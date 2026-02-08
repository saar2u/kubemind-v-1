import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api/client'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, deleteUser } from "firebase/auth"
import { initializeApp, getApps, getApp } from "firebase/app"

// --- REAL CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyApcbg57B0k8IDg6Rdt0Krkh9Wf_SVMVvI",
  authDomain: "kubemind-staging.firebaseapp.com",
  projectId: "kubemind-staging",
  storageBucket: "kubemind-staging.firebasestorage.app",
  messagingSenderId: "446293329392",
  appId: "1:446293329392:web:b70a20971c455a9934c935",
  measurementId: "G-EZSJHDELB7"
};

// --- SINGLETON INIT ---
let app, auth, provider;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase Init Error", e);
}

// --- TYPES ---
interface UserProfile {
  uid: string
  name: string
  email: string
  avatar?: string
  photoURL?: string
}

interface ConnectedAccount {
  id: string
  provider: string
  displayName: string
  connectedAt: string
  status: 'active' | 'error'
}

interface AccountState {
  user: UserProfile | null
  connectedAccounts: ConnectedAccount[]
  isAuthenticated: boolean
  lastLogin: string | null

  // Methods used by UI Components
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (e: string, p: string) => Promise<void> // Added back
  signUpWithEmail: (e: string, p: string) => Promise<void> // Added back
  signOut: () => Promise<void>
  
  // State management
  login: (email: string, name: string, uid: string, photo?: string) => void
  logout: () => void
  addConnectedAccount: (account: ConnectedAccount) => void
  removeConnectedAccount: (providerId: string) => void
  deleteAccount: () => Promise<void>
}

// --- STORE IMPLEMENTATION ---
export const useAccountStore = create<AccountState>()(persist((set, get) => ({
  user: null,
  connectedAccounts: [],
  isAuthenticated: false,
  lastLogin: null,

  signInWithGoogle: async () => {
      try {
        const res = await signInWithPopup(auth, provider);
        const user = res.user;
        get().login(user.email!, user.displayName || 'User', user.uid, user.photoURL || '');
      } catch (e: any) { alert(e.message); }
  },

  // Stub for Email login (since we use Google mostly, but UI needs this function to not crash)
  signInWithEmail: async (email) => get().login(email, email.split('@')[0], btoa(email), ''),
  signUpWithEmail: async (email) => get().login(email, email.split('@')[0], btoa(email), ''),

  signOut: async () => {
      if (auth) await signOut(auth);
      get().logout();
  },

  login: (email, name, uid, photoURL) => {
      localStorage.setItem('kubemind-user-email', email)
      set({ 
        isAuthenticated: true, 
        user: { uid, name, email, avatar: photoURL, photoURL }, 
        lastLogin: new Date().toISOString() 
      })
  },

  logout: () => {
      localStorage.removeItem('kubemind-user-email')
      set({ isAuthenticated: false, user: null, connectedAccounts: [] })
  },

  addConnectedAccount: (account) => set((state) => ({
    connectedAccounts: [...state.connectedAccounts.filter(a => a.provider !== account.provider), account]
  })),

  removeConnectedAccount: (providerId) => set((state) => ({
    connectedAccounts: state.connectedAccounts.filter((a) => a.provider !== providerId)
  })),

  deleteAccount: async () => {
    if (auth && auth.currentUser) {
        try {
            await api.deleteAccountPermanently(); // Wipe Backend
            await deleteUser(auth.currentUser);   // Wipe Firebase Auth
        } catch (e) { console.error("Delete partial error", e); }
    }
    // Always wipe local
    localStorage.clear();
    sessionStorage.clear();
    set({ user: null, connectedAccounts: [], isAuthenticated: false });
    window.location.href = '/';
  }
}), { name: 'kubemind-account' }))
