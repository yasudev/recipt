<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { Product } from '../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShoppingCart,
  X,
} from 'lucide-vue-next';

const {
  products,
  formatCurrency,
  deleteProduct,
  addToCart,
  isAddProductModalOpen,
  editingProduct,
} = usePosStore();

const searchQuery = ref('');

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return products.value;

  return products.value.filter((p) => {
    return (
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  });
});

const openAddModal = () => {
  editingProduct.value = null;
  isAddProductModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  editingProduct.value = product;
  isAddProductModalOpen.value = true;
};

const handleDelete = (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete "${name}" from the product list?`)) {
    deleteProduct(id);
  }
};

const handleAddToCart = (product: Product) => {
  addToCart(product);
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Products
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          View, edit, and create products with automatically assigned item codes.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <span class="text-slate-400 font-sans">Total:</span>
          <span class="font-bold text-white ml-1.5">{{ products.length }} items</span>
        </div>

        <button
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div class="relative w-full">
        <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products by name or SKU / item code..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Products Table / Responsive Card List -->
    <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      <!-- Desktop Table Header -->
      <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div class="col-span-5">Product Name</div>
        <div class="col-span-3">Item Code / SKU</div>
        <div class="col-span-2">Price</div>
        <div class="col-span-2 text-right">Actions</div>
      </div>

      <!-- Items List -->
      <div v-if="filteredProducts.length > 0" class="divide-y divide-slate-800/70">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="p-4 sm:px-6 py-3.5 hover:bg-slate-800/40 transition flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center"
        >
          <!-- 1. Name with Color Avatar -->
          <div class="col-span-5 flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs text-white shadow-sm"
              :style="{ backgroundColor: product.color || '#6366f1' }"
            >
              {{ product.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-bold text-white truncate">{{ product.name }}</h4>
            </div>
          </div>

          <!-- 2. SKU / Item Code -->
          <div class="col-span-3 flex items-center">
            <span class="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 font-semibold">
              {{ product.sku }}
            </span>
          </div>

          <!-- 3. Price -->
          <div class="col-span-2">
            <span class="text-sm font-extrabold text-white font-mono">
              {{ formatCurrency(product.price ?? 0) }}
            </span>
          </div>

          <!-- 4. Actions -->
          <div class="col-span-2 flex items-center justify-end gap-1.5">
            <!-- Add to Cart Quick button -->
            <button
              @click="handleAddToCart(product)"
              class="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
              title="Add to current POS sale"
            >
              <ShoppingCart class="w-4 h-4" />
            </button>

            <!-- Edit button -->
            <button
              @click="openEditModal(product)"
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Edit product"
            >
              <Edit2 class="w-4 h-4" />
            </button>

            <!-- Delete button -->
            <button
              @click="handleDelete(product.id, product.name)"
              class="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
              title="Delete product"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
        <Package class="w-10 h-10 mb-2 opacity-30 text-slate-400" />
        <h4 class="text-sm font-semibold text-slate-300">No matching products</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-xs">
          No items match your search. Click below to add a new product.
        </p>
        <button
          @click="openAddModal"
          class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
        >
          Add New Product
        </button>
      </div>
    </div>
  </div>
</template>
