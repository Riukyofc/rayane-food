import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

// ========================================
// TOAST NOTIFICATIONS
// ========================================

export const ToastContainer = () => {
    const toasts = useAppStore(state => state.toasts);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />
    };

    const borderColors = {
        success: 'border-l-green-500',
        error: 'border-l-red-500',
        warning: 'border-l-yellow-500',
        info: 'border-l-blue-500'
    };

    return (
        <div className="toast-container">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`toast ${borderColors[toast.type]}`}
                    >
                        {icons[toast.type]}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white">{toast.title}</p>
                            <p className="text-xs text-zinc-400 truncate">{toast.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// ========================================
// MODAL
// ========================================

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`modal-content ${sizes[size]}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// ========================================
// BUTTON
// ========================================

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        success: 'btn-success',
        danger: 'btn-danger'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            className={`${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={16} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={16} />}
                </>
            )}
        </button>
    );
};

// ========================================
// INPUT
// ========================================

export const Input = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && <label className="input-label">{label}</label>}
            <input className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
};

// ========================================
// SELECT
// ========================================

export const Select = ({
    label,
    options = [],
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && <label className="input-label">{label}</label>}
            <select className={`input cursor-pointer ${className}`} {...props}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

// ========================================
// TEXTAREA
// ========================================

export const Textarea = ({
    label,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && <label className="input-label">{label}</label>}
            <textarea className={`input resize-none ${className}`} {...props} />
        </div>
    );
};

// ========================================
// TOGGLE SWITCH
// ========================================

export const Toggle = ({ checked, onChange, label, size = 'md' }) => {
    const sizes = {
        sm: { track: 'w-8 h-5', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-6' },
        lg: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: 'translate-x-8' }
    };

    const s = sizes[size];

    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`
        relative ${s.track} rounded-full transition-colors duration-200
        ${checked ? 'bg-primary-500' : 'bg-dark-200'}
      `}>
                <motion.div
                    className={`
            absolute top-1 left-1 ${s.thumb} bg-white rounded-full shadow-md
          `}
                    animate={{ x: checked ? parseInt(s.translate.split('-x-')[1]) * 4 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </div>
            {label && (
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                    {label}
                </span>
            )}
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
        </label>
    );
};

// ========================================
// BADGE
// ========================================

export const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-zinc-700 text-zinc-300',
        primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
        success: 'bg-green-500/20 text-green-400 border border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// ========================================
// SKELETON LOADER
// ========================================

export const Skeleton = ({ className = '', variant = 'rect' }) => {
    const variants = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4'
    };

    return (
        <div className={`bg-dark-200 animate-pulse shimmer ${variants[variant]} ${className}`} />
    );
};

// ========================================
// METRIC CARD
// ========================================

export const MetricCard = ({
    label,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary'
}) => {
    const colors = {
        primary: 'from-primary-500/20 to-transparent text-primary-400',
        green: 'from-green-500/20 to-transparent text-green-400',
        blue: 'from-blue-500/20 to-transparent text-blue-400',
        yellow: 'from-yellow-500/20 to-transparent text-yellow-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card group"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="metric-label">{label}</p>
                    <h3 className="metric-value mt-1">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            <span>{trend === 'up' ? '↑' : '↓'}</span>
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ========================================
// EMPTY STATE
// ========================================

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-dark-200 flex items-center justify-center mb-4">
                    <Icon size={32} className="text-zinc-500" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">{description}</p>
            {action}
        </div>
    );
};

// ========================================
// LOADING SPINNER
// ========================================

export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`${sizes[size]} border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin ${className}`} />
    );
};
