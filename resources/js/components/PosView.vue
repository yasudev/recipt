<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { Product } from '../types';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Tag,
  Sparkles,
  Package,
  AlertCircle,
  X,
} from 'lucide-vue-next';

const {
  products,
  cart,
  cartSubtotal,
  cartTaxAmount,
  cartTotal,
  cartTotalCount,
  formatCurrency,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  isCheckoutModalOpen,
  isAddProductModalOpen,
  editingProduct,
  settings,
} = usePosStore();

const searchQuery = ref('');
const isMobileCartDrawerOpen = ref(false);

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return products.value;

  return products.value.filter((prod) => {
    return (
      prod.name.toLowerCase().includes(query) ||
      (prod.sku && prod.sku.toLowerCase().includes(query))
    );
  });
});

const handleProductClick = (product: Product) => {
  addToCart(product);
};

const handleOpenCheckout = () => {
  if (cart.value.length === 0) return;
  isMobileCartDrawerOpen.value = false;
  isCheckoutModalOpen.value = true;
};

const handleOpenAddProduct = () => {
  editingProduct.value = null;
  isAddProductModalOpen.value = true;
};
</script>

<template>
  <div class="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
    <!-- Left / Center: Catalog & Fast Product Selector -->
    <div class="flex-1 flex flex-col overflow-y-auto border-r border-slate-800/80">
      <!-- Search & Category Bar -->
      <div class="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800/80 sticky top-0 z-10 backdrop-blur-md space-y-3">
        <!-- Search Input -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search product name, SKU, or barcode..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <button
            @click="handleOpenAddProduct"
            class="px-3 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition active:scale-95 shrink-0 flex items-center gap-1.5"
            title="Create new product"
          >
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">New Item</span>
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="p-3 sm:p-5 flex-1">
        <div
          v-if="filteredProducts.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5"
        >
          <div
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="handleProductClick(prod)"
            class="group p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-150 cursor-pointer shadow-sm flex flex-col justify-between active:scale-[0.98] select-none relative overflow-hidden"
          >
            <!-- Top Color Accent Bar -->
            <div
              class="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
              :style="{ backgroundColor: prod.color || '#6366f1' }"
            ></div>

            <div>
              <!-- SKU / Item code header -->
              <div class="flex items-center justify-between text-[10px] text-slate-400 mb-2 pt-1 font-mono">
                <span class="truncate uppercase bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  {{ prod.sku }}
                </span>
              </div>

              <!-- Product Name -->
              <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 line-clamp-2 mb-1 transition-colors">
                {{ prod.name }}
              </h4>
            </div>

            <!-- Price Footer -->
            <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span class="text-sm sm:text-base font-extrabold text-white font-mono">
                  {{ formatCurrency(prod.price ?? 0) }}
                </span>
              </div>

              <!-- Quick Add Indicator -->
              <div
                class="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition"
              >
                <Plus class="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Products State -->
        <div
          v-else
          class="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500"
        >
          <Package class="w-10 h-10 mb-2 opacity-30 text-slate-400" />
          <h4 class="text-sm font-semibold text-slate-300">No products found</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-xs">
            Try adjusting your search query or add a new product to your inventory.
          </p>
          <button
            @click="handleOpenAddProduct"
            class="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Add Product Now
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Register Cart Panel (Visible on Desktop / Sliding Drawer on Mobile) -->
    <div
      :class="[
        // Mobile layout: Fixed drawer if toggled, or bottom pill if closed
        'w-full lg:w-96 xl:w-[420px] flex flex-col bg-slate-900 shrink-0 border-l border-slate-800 shadow-xl',
        // Desktop always shows; mobile shows when isMobileCartDrawerOpen is true
        isMobileCartDrawerOpen ? 'fixed inset-y-0 right-0 z-50 lg:static' : 'hidden lg:flex',
      ]"
    >
      <!-- Cart Header -->
      <div class="h-16 px-4 sm:px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <ShoppingCart class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Current Sale</h3>
            <p class="text-[11px] text-slate-400 font-mono">{{ cartTotalCount }} items in cart</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="cart.length > 0"
            @click="clearCart"
            class="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition flex items-center gap-1"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <!-- Mobile close drawer button -->
          <button
            @click="isMobileCartDrawerOpen = false"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Cart Item List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div
          v-for="item in cart"
          :key="item.id"
          class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-3"
        >
          <div class="min-w-0 flex-1">
            <h5 class="text-xs font-bold text-white truncate">{{ item.name }}</h5>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[11px] text-slate-400 font-mono">
                {{ formatCurrency(item.unitPrice) }} each
              </span>
              <span
                v-if="item.isCustomPrice"
                class="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30"
              >
                Custom Price
              </span>
            </div>
          </div>

          <!-- Quantity Steppers -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="updateCartQuantity(item.id, -1)"
              class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <Minus class="w-3.5 h-3.5" />
            </button>
            <span class="w-6 text-center text-xs font-bold text-white font-mono">
              {{ item.quantity }}
            </span>
            <button
              @click="updateCartQuantity(item.id, 1)"
              class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Item Total & Delete -->
          <div class="text-right shrink-0 min-w-[65px]">
            <span class="text-xs font-bold text-white font-mono block">
              {{ formatCurrency(item.unitPrice * item.quantity) }}
            </span>
            <button
              @click="removeFromCart(item.id)"
              class="text-[10px] text-slate-500 hover:text-rose-400 transition mt-0.5"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Empty Cart Graphic -->
        <div
          v-if="cart.length === 0"
          class="h-64 flex flex-col items-center justify-center text-center text-slate-500 p-6"
        >
          <ShoppingCart class="w-10 h-10 mb-2 opacity-30 text-slate-400" />
          <p class="text-xs font-semibold text-slate-300">Cart is empty</p>
          <p class="text-[11px] text-slate-500 mt-1 max-w-xs">
            Tap items from the catalog on the left to add them to this sale.
          </p>
        </div>
      </div>

      <!-- Cart Bottom Calculations & Checkout CTA -->
      <div class="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 space-y-3 shrink-0">
        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span class="font-mono text-slate-200">{{ formatCurrency(cartSubtotal) }}</span>
          </div>
          <div v-if="settings.enableTax" class="flex justify-between text-slate-400">
            <span>Sales Tax ({{ settings.taxRate }}%)</span>
            <span class="font-mono text-slate-200">{{ formatCurrency(cartTaxAmount) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-bold text-white">
            <span>Total</span>
            <span class="text-xl font-extrabold text-indigo-400 font-mono">
              {{ formatCurrency(cartTotal) }}
            </span>
          </div>
        </div>

        <!-- Checkout Action Button -->
        <button
          @click="handleOpenCheckout"
          :disabled="cart.length === 0"
          :class="[
            'w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 active:scale-98',
            cart.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed',
          ]"
        >
          <CreditCard class="w-4 h-4" />
          <span>Charge {{ formatCurrency(cartTotal) }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile Floating Bottom Bar for Quick Cart access when closed -->
    <div
      v-if="!isMobileCartDrawerOpen && cartTotalCount > 0"
      class="lg:hidden fixed bottom-3 left-3 right-3 z-30"
    >
      <button
        @click="isMobileCartDrawerOpen = true"
        class="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 flex items-center justify-between active:scale-98 transition"
      >
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
            {{ cartTotalCount }}
          </span>
          <span>View Current Cart</span>
        </div>
        <span class="font-mono text-sm font-extrabold">
          {{ formatCurrency(cartTotal) }} &rarr;
        </span>
      </button>
    </div>
  </div>
</template>
