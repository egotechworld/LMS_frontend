import { create } from 'zustand';

// Authentication is restored from the HttpOnly cookie via /users/me.
// No token or authentication state is persisted in browser storage.
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setSession: (user) => set({
    user,
    isAuthenticated: Boolean(user),
    isInitialized: true,
  }),

  clearSession: () => set({
    user: null,
    isAuthenticated: false,
    isInitialized: true,
  }),

  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null,
  })),
}));
