import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, UtensilsCrossed, Package, MapPin, Settings, LogOut,
    Bell, ToggleLeft, ToggleRight, ChevronDown, Menu, X, TrendingUp,
    DollarSign, ShoppingBag, Users, Clock, Star, ChefHat, Bike,
    CheckCircle2, PlusCircle, Search, MoreVertical, Trash2, Edit2,
    Pause, Play, Image as ImageIcon, AlertCircle, UserCheck, LogIn, Phone
} from 'lucide-react';
import { useAppStore, formatCurrency, getTimeAgo, formatDate } from '../../store/useAppStore';
import {
    Modal, Button, Input, Textarea, Select, Toggle, Badge, MetricCard, EmptyState
} from '../ui';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { subscribeToLoginLogs, subscribeToUsers } from '../../lib/firebase';

// ========================================
// ADMIN SIDEBAR
// ========================================

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
    const settings = useAppStore(state => state.settings);
    const toggleStoreOpen = useAppStore(state => state.toggleStoreOpen);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Pedidos', icon: UtensilsCrossed, badge: 3 },
        { id: 'menu', label: 'Cardápio', icon: Package },
        { id: 'delivery', label: 'Entregas', icon: MapPin },
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-dark-500 border-r border-dark-100 hidden lg:flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-dark-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Rayane<span className="text-primary-500">Admin</span></h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Painel de Controle</p>
                    </div>
                </div>
            </div>

            {/* Store Status */}
            <div className="p-4 mx-4 mt-4 rounded-xl bg-dark-300 border border-dark-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-400">Status da Loja</span>
                    <div className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <button
                    onClick={toggleStoreOpen}
                    className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${settings.isOpen
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                >
                    {settings.isOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {settings.isOpen ? 'ABERTA' : 'FECHADA'}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={activeTab === item.id ? 'nav-item-active w-full' : 'nav-item w-full'}
                    >
                        <item.icon size={20} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                            <span className="px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-dark-100">
                <button
                    onClick={onLogout}
                    className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    <LogOut size={20} />
                    <span>Sair do Painel</span>
                </button>
            </div>
        </aside>
    );
};

// ========================================
// ADMIN HEADER
// ========================================

