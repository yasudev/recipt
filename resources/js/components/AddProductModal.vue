<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { X, PackagePlus, AlertCircle, DollarSign, Sparkles } from 'lucide-vue-next';

const {
  isAddProductModalOpen,
  editingProduct,
  addProduct,
  updateProduct,
  settings,
} = usePosStore();

const name = ref('');
const priceInput = ref('');
const autoSku = ref('');
const autoColor = ref('#6366f1');
const errorMsg = ref('');

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
];

const generateSku = () => {
  return `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
};

const generateColorFromName = (str: string) => {
  if (!str) return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

// Auto-update color preview when name changes if not in editing mode
watch(name, (newName) => {
  if (!editingProduct.value && newName.trim()) {
    autoColor.value = generateColorFromName(newName.trim());
  }
});

// Populate fields when editing or reset when adding
watch(
  () => isAddProductModalOpen.value,
  (isOpen) => {
    if (isOpen) {
      if (editingProduct.value) {
        name.value = editingProduct.value.name;
        priceInput.value =
          editingProduct.value.price !== null && editingProduct.value.price !== undefined
            ? String(editingProduct.value.price)
            : '';
        autoSku.value = editingProduct.value.sku || generateSku();
        autoColor.value = editingProduct.value.color || generateColorFromName(editingProduct.value.name);
      } else {
        name.value = '';
        priceInput.value = '';
        autoSku.value = generateSku();
        autoColor.value = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      }
      errorMsg.value = '';
    }
  }
);

const closeModal = () => {
  isAddProductModalOpen.value = false;
  editingProduct.value = null;
  errorMsg.value = '';
};

const handleSave = (e: Event) => {
  e.preventDefault();
  if (!name.value.trim()) {
    errorMsg.value = 'Product Name is required';
    return;
  }

  const parsedPrice = parseFloat(priceInput.value);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    errorMsg.value = 'Please enter a valid price (e.g. 150.00)';
    return;
  }

  const resolvedColor = autoColor.value || generateColorFromName(name.value.trim());
  const resolvedSku = autoSku.value || generateSku();
  const autoBarcode = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  if (editingProduct.value) {
    updateProduct(editingProduct.value.id, {
      name: name.value.trim(),
      price: parsedPrice,
      isPriceOptional: false,
      sku: resolvedSku,
      color: resolvedColor,
      category: editingProduct.value.category || 'general',
      stock: editingProduct.value.stock ?? 999,
      barcode: editingProduct.value.barcode || autoBarcode,
      description: '',
    });
  } else {
    addProduct({
      name: name.value.trim(),
      price: parsedPrice,
      isPriceOptional: false,
      sku: resolvedSku,
      color: resolvedColor,
      category: 'general',
      stock: 999,
      barcode: autoBarcode,
      description: '',
    });
  }

  closeModal();
};
</script>

<template>
  <div
    v-if="isAddProductModalOpen"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
  >
    <div
      class="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col my-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            :style="{ backgroundColor: autoColor }"
          >
            <span v-if="name.trim()">{{ name.trim().charAt(0).toUpperCase() }}</span>
            <PackagePlus v-else class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white">
              {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <p class="text-xs text-slate-400">
              Enter product name and price
            </p>
          </div>
        </div>

        <button
          @click="closeModal"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMsg"
        class="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMsg }}</span>
      </div>

      <!-- Streamlined Form: Name and Price only -->
      <form @submit="handleSave" class="space-y-4 mt-4">
        <!-- 1. Product Name -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Product Name <span class="text-indigo-400">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            autofocus
            placeholder="e.g. Iced Latte, Croissant, Espresso"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <!-- 2. Product Price -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Price <span class="text-indigo-400">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono select-none">
              {{ settings.currency }}
            </span>
            <input
              v-model="priceInput"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="150.00"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-14 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <!-- Auto-Generated System Badges (Color Tag & SKU/Item Code) -->
        <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
            <span class="text-[11px] text-slate-400">Auto SKU & Color:</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {{ autoSku }}
            </span>
            <span
              class="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
              :style="{ backgroundColor: autoColor }"
              title="Auto-assigned color tag"
            ></span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98"
          >
            {{ editingProduct ? 'Update Product' : 'Save Product' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
