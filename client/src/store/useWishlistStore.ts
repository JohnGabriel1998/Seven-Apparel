import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface WishlistState {
  items: string[];
  products: Product[];
  loading: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      products: [],
      loading: false,

      addItem: async (productId: string) => {
        try {
          const response = await api.post(`/wishlist/${productId}`);
          set({ 
            items: response.data.data.map((p: Product) => p._id),
            products: response.data.data 
          });
          toast.success('Added to wishlist');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
      },

      removeItem: async (productId: string) => {
        try {
          const response = await api.delete(`/wishlist/${productId}`);
          set({ 
            items: response.data.data.map((p: Product) => p._id),
            products: response.data.data 
          });
          toast.success('Removed from wishlist');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
        }
      },

      fetchWishlist: async () => {
        try {
          set({ loading: true });
          const response = await api.get('/wishlist');
          set({ 
            products: response.data.data,
            items: response.data.data.map((p: Product) => p._id),
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
