import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { subscribeToProducts, subscribeToSettings, subscribeToDeliveryZones, seedInitialData, addDeliveryZone, getSettings, getDocs, collection, db } from './lib/firebase'
import { useAppStore } from './store/useAppStore'

// Initial data for seeding (if Firestore is empty)
const INITIAL_PRODUCTS = [
    { name: "Marmita Executiva de Frango", description: "Filé de frango grelhado, arroz soltinho, feijão carioca, farofa da casa e salada mista.", price: 24.90, category: "marmitas", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=50", isNew: true, isPaused: false, rating: 4.8, reviews: 124 },
    { name: "Smash Burger Duplo", description: "Dois blends de 90g smash, cheddar inglês derretido, cebola caramelizada e molho especial.", price: 32.90, category: "burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 4.9, reviews: 89 },
    { name: "Marmita Fitness Low Carb", description: "Frango desfiado, legumes grelhados, brócolis, cenoura e batata doce.", price: 28.90, category: "marmitas", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 4.7, reviews: 67 },
    { name: "Bacon Cheese Burger", description: "Blend 150g, bacon crocante, queijo prato, alface, tomate e maionese.", price: 35.90, category: "burgers", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=400&q=50", isNew: true, isPaused: false, rating: 4.8, reviews: 156 },
    { name: "Milkshake de Oreo", description: "Sorvete de baunilha cremoso batido com Oreo e calda de chocolate.", price: 22.00, category: "drinks", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 4.9, reviews: 203 },
    { name: "Pizza Margherita", description: "Molho de tomate italiano, mozzarella di bufala, tomate cereja e manjericão.", price: 49.90, category: "pizzas", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 4.6, reviews: 78 },
    { name: "Coca-Cola Lata 350ml", description: "Refrigerante Coca-Cola gelado. Lata 350ml.", price: 6.00, category: "drinks", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 5.0, reviews: 45 },
    { name: "Brownie com Sorvete", description: "Brownie de chocolate 70% cacau com sorvete de creme.", price: 18.90, category: "desserts", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=400&q=50", isPaused: false, rating: 4.8, reviews: 92 },
];

const INITIAL_SETTINGS = {
    storeName: 'Restaurante Garcia',
    isOpen: true,
    whatsapp: '5511999999999',
    address: 'Av. Gastronômica, 1500 - Jardins, SP',
    openingHours: { weekdays: '11:00 - 23:00', weekends: '11:00 - 00:00' },
    paymentMethods: { pix: true, cash: true, card: true }
};

const INITIAL_DELIVERY_ZONES = [
    { name: 'Centro', price: 5.90, time: '30-40 min' },
    { name: 'Jardins', price: 7.00, time: '40-50 min' },
    { name: 'Bela Vista', price: 8.50, time: '45-55 min' },
    { name: 'Pinheiros', price: 9.00, time: '50-60 min' },
];

// Seed initial delivery zones if empty
const seedDeliveryZones = async () => {
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');

        const zonesSnapshot = await getDocs(collection(db, 'deliveryZones'));

        if (zonesSnapshot.empty) {
            console.log('🌱 Seeding initial delivery zones...');
            for (const zone of INITIAL_DELIVERY_ZONES) {
                await addDeliveryZone(zone);
            }
            console.log(`✅ Seeded ${INITIAL_DELIVERY_ZONES.length} delivery zones`);
        }
    } catch (error) {
        console.error('Error seeding delivery zones:', error);
    }
};

// Seed and subscribe to Firebase on startup
seedInitialData(INITIAL_PRODUCTS, INITIAL_SETTINGS);
seedDeliveryZones();

// Subscribe to real-time updates
subscribeToProducts((products) => {
    useAppStore.getState().setProducts(products);
});

subscribeToSettings((settings) => {
    useAppStore.getState().setSettings(settings);
});

subscribeToDeliveryZones((zones) => {
    useAppStore.getState().setDeliveryZones(zones);
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
