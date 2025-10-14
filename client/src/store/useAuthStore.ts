import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          
          // SECURITY FIX: Clear any previous user's cart data
          localStorage.removeItem('cart-storage');
          
          set({ user, token, isAuthenticated: true, loading: false });
          
          // Fetch server cart (don't sync local cart to prevent data leak)
          const { useCartStore } = await import('./useCartStore');
          await useCartStore.getState().fetchCart();
          
          toast.success('Welcome back!');
        } catch (error: any) {
          set({ loading: false });
          const errorMessage = error.response?.data?.message || 'Login failed';
          
          // Show specific error for deactivated accounts
          if (error.response?.status === 403) {
            toast.error(errorMessage, { duration: 5000 });
          } else {
            toast.error(errorMessage);
          }
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true });
          const response = await api.post('/auth/register', { name, email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          
          // SECURITY FIX: Clear any previous user's cart data
          localStorage.removeItem('cart-storage');
          
          set({ user, token, isAuthenticated: true, loading: false });
          
          // Fetch server cart (new user will have empty cart)
          const { useCartStore } = await import('./useCartStore');
          await useCartStore.getState().fetchCart();
          
          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      logout: async () => {
        localStorage.removeItem('token');
        
        // CRITICAL FIX: Clear cart data to prevent cross-user data leak
        localStorage.removeItem('cart-storage');
        
        // Reset auth state
        set({ user: null, token: null, isAuthenticated: false });
        
        // Clear cart in memory to prevent UI showing old data
        try {
          const { useCartStore } = await import('./useCartStore');
          useCartStore.setState({ items: [] });
        } catch (error) {
          console.error('Error clearing cart on logout:', error);
        }
        
        toast.success('Logged out successfully');
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true, token });
        } catch (error: any) {
          // Handle deactivated account
          if (error.response?.status === 403) {
            toast.error(error.response?.data?.message || 'Your account has been deactivated.', { 
              duration: 6000 
            });
          }
          
          localStorage.removeItem('token');
          localStorage.removeItem('cart-storage');
          set({ isAuthenticated: false, user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
