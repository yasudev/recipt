import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('pos_user') || 'null');
    } catch (e) {
        localStorage.removeItem('pos_user');
        return null;
    }
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('pos_token') || '');
    const user = ref(readStoredUser());

    const isAuthenticated = computed(() => !!token.value);

    async function login(email, password) {
        const res = await api.post('/login', { email, password });
        if (res.status !== 200) {
            const message =
                res.data?.errors?.email?.[0] || 'Invalid credentials. Please try again.';
            throw new Error(message);
        }
        token.value = res.data.token;
        user.value = res.data.user;
        localStorage.setItem('pos_token', token.value);
        localStorage.setItem('pos_user', JSON.stringify(user.value));
        return res.data.user;
    }

    async function logout() {
        try {
            if (token.value) {
                await api.post('/logout');
            }
        } catch (e) {
            /* ignore */
        }
        token.value = '';
        user.value = null;
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
    }

    return { token, user, isAuthenticated, login, logout };
});