import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initSync } from './services/sync';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');

initSync();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((e) => {
            console.error('Service worker registration failed:', e);
        });
    });
}