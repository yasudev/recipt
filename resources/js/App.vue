<script setup lang="ts">
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

const { activeTab } = usePosStore();
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
  </div>
</template>
