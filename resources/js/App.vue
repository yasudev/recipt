<template>
    <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useCatalogStore } from './stores/catalog';
import { useSettingsStore } from './stores/settings';
import { isOnline, runSync, onSyncComplete } from './services/sync';

const auth = useAuthStore();
const catalog = useCatalogStore();
const settings = useSettingsStore();

async function reloadLocal() {
    await Promise.all([catalog.loadLocal(), settings.loadLocal()]);
}

onMounted(async () => {
    if (!auth.isAuthenticated) return;
    await reloadLocal();
    if (isOnline.value) {
        runSync().then(reloadLocal);
    }
});

onSyncComplete(reloadLocal);
</script>