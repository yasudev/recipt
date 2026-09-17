import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/Login.vue'),
        meta: { public: true },
    },
    {
        path: '/',
        component: () => import('../components/Layout.vue'),
        children: [
            { path: '', name: 'dashboard', component: () => import('../views/Dashboard.vue') },
            { path: 'pos', name: 'pos', component: () => import('../views/POS.vue') },
            { path: 'products', name: 'products', component: () => import('../views/Products.vue') },
            { path: 'categories', name: 'categories', component: () => import('../views/Categories.vue') },
            { path: 'sales', name: 'sales', component: () => import('../views/SalesHistory.vue') },
            { path: 'settings', name: 'settings', component: () => import('../views/Settings.vue') },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    if (!to.meta.public && !auth.isAuthenticated) {
        return { name: 'login' };
    }
    if (to.name === 'login' && auth.isAuthenticated) {
        return { name: 'dashboard' };
    }
});

export default router;