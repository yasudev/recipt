<script setup lang="ts">
import { computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { NavigationTab } from '../types';
import {
  ShoppingCart,
  ReceiptText,
  Package,
  Printer,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';

const {
  activeTab,
  isDrawerOpen,
  isDrawerCollapsed,
  closeDrawer,
  toggleDrawerCollapse,
  navigateTo,
  cartTotalCount,
  totalProductsCount,
  todayOrdersCount,
  settings,
} = usePosStore();

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
}

const navItems = computed<NavItem[]>(() => [
  {
    id: 'pos',
    label: 'POS',
    icon: ShoppingCart,
    badge: cartTotalCount.value > 0 ? cartTotalCount.value : undefined,
    badgeColor: 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: ReceiptText,
    badge: todayOrdersCount.value > 0 ? `${todayOrdersCount.value} today` : undefined,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    badge: totalProductsCount.value,
    badgeColor: 'bg-slate-800/90 text-slate-300 border border-slate-700/80',
  },
  {
    id: 'print-settings',
    label: 'Print Settings',
    icon: Printer,
  },
]);
</script>

<template>
  <div>
    <!-- Mobile/Tablet Backdrop Overlay -->
    <div
      v-if="isDrawerOpen"
      @click="closeDrawer"
      class="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm lg:hidden transition-opacity duration-300"
      aria-hidden="true"
    />

    <!-- Navigation Drawer Sidebar -->
    <aside
      :class="[
        // Mobile & Tablet Drawer Transition
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none lg:static',
        // Responsive visibility on mobile/tablet
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop collapsed rail width vs expanded width
        isDrawerCollapsed ? 'lg:w-20' : 'w-72 sm:w-80 lg:w-72',
      ]"
    >
      <!-- Drawer Header / Brand -->
      <div class="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0"
          >
            <Store class="w-5 h-5" />
          </div>

          <div
            v-if="!isDrawerCollapsed"
            class="transition-opacity duration-200 truncate"
          >
            <h1 class="text-sm font-bold text-white tracking-tight truncate">
              {{ settings.storeName || 'Yum POS' }}
            </h1>
            <div class="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Modern Retail & POS
            </div>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button
          @click="closeDrawer"
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
          title="Close Navigation Menu"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Desktop Collapse Toggle Button -->
        <button
          @click="toggleDrawerCollapse"
          class="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          :title="isDrawerCollapsed ? 'Expand Menu' : 'Collapse Menu'"
        >
          <ChevronRight v-if="isDrawerCollapsed" class="w-4 h-4" />
          <ChevronLeft v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Quick Action / Status Pill (when expanded) -->
      <div
        v-if="!isDrawerCollapsed"
        class="px-3.5 py-2.5 mx-3 my-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-300 font-medium">Terminal #1</span>
        </div>
        <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 font-mono">
          Local Mode
        </span>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="navigateTo(item.id)"
          :class="[
            'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all duration-150 group relative',
            activeTab === item.id
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 border border-indigo-500/40'
              : 'text-slate-300 hover:text-white font-semibold hover:bg-slate-800/80 border border-transparent hover:border-slate-800',
            isDrawerCollapsed ? 'justify-center px-2' : '',
          ]"
          :title="isDrawerCollapsed ? item.label : undefined"
        >
          <!-- Icon -->
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110',
              activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400',
            ]"
          />

          <!-- Label & Badge (Clean bold layout without p) -->
          <div
            v-if="!isDrawerCollapsed"
            class="flex-1 flex items-center justify-between min-w-0"
          >
            <span class="text-sm font-bold tracking-tight truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              :class="[
                'text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-2 font-mono',
                activeTab === item.id ? 'bg-white/20 text-white shadow-sm' : item.badgeColor,
              ]"
            >
              {{ item.badge }}
            </span>
          </div>

          <!-- Dot indicator for collapsed rail -->
          <span
            v-if="isDrawerCollapsed && activeTab === item.id"
            class="absolute right-1 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-indigo-400/30"
          ></span>
        </button>
      </nav>
    </aside>
  </div>
</template>
