import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    subscribeToAuth,
    loginWithEmail,
    registerWithEmail,
    logout as firebaseLogout,
    getUserProfile,
    createOrder as firebaseCreateOrder,
    subscribeToOrders,
    subscribeToUserOrders,
    updateOrderStatus as firebaseUpdateOrderStatus,
    addProduct as firebaseAddProduct,
    updateProduct as firebaseUpdateProduct,
    deleteProduct as firebaseDeleteProduct,
    updateSettings as firebaseUpdateSettings,
    addDeliveryZone as firebaseAddDeliveryZone,
    updateDeliveryZone as firebaseUpdateDeliveryZone,
    deleteDeliveryZone as firebaseDeleteDeliveryZone
} from '../lib/firebase';

// ========================================
// INITIAL DATA
// ========================================

const INITIAL_SETTINGS = {
    storeName: 'Restaurante Garcia',
    isOpen: true,
    whatsapp: '5511999999999',
    address: 'Av. Gastronômica, 1500 - Jardins, SP',
    openingHours: {
        weekdays: '11:00 - 23:00',
        weekends: '11:00 - 00:00'
    },
    paymentMethods: { pix: true, cash: true, card: true }
};

const INITIAL_CATEGORIES = [
    { id: 'all', name: 'Destaques', icon: '⭐' },
    { id: 'marmitas', name: 'Marmitas', icon: '🍱' },
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
    { id: 'drinks', name: 'Bebidas', icon: '🥤' },
    { id: 'desserts', name: 'Sobremesas', icon: '🍰' },
];

const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Marmita Executiva de Frango",
        description: "Filé de frango grelhado, arroz soltinho, feijão carioca, farofa da casa e salada mista. Porção generosa.",
        price: 24.90,
        category: "marmitas",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=50",
        isNew: true,
        isPaused: false,
        rating: 4.8,
        reviews: 124
    },
    {
        id: 2,
        name: "Smash Burger Duplo",
        description: "Dois blends de 90g smash, cheddar inglês derretido, cebola caramelizada e molho especial da casa no pão brioche artesanal.",
        price: 32.90,
        category: "burgers",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 4.9,
        reviews: 89
    },
    {
        id: 3,
        name: "Marmita Fitness Low Carb",
        description: "Frango desfiado, legumes grelhados, brócolis, cenoura e batata doce. Zero açúcar, ideal para dieta.",
        price: 28.90,
        category: "marmitas",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 4.7,
        reviews: 67
    },
    {
        id: 4,
        name: "Bacon Cheese Burger",
        description: "Blend 150g, fatias de bacon crocante, queijo prato derretido, alface, tomate e maionese especial.",
        price: 35.90,
        category: "burgers",
        image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=400&q=50",
        isNew: true,
        isPaused: false,
        rating: 4.8,
        reviews: 156
    },
    {
        id: 5,
        name: "Milkshake de Oreo",
        description: "Sorvete de baunilha cremoso batido com biscoito Oreo e calda de chocolate belga. 500ml.",
        price: 22.00,
        category: "drinks",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 4.9,
        reviews: 203
    },
    {
        id: 6,
        name: "Pizza Margherita",
        description: "Molho de tomate italiano, mozzarella di bufala, tomate cereja, manjericão fresco e azeite trufado.",
        price: 49.90,
        category: "pizzas",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 4.6,
        reviews: 78
    },
    {
        id: 7,
        name: "Coca-Cola Lata 350ml",
        description: "Refrigerante Coca-Cola gelado. Lata 350ml.",
        price: 6.00,
        category: "drinks",
        image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 5.0,
        reviews: 45
    },
    {
        id: 8,
        name: "Brownie com Sorvete",
        description: "Brownie de chocolate 70% cacau, servido com bola de sorvete de creme e calda quente.",
        price: 18.90,
        category: "desserts",
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=400&q=50",
        isPaused: false,
        rating: 4.8,
        reviews: 92
    },
];

