import { create } from 'zustand';
import api from '../lib/api';

interface User {
    id: string;
    name: string;
    phone: string;
    role: 'CLIENT' | 'BARBER' | 'ADMIN';
    image?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (phone, password) => {
        const response = await api.post('/auth/login', { phone, password });
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await api.get('/users/me');
                set({ user: response.data, isAuthenticated: true });
            }
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));