const AdminHeader = ({ activeTab, onMenuClick }) => {
    const settings = useAppStore(state => state.settings);
    const orders = useAppStore(state => state.orders);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    const titles = {
        dashboard: 'Dashboard',
        orders: 'Gestão de Pedidos',
        menu: 'Cardápio & Estoque',
        delivery: 'Áreas de Entrega',
        users: 'Usuários & Logins',
        settings: 'Configurações'
    };

    return (
        <header className="h-16 bg-dark-500/80 backdrop-blur-xl border-b border-dark-100 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
                    <Menu size={20} />
                </button>
                <div>
                    <h2 className="font-bold text-lg text-white">{titles[activeTab]}</h2>
                    <p className="text-xs text-zinc-500">Bem-vindo de volta!</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <Bell size={20} className="text-zinc-400" />
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                </button>

                {/* User */}
                <div className="flex items-center gap-3 pl-4 border-l border-dark-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-white">Admin</p>
                        <p className="text-[10px] text-zinc-500">{settings.storeName}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

// ========================================
// DASHBOARD VIEW
// ========================================

const DashboardView = () => {
    const analytics = useAppStore(state => state.analytics);
    const orders = useAppStore(state => state.orders);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;

    return (
        <div className="space-y-6 animate-in">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Vendas Hoje"
                    value={formatCurrency(analytics.metrics.todaySales)}
                    icon={DollarSign}
                    trend="up"
                    trendValue="+12.5%"
                    color="primary"
                />
                <MetricCard
                    label="Pedidos Hoje"
                    value={analytics.metrics.todayOrders}
                    icon={ShoppingBag}
                    trend="up"
                    trendValue="+8"
                    color="blue"
                />
                <MetricCard
                    label="Ticket Médio"
                    value={formatCurrency(analytics.metrics.avgTicket)}
                    icon={TrendingUp}
                    color="green"
                />
                <MetricCard
                    label="Conversão"
                    value={`${analytics.metrics.conversionRate}%`}
                    icon={Users}
                    color="yellow"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-white">Vendas da Semana</h3>
                            <p className="text-xs text-zinc-500">Últimos 7 dias</p>
                        </div>
                        <Badge variant="success">+15.2%</Badge>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.dailySales}>
                                <defs>
                                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                    }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#f97316' }}
                                    formatter={(value) => [formatCurrency(value), 'Vendas']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="vendas"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVendas)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="glass-card">
                    <h3 className="font-bold text-white mb-6">Por Categoria</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {analytics.categoryBreakdown.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                        {analytics.categoryBreakdown.map(cat => (
                            <div key={cat.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-zinc-400">{cat.name}</span>
                                </div>
                                <span className="text-white font-medium">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Orders Status */}
                <div className="glass-card">
                    <h3 className="font-bold text-white mb-4">Pedidos em Tempo Real</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-yellow-400" />
                                <span className="text-xs text-yellow-400 font-semibold">PENDENTES</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-400">{pendingOrders}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ChefHat size={16} className="text-blue-400" />
                                <span className="text-xs text-blue-400 font-semibold">PREPARANDO</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-400">{preparingOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="glass-card">
                    <h3 className="font-bold text-white mb-4">Top Produtos</h3>
                    <div className="space-y-3">
                        {analytics.topProducts.slice(0, 4).map((product, index) => (
                            <div key={product.name} className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-dark-200 flex items-center justify-center text-xs font-bold text-zinc-400">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                    <p className="text-xs text-zinc-500">{product.orders} pedidos</p>
                                </div>
                                <span className="text-sm font-bold text-primary-400">{formatCurrency(product.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========================================
// ORDERS KANBAN VIEW
// ========================================

const OrderCard = ({ order, onClick, onStatusChange }) => {
    const isUrgent = order.status === 'pending' && (Date.now() - order.timestamp) > 300000; // 5min

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`order-card ${isUrgent ? 'order-card-urgent' : ''}`}
            onClick={() => onClick(order)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-dark-200 text-zinc-300 px-2 py-1 rounded">
                        {order.id}
                    </span>
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-zinc-500'
                        }`}>
                        <Clock size={10} />
                        {getTimeAgo(order.timestamp)}
                    </span>
                </div>
                <Badge variant={order.type === 'delivery' ? 'primary' : 'info'}>
                    {order.type === 'delivery' ? 'Entrega' : 'Retirada'}
                </Badge>
            </div>

            <div className="mb-3">
                <h4 className="font-semibold text-white text-sm">{order.customer}</h4>
                <div className="text-xs text-zinc-500 mt-1 space-y-0.5">
                    {order.items.slice(0, 2).map((item, idx) => (
                        <p key={idx}>{item.qty}x {item.name}</p>
                    ))}
                    {order.items.length > 2 && (
                        <p className="text-zinc-600">+{order.items.length - 2} mais...</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                <span className="font-bold text-white">{formatCurrency(order.total)}</span>

                {order.status === 'pending' && (
                    <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'preparing'); }}>
                        Aceitar
                    </Button>
                )}
                {order.status === 'preparing' && (
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'delivery'); }} icon={Bike}>
                        Enviar
                    </Button>
                )}
                {order.status === 'delivery' && (
                    <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'done'); }} icon={CheckCircle2}>
                        Concluir
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

const OrdersKanbanView = () => {
    const orders = useAppStore(state => state.orders);
    const updateOrderStatus = useAppStore(state => state.updateOrderStatus);
    const setSelectedOrder = useAppStore(state => state.setSelectedOrder);
    const selectedOrder = useAppStore(state => state.selectedOrder);

    const columns = [
        { key: 'pending', label: 'Pendentes', icon: Bell, color: 'yellow' },
        { key: 'preparing', label: 'Preparando', icon: ChefHat, color: 'blue' },
        { key: 'delivery', label: 'Em Entrega', icon: Bike, color: 'orange' },
        { key: 'done', label: 'Concluídos', icon: CheckCircle2, color: 'green' },
    ];

    const colorClasses = {
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
    };

    return (
        <div className="h-full animate-in">
            <div className="flex gap-4 h-full overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                {columns.map(col => {
                    const columnOrders = orders.filter(o => o.status === col.key);
                    return (
                        <div key={col.key} className="kanban-column snap-center">
                            <div className={`kanban-header ${colorClasses[col.color]}`}>
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <col.icon size={16} />
                                    {col.label}
                                </div>
                                <span className="px-2 py-0.5 bg-black/20 rounded text-xs font-bold">
                                    {columnOrders.length}
                                </span>
                            </div>
                            <div className="kanban-body">
                                <AnimatePresence mode="popLayout">
                                    {columnOrders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onClick={setSelectedOrder}
                                            onStatusChange={updateOrderStatus}
                                        />
                                    ))}
                                </AnimatePresence>
                                {columnOrders.length === 0 && (
                                    <div className="text-center py-8 text-zinc-600 text-sm">
                                        Nenhum pedido
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Order Detail Modal */}
            <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido ${selectedOrder?.id}`} size="md">
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-dark-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white">{selectedOrder.customer}</span>
                                <Badge variant={selectedOrder.type === 'delivery' ? 'primary' : 'info'}>
                                    {selectedOrder.type === 'delivery' ? 'Entrega' : 'Retirada'}
                                </Badge>
                            </div>
                            {selectedOrder.address && (
                                <p className="text-sm text-zinc-400 flex items-center gap-2">
                                    <MapPin size={14} />
                                    {selectedOrder.address}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase">Itens</h4>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-dark-100">
                                    <div>
                                        <span className="text-white">{item.qty}x {item.name}</span>
                                        {item.obs && <p className="text-xs text-zinc-500 mt-1">Obs: {item.obs}</p>}
                                    </div>
                                    <span className="font-medium text-white">{formatCurrency(item.price * item.qty)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Subtotal</span>
                                <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Taxa de entrega</span>
                                <span className="text-white">{formatCurrency(selectedOrder.deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-100">
                                <span className="text-white">Total</span>
                                <span className="text-primary-400">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-dark-100">
                            <Badge>{selectedOrder.payment}</Badge>
                            <Badge variant="default">{getTimeAgo(selectedOrder.timestamp)}</Badge>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ========================================
// MENU MANAGER VIEW
// ========================================

const ProductFormModal = ({ isOpen, onClose }) => {
    const addProduct = useAppStore(state => state.addProduct);
    const categories = useAppStore(state => state.categories);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'marmitas',
        image: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return;
        addProduct({
            ...form,
            price: parseFloat(form.price)
        });
        setForm({ name: '', description: '', price: '', category: 'marmitas', image: '' });
        onClose();
    };

    const categoryOptions = categories
        .filter(c => c.id !== 'all')
        .map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Produto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nome do Produto"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Smash Burger Triplo"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Preço (R$)"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                    <Select
                        label="Categoria"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        options={categoryOptions}
                    />
                </div>
                <Textarea
                    label="Descrição"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ingredientes, detalhes do prato..."
                    rows={3}
                />
                <Input
                    label="URL da Imagem"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                />
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                        Salvar Produto
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const MenuManagerView = () => {
    const products = useAppStore(state => state.products);
    const categories = useAppStore(state => state.categories);
    const toggleProductPause = useAppStore(state => state.toggleProductPause);
    const removeProduct = useAppStore(state => state.removeProduct);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>
                    Novo Produto
                </Button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-300 text-zinc-400 hover:text-white hover:bg-dark-200'
                            }`}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map(product => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`card group ${product.isPaused ? 'opacity-60' : ''}`}
                        >
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-all duration-500 ${product.isPaused ? 'grayscale' : 'group-hover:scale-110'
                                        }`}
                                />
                                {product.isPaused && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Badge variant="error">PAUSADO</Badge>
                                    </div>
                                )}
                                {product.isNew && !product.isPaused && (
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="success">NOVO</Badge>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-white line-clamp-1">{product.name}</h3>
                                    <span className="font-bold text-primary-400 whitespace-nowrap ml-2">
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{product.description}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <Star size={12} className="text-yellow-500" />
                                        <span>{product.rating}</span>
                                        <span className="text-zinc-600">({product.reviews})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleProductPause(product.id)}
                                            className={`p-2 rounded-lg transition-colors ${product.isPaused
                                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                                }`}
                                        >
                                            {product.isPaused ? <Play size={16} /> : <Pause size={16} />}
                                        </button>
                                        <button
                                            onClick={() => removeProduct(product.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
                <EmptyState
                    icon={Package}
                    title="Nenhum produto encontrado"
                    description="Adicione produtos ao seu cardápio para começar a vender."
                    action={<Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>Adicionar Produto</Button>}
                />
            )}

            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

// ========================================
// DELIVERY ZONES VIEW
// ========================================

const ZoneFormModal = ({ isOpen, onClose }) => {
    const addDeliveryZone = useAppStore(state => state.addDeliveryZone);
    const [form, setForm] = useState({ name: '', price: '', time: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return;
        addDeliveryZone({ ...form, price: parseFloat(form.price) });
        setForm({ name: '', price: '', time: '' });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Área de Entrega">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nome do Bairro/Região"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Vila Mariana"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Taxa (R$)"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                    <Input
                        label="Tempo Estimado"
                        value={form.time}
                        onChange={e => setForm({ ...form, time: e.target.value })}
                        placeholder="Ex: 30-45 min"
                    />
                </div>
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                        Adicionar Área
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const DeliveryZonesView = () => {
    const settings = useAppStore(state => state.settings);
    const removeDeliveryZone = useAppStore(state => state.removeDeliveryZone);
    const toggleDeliveryZone = useAppStore(state => state.toggleDeliveryZone);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Áreas de Entrega</h3>
                    <p className="text-sm text-zinc-500">{settings.deliveryFees.length} áreas cadastradas</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>
                    Nova Área
                </Button>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {settings.deliveryFees.map(zone => (
                        <motion.div
                            key={zone.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`glass-card flex items-center justify-between ${!zone.active ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                    <MapPin size={20} className="text-primary-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{zone.name}</h4>
                                    <p className="text-xs text-zinc-500">{zone.time || 'Tempo não definido'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold text-primary-400 text-lg">{formatCurrency(zone.price)}</span>
                                <Toggle
                                    checked={zone.active}
                                    onChange={() => toggleDeliveryZone(zone.id)}
                                    size="sm"
                                />
                                <button
                                    onClick={() => removeDeliveryZone(zone.id)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {settings.deliveryFees.length === 0 && (
                <EmptyState
                    icon={MapPin}
                    title="Nenhuma área cadastrada"
                    description="Adicione áreas de entrega para definir taxas por região."
                    action={<Button onClick={() => setIsModalOpen(true)} icon={PlusCircle}>Adicionar Área</Button>}
                />
            )}

            <ZoneFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

// ========================================
// SETTINGS VIEW
// ========================================

const SettingsView = () => {
    const settings = useAppStore(state => state.settings);
    const updateSettings = useAppStore(state => state.updateSettings);
    const [form, setForm] = useState({
        storeName: settings.storeName,
        whatsapp: settings.whatsapp,
        address: settings.address
    });

    const handleSave = () => {
        updateSettings(form);
    };

    return (
        <div className="space-y-6 animate-in max-w-2xl">
            <div className="glass-card">
                <h3 className="font-bold text-white mb-6">Informações da Loja</h3>
                <div className="space-y-4">
                    <Input
                        label="Nome da Loja"
                        value={form.storeName}
                        onChange={e => setForm({ ...form, storeName: e.target.value })}
                    />
                    <Input
                        label="WhatsApp (com DDI)"
                        value={form.whatsapp}
                        onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="5511999999999"
                    />
                    <Textarea
                        label="Endereço"
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        rows={2}
                    />
                    <Button onClick={handleSave} className="mt-4">
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="glass-card">
                <h3 className="font-bold text-white mb-6">Métodos de Pagamento</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💸</span>
                            <span className="font-medium text-white">PIX</span>
                        </div>
                        <Toggle checked={settings.paymentMethods.pix} onChange={() => { }} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💵</span>
                            <span className="font-medium text-white">Dinheiro</span>
                        </div>
                        <Toggle checked={settings.paymentMethods.cash} onChange={() => { }} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💳</span>
                            <span className="font-medium text-white">Cartão</span>
                        </div>
                        <Toggle checked={settings.paymentMethods.card} onChange={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========================================
// USERS & LOGINS VIEW
// ========================================

const UsersView = () => {
    const [users, setUsers] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'logs'

    useEffect(() => {
        // Subscribe to users
        const unsubUsers = subscribeToUsers((data) => {
            setUsers(data);
        });

        // Subscribe to login logs
        const unsubLogs = subscribeToLoginLogs((data) => {
            setLoginLogs(data);
        });

        return () => {
            unsubUsers();
            unsubLogs();
        };
    }, []);

    return (
        <div className="space-y-6 animate-in">
            {/* Sub Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveSubTab('users')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'users'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-300 text-zinc-400 hover:text-white'
                        }`}
                >
                    <UserCheck size={16} />
                    Usuários Cadastrados ({users.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('logs')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'logs'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-300 text-zinc-400 hover:text-white'
                        }`}
                >
                    <LogIn size={16} />
                    Histórico de Logins ({loginLogs.length})
                </button>
            </div>

            {activeSubTab === 'users' ? (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-100">
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Usuário</th>
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Telefone</th>
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Tipo</th>
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Cadastro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            Nenhum usuário cadastrado ainda
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className="border-b border-dark-100/50 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{user.displayName || 'Sem nome'}</p>
                                                        <p className="text-xs text-zinc-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {user.phone ? (
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <Phone size={14} />
                                                        <span className="text-sm">{user.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={user.role === 'admin' ? 'success' : 'default'}>
                                                    {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-sm text-zinc-400">
                                                {user.createdAt ? formatDate(user.createdAt) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-100">
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Usuário</th>
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Tipo</th>
                                    <th className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-zinc-500">
                                            Nenhum login registrado ainda
                                        </td>
                                    </tr>
                                ) : (
                                    loginLogs.map(log => (
                                        <tr key={log.id} className="border-b border-dark-100/50 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.type === 'register' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                                                        {log.type === 'register' ? (
                                                            <UserCheck size={18} className="text-green-400" />
                                                        ) : (
                                                            <LogIn size={18} className="text-blue-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{log.displayName || 'Usuário'}</p>
                                                        <p className="text-xs text-zinc-500">{log.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={log.type === 'register' ? 'success' : 'info'}>
                                                    {log.type === 'register' ? 'Cadastro' : 'Login'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-sm text-zinc-400">
                                                {log.timestamp ? formatDate(log.timestamp) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========================================
// ADMIN LAYOUT (MAIN)
// ========================================

export const AdminLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'orders': return <OrdersKanbanView />;
            case 'menu': return <MenuManagerView />;
            case 'delivery': return <DeliveryZonesView />;
            case 'users': return <UsersView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-dark-700 overflow-hidden">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <AdminHeader activeTab={activeTab} onMenuClick={() => setMobileMenuOpen(true)} />

                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {renderView()}
                </div>
            </main>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed inset-y-0 left-0 w-64 bg-dark-500 border-r border-dark-100 z-50 lg:hidden"
                        >
                            <div className="p-4 border-b border-dark-100 flex justify-between items-center">
                                <span className="font-bold text-white">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="p-4 space-y-1">
                                {[
                                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                    { id: 'orders', label: 'Pedidos', icon: UtensilsCrossed },
                                    { id: 'menu', label: 'Cardápio', icon: Package },
                                    { id: 'delivery', label: 'Entregas', icon: MapPin },
                                    { id: 'users', label: 'Usuários', icon: Users },
                                    { id: 'settings', label: 'Configurações', icon: Settings },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                        className={activeTab === item.id ? 'nav-item-active w-full' : 'nav-item w-full'}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLayout;
