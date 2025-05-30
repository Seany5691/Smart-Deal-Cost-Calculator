import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { AuthState, User } from '@/lib/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const { token, user } = await authAPI.login(username, password);
          set({ user, token, isAuthenticated: true });
          localStorage.setItem('token', token);
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      getUsers: async () => {
        try {
          return await authAPI.getUsers();
        } catch (error) {
          console.error('Failed to get users:', error);
          return [];
        }
      },

      addUser: async (username: string, password: string, role: 'admin' | 'user') => {
        try {
          await authAPI.addUser(username, password, role);
          return true;
        } catch (error) {
          console.error('Failed to add user:', error);
          return false;
        }
      },

      updateUser: async (id: string, updates: Partial<User & { password?: string }>) => {
        try {
          await authAPI.updateUser(id, updates);
          return true;
        } catch (error) {
          console.error('Failed to update user:', error);
          return false;
        }
      },

      deleteUser: async (id: string) => {
        try {
          await authAPI.deleteUser(id);
          return true;
        } catch (error) {
          console.error('Failed to delete user:', error);
          return false;
        }
      },

      changePassword: async (userId: string, newPassword: string) => {
        try {
          await authAPI.changePassword(userId, newPassword);
          return true;
        } catch (error) {
          console.error('Failed to change password:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
