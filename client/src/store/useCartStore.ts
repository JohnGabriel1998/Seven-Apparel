import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product, color: string, size: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, color: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      // Fetch cart from server
      fetchCart: async () => {
        try {
          set({ loading: true });
          const { data } = await api.get('/cart');
          const cartItems = data.data.items.map((item: any) => ({
            productId: item.product._id || item.product,
            product: item.product,
            name: item.name,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            _id: item._id
          }));
          set({ items: cartItems, loading: false });
        } catch (error: any) {
          console.error('Fetch cart error:', error);
          set({ loading: false });
          // If not authenticated, use local cart
          if (error.response?.status === 401) {
            // Keep local cart
          }
        }
      },

      // Sync local cart with server (on login)
      syncCart: async () => {
        try {
          const localItems = get().items;
          if (localItems.length === 0) {
            // Just fetch server cart
            await get().fetchCart();
            return;
          }

          const { data } = await api.post('/cart/sync', { items: localItems });
          const cartItems = data.data.items.map((item: any) => ({
            productId: item.product._id || item.product,
            product: item.product,
            name: item.name,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            _id: item._id
          }));
          set({ items: cartItems });
          toast.success('Cart synced');
        } catch (error: any) {
          console.error('Sync cart error:', error);
          toast.error('Failed to sync cart');
        }
      },

      addItem: async (product, color, size, quantity) => {
        try {
          // Normalize image
          const firstImage = product.images?.[0];
          const imageUrl = typeof firstImage === 'string' 
            ? firstImage 
            : (firstImage as any)?.url || 'https://via.placeholder.com/150';

          const { data } = await api.post('/cart', {
            productId: product._id,
            name: product.name,
            image: imageUrl,
            color,
            size,
            quantity,
            price: product.price
          });

          // Update local state with server cart
          const cartItems = data.data.items.map((item: any) => ({
            productId: item.product._id || item.product,
            product: item.product,
            name: item.name,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            _id: item._id
          }));
          set({ items: cartItems });
          toast.success(data.message || 'Added to cart');
        } catch (error: any) {
          console.error('Add to cart error:', error);
          toast.error(error.response?.data?.message || 'Failed to add to cart');
          
          // Fallback to local cart if API fails
          const items = get().items;
          const existingItem = items.find(
            (item) =>
              item.productId === product._id &&
              item.color === color &&
              item.size === size
          );

          if (existingItem) {
            set({
              items: items.map((item) =>
                item.productId === product._id &&
                item.color === color &&
                item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          } else {
            const firstImage = product.images?.[0];
            const imageUrl = typeof firstImage === 'string' 
              ? firstImage 
              : (firstImage as any)?.url || 'https://via.placeholder.com/150';
            
            set({
              items: [
                ...items,
                {
                  productId: product._id,
                  product,
                  name: product.name,
                  image: imageUrl,
                  color,
                  size,
                  quantity,
                  price: product.price,
                },
              ],
            });
          }
        }
      },

      removeItem: async (productId, color, size) => {
        try {
          // Find item _id
          const item = get().items.find(
            (i) => i.productId === productId && i.color === color && i.size === size
          );

          if (item && (item as any)._id) {
            await api.delete(`/cart/${(item as any)._id}`);
            await get().fetchCart();
          } else {
            // Fallback to local removal
            set({
              items: get().items.filter(
                (i) =>
                  !(
                    i.productId === productId &&
                    i.color === color &&
                    i.size === size
                  )
              ),
            });
          }
          toast.success('Removed from cart');
        } catch (error: any) {
          console.error('Remove from cart error:', error);
          // Fallback to local removal
          set({
            items: get().items.filter(
              (i) =>
                !(
                  i.productId === productId &&
                  i.color === color &&
                  i.size === size
                )
            ),
          });
          toast.success('Removed from cart');
        }
      },

      updateQuantity: async (productId, color, size, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(productId, color, size);
          return;
        }

        try {
          const item = get().items.find(
            (i) => i.productId === productId && i.color === color && i.size === size
          );

          if (item && (item as any)._id) {
            await api.put(`/cart/${(item as any)._id}`, { quantity });
            await get().fetchCart();
          } else {
            // Fallback to local update
            set({
              items: get().items.map((i) =>
                i.productId === productId &&
                i.color === color &&
                i.size === size
                  ? { ...i, quantity }
                  : i
              ),
            });
          }
        } catch (error: any) {
          console.error('Update quantity error:', error);
          toast.error(error.response?.data?.message || 'Failed to update quantity');
        }
      },

      clearCart: async () => {
        try {
          await api.delete('/cart');
          set({ items: [] });
          toast.success('Cart cleared');
        } catch (error: any) {
          console.error('Clear cart error:', error);
          // Fallback to local clear
          set({ items: [] });
        }
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
