import { create } from 'zustand';
import { User } from '../types';
import { storage } from '../utils/storage';

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];
  setAuth: (token: string, user: User, permissions?: string[]) => void;
  setPermissions: (permissions: string[]) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = storage.getToken();
  const initialUser = storage.getUser<User>();
  const initialPermissions = initialUser?.permissions || [];

  return {
    token: initialToken,
    user: initialUser,
    permissions: initialPermissions,

    setAuth: (token: string, user: User, permissions: string[] = []) => {
      const userPermissions = permissions.length > 0 ? permissions : (user.permissions || []);
      const updatedUser = { ...user, permissions: userPermissions };
      
      storage.setToken(token);
      storage.setUser(updatedUser);

      set({
        token,
        user: updatedUser,
        permissions: userPermissions,
      });
    },

    setPermissions: (permissions: string[]) => {
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, permissions };
        storage.setUser(updatedUser);
        set({ user: updatedUser, permissions });
      } else {
        set({ permissions });
      }
    },

    logout: () => {
      storage.clearAuth();
      set({ token: null, user: null, permissions: [] });
    },

    hasPermission: (permission: string) => {
      const state = get();
      if (!state.user || !state.token) return false;

      // Admin role bypasses permission check if needed, or check explicit permissions list
      if (state.user.roles?.includes('Admin')) {
        return true;
      }

      return state.permissions.includes(permission);
    },

    isAdmin: () => {
      const user = get().user;
      return !!user?.roles?.includes('Admin');
    }
  };
});
