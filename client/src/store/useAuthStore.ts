import { create } from 'zustand';
import { API_BASE } from '../lib/api';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<{ ok: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
    isAuthenticated: false,
    isLoading: true,

    login: async (password: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                const data = await res.json();
                return { ok: false, error: data.error || 'Invalid password' };
            }

            set({ isAuthenticated: true });
            return { ok: true };
        } catch {
            return { ok: false, error: 'Server error. Is the backend running?' };
        }
    },

    logout: async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // ignore
        }
        set({ isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/verify`, {
                credentials: 'include',
            });
            set({ isAuthenticated: res.ok, isLoading: false });
        } catch {
            set({ isAuthenticated: false, isLoading: false });
        }
    },
}));
