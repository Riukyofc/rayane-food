import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Minus, Plus, X, MapPin, Store, ChevronLeft, Star,
    Clock, ChevronRight, Search, Settings, Phone, Instagram, Bike, Package, User, Receipt
} from 'lucide-react';
import { useAppStore, formatCurrency } from '../../store/useAppStore';
import { Button, Modal, Badge } from '../ui';
import { UserMenu } from '../auth/AuthModal';
import { MyOrdersView } from './MyOrdersView';

// ========================================
// PRODUCT MODAL
// ========================================

const ProductModal = ({ product, isOpen, onClose, onAddToCart, onProductAdded }) => {
    const [observation, setObservation] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const handleAdd = () => {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product, observation);
        }
        const addedProduct = { ...product, quantity };
        setObservation('');
        setQuantity(1);
        onClose();
        onProductAdded(addedProduct);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
            <div className="-m-6">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                            {product.isNew && <Badge variant="success">NOVO</Badge>}
                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <Star size={12} fill="currentColor" />
                                <span>{product.rating}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-zinc-400">{product.description}</p>

                    {/* Observation */}
                    <div>
                        <label className="input-label">Alguma observação?</label>
                        <textarea
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                            placeholder="Ex: Sem cebola, molho à parte..."
                            className="input resize-none h-20"
                        />
                    </div>

                    {/* Quantity & Add */}
                    <div className="flex items-center gap-4 pt-4 border-t border-dark-100">
                        <div className="flex items-center gap-3 bg-dark-300 rounded-xl p-1">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center text-white hover:bg-dark-100 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center text-white hover:bg-dark-100 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <Button onClick={handleAdd} className="flex-1 py-4">
                            Adicionar {formatCurrency(product.price * quantity)}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// ========================================
