import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Loader2 } from 'lucide-react';
import { useAppStore, initializeFirebaseListeners } from './store/useAppStore';
import { ToastContainer, Button } from './components/ui';
import { AdminLayout } from './components/admin/AdminLayout';
import { ClientStore } from './components/store/ClientStore';
import { AuthModal } from './components/auth/AuthModal';
import { ADMIN_EMAIL, ADMIN_PIN } from './lib/firebase';

// ========================================
// ADMIN LOGIN MODAL (PIN BASED)
// ========================================

const AdminPinModal = ({ isOpen, onClose, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const user = useAppStore(state => state.user);
    const addToast = useAppStore(state => state.addToast);

    // Check if user is admin by email
    const isAdmin = user?.email === ADMIN_EMAIL;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Only allow admin email OR correct PIN
        if (isAdmin || pin === ADMIN_PIN) {
            if (!isAdmin && pin === ADMIN_PIN && (!user || user.email !== ADMIN_EMAIL)) {
                // If not logged in as admin, require login
                addToast('Erro', 'Faça login com a conta admin para acessar.', 'error');
                setError(true);
                setTimeout(() => setError(false), 2000);
                return;
            }
            onSuccess();
            onClose();
            setPin('');
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="relative bg-dark-400 border border-dark-100 rounded-3xl p-8 w-full max-w-sm shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-zinc-400" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
                                <Lock size={28} className="text-primary-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Área Restrita</h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {isAdmin
                                    ? 'Clique para acessar'
                                    : 'Acesse com a conta admin'
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isAdmin && (
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={e => setPin(e.target.value)}
                                        className={`w-full text-center text-3xl font-mono py-4 bg-dark-300 rounded-2xl border-2 transition-all focus:outline-none tracking-[0.5em]
                      ${error ? 'border-red-500 animate-shake' : 'border-dark-100 focus:border-primary-500'}
                    `}
                                        placeholder="••••"
                                        maxLength={4}
                                        autoFocus
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center mt-2"
                                        >
                                            Acesso negado
                                        </motion.p>
                                    )}
                                </div>
                            )}

                            <Button type="submit" className="w-full py-4">
                                Acessar Painel
                            </Button>
                        </form>

                        {!isAdmin && (
                            <p className="text-center text-xs text-zinc-600 mt-6">
                                Entre com a conta administrador
                            </p>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// ========================================
// LOADING SCREEN
// ========================================

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-dark-700 flex items-center justify-center z-[100]">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
            <img
                src="/logo-garcia.jpg"
                alt="Restaurante Garcia"
                className="w-32 h-32 rounded-2xl mx-auto mb-6 shadow-2xl object-cover"
            />
            <h1 className="text-2xl font-bold text-white mb-2">Restaurante Garcia</h1>
            <div className="flex items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Carregando...</span>
            </div>
        </motion.div>
    </div>
);

// ========================================
// MAIN APP
// ========================================

function App() {
    const currentModule = useAppStore(state => state.currentModule);
    const setCurrentModule = useAppStore(state => state.setCurrentModule);
    const isAuthLoading = useAppStore(state => state.isAuthLoading);

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Initialize Firebase listeners on mount
    useEffect(() => {
        const cleanup = initializeFirebaseListeners();
        return cleanup;
    }, []);

    // Show loading screen while checking auth
    if (isAuthLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {currentModule === 'client' ? (
                    <motion.div
                        key="client"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ClientStore
                            onOpenAdmin={() => setIsPinModalOpen(true)}
                            onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="admin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AdminLayout onLogout={() => setCurrentModule('client')} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin PIN Modal */}
            <AdminPinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={() => setCurrentModule('admin')}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Toast Notifications */}
            <ToastContainer />

            {/* Global Styles */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
        </>
    );
}

export default App;
