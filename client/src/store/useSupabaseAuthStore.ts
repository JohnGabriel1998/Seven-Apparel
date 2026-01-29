import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useSupabaseAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) throw profileError;

          // Check if user is active
          if (!profile.is_active) {
            await supabase.auth.signOut();
            throw new Error('Your account has been deactivated. Please contact support.');
          }

          const user: User = {
            _id: profile.id,
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.email,
            phone: profile.phone,
            avatar: profile.avatar,
            role: profile.role,
            addresses: profile.addresses || [],
            preferences: profile.preferences,
          };

          // Clear previous cart data
          localStorage.removeItem('cart-storage');
          
          set({ 
            user, 
            session: data.session, 
            isAuthenticated: true, 
            loading: false 
          });

          // Fetch cart
          const { useCartStore } = await import('./useCartStore');
          await useCartStore.getState().fetchCart();
          
          toast.success('Welcome back!');
        } catch (error: any) {
          set({ loading: false });
          const errorMessage = error.message || 'Login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          });

          if (error) throw error;

          if (!data.user) {
            throw new Error('Registration failed');
          }

          // Wait a moment for the profile trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Get user profile (verify it was created)
          const { error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
          }

          const user: User = {
            _id: data.user.id,
            id: data.user.id,
            email: email,
            name: name,
            role: 'user',
            addresses: [],
          };

          // Clear previous cart data
          localStorage.removeItem('cart-storage');
          
          set({ 
            user, 
            session: data.session, 
            isAuthenticated: true, 
            loading: false 
          });

          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: async () => {
        localStorage.setItem('isLoggingOut', 'true');
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Logout error:', error);
        }

        localStorage.removeItem('cart-storage');
        
        set({ user: null, session: null, isAuthenticated: false });

        try {
          const { useCartStore } = await import('./useCartStore');
          useCartStore.setState({ items: [] });
        } catch (error) {
          console.error('Error clearing cart on logout:', error);
        }

        toast.success('Logged out successfully');

        setTimeout(() => {
          localStorage.removeItem('isLoggingOut');
        }, 1000);
      },

      updateUser: (user: User) => {
        set({ user });
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const dbUpdates: any = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
          if (updates.addresses !== undefined) dbUpdates.addresses = updates.addresses;
          if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;

          const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', currentUser.id);

          if (error) throw error;

          set({
            user: {
              ...currentUser,
              ...updates,
            },
          });

          toast.success('Profile updated successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to update profile');
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ isAuthenticated: false, user: null, session: null });
            return;
          }

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            set({ isAuthenticated: false, user: null, session: null });
            return;
          }

          // Check if user is active
          if (!profile.is_active) {
            await supabase.auth.signOut();
            toast.error('Your account has been deactivated.', { duration: 6000 });
            set({ isAuthenticated: false, user: null, session: null });
            return;
          }

          const user: User = {
            _id: profile.id,
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.email,
            phone: profile.phone,
            avatar: profile.avatar,
            role: profile.role,
            addresses: profile.addresses || [],
            preferences: profile.preferences,
          };

          set({ user, session, isAuthenticated: true });
        } catch (error) {
          console.error('Check auth error:', error);
          set({ isAuthenticated: false, user: null, session: null });
        }
      },
    }),
    {
      name: 'supabase-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useSupabaseAuthStore.getState();
  
  if (event === 'SIGNED_OUT') {
    useSupabaseAuthStore.setState({ 
      user: null, 
      session: null, 
      isAuthenticated: false 
    });
  } else if (event === 'SIGNED_IN' && session) {
    // Refresh user data on sign in
    await store.checkAuth();
  } else if (event === 'TOKEN_REFRESHED' && session) {
    useSupabaseAuthStore.setState({ session });
  }
});

export default useSupabaseAuthStore;
