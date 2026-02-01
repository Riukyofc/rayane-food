import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Mail, Lock, User, Eye, EyeOff, ArrowRight,
    ChevronLeft, Loader2, Phone
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui';

// ========================================
// AUTH MODAL - LOGIN/REGISTER
// ========================================

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', requireLogin = false }) => {
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: ''
    });

    const login = useAppStore(state => state.login);
    const register = useAppStore(state => state.register);
    const isAuthLoading = useAppStore(state => state.isAuthLoading);
    const authError = useAppStore(state => state.authError);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'login') {
            const result = await login(form.email, form.password);
            if (result.success) {
                onClose();
                setForm({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
            }
        } else {
            if (form.password !== form.confirmPassword) {
                useAppStore.getState().addToast('Erro', 'As senhas não coincidem.', 'error');
                return;
            }
            if (!form.phone || form.phone.length < 10) {
                useAppStore.getState().addToast('Erro', 'Digite um telefone válido.', 'error');
                return;
            }
            const result = await register(form.email, form.password, form.name, form.phone);
            if (result.success) {
                onClose();
                setForm({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
            }
        }
    };

    const resetForm = () => {
        setForm({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
    };

    // Format phone number
    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={requireLogin ? undefined : onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="relative bg-dark-400 border border-dark-100 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-auto shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-dark-400 border-b border-dark-100 p-4 flex items-center justify-between">
                            {!requireLogin ? (
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-zinc-400" />
                                </button>
                            ) : <div className="w-9" />}
                            <h2 className="font-bold text-lg text-white">
                                {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                            </h2>
                            <div className="w-9" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Logo */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                                    <span className="text-white font-bold text-2xl">R</span>
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {mode === 'login' ? 'Bem-vindo de volta!' : 'Junte-se a nós!'}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {requireLogin
                                        ? 'Faça login para continuar seu pedido'
                                        : mode === 'login' ? 'Entre para continuar' : 'Crie sua conta grátis'
                                    }
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'register' && (
                                    <>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                placeholder="Seu nome completo"
                                                className="input pl-11"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
                                                placeholder="(11) 99999-9999"
                                                className="input pl-11"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="E-mail"
                                        className="input pl-11"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Senha"
                                        className="input pl-11 pr-11"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {mode === 'register' && (
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.confirmPassword}
                                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                            placeholder="Confirmar senha"
                                            className="input pl-11"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                {authError && (
                                    <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                                        {authError}
                                    </p>
                                )}

                                <Button type="submit" className="w-full py-4" disabled={isAuthLoading}>
                                    {isAuthLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Switch Mode */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-zinc-500">
                                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                                    <button
                                        onClick={() => {
                                            setMode(mode === 'login' ? 'register' : 'login');
                                            resetForm();
                                        }}
                                        className="text-primary-400 font-semibold ml-1 hover:underline"
                                    >
                                        {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// ========================================
// USER MENU DROPDOWN
// ========================================

export const UserMenu = ({ onOpenAuth }) => {
    const user = useAppStore(state => state.user);
    const userProfile = useAppStore(state => state.userProfile);
    const logout = useAppStore(state => state.logout);
    const setCurrentModule = useAppStore(state => state.setCurrentModule);
    const [isOpen, setIsOpen] = useState(false);

    // Admin email check
    const isAdmin = user?.email === 'marmitasrayane@gmail.com';

    if (!user) {
        return (
            <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors"
            >
                <User size={18} className="text-zinc-400" />
                <span className="text-sm font-medium text-white hidden sm:inline">Entrar</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                </div>
                <span className="text-sm font-medium text-white hidden sm:inline max-w-[100px] truncate">
                    {user.displayName || 'Usuário'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-dark-400 border border-dark-100 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-dark-100">
                                <p className="font-semibold text-white truncate">
                                    {user.displayName || 'Usuário'}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                {userProfile?.phone && (
                                    <p className="text-xs text-zinc-500">{userProfile.phone}</p>
                                )}
                            </div>

                            <div className="p-2">
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            setCurrentModule('admin');
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Painel Admin
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    Sair
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthModal;
