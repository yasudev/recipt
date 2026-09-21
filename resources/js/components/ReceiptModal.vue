<script setup lang="ts">
import { usePosStore } from '../composables/usePosStore';
import { X, Printer, CheckCircle, Receipt, ArrowRight, FileText } from 'lucide-vue-next';

const {
  selectedSaleForReceipt,
  formatCurrency,
  settings,
  navigateTo,
} = usePosStore();

const closeModal = () => {
  selectedSaleForReceipt.value = null;
};

const handlePrint = () => {
  window.print();
};

const handleNewSale = () => {
  closeModal();
  navigateTo('pos');
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div
    v-if="selectedSaleForReceipt"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
  >
    <div
      :class="[
        'w-full bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col my-auto transition-all duration-200',
        settings.paperWidth === 'a4' ? 'sm:max-w-2xl md:max-w-3xl' : 'sm:max-w-md',
      ]"
    >
      <!-- Modal Header & Quick Format Switcher -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Receipt Completed</h3>
            <p class="text-[11px] text-slate-400">Order {{ selectedSaleForReceipt.id }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Quick Paper Format Selector -->
          <div class="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center text-[10px] font-medium">
            <button
              type="button"
              @click="settings.paperWidth = '80mm'"
              :class="[
                'px-2 py-1 rounded-lg transition font-mono',
                settings.paperWidth === '80mm' || (!settings.paperWidth && settings.paperWidth !== 'a4' && settings.paperWidth !== '58mm')
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              ]"
              title="80mm Thermal POS Roll"
            >
              80mm
            </button>
            <button
              type="button"
              @click="settings.paperWidth = '58mm'"
              :class="[
                'px-2 py-1 rounded-lg transition font-mono',
                settings.paperWidth === '58mm'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              ]"
              title="58mm Compact Roll"
            >
              58mm
            </button>
            <button
              type="button"
              @click="settings.paperWidth = 'a4'"
              :class="[
                'px-2 py-1 rounded-lg transition font-medium flex items-center gap-1',
                settings.paperWidth === 'a4'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              ]"
              title="A4 Full Page Commercial Tax Invoice"
            >
              <FileText class="w-2.5 h-2.5" />
              <span>A4 Sheet</span>
            </button>
          </div>

          <button
            @click="closeModal"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Printable Receipt / Invoice Layout -->
      <div
        id="printable-receipt"
        :class="[
          'my-4 p-5 rounded-2xl bg-white text-slate-900 shadow-inner overflow-y-auto max-h-[58vh] border border-slate-200 mx-auto transition-all',
          settings.paperWidth === 'a4'
            ? 'w-full paper-a4 font-sans text-xs'
            : settings.paperWidth === '58mm'
              ? 'w-full max-w-[280px] paper-58mm font-mono text-xs'
              : 'w-full max-w-[340px] paper-80mm font-mono text-xs',
        ]"
      >
        <!-- ======================= 1. A4 INVOICE LAYOUT ======================= -->
        <div v-if="settings.paperWidth === 'a4'" class="space-y-4">
          <!-- Top Row: Store & Invoice Header -->
          <div class="flex items-start justify-between pb-3.5 border-b-2 border-slate-900">
            <div>
              <h4 class="font-extrabold text-base tracking-tight text-slate-950 uppercase">
                {{ settings.storeName }}
              </h4>
              <p v-if="settings.tagline" class="text-[11px] text-slate-500 font-medium mt-0.5">
                {{ settings.tagline }}
              </p>
              <p class="text-[10px] text-slate-600 mt-1">{{ settings.storeAddress }}</p>
              <p class="text-[10px] text-slate-600">{{ settings.storePhone }}</p>
              <p v-if="settings.vatNumber" class="text-[10px] font-bold text-slate-800 font-mono mt-0.5">
                TIN / VAT: {{ settings.vatNumber }}
              </p>
            </div>

            <div class="text-right">
              <span class="inline-block px-2.5 py-1 rounded bg-slate-950 text-white font-bold text-[10px] tracking-wider uppercase">
                Tax Invoice / Receipt
              </span>
              <div class="mt-2 text-[11px]">
                <span class="text-slate-500">Invoice: </span>
                <span class="font-bold font-mono text-slate-900">{{ selectedSaleForReceipt.id }}</span>
              </div>
              <div class="text-[10px] text-slate-500">
                {{ formatDate(selectedSaleForReceipt.timestamp) }}
              </div>
              <div class="mt-1 text-[10px] font-bold text-emerald-700 uppercase">
                Status: {{ selectedSaleForReceipt.status.toUpperCase() }}
              </div>
            </div>
          </div>

          <!-- Customer & Attendant Strip -->
          <div class="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Customer / Bill To</span>
              <span class="font-semibold text-slate-900">
                {{ settings.showCustomer !== false && selectedSaleForReceipt.customerName ? selectedSaleForReceipt.customerName : 'Walk-in Guest / Retail Customer' }}
              </span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Cashier / Staff</span>
              <span class="font-semibold text-slate-900">
                {{ settings.showCashier !== false ? selectedSaleForReceipt.cashierName : 'Store Attendant' }}
              </span>
            </div>
          </div>

          <!-- Structured Items Table -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2 px-2.5">Item Description</th>
                  <th v-if="settings.showSku !== false" class="py-2 px-2.5">SKU</th>
                  <th class="py-2 px-2 text-center">Qty</th>
                  <th class="py-2 px-2.5 text-right">Unit Price</th>
                  <th class="py-2 px-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-800">
                <tr v-for="item in selectedSaleForReceipt.items" :key="item.id">
                  <td class="py-2 px-2.5 font-medium text-slate-900">{{ item.name }}</td>
                  <td v-if="settings.showSku !== false" class="py-2 px-2.5 font-mono text-[10px] text-slate-500">
                    {{ item.sku || '-' }}
                  </td>
                  <td class="py-2 px-2 text-center font-mono">{{ item.quantity }}</td>
                  <td class="py-2 px-2.5 text-right font-mono">{{ formatCurrency(item.unitPrice) }}</td>
                  <td class="py-2 px-2.5 text-right font-mono font-semibold text-slate-900">
                    {{ formatCurrency(item.quantity * item.unitPrice) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary & Payments (Two Columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
            <!-- Left: Payment details & footer -->
            <div class="sm:col-span-6 space-y-2.5 text-[10px]">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-500 uppercase font-semibold">Payment:</span>
                  <span class="font-bold uppercase text-slate-800">{{ selectedSaleForReceipt.paymentMethod }}</span>
                </div>
                <div v-if="selectedSaleForReceipt.amountTendered" class="flex justify-between">
                  <span class="text-slate-500 uppercase font-semibold">Tendered:</span>
                  <span class="font-mono text-slate-700">{{ formatCurrency(selectedSaleForReceipt.amountTendered) }}</span>
                </div>
                <div v-if="selectedSaleForReceipt.changeDue !== undefined" class="flex justify-between font-bold">
                  <span class="text-slate-500 uppercase">Change Due:</span>
                  <span class="font-mono text-emerald-700">{{ formatCurrency(selectedSaleForReceipt.changeDue) }}</span>
                </div>
              </div>

              <p class="text-slate-600 text-[10px] leading-relaxed italic">
                {{ settings.receiptFooter }}
              </p>

              <div v-if="settings.showBarcode !== false" class="pt-1">
                <div class="h-6 bg-slate-900 rounded max-w-[140px] flex items-center justify-center text-white text-[7px] font-mono tracking-widest">
                  |||||| | |||| ||| |||| |
                </div>
                <span class="text-[8px] text-slate-400 font-mono tracking-widest block mt-0.5">{{ selectedSaleForReceipt.id }}</span>
              </div>
            </div>

            <!-- Right: Financial Totals -->
            <div class="sm:col-span-6 space-y-1.5 text-[11px]">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span class="font-mono">{{ formatCurrency(selectedSaleForReceipt.subtotal) }}</span>
              </div>

              <div v-if="selectedSaleForReceipt.discount > 0" class="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span class="font-mono">-{{ formatCurrency(selectedSaleForReceipt.discount) }}</span>
              </div>

              <div
                v-if="settings.showTaxBreakdown !== false && selectedSaleForReceipt.taxAmount > 0"
                class="flex justify-between text-slate-600"
              >
                <span>VAT ({{ selectedSaleForReceipt.taxRate }}%):</span>
                <span class="font-mono">{{ formatCurrency(selectedSaleForReceipt.taxAmount) }}</span>
              </div>

              <div class="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>TOTAL:</span>
                <span class="font-mono text-indigo-900">{{ formatCurrency(selectedSaleForReceipt.total) }}</span>
              </div>

              <!-- Signature stamp line -->
              <div class="pt-4 border-t border-dashed border-slate-300 text-center">
                <div class="h-5 border-b border-slate-400 w-32 mx-auto mb-1"></div>
                <span class="text-[8px] uppercase tracking-wider text-slate-400 block font-semibold">Authorized Signature / Stamp</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================= 2. THERMAL ROLL LAYOUT ======================= -->
        <div v-else>
          <!-- Store Info -->
          <div class="text-center pb-3 border-b border-dashed border-slate-300">
            <h4 class="font-bold text-base tracking-tight text-slate-950">
              {{ settings.storeName }}
            </h4>
            <p v-if="settings.tagline" class="text-[10px] text-slate-500 mt-0.5">{{ settings.tagline }}</p>
            <p class="text-[10px] text-slate-500 mt-0.5">{{ settings.storeAddress }}</p>
            <p class="text-[10px] text-slate-500">{{ settings.storePhone }}</p>
            <p v-if="settings.vatNumber" class="text-[9px] text-slate-500 mt-0.5 font-mono">VAT: {{ settings.vatNumber }}</p>
            <p class="text-[10px] text-slate-400 mt-1">
              {{ formatDate(selectedSaleForReceipt.timestamp) }}
            </p>
          </div>

          <!-- Order Metadata -->
          <div class="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-slate-500">Order Ref:</span>
              <span class="font-bold text-slate-900">{{ selectedSaleForReceipt.id }}</span>
            </div>
            <div v-if="settings.showCashier !== false" class="flex justify-between">
              <span class="text-slate-500">Cashier:</span>
              <span>{{ selectedSaleForReceipt.cashierName }}</span>
            </div>
            <div v-if="settings.showCustomer !== false && selectedSaleForReceipt.customerName" class="flex justify-between">
              <span class="text-slate-500">Customer:</span>
              <span>{{ selectedSaleForReceipt.customerName }}</span>
            </div>
          </div>

          <!-- Items Breakdown -->
          <div class="py-3 border-b border-dashed border-slate-300 space-y-2">
            <div
              v-for="item in selectedSaleForReceipt.items"
              :key="item.id"
              class="flex items-start justify-between text-[11px]"
            >
              <div class="pr-2">
                <p class="font-semibold text-slate-900">{{ item.name }}</p>
                <p v-if="settings.showSku !== false && item.sku" class="text-[9px] text-slate-500">
                  SKU: {{ item.sku }}
                </p>
                <p class="text-[10px] text-slate-500">
                  {{ item.quantity }} &times; {{ formatCurrency(item.unitPrice) }}
                  <span v-if="item.isCustomPrice" class="text-indigo-600 font-sans font-medium text-[9px]">(custom)</span>
                </p>
              </div>
              <span class="font-bold text-slate-900 shrink-0">
                {{ formatCurrency(item.quantity * item.unitPrice) }}
              </span>
            </div>
          </div>

          <!-- Calculation Totals -->
          <div class="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-slate-500">Subtotal:</span>
              <span>{{ formatCurrency(selectedSaleForReceipt.subtotal) }}</span>
            </div>
            <div v-if="selectedSaleForReceipt.discount > 0" class="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span>-{{ formatCurrency(selectedSaleForReceipt.discount) }}</span>
            </div>
            <div v-if="settings.showTaxBreakdown !== false && selectedSaleForReceipt.taxAmount > 0" class="flex justify-between">
              <span class="text-slate-500">Tax ({{ selectedSaleForReceipt.taxRate }}%):</span>
              <span>{{ formatCurrency(selectedSaleForReceipt.taxAmount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-slate-950 pt-1">
              <span>TOTAL:</span>
              <span>{{ formatCurrency(selectedSaleForReceipt.total) }}</span>
            </div>
          </div>

          <!-- Payment method -->
          <div class="py-2 text-[10px] space-y-0.5 text-slate-600">
            <div class="flex justify-between uppercase">
              <span>Payment Method:</span>
              <span class="font-bold">{{ selectedSaleForReceipt.paymentMethod }}</span>
            </div>
            <div v-if="selectedSaleForReceipt.amountTendered" class="flex justify-between">
              <span>Cash Tendered:</span>
              <span>{{ formatCurrency(selectedSaleForReceipt.amountTendered) }}</span>
            </div>
            <div v-if="selectedSaleForReceipt.changeDue !== undefined" class="flex justify-between">
              <span>Change Returned:</span>
              <span>{{ formatCurrency(selectedSaleForReceipt.changeDue) }}</span>
            </div>
          </div>

          <!-- Footer Note -->
          <div class="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
            <p>{{ settings.receiptFooter }}</p>
          </div>

          <!-- Barcode representation -->
          <div v-if="settings.showBarcode !== false" class="mt-3 text-center">
            <div class="h-7 bg-slate-900 rounded mx-auto max-w-[180px] flex items-center justify-center text-white text-[8px] font-mono tracking-widest">
              |||||| | |||| ||| |||| | |||||
            </div>
            <span class="text-[8px] text-slate-500 font-mono tracking-widest mt-0.5 block">
              {{ selectedSaleForReceipt.id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 pt-2 shrink-0">
        <button
          @click="handlePrint"
          type="button"
          class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
        >
          <Printer class="w-4 h-4" />
          <span>Print {{ settings.paperWidth === 'a4' ? 'A4 Invoice' : 'Receipt' }}</span>
        </button>
        <button
          @click="handleNewSale"
          type="button"
          class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition active:scale-98 flex items-center justify-center gap-1.5"
        >
          <span>New Sale</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
