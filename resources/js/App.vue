<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { usePosStore } from './composables/usePosStore';
import NavigationDrawer from './components/NavigationDrawer.vue';
import HeaderBar from './components/HeaderBar.vue';
import PosView from './components/PosView.vue';
import ProductsView from './components/ProductsView.vue';
import SalesView from './components/SalesView.vue';
import PrintSettingsView from './components/PrintSettingsView.vue';
import AddProductModal from './components/AddProductModal.vue';
import CustomPriceModal from './components/CustomPriceModal.vue';
import CheckoutModal from './components/CheckoutModal.vue';
import ReceiptModal from './components/ReceiptModal.vue';
import { WifiOff, Wifi } from 'lucide-vue-next';

const { activeTab } = usePosStore();

const isOnline = ref(navigator.onLine);
const showOfflineToast = ref(false);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  showOfflineToast.value = true;
  setTimeout(() => {
    showOfflineToast.value = false;
  }, 4000);
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<template>
  <div class="flex h-screen w-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans overflow-hidden">
    <!-- Responsive Navigation Drawer -->
    <NavigationDrawer />

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950">
      <!-- Top Responsive Header Bar -->
      <HeaderBar />

      <!-- Active View Body -->
      <main class="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
        <PosView v-if="activeTab === 'pos'" />
        <SalesView v-else-if="activeTab === 'sales'" />
        <ProductsView v-else-if="activeTab === 'products'" />
        <PrintSettingsView v-else-if="activeTab === 'print-settings'" />
      </main>
    </div>

    <!-- Modals & Drawers -->
    <AddProductModal />
    <CustomPriceModal />
    <CheckoutModal />
    <ReceiptModal />

    <!-- Network Status Toast Banner -->
    <div
      v-if="showOfflineToast"
      class="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-3 duration-200"
    >
      <div
        :class="[
          'px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2',
          isOnline
            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950 border-rose-500/40 text-rose-300',
        ]"
      >
        <Wifi v-if="isOnline" class="w-4 h-4" />
        <WifiOff v-else class="w-4 h-4" />
        <span>{{ isOnline ? 'Network online — local changes synchronized' : 'Offline mode — transactions saved to local cache' }}</span>
      </div>
    </div>
  </div>
</template>
