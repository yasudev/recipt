<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import { SaleRecord } from '../types';
import {
  ReceiptText,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  Download,
  Clock,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Receipt,
  User,
  CheckCircle,
} from 'lucide-vue-next';

const {
  sales,
  formatCurrency,
  selectedSaleForReceipt,
  exportBackup,
} = usePosStore();

const searchQuery = ref('');
const paymentFilter = ref<string>('all');

const filteredSales = computed(() => {
  return sales.value.filter((s) => {
    const matchesPayment =
      paymentFilter.value === 'all' || s.paymentMethod === paymentFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.id.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      s.cashierName.toLowerCase().includes(q);

    return matchesPayment && matchesQuery;
  });
});

const totalSalesAmount = computed(() => {
  return sales.value.reduce((acc, s) => acc + s.total, 0);
});

const averageOrderValue = computed(() => {
  if (sales.value.length === 0) return 0;
  return totalSalesAmount.value / sales.value.length;
});

const openReceipt = (sale: SaleRecord) => {
  selectedSaleForReceipt.value = sale;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sales Audit & Transactions
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          History of all completed checkouts, receipts, and revenue logs.
        </p>
      </div>

      <button
        @click="exportBackup"
        class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
      >
        <Download class="w-4 h-4 text-indigo-400" />
        <span>Export Sales Data</span>
      </button>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <span class="text-xs font-medium text-slate-400">Total Gross Sales</span>
        <div class="text-2xl font-extrabold text-white mt-1 font-mono">
          {{ formatCurrency(totalSalesAmount) }}
        </div>
        <span class="text-[11px] text-emerald-400 mt-1 block">
          Lifetime across all terminals
        </span>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <span class="text-xs font-medium text-slate-400">Total Transactions</span>
        <div class="text-2xl font-extrabold text-white mt-1 font-mono">
          {{ sales.length }} orders
        </div>
        <span class="text-[11px] text-slate-400 mt-1 block">
          Completed receipts
        </span>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <span class="text-xs font-medium text-slate-400">Average Order Value (AOV)</span>
        <div class="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">
          {{ formatCurrency(averageOrderValue) }}
        </div>
        <span class="text-[11px] text-slate-400 mt-1 block">
          Per customer basket
        </span>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Order ID (ORD-...), customer, or cashier..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="paymentFilter"
          class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Payment Methods</option>
          <option value="card">Credit Card</option>
          <option value="cash">Cash</option>
          <option value="qr">QR / Mobile</option>
        </select>
      </div>
    </div>

    <!-- Sales Table / List -->
    <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      <!-- Table Header -->
      <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div class="col-span-3">Order Number & Date</div>
        <div class="col-span-3">Customer & Cashier</div>
        <div class="col-span-2">Payment</div>
        <div class="col-span-2 text-right">Order Total</div>
        <div class="col-span-2 text-right">Receipt Action</div>
      </div>

      <!-- Items List -->
      <div v-if="filteredSales.length > 0" class="divide-y divide-slate-800/70">
        <div
          v-for="sale in filteredSales"
          :key="sale.id"
          class="p-4 sm:px-6 py-3.5 hover:bg-slate-800/40 transition flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center"
        >
          <!-- 1. Order ID & Date -->
          <div class="col-span-3 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs border border-slate-700/80 shrink-0">
              <Receipt class="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span class="text-sm font-bold text-white font-mono">{{ sale.id }}</span>
              <p class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock class="w-3 h-3 text-slate-500" />
                <span>{{ formatDate(sale.timestamp) }}</span>
              </p>
            </div>
          </div>

          <!-- 2. Customer & Cashier -->
          <div class="col-span-3">
            <p class="text-xs font-semibold text-slate-200 truncate">
              {{ sale.customerName || 'Walk-in Customer' }}
            </p>
            <p class="text-[11px] text-slate-500 truncate">
              Cashier: {{ sale.cashierName }} &bull; {{ sale.items.length }} items
            </p>
          </div>

          <!-- 3. Payment Method Badge -->
          <div class="col-span-2 flex items-center">
            <span
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border flex items-center gap-1.5',
                sale.paymentMethod === 'card' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : '',
                sale.paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : '',
                sale.paymentMethod === 'qr' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : '',
              ]"
            >
              <CreditCard v-if="sale.paymentMethod === 'card'" class="w-3 h-3" />
              <Banknote v-else-if="sale.paymentMethod === 'cash'" class="w-3 h-3" />
              <QrCode v-else class="w-3 h-3" />
              <span>{{ sale.paymentMethod }}</span>
            </span>
          </div>

          <!-- 4. Total -->
          <div class="col-span-2 text-left md:text-right">
            <span class="text-sm font-extrabold text-white font-mono">
              {{ formatCurrency(sale.total) }}
            </span>
            <span v-if="sale.taxAmount > 0" class="block text-[10px] text-slate-500 font-mono">
              Tax: {{ formatCurrency(sale.taxAmount) }}
            </span>
          </div>

          <!-- 5. View Receipt Button -->
          <div class="col-span-2 flex items-center justify-end">
            <button
              @click="openReceipt(sale)"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <ReceiptText class="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
        <ReceiptText class="w-10 h-10 mb-2 opacity-30 text-slate-400" />
        <h4 class="text-sm font-semibold text-slate-300">No transactions recorded</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-xs">
          Sales history will appear here once checkouts are processed in the Point of Sale.
        </p>
      </div>
    </div>
  </div>
</template>