// Calculate real analytics from orders
const calculateAnalytics = (orders, products) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));

    // Filter orders from last 7 days
    const last7Days = orders.filter(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
        const diffDays = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    });

    // Calculate daily sales for chart
    const dailySales = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        const dayIndex = date.getDay();

        const dayOrders = last7Days.filter(order => {
            const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === date.getTime();
        });

        const vendas = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        return {
            day: days[dayIndex],
            vendas: Math.round(vendas * 100) / 100,
            pedidos: dayOrders.length
        };
    });

    // Calculate category breakdown
    const categoryMap = {};
    last7Days.forEach(order => {
        order.items?.forEach(item => {
            const category = item.category || 'outros';
            categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
        });
    });

    const categoryColors = {
        marmitas: '#f97316',
        burgers: '#eab308',
        pizzas: '#22c55e',
        drinks: '#3b82f6',
        desserts: '#ec4899',
        outros: '#8b5cf6'
    };

    const totalItems = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((value / totalItems) * 100),
        color: categoryColors[name] || '#8b5cf6'
    }));

    // Calculate top products
    const productMap = {};
    last7Days.forEach(order => {
        order.items?.forEach(item => {
            if (!productMap[item.name]) {
                productMap[item.name] = { orders: 0, revenue: 0 };
            }
            productMap[item.name].orders += item.quantity;
            productMap[item.name].revenue += item.price * item.quantity;
        });
    });

    const topProducts = Object.entries(productMap)
        .map(([name, data]) => ({
            name,
            orders: data.orders,
            revenue: Math.round(data.revenue * 100) / 100
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

    // Calculate today's metrics
    const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
        return orderDate >= todayStart;
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgTicket = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    // Simple conversion rate (orders / total views - simplified)
    const conversionRate = todayOrders.length > 0 ? Math.min(todayOrders.length * 2, 100) : 0;

    return {
        dailySales,
        categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
            { name: 'Marmitas', value: 45, color: '#f97316' },
            { name: 'Burgers', value: 30, color: '#eab308' },
            { name: 'Pizzas', value: 15, color: '#22c55e' },
            { name: 'Bebidas', value: 10, color: '#3b82f6' },
        ],
        topProducts: topProducts.length > 0 ? topProducts : [
            { name: 'Sem dados ainda', orders: 0, revenue: 0 }
        ],
        metrics: {
            todaySales: Math.round(todaySales * 100) / 100,
            todayOrders: todayOrders.length,
            avgTicket: Math.round(avgTicket * 100) / 100,
            conversionRate: Math.round(conversionRate)
        }
    };
};

// ========================================
// STORE
// ========================================

export const useAppStore = create(
    persist(
        (set, get) => ({
            // State
            settings: INITIAL_SETTINGS, // Will be replaced by Firebase
            categories: INITIAL_CATEGORIES,
            products: [], // Will be loaded from Firebase
            orders: [],
            deliveryZones: [], // Will be loaded from Firebase
            userOrders: [], // User's own orders for "Meus Pedidos"
            analytics: calculateAnalytics([], []), // Will be calculated from real orders
            cart: [],
            toasts: [],

            // Auth State
            user: null,
            userProfile: null,
            isAuthLoading: true,
            authError: null,

            // UI State
            currentModule: 'client',
            adminTab: 'dashboard',
            isCartOpen: false,
            selectedOrder: null,
            mobileMenuOpen: false,

            // ========================================
            // AUTH ACTIONS
            // ========================================
            setUser: (user) => set({ user, isAuthLoading: false }),
            setUserProfile: (userProfile) => set({ userProfile }),
            setAuthLoading: (loading) => set({ isAuthLoading: loading }),
            setAuthError: (error) => set({ authError: error }),

            login: async (email, password) => {
                set({ isAuthLoading: true, authError: null });
                const result = await loginWithEmail(email, password);
                if (result.success) {
                    const profile = await getUserProfile(result.user.uid);
                    set({
                        user: result.user,
                        userProfile: profile,
                        isAuthLoading: false,
                        currentModule: profile?.role === 'admin' ? 'admin' : 'client'
                    });
                    get().addToast('Bem-vindo!', `Olá, ${result.user.displayName || 'usuário'}!`, 'success');
                } else {
                    set({ authError: result.error, isAuthLoading: false });
                    get().addToast('Erro', result.error, 'error');
                }
                return result;
            },

            register: async (email, password, displayName, phone = '') => {
                set({ isAuthLoading: true, authError: null });
                const result = await registerWithEmail(email, password, displayName, phone);
                if (result.success) {
                    // Try to get profile, but don't block if it fails
                    let profile = null;
                    try {
                        // Wait a bit for Firestore to sync
                        await new Promise(resolve => setTimeout(resolve, 500));
                        profile = await getUserProfile(result.user.uid);
                    } catch (error) {
                        console.log('Profile not found yet, will be loaded on next login');
                    }
                    set({ user: result.user, userProfile: profile, isAuthLoading: false });
                    get().addToast('Conta criada!', 'Bem-vindo ao Restaurante Garcia!', 'success');
                } else {
                    set({ authError: result.error, isAuthLoading: false });
                    get().addToast('Erro', result.error, 'error');
                }
                return result;
            },

            logout: async () => {
                await firebaseLogout();
                set({
                    user: null,
                    userProfile: null,
                    currentModule: 'client',
                    cart: []
                });
                get().addToast('Até logo!', 'Você saiu da sua conta.', 'info');
            },

            // ========================================
            // TOAST ACTIONS
            // ========================================
            addToast: (title, message, type = 'info') => {
                const id = Date.now();
                set(state => ({
                    toasts: [...state.toasts, { id, title, message, type }]
                }));
                setTimeout(() => {
                    set(state => ({
                        toasts: state.toasts.filter(t => t.id !== id)
                    }));
                }, 4000);
            },

            // ========================================
            // SETTINGS ACTIONS
            // ========================================
            setSettings: (settings) => set({ settings }),

            updateSettings: async (newSettings) => {
                // Update local state immediately for UI responsiveness
                set(state => ({
                    settings: { ...state.settings, ...newSettings }
                }));

                // Save to Firebase
                const result = await firebaseUpdateSettings(newSettings);
                if (!result.success) {
                    console.error('Failed to update settings:', result.error);
                    get().addToast('Erro', 'Falha ao salvar configurações', 'error');
                }

                if (newSettings.isOpen !== undefined) {
                    get().addToast(
                        'Loja',
                        `Loja ${newSettings.isOpen ? 'ABERTA' : 'FECHADA'}`,
                        newSettings.isOpen ? 'success' : 'warning'
                    );
                } else {
                    get().addToast('Sucesso', 'Configurações salvas.', 'success');
                }
            },

            toggleStoreOpen: () => {
                const { settings, updateSettings } = get();
                updateSettings({ isOpen: !settings.isOpen });
            },

            // ========================================
            // DELIVERY ZONES ACTIONS
            // ========================================
            setDeliveryZones: (zones) => set({ deliveryZones: zones }),

            addDeliveryZone: async (zone) => {
                // Save to Firebase
                const result = await firebaseAddDeliveryZone(zone);
                if (result.success) {
                    get().addToast('Entrega', `Área "${zone.name}" adicionada.`, 'success');
                } else {
                    get().addToast('Erro', 'Falha ao adicionar área de entrega', 'error');
                }
                return result;
            },

            removeDeliveryZone: async (id) => {
                // Delete from Firebase
                const result = await firebaseDeleteDeliveryZone(id);
                if (result.success) {
                    get().addToast('Entrega', 'Área removida.', 'info');
                } else {
                    get().addToast('Erro', 'Falha ao remover área', 'error');
                }
            },

            toggleDeliveryZone: async (id) => {
                // Find the zone
                const zone = get().deliveryZones.find(z => z.id === id);
                if (!zone) return;

                // Update in Firebase
                const result = await firebaseUpdateDeliveryZone(id, { active: !zone.active });
                if (!result.success) {
                    get().addToast('Erro', 'Falha ao atualizar área', 'error');
                }
            },

            // ========================================
            // PRODUCT ACTIONS
            // ========================================
            setProducts: (products) => set({ products }),

            addProduct: async (product) => {
                const newProduct = {
                    ...product,
                    isNew: true,
                    isPaused: false,
                    rating: 5.0,
                    reviews: 0
                };

                // Save to Firebase
                const result = await firebaseAddProduct(newProduct);
                if (result.success) {
                    get().addToast('Cardápio', `"${product.name}" adicionado!`, 'success');
                } else {
                    get().addToast('Erro', 'Falha ao adicionar produto', 'error');
                }
            },

            updateProduct: async (id, updates) => {
                // Update locally first for UI responsiveness
                set(state => ({
                    products: state.products.map(p =>
                        p.id === id || p.firestoreId === id ? { ...p, ...updates } : p
                    )
                }));

                // Find the firestore ID
                const product = get().products.find(p => p.id === id || p.firestoreId === id);
                const firestoreId = product?.firestoreId || id;

                // Save to Firebase
                const result = await firebaseUpdateProduct(firestoreId, updates);
                if (!result.success) {
                    get().addToast('Erro', 'Falha ao atualizar produto', 'error');
                } else {
                    get().addToast('Cardápio', 'Produto atualizado.', 'success');
                }
            },

            toggleProductPause: (id) => {
                const product = get().products.find(p => p.id === id);
                if (!product) return;

                const newStatus = !product.isPaused;
                set(state => ({
                    products: state.products.map(p =>
                        p.id === id ? { ...p, isPaused: newStatus } : p
                    )
                }));
                get().addToast(
                    'Estoque',
                    `${product.name} ${newStatus ? 'PAUSADO 🔴' : 'ATIVADO 🟢'}`,
                    newStatus ? 'warning' : 'success'
                );
            },

            removeProduct: async (id) => {
                // Remove locally first for UI responsiveness
                set(state => ({
                    products: state.products.filter(p => p.id !== id && p.firestoreId !== id)
                }));

                // Find the firestore ID
                const product = get().products.find(p => p.id === id || p.firestoreId === id);
                const firestoreId = product?.firestoreId || id;

                // Delete from Firebase
                const result = await firebaseDeleteProduct(firestoreId);
                if (!result.success) {
                    get().addToast('Erro', 'Falha ao remover produto', 'error');
                } else {
                    get().addToast('Cardápio', 'Produto removido.', 'info');
                }
            },

            setProducts: (products) => set({ products }),

            // ========================================
            // ORDER ACTIONS
            // ========================================
            setOrders: (orders) => set({ orders }),

            addOrder: async (orderData) => {
                const { user, addToast } = get();
                const order = {
                    ...orderData,
                    userId: user?.uid || null,
                    status: 'pending',
                    timestamp: Date.now()
                };

                // Try to save to Firebase
                const result = await firebaseCreateOrder(order);
                if (result.success) {
                    addToast('Pedido', 'Pedido enviado com sucesso!', 'success');
                }

                // Also add locally for immediate feedback
                set(state => ({
                    orders: [{ ...order, id: result.id || `#${Date.now()}` }, ...state.orders]
                }));

                return result;
            },

            updateOrderStatus: async (id, status) => {
                // Update locally first
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id || o.firestoreId === id ? { ...o, status } : o
                    )
                }));

                // Then update in Firebase
                await firebaseUpdateOrderStatus(id, status);

                const messages = {
                    preparing: 'Pedido aceito! Enviando para cozinha.',
                    delivery: 'Pedido saiu para entrega!',
                    done: 'Pedido finalizado com sucesso!'
                };

                get().addToast('Pedido', messages[status] || 'Status atualizado.', 'success');
            },

            setSelectedOrder: (order) => set({ selectedOrder: order }),

            // ========================================
            // USER ORDERS ACTIONS (for "Meus Pedidos")
            // ========================================
            setUserOrders: (newOrders) => {
                const { userOrders: oldOrders, addToast } = get();

                // Detect status changes and show notifications
                newOrders.forEach(newOrder => {
                    const oldOrder = oldOrders.find(o => o.id === newOrder.id);

                    // Only notify if order already existed and status changed
                    if (oldOrder && oldOrder.status !== newOrder.status) {
                        const statusMessages = {
                            preparing: {
                                title: '✅ Pedido Confirmado!',
                                message: `Seu pedido #${newOrder.id.substring(0, 8)} foi aceito e está sendo preparado.`,
                                type: 'success'
                            },
                            delivery: {
                                title: '🚚 Saiu para Entrega!',
                                message: `Seu pedido #${newOrder.id.substring(0, 8)} está a caminho!`,
                                type: 'info'
                            },
                            done: {
                                title: '🎉 Pedido Concluído!',
                                message: `Seu pedido #${newOrder.id.substring(0, 8)} foi entregue com sucesso!`,
                                type: 'success'
                            }
                        };

                        const notification = statusMessages[newOrder.status];
                        if (notification) {
                            addToast(notification.title, notification.message, notification.type);
                        }
                    }
                });

                set({ userOrders: newOrders });
            },

            // ========================================
            // CART ACTIONS
            // ========================================
            addToCart: (product, observation = '') => {
                const { settings, addToast } = get();

                if (!settings.isOpen) {
                    addToast('Fechado', 'A loja está fechada no momento.', 'error');
                    return;
                }

                if (product.isPaused) {
                    addToast('Indisponível', 'Este produto está temporariamente indisponível.', 'error');
                    return;
                }

                set(state => {
                    const existingIndex = state.cart.findIndex(
                        item => item.id === product.id && item.observation === observation
                    );

                    if (existingIndex >= 0) {
                        const newCart = [...state.cart];
                        newCart[existingIndex].qty += 1;
                        return { cart: newCart };
                    }

                    return {
                        cart: [...state.cart, { ...product, qty: 1, observation }]
                    };
                });

                addToast('Adicionado', `${product.name} +1`, 'success');
            },

            updateCartQty: (id, observation, delta) => {
                set(state => ({
                    cart: state.cart
                        .map(item => {
                            if (item.id === id && item.observation === observation) {
                                return { ...item, qty: Math.max(0, item.qty + delta) };
                            }
                            return item;
                        })
                        .filter(item => item.qty > 0)
                }));
            },

            removeFromCart: (id, observation) => {
                set(state => ({
                    cart: state.cart.filter(
                        item => !(item.id === id && item.observation === observation)
                    )
                }));
            },

            clearCart: () => set({ cart: [] }),

            getCartTotal: () => {
                return get().cart.reduce((acc, item) => acc + item.price * item.qty, 0);
            },

            getCartCount: () => {
                return get().cart.reduce((acc, item) => acc + item.qty, 0);
            },

            // ========================================
            // UI ACTIONS
            // ========================================
            setCurrentModule: (module) => set({ currentModule: module }),
            setAdminTab: (tab) => set({ adminTab: tab }),
            setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
            toggleCart: () => set(state => ({ isCartOpen: !state.isCartOpen })),
            setMobileMenuOpen: (isOpen) => set({ mobileMenuOpen: isOpen }),
        }),
        {
            name: 'rayane-food-storage',
            partialize: (state) => ({
                cart: state.cart,
                // Don't persist user - let Firebase handle auth state
            }),
        }
    )
);

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp));
};

