<template>
    <div class="min-h-full flex flex-col lg:flex-row">
        <!-- Desktop sidebar -->
        <aside
            class="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 lg:h-screen lg:sticky lg:top-0"
        >
            <div class="px-5 py-5 border-b border-slate-200">
                <div class="text-lg font-bold text-indigo-600 truncate">YumInventory</div>
                <div class="text-xs text-slate-500">POS &amp; Inventory</div>
            </div>
            <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <router-link
                    v-for="link in navLinks"
                    :key="link.name"
                    :to="{ name: link.name }"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                    active-class="!bg-indigo-50 !text-indigo-700"
                >
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg">
                        <path :d="link.d" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span class="truncate">{{ link.label }}</span>
                </router-link>
            </nav>
            <div class="px-4 py-4 border-t border-slate-200">
                <div class="text-sm font-medium text-slate-700 truncate">{{ auth.user?.name }}</div>
                <div class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</div>
                <button
                    @click="handleLogout"
                    class="mt-2 w-full text-left text-xs font-medium text-red-600 hover:text-red-700"
                >
                    Sign out
                </button>
            </div>
        </aside>

        <!-- Main column -->
        <div class="flex-1 flex flex-col min-h-screen lg:min-w-0">
            <!-- Top bar (mobile) -->
            <header
                class="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3"
            >
                <router-link :to="{ name: 'dashboard' }" class="font-bold text-indigo-600">
                    YumInventory
                </router-link>
                <div class="flex items-center gap-2">
                    <OnlineBadge />
                    <button @click="handleLogout" class="text-slate-500 hover:text-red-600" title="Sign out">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </header>

            <OfflineBanner />

            <main class="flex-1 px-4 py-4 lg:px-8 lg:py-6 pb-24 lg:pb-6">
                <router-view />
            </main>
        </div>

        <!-- Mobile bottom nav -->
        <nav
            class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around px-2 pt-1.5 pb-3 lg:hidden"
        >
            <router-link
                v-for="link in mobileNav"
                :key="link.name"
                :to="{ name: link.name }"
                class="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium text-slate-500"
                active-class="!text-indigo-700"
            >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg">
                    <path :d="link.d" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ link.label }}
            </router-link>
        </nav>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import OfflineBanner from './OfflineBanner.vue';
import OnlineBadge from './OnlineBadge.vue';

const router = useRouter();
const auth = useAuthStore();

const paths = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    pos: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
};

function navItem(name, label, key) {
    return { name, label, d: paths[key] };
}

const navLinks = [
    navItem('dashboard', 'Dashboard', 'home'),
    navItem('pos', 'POS', 'pos'),
    navItem('products', 'Products', 'box'),
    navItem('categories', 'Categories', 'tag'),
    navItem('sales', 'Sales', 'history'),
    navItem('settings', 'Settings', 'settings'),
];

const mobileNav = [
    navItem('dashboard', 'Home', 'home'),
    navItem('pos', 'POS', 'pos'),
    navItem('products', 'Products', 'box'),
    navItem('sales', 'Sales', 'history'),
    navItem('settings', 'Settings', 'settings'),
];

async function handleLogout() {
    await auth.logout();
    router.push({ name: 'login' });
}
</script>