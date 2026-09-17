<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div class="w-full max-w-sm">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-slate-800">YumInventory POS</h1>
                <p class="text-sm text-slate-500 mt-1">Sign in to your account</p>
            </div>

            <form @submit.prevent="submit" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        v-model="email"
                        type="email"
                        required
                        autocomplete="username"
                        placeholder="admin@pos.com"
                        class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        v-model="password"
                        type="password"
                        required
                        autocomplete="current-password"
                        placeholder="••••••••"
                        class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {{ error }}
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Sign in
                </button>
            </form>

            <p class="text-xs text-slate-400 text-center mt-4">
                Default account: admin@pos.com &middot; password
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { runSync } from '../services/sync';
import { useCatalogStore } from '../stores/catalog';
import { useSettingsStore } from '../stores/settings';

const router = useRouter();
const auth = useAuthStore();
const catalog = useCatalogStore();
const settings = useSettingsStore();

const email = ref('admin@pos.com');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
    error.value = '';
    loading.value = true;
    try {
        await auth.login(email.value, password.value);
        await catalog.loadLocal();
        await settings.loadLocal();
        runSync().then(async () => {
            await catalog.loadLocal();
            await settings.loadLocal();
        });
        router.push({ name: 'dashboard' });
    } catch (e) {
        error.value = e.message || 'Login failed';
    } finally {
        loading.value = false;
    }
}
</script>