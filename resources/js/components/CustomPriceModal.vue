<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { X, DollarSign, Tag, Check, Sparkles } from 'lucide-vue-next';

const {
  isCustomPriceModalOpen,
  pendingProductForCustomPrice,
  addToCart,
  formatCurrency,
  settings,
} = usePosStore();

const customPrice = ref<string>('');
const error = ref('');

watch(
  () => isCustomPriceModalOpen.value,
  (isOpen) => {
    if (isOpen) {
      customPrice.value = '';
      error.value = '';
    }
  }
);

const closeModal = () => {
  isCustomPriceModalOpen.value = false;
  pendingProductForCustomPrice.value = null;
  customPrice.value = '';
  error.value = '';
};

const handleKeypad = (val: string) => {
  if (val === '.' && customPrice.value.includes('.')) return;
  if (val === 'clear') {
    customPrice.value = '';
    return;
  }
  if (val === 'backspace') {
    customPrice.value = customPrice.value.slice(0, -1);
    return;
  }
  customPrice.value += val;
};

const handleConfirm = (e?: Event) => {
  if (e) e.preventDefault();
  if (!pendingProductForCustomPrice.value) return;

  const parsed = customPrice.value.trim() === '' ? 0 : parseFloat(customPrice.value);
  if (isNaN(parsed) || parsed < 0) {
    error.value = 'Please enter a valid amount (e.g. 15.00 or 0 for complimentary)';
    return;
  }

  // Add to cart with custom price override!
  addToCart(pendingProductForCustomPrice.value, parsed);
  closeModal();
};
</script>

<template>
  <div
    v-if="isCustomPriceModalOpen && pendingProductForCustomPrice"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4"
  >
    <div
      class="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 animate-in slide-in-from-bottom-4 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Tag class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Enter Custom Price</h3>
            <p class="text-xs text-purple-300 font-medium truncate max-w-[200px] sm:max-w-xs">
              {{ pendingProductForCustomPrice.name }}
            </p>
          </div>
        </div>

        <button
          @click="closeModal"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Item context notice -->
      <div class="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>SKU: {{ pendingProductForCustomPrice.sku }}</span>
        <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
          Optional Price Item
        </span>
      </div>

      <!-- Display Price Input -->
      <div class="mb-4">
        <label class="block text-xs font-medium text-slate-400 mb-1.5">
          Unit Price for this Sale
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 font-mono select-none">
            {{ settings.currency }}
          </span>
          <input
            v-model="customPrice"
            type="number"
            step="0.01"
            min="0"
            autofocus
            placeholder="0.00"
            @keyup.enter="handleConfirm"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-4 py-3.5 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-left font-mono"
          />
        </div>
        <p v-if="error" class="text-xs text-rose-400 mt-1.5">{{ error }}</p>
        <p v-else class="text-[11px] text-slate-500 mt-1.5">
          Enter 0 for complimentary / sample, or any customized unit charge.
        </p>
      </div>

      <!-- Quick Amount Presets (Birr) -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <button
          v-for="preset in [50, 100, 200, 500]"
          :key="preset"
          type="button"
          @click="customPrice = preset.toFixed(2)"
          class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          {{ preset }} {{ settings.currency }}
        </button>
      </div>

      <!-- Numeric Keypad for fast touch tablets/mobile -->
      <div class="grid grid-cols-3 gap-2 mb-5">
        <button
          v-for="k in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']"
          :key="k"
          type="button"
          @click="handleKeypad(k)"
          class="py-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-sm font-bold text-slate-200 active:scale-95 transition flex items-center justify-center"
        >
          <span v-if="k === 'backspace'" class="text-xs text-slate-400">DEL</span>
          <span v-else>{{ k }}</span>
        </button>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="closeModal"
          class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleConfirm"
          class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Check class="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  </div>
</template>