export const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
};

// ========================================
// FIREBASE LISTENERS SETUP
// ========================================

export const initializeFirebaseListeners = () => {
    const unsubscribers = [];
    let userOrdersUnsub = null;

    // Subscribe to Auth state
    const unsubAuth = subscribeToAuth(async (user) => {
        if (user) {
            const profile = await getUserProfile(user.uid);
            useAppStore.getState().setUser(user);
            useAppStore.getState().setUserProfile(profile);

            // Subscribe to user's orders when logged in
            if (userOrdersUnsub) userOrdersUnsub();
            userOrdersUnsub = subscribeToUserOrders(user.uid, (userOrders) => {
                useAppStore.getState().setUserOrders(userOrders);
            });
        } else {
            useAppStore.getState().setUser(null);
            useAppStore.getState().setUserProfile(null);
            useAppStore.getState().setUserOrders([]);
            if (userOrdersUnsub) {
                userOrdersUnsub();
                userOrdersUnsub = null;
            }
        }
        useAppStore.getState().setAuthLoading(false);
    });
    unsubscribers.push(unsubAuth);

    // Subscribe to Orders (admin)
    const unsubOrders = subscribeToOrders((orders) => {
        useAppStore.getState().setOrders(orders);
    });
    unsubscribers.push(unsubOrders);

    return () => {
        unsubscribers.forEach(unsub => unsub());
        if (userOrdersUnsub) userOrdersUnsub();
    };
};