// CART DRAWER
// ========================================

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
    const cart = useAppStore(state => state.cart);
    const updateCartQty = useAppStore(state => state.updateCartQty);
    const clearCart = useAppStore(state => state.clearCart);
    const getCartTotal = useAppStore(state => state.getCartTotal);

    const total = getCartTotal();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="cart-drawer"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-dark-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-white">Sua Sacola</h2>
                                    <p className="text-xs text-zinc-500">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-dark-300 flex items-center justify-center mb-4">
                                        <ShoppingBag size={32} className="text-zinc-600" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">Sacola vazia</h3>
                                    <p className="text-sm text-zinc-500">Adicione itens para começar</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item, idx) => (
                                        <motion.div
                                            key={`${item.id}-${item.observation}-${idx}`}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex gap-4 p-4 bg-dark-300 rounded-xl"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                                loading="lazy"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-semibold text-white text-sm truncate pr-2">{item.name}</h4>
                                                    <span className="font-bold text-primary-400 text-sm whitespace-nowrap">
                                                        {formatCurrency(item.price * item.qty)}
                                                    </span>
                                                </div>
                                                {item.observation && (
                                                    <p className="text-xs text-zinc-500 mb-2 truncate">Obs: {item.observation}</p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateCartQty(item.id, item.observation, -1)}
                                                        className="w-7 h-7 rounded-lg bg-dark-200 flex items-center justify-center hover:bg-dark-100 transition-colors"
                                                    >
                                                        <Minus size={12} className="text-zinc-400" />
                                                    </button>
                                                    <span className="text-sm font-semibold text-white w-6 text-center">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateCartQty(item.id, item.observation, 1)}
                                                        className="w-7 h-7 rounded-lg bg-dark-200 flex items-center justify-center hover:bg-dark-100 transition-colors"
                                                    >
                                                        <Plus size={12} className="text-zinc-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 bg-dark-400 border-t border-dark-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-zinc-400">Subtotal</span>
                                    <span className="text-xl font-bold text-white">{formatCurrency(total)}</span>
                                </div>
                                <Button onClick={onCheckout} className="w-full py-4 text-base">
                                    Finalizar Pedido
                                </Button>
                                <button
                                    onClick={clearCart}
                                    className="w-full mt-3 py-2 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    Limpar sacola
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ========================================
// CHECKOUT VIEW
// ========================================

const CheckoutView = ({ onBack }) => {
    const cart = useAppStore(state => state.cart);
    const settings = useAppStore(state => state.settings);
    const deliveryZones = useAppStore(state => state.deliveryZones);
    const getCartTotal = useAppStore(state => state.getCartTotal);
    const clearCart = useAppStore(state => state.clearCart);
    const addToast = useAppStore(state => state.addToast);

    const [deliveryMode, setDeliveryMode] = useState('delivery');
    const [deliveryBairro, setDeliveryBairro] = useState('');
    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const addOrder = useAppStore(state => state.addOrder);

    const deliveryFee = useMemo(() => {
        if (deliveryMode === 'pickup') return 0;
        const zone = deliveryZones.find(f => f.name === deliveryBairro);
        return zone ? zone.price : 0;
    }, [deliveryBairro, deliveryMode, deliveryZones]);

    const subtotal = getCartTotal();
    const total = subtotal + deliveryFee;

    const handleFinish = async () => {
        if (deliveryMode === 'delivery' && (!deliveryBairro || !address || !name)) {
            addToast('Erro', 'Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (deliveryMode === 'pickup' && !name) {
            addToast('Erro', 'Preencha seu nome.', 'error');
            return;
        }

        // Salvar pedido no Firebase primeiro
        const orderData = {
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.qty,
                observation: item.observation,
                category: item.category
            })),
            customerName: name,
            deliveryMode,
            address: deliveryMode === 'delivery' ? `${address} - ${deliveryBairro}` : 'Retirada no local',
            deliveryBairro: deliveryMode === 'delivery' ? deliveryBairro : null,
            subtotal,
            deliveryFee,
            total,
            status: 'pending'
        };

        const result = await addOrder(orderData);

        if (result.success) {
            setConfirmedOrder(orderData);
            setOrderConfirmed(true);
            clearCart();
            addToast('Sucesso', 'Pedido confirmado! 🎉', 'success');
        } else {
            addToast('Erro', 'Falha ao criar pedido. Tente novamente.', 'error');
        }
    };

    const handleSendWhatsApp = () => {
        const items = confirmedOrder.items.map(i => `${i.quantity}x ${i.name}`).join('\n');
        const msg = `*NOVO PEDIDO - ${settings.storeName}*\n\n` +
            `📋 *Itens:*\n${items}\n\n` +
            `👤 *Cliente:* ${confirmedOrder.customerName}\n` +
            `📍 *${confirmedOrder.address}*\n\n` +
            `💰 *Total:* ${formatCurrency(confirmedOrder.total)}`;

        window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
        addToast('Sucesso', 'Abrindo WhatsApp...', 'success');
        setOrderConfirmed(false);
        onBack();
    };

    return (
        <div className="min-h-screen bg-dark-700 pb-safe">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-dark-500/80 backdrop-blur-xl border-b border-dark-100">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="font-bold text-lg text-white">Finalizar Pedido</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto p-4 space-y-6">
                {/* Delivery Mode */}
                <div className="glass-card p-2 flex gap-2">
                    <button
                        onClick={() => setDeliveryMode('delivery')}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${deliveryMode === 'delivery'
                            ? 'bg-primary-500 text-white'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Bike size={18} />
                        Entrega
                    </button>
                    <button
                        onClick={() => setDeliveryMode('pickup')}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${deliveryMode === 'pickup'
                            ? 'bg-primary-500 text-white'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Store size={18} />
                        Retirada
                    </button>
                </div>

                {/* Delivery Form */}
                <div className="glass-card space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {deliveryMode === 'delivery' ? <MapPin size={18} className="text-primary-400" /> : <Store size={18} className="text-primary-400" />}
                        {deliveryMode === 'delivery' ? 'Endereço de Entrega' : 'Retirada'}
                    </h3>

                    {deliveryMode === 'delivery' ? (
                        <>
                            <div>
                                <label className="input-label">Seu Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Digite seu nome"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="input-label">Bairro</label>
                                <select
                                    value={deliveryBairro}
                                    onChange={e => setDeliveryBairro(e.target.value)}
                                    className="input"
                                >
                                    <option value="">Selecione o bairro...</option>
                                    {deliveryZones.filter(f => f.active).map(f => (
                                        <option key={f.id} value={f.name}>
                                            {f.name} ({formatCurrency(f.price)} - {f.time})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Endereço Completo</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Rua, número, complemento"
                                    className="input"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-dark-300 rounded-xl text-center">
                            <Store size={32} className="mx-auto text-primary-400 mb-2" />
                            <p className="font-semibold text-white">{settings.storeName}</p>
                            <p className="text-sm text-zinc-400 mt-1">{settings.address}</p>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="glass-card">
                    <h3 className="font-bold text-white mb-4">Resumo do Pedido</h3>
                    <div className="space-y-2 mb-4 pb-4 border-b border-dark-100">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-zinc-400">{item.qty}x {item.name}</span>
                                <span className="text-white">{formatCurrency(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Subtotal</span>
                            <span className="text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Taxa de entrega</span>
                            <span className="text-white">{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-100">
                            <span className="text-white">Total</span>
                            <span className="gradient-text">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Finish Button */}
                <Button onClick={handleFinish} className="w-full py-4 text-base">
                    Confirmar Pedido
                </Button>
            </div>

            {/* Order Confirmation Modal */}
            <Modal
                isOpen={orderConfirmed}
                onClose={() => {
                    setOrderConfirmed(false);
                    onBack();
                }}
                title="Pedido Confirmado! 🎉"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={40} className="text-green-500" />
                        </div>
                        <p className="text-zinc-300 mb-4">
                            Seu pedido foi registrado com sucesso!
                        </p>
                        <p className="text-sm text-zinc-400">
                            O administrador já pode ver seu pedido no painel.
                        </p>
                    </div>

                    {confirmedOrder && (
                        <div className="bg-dark-300 rounded-xl p-4 space-y-3">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase mb-1">Cliente</p>
                                <p className="text-white font-semibold">{confirmedOrder.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase mb-1">Endereço</p>
                                <p className="text-white">{confirmedOrder.address}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase mb-1">Total</p>
                                <p className="text-2xl font-bold gradient-text">
                                    {formatCurrency(confirmedOrder.total)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button onClick={handleSendWhatsApp} className="w-full py-4">
                            <Phone className="mr-2" size={20} />
                            Enviar via WhatsApp
                        </Button>
                        <button
                            onClick={() => {
                                setOrderConfirmed(false);
                                onBack();
                            }}
                            className="w-full py-3 text-zinc-400 hover:text-white transition-colors"
                        >
                            Voltar para o início
                        </button>
                    </div>

                    <p className="text-xs text-zinc-500 text-center">
                        💡 Envie via WhatsApp para finalizar seu pedido e combinar detalhes!
                    </p>
                </div>
            </Modal>
        </div>
    );
};

// ========================================
// PRODUCT CARD
// ========================================

const ProductCard = ({ product, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`product-card ${product.isPaused ? 'opacity-50' : ''}`}
            onClick={() => !product.isPaused && onClick(product)}
        >
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`product-image ${product.isPaused ? 'grayscale' : ''}`}
                    loading="lazy"
                />
                {product.isPaused && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="error">ESGOTADO</Badge>
                    </div>
                )}
                {product.isNew && !product.isPaused && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="success">NOVO</Badge>
                    </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                    <Star size={12} className="text-yellow-400" fill="#facc15" />
                    <span className="text-xs font-semibold text-white">{product.rating}</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white line-clamp-1">{product.name}</h3>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold gradient-text">{formatCurrency(product.price)}</span>
                    <Button size="sm" disabled={product.isPaused}>
                        {product.isPaused ? 'Indisponível' : 'Adicionar'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

// ========================================
// CLIENT STORE (MAIN)
// ========================================

export const ClientStore = ({ onOpenAdmin, onOpenAuth }) => {
    const products = useAppStore(state => state.products);
    const categories = useAppStore(state => state.categories);
    const settings = useAppStore(state => state.settings);
    const addToCart = useAppStore(state => state.addToCart);
    const isCartOpen = useAppStore(state => state.isCartOpen);
    const setCartOpen = useAppStore(state => state.setCartOpen);
    const getCartCount = useAppStore(state => state.getCartCount);
    const user = useAppStore(state => state.user);
    const userOrders = useAppStore(state => state.userOrders);

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [view, setView] = useState('home'); // 'home' | 'checkout' | 'myorders'
    const [showAddedModal, setShowAddedModal] = useState(false);
    const [addedProduct, setAddedProduct] = useState(null);

    const filteredProducts = useMemo(() => {
        let list = products;

        if (activeCategory !== 'all') {
            list = list.filter(p => p.category === activeCategory);
        }

        if (searchQuery) {
            list = list.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeCategory === 'all') {
            list = list.slice(0, 8);
        }

        return list.sort((a, b) => a.isPaused - b.isPaused);
    }, [products, activeCategory, searchQuery]);

    const cartCount = getCartCount();
    const activeOrdersCount = userOrders.filter(o => o.status !== 'done' && o.status !== 'cancelled').length;

    if (view === 'checkout') {
        return <CheckoutView onBack={() => setView('home')} />;
    }

    if (view === 'myorders') {
        return <MyOrdersView onBack={() => setView('home')} />;
    }

    return (
        <div className="min-h-screen store-bg pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-dark-500/80 backdrop-blur-xl border-b border-dark-100">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-white">{settings.storeName}</h1>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase">
                                    {settings.isOpen ? 'Aberto agora' : 'Fechado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <UserMenu onOpenAuth={onOpenAuth} />

                        {/* My Orders Button - Only shown if logged in */}
                        {user && (
                            <button
                                onClick={() => setView('myorders')}
                                className="relative p-3 bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors"
                                title="Meus Pedidos"
                            >
                                <Receipt size={22} className="text-white" />
                                {activeOrdersCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        {activeOrdersCount}
                                    </motion.span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative p-3 bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors"
                        >
                            <ShoppingBag size={22} className="text-white" />
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
                {/* Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-64 md:h-80 rounded-3xl overflow-hidden"
                >
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60"
                        alt="Hero"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 hero-gradient" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <Badge variant="primary" className="mb-3">🔥 Destaque do Dia</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            Sabor que<br />conquista
                        </h2>
                        <p className="text-zinc-300 mt-2 max-w-md">
                            Experimente nossos pratos preparados com ingredientes frescos e muito carinho.
                        </p>
                    </div>
                </motion.div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar no cardápio..."
                        className="input pl-11"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-dark-300 text-zinc-400 hover:text-white hover:bg-dark-200'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ProductCard product={product} onClick={setSelectedProduct} />
                        </motion.div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <Package size={48} className="mx-auto mb-4 text-zinc-600" />
                        <h3 className="font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                        <p className="text-sm text-zinc-500">Tente buscar por outro termo</p>
                    </div>
                )}
            </main>

            {/* Admin Access Button */}
            <button
                onClick={onOpenAdmin}
                className="fixed bottom-6 left-6 w-12 h-12 bg-dark-300 hover:bg-dark-200 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-all z-40"
            >
                <Settings size={20} className="text-zinc-400" />
            </button>

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={addToCart}
                onProductAdded={(product) => {
                    setAddedProduct(product);
                    setShowAddedModal(true);
                }}
            />

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setCartOpen(false)}
                onCheckout={() => {
                    setCartOpen(false);
                    setView('checkout');
                }}
            />

            {/* Product Added Confirmation Modal */}
            <Modal
                isOpen={showAddedModal}
                onClose={() => setShowAddedModal(false)}
                title=""
                size="sm"
            >
                <div className="text-center space-y-6 py-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag size={32} className="text-green-500" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Produto adicionado!
                        </h3>
                        <p className="text-zinc-400">
                            Deseja abrir o carrinho?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                setShowAddedModal(false);
                                setCartOpen(true);
                            }}
                            className="w-full py-3"
                        >
                            <ShoppingBag className="mr-2" size={18} />
                            Abrir Carrinho
                        </Button>

                        <button
                            onClick={() => setShowAddedModal(false)}
                            className="w-full py-3 text-zinc-400 hover:text-white transition-colors font-medium"
                        >
                            Continuar comprando
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClientStore;
