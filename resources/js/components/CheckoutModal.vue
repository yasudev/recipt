<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { printPage } from '../utils/print';
import { PaymentMethod } from '../types';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Receipt,
  User,
  Percent,
} from 'lucide-vue-next';

const {
  isCheckoutModalOpen,
  cart,
  cartSubtotal,
  cartTaxAmount,
  cartTotal,
  formatCurrency,
  completeSale,
  settings,
} = usePosStore();

const paymentMethod = ref<PaymentMethod>('card');
const amountTendered = ref<string>('');
const customerName = ref<string>('');
const discount = ref<number>(0);
const notes = ref<string>('');

watch(
  () => isCheckoutModalOpen.value,
  (isOpen) => {
    if (isOpen) {
      paymentMethod.value = 'card';
      amountTendered.value = cartTotal.value.toFixed(2);
      customerName.value = '';
      discount.value = 0;
      notes.value = '';
    }
  }
);

const finalTotal = computed(() => {
  const disc = Number(discount.value) || 0;
  const subAfterDisc = Math.max(0, cartSubtotal.value - disc);
  const tax = settings.value.enableTax ? subAfterDisc * (settings.value.taxRate / 100) : 0;
  return subAfterDisc + tax;
});

const changeDue = computed(() => {
  const tendered = parseFloat(amountTendered.value) || 0;
  return Math.max(0, tendered - finalTotal.value);
});

const isTenderSufficient = computed(() => {
  if (paymentMethod.value !== 'cash') return true;
  const tendered = parseFloat(amountTendered.value) || 0;
  return tendered >= finalTotal.value - 0.01;
});

const setExactCash = () => {
  amountTendered.value = finalTotal.value.toFixed(2);
};

const addCashPreset = (amount: number) => {
  amountTendered.value = amount.toFixed(2);
};

const closeModal = () => {
  isCheckoutModalOpen.value = false;
};

const handleComplete = () => {
  if (!isTenderSufficient.value) return;

  completeSale({
    paymentMethod: paymentMethod.value,
    amountTendered: paymentMethod.value === 'cash' ? parseFloat(amountTendered.value) : undefined,
    discount: Number(discount.value) || 0,
    customerName: customerName.value.trim() || 'Walk-in Customer',
    cashierName: 'Cashier',
    notes: notes.value.trim(),
  });

  closeModal();

  if (settings.value.autoPrintReceipt) {
    nextTick(() => {
      printPage(
        'printable-receipt',
        settings.value.paperWidth || '80mm',
        settings.value.printCopies || 1,
      );
    });
  }
};
</script>

<template>
  <div
    v-if="isCheckoutModalOpen"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
  >
    <div
      class="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col my-auto"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CreditCard class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Payment & Checkout</h3>
            <p class="text-xs text-slate-400">
              {{ cart.length }} items &bull; Total due: {{ formatCurrency(finalTotal) }}
            </p>
          </div>
        </div>

        <button
          @click="closeModal"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4 overflow-y-auto pr-1 mt-4 flex-1">
        <!-- Order Summary Card -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Items Subtotal</span>
            <span>{{ formatCurrency(cartSubtotal) }}</span>
          </div>
          <div v-if="discount > 0" class="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span>Discount</span>
            <span>-{{ formatCurrency(discount) }}</span>
          </div>
          <div v-if="settings.enableTax" class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Estimated Tax ({{ settings.taxRate }}%)</span>
            <span>{{ formatCurrency(cartTaxAmount) }}</span>
          </div>
          <div class="pt-2 border-t border-slate-800 flex items-baseline justify-between">
            <span class="text-sm font-bold text-white">Total Due</span>
            <span class="text-2xl font-extrabold text-indigo-400 font-mono">
              {{ formatCurrency(finalTotal) }}
            </span>
          </div>
        </div>

        <!-- Payment Method Tabs -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="paymentMethod = 'card'"
              :class="[
                'p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5',
                paymentMethod === 'card'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              ]"
            >
              <CreditCard class="w-5 h-5" />
              <span class="text-xs font-semibold">Credit Card</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'cash'"
              :class="[
                'p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5',
                paymentMethod === 'cash'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              ]"
            >
              <Banknote class="w-5 h-5" />
              <span class="text-xs font-semibold">Cash</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'qr'"
              :class="[
                'p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5',
                paymentMethod === 'qr'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              ]"
            >
              <QrCode class="w-5 h-5" />
              <span class="text-xs font-semibold">QR / Mobile</span>
            </button>
          </div>
        </div>

        <!-- Cash Details (if Cash selected) -->
        <div
          v-if="paymentMethod === 'cash'"
          class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 animate-in fade-in duration-200"
        >
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-slate-300">Amount Tendered</label>
              <button
                type="button"
                @click="setExactCash"
                class="text-[11px] font-semibold text-indigo-400 hover:underline"
              >
                Exact Cash ({{ formatCurrency(finalTotal) }})
              </button>
            </div>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono select-none">
                {{ settings.currency }}
              </span>
              <input
                v-model="amountTendered"
                type="number"
                step="0.01"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-14 pr-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <!-- Quick Cash Bills (Ethiopian Birr Notes) -->
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="amt in [50, 100, 200, 500, 1000]"
              :key="amt"
              type="button"
              @click="addCashPreset(amt)"
              class="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition text-center truncate"
              :title="`Tender ${settings.currency} ${amt}`"
            >
              {{ amt }} <span class="text-[9px] text-slate-500">{{ settings.currency }}</span>
            </button>
          </div>

          <!-- Change Due Indicator -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span class="text-slate-400 font-medium">Change to Return:</span>
            <span
              :class="[
                'text-sm font-bold font-mono',
                isTenderSufficient ? 'text-emerald-400' : 'text-rose-400',
              ]"
            >
              {{ isTenderSufficient ? formatCurrency(changeDue) : 'Insufficient Cash' }}
            </span>
          </div>
        </div>

        <!-- Optional Discount & Customer Name -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Name <span class="text-slate-500">(Optional)</span>
            </label>
            <div class="relative">
              <User class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="customerName"
                type="text"
                placeholder="Walk-in Customer"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">
              Discount Amount <span class="text-slate-500">(Optional)</span>
            </label>
            <div class="relative">
              <span class="text-xs text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-bold">
                {{ settings.currency }}
              </span>
              <input
                v-model.number="discount"
                type="number"
                min="0"
                step="0.5"
                placeholder="0.00"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 pt-3 border-t border-slate-800 shrink-0 mt-3">
        <button
          type="button"
          @click="closeModal"
          class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="!isTenderSufficient"
          @click="handleComplete"
          :class="[
            'flex-1 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-98',
            isTenderSufficient
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed',
          ]"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Charge {{ formatCurrency(finalTotal) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
