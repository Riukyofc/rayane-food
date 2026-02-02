import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Package, Clock, ChefHat, Truck, CheckCircle2,
    MapPin, Calendar, DollarSign, ShoppingBag
} from 'lucide-react';
import { useAppStore, formatCurrency } from '../../store/useAppStore';
import { Badge } from '../ui';

// ========================================
// ORDER STATUS TIMELINE
// ========================================

const OrderTimeline = ({ status }) => {
    const steps = [
        { id: 'pending', label: 'Pendente', icon: Clock, color: 'yellow' },
        { id: 'preparing', label: 'Preparando', icon: ChefHat, color: 'blue' },
        { id: 'delivery', label: 'A Caminho', icon: Truck, color: 'orange' },
        { id: 'done', label: 'Concluído', icon: CheckCircle2, color: 'green' }
    ];

    const statusIndex = steps.findIndex(s => s.id === status);

    return (
        <div className="flex items-center justify-between px-4 py-6">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= statusIndex;
                const isCurrentlatest = index === statusIndex;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                                        ? step.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                            step.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                step.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-green-500/20 text-green-400'
                                        : 'bg-dark-300 text-zinc-600'
                                    } ${isCurrentlatest ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-500' : ''}`}
                            >
                                <Icon size={20} />
                            </motion.div>
                            <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 bg-dark-300 relative -mx-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isActive ? '100%' : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`h-full ${step.color === 'yellow' ? 'bg-yellow-500' :
                                            step.color === 'blue' ? 'bg-blue-500' :
                                                step.color === 'orange' ? 'bg-orange-500' :
                                                    'bg-green-500'
                                        }`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ========================================
// ORDER CARD
// ========================================

const OrderCard = ({ order }) => {
    const getStatusBadge = (status) => {
        const variants = {
            pending: { variant: 'warning', label: 'Aguardando' },
            preparing: { variant: 'info', label: 'Preparando' },
            delivery: { variant: 'primary', label: 'Saiu para Entrega' },
            done: { variant: 'success', label: 'Concluído' },
            cancelled: { variant: 'error', label: 'Cancelado' }
        };
        return variants[status] || variants.pending;
    };

    const badge = getStatusBadge(order.status);
    const orderDate = order.createdAt instanceof Date
        ? order.createdAt
        : new Date(order.createdAt);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-dark-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <Package size={20} className="text-primary-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Pedido #{order.id?.substring(0, 8) || 'N/A'}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar size={12} />
                            <span>
                                {orderDate.toLocaleDateString('pt-BR')} às {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>

            {/* Timeline */}
            <OrderTimeline status={order.status} />

            {/* Details */}
            <div className="p-4 space-y-3">
                {/* Items */}
                <div>
                    <p className="text-xs text-zinc-500 uppercase mb-2 flex items-center gap-2">
                        <ShoppingBag size={12} />
                        Itens
                    </p>
                    <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-zinc-400">
                                    {item.quantity}x {item.name}
                                </span>
                                <span className="text-white font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div>
                    <p className="text-xs text-zinc-500 uppercase mb-1 flex items-center gap-2">
                        <MapPin size={12} />
                        {order.deliveryMode === 'delivery' ? 'Endereço' : 'Retirada'}
                    </p>
                    <p className="text-sm text-white">{order.address}</p>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-dark-100">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                            <DollarSign size={16} />
                            Total
                        </span>
                        <span className="text-xl font-bold gradient-text">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ========================================
// MY ORDERS VIEW (MAIN)
// ========================================

export const MyOrdersView = ({ onBack }) => {
    const userOrders = useAppStore(state => state.userOrders);

    const activeOrders = userOrders.filter(o => o.status !== 'done' && o.status !== 'cancelled');
    const completedOrders = userOrders.filter(o => o.status === 'done' || o.status === 'cancelled');

    return (
        <div className="min-h-screen bg-dark-700 pb-safe">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-dark-500/80 backdrop-blur-xl border-b border-dark-100">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-white">Meus Pedidos</h1>
                        <p className="text-xs text-zinc-500">
                            {activeOrders.length} {activeOrders.length === 1 ? 'pedido ativo' : 'pedidos ativos'}
                        </p>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-zinc-400 uppercase mb-3">
                            Em Andamento
                        </h2>
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {activeOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Completed Orders */}
                {completedOrders.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-zinc-400 uppercase mb-3">
                            Histórico
                        </h2>
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {completedOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {userOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-dark-300 flex items-center justify-center mb-4">
                            <Package size={40} className="text-zinc-600" />
                        </div>
                        <h3 className="font-bold text-white mb-2">Nenhum pedido ainda</h3>
                        <p className="text-sm text-zinc-500 max-w-xs">
                            Seus pedidos aparecerão aqui assim que você fizer seu primeiro pedido.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersView;
