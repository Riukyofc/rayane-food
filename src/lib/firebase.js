import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, onSnapshot, query, orderBy, where, serverTimestamp, limit } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACLmrEPhly3hfn_Wq-bXTw92j1mVDKTwo",
    authDomain: "fastfood-5df4d.firebaseapp.com",
    projectId: "fastfood-5df4d",
    storageBucket: "fastfood-5df4d.firebasestorage.app",
    messagingSenderId: "709646150280",
    appId: "1:709646150280:web:3c9cb42c96ca68b216cd3d",
    measurementId: "G-S2HJRYHFT6"
};

// Admin email - only this user can access admin panel
export const ADMIN_EMAIL = 'marmitasrayane@gmail.com';
export const ADMIN_PIN = '8327';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// ========================================
// AUTH FUNCTIONS
// ========================================

// Log login activity to Firestore
const logLoginActivity = async (user, isNewUser = false) => {
    try {
        await addDoc(collection(db, 'loginLogs'), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            timestamp: serverTimestamp(),
            type: isNewUser ? 'register' : 'login',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            ip: 'client-side' // IP seria obtido no server-side
        });
    } catch (error) {
        console.error('Error logging login activity:', error);
    }
};

export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Log the login activity
        await logLoginActivity(userCredential.user, false);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login detail:", error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
};

export const registerWithEmail = async (email, password, displayName, phone = '') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });

        // Create user document in Firestore with phone
        await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            email,
            displayName,
            phone,
            role: email === ADMIN_EMAIL ? 'admin' : 'customer',
            createdAt: serverTimestamp(),
            addresses: []
        });

        // Log the registration activity
        await logLoginActivity(userCredential.user, true);

        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Registration detail:", error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};

const getAuthErrorMessage = (code) => {
    const messages = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'Este email já está em uso.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/invalid-email': 'Email inválido.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/invalid-credential': 'Credenciais inválidas.',
        'auth/operation-not-allowed': 'O provedor de login por email/senha não está ativado no Firebase Console.',
        'auth/internal-error': 'Erro interno do Firebase. Tente novamente.',
        'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
    };
    return messages[code] || `Erro ao autenticar (${code}). Tente novamente.`;
};

// ========================================
// FIRESTORE - LOGIN LOGS
// ========================================

export const subscribeToLoginLogs = (callback) => {
    const q = query(collection(db, 'loginLogs'), orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));
        callback(logs);
    });
};

export const getLoginLogs = async () => {
    try {
        const q = query(collection(db, 'loginLogs'), orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));
    } catch (error) {
        return [];
    }
};

// ========================================
// FIRESTORE - ORDERS
// ========================================

export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const subscribeToOrders = (callback) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            firestoreId: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        callback(orders);
    });
};

export const getOrdersByUser = async (userId) => {
    try {
        const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        return [];
    }
};

// ========================================
// FIRESTORE - PRODUCTS
// ========================================

export const addProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateProduct = async (productId, updates) => {
    try {
        await updateDoc(doc(db, 'products', productId), {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteProduct = async (productId) => {
    try {
        await deleteDoc(doc(db, 'products', productId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const subscribeToProducts = (callback) => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            firestoreId: doc.id,
            ...doc.data()
        }));
        callback(products);
    });
};

// ========================================
// FIRESTORE - SETTINGS
// ========================================

export const getSettings = async () => {
    try {
        const docRef = doc(db, 'settings', 'store');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const updateSettings = async (settings) => {
    try {
        await updateDoc(doc(db, 'settings', 'store'), {
            ...settings,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const subscribeToSettings = (callback) => {
    return onSnapshot(doc(db, 'settings', 'store'), (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};

// ========================================
// FIRESTORE - USER PROFILE
// ========================================

export const getUserProfile = async (uid) => {
    try {
        const q = query(collection(db, 'users'), where('uid', '==', uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const updateUserProfile = async (docId, updates) => {
    try {
        await updateDoc(doc(db, 'users', docId), {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get all registered users (for admin)
export const subscribeToUsers = (callback) => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        callback(users);
    });
};

export { auth, db, app };

// ========================================
// FIRESTORE - SEED INITIAL DATA
// ========================================

// Create or set settings document (for initial seed)
export const setSettings = async (settings) => {
    try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'store'), {
            ...settings,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error setting settings:', error);
        return { success: false, error: error.message };
    }
};

// Seed initial data (products and settings) if Firestore is empty
export const seedInitialData = async (initialProducts, initialSettings) => {
    try {
        // Check if products already exist
        const productsSnapshot = await getDocs(collection(db, 'products'));

        if (productsSnapshot.empty) {
            console.log('🌱 Seeding initial products...');
            // Add all initial products
            for (const product of initialProducts) {
                await addProduct(product);
            }
            console.log(`✅ Seeded ${initialProducts.length} products`);
        }

        // Check if settings exist
        const settingsDoc = await getDoc(doc(db, 'settings', 'store'));

        if (!settingsDoc.exists()) {
            console.log('🌱 Seeding initial settings...');
            await setSettings(initialSettings);
            console.log('✅ Seeded settings');
        }

        return { success: true };
    } catch (error) {
        console.error('Error seeding data:', error);
        return { success: false, error: error.message };
    }
};
