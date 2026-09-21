<script setup lang="ts">
import { computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import {
  Menu,
  ShoppingCart,
  Plus,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-vue-next';

const {
  activeTab,
  toggleDrawer,
  navigateTo,
  cartTotalCount,
  isAddProductModalOpen,
  editingProduct,
  settings,
  isApiConnected,
  isSyncing,
} = usePosStore();

const pageTitle = computed(() => {
  switch (activeTab.value) {
    case 'pos':
      return 'Point of Sale';
    case 'sales':
      return 'Sales History';
    case 'products':
      return 'Products & Catalog';
    case 'print-settings':
      return 'Print Settings';
    default:
      return 'Point of Sale';
  }
});

const handleOpenAddProduct = () => {
  editingProduct.value = null;
  isAddProductModalOpen.value = true;
};
</script>

<template>
  <header
    class="h-16 px-3 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between sticky top-0 z-30 shrink-0 gap-2 sm:gap-4"
  >
    <!-- Left: Hamburger Toggle & Page Heading -->
    <div class="flex items-center gap-2 sm:gap-3.5 min-w-0">
      <!-- Drawer Menu Toggle Button -->
      <button
        @click="toggleDrawer"
        class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center justify-center shrink-0 shadow-sm"
        title="Open Navigation Menu"
        aria-label="Open Navigation Menu"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Title & Badges -->
      <div class="truncate">
        <div class="flex items-center gap-2">
          <h2 class="text-base sm:text-lg font-bold text-white truncate tracking-tight">
            {{ pageTitle }}
          </h2>
          <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-indigo-400 border border-slate-700">
            {{ settings.currency }} {{ settings.storeName.split(' ')[0] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Quick Actions (MySQL Sync Status, Add Product, Cart) -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <!-- MySQL Sync Status Badge -->
      <div
        :class="[
          'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all',
          isApiConnected
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        ]"
        :title="isApiConnected ? 'Connected to MySQL database' : 'Connecting to database...'"
      >
        <span
          :class="[
            'w-2 h-2 rounded-full',
            isApiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          ]"
        ></span>
        <Cloud v-if="isApiConnected" class="w-3.5 h-3.5 text-emerald-400" />
        <CloudOff v-else class="w-3.5 h-3.5 text-slate-400" />
        <span class="font-sans font-medium text-[11px]">
          {{ isSyncing ? 'Syncing...' : isApiConnected ? 'MySQL Server' : 'Connecting' }}
        </span>
        <RefreshCw v-if="isSyncing" class="w-2.5 h-2.5 animate-spin text-emerald-300 ml-0.5" />
      </div>

      <!-- Add Product Quick Button -->
      <button
        @click="handleOpenAddProduct"
        class="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition active:scale-95 flex items-center justify-center"
        title="Add Product"
        aria-label="Add Product"
      >
        <Plus class="w-4 h-4" />
      </button>

      <!-- Cart Quick Access Button (Jumps to POS) -->
      <button
        @click="navigateTo('pos')"
        :class="[
          'p-2.5 rounded-xl transition shadow-sm active:scale-95 border relative flex items-center justify-center',
          cartTotalCount > 0
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-600/20'
            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700',
        ]"
        title="View POS Register & Cart"
        aria-label="View POS Register & Cart"
      >
        <ShoppingCart class="w-4 h-4" />
        <span
          v-if="cartTotalCount > 0"
          class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow"
        >
          {{ cartTotalCount }}
        </span>
      </button>
    </div>
  </header>
</template>
