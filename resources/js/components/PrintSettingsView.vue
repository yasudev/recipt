<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../composables/usePosStore';
import {
  Printer,
  Check,
  RotateCcw,
  Sliders,
  Receipt,
  FileText,
  Building2,
  Phone,
  MapPin,
  Barcode,
  Percent,
  User,
  Scissors,
  Copy,
  Banknote,
} from 'lucide-vue-next';

const { settings, formatCurrency } = usePosStore();

const saveStatus = ref('');
const isPrinting = ref(false);

const sampleSubtotal = 300.00;
const sampleTax = computed(() => {
  if (!settings.value.enableTax) return 0;
  return sampleSubtotal * ((Number(settings.value.taxRate) || 0) / 100);
});
const sampleTotal = computed(() => {
  return sampleSubtotal + sampleTax.value;
});
const sampleTendered = 500.00;
const sampleChange = computed(() => {
  return Math.max(0, sampleTendered - sampleTotal.value);
});

const notifySaved = () => {
  saveStatus.value = 'Print settings saved!';
  setTimeout(() => {
    saveStatus.value = '';
  }, 2200);
};

const handleTestPrint = () => {
  const copies = Math.max(1, Number(settings.value.printCopies) || 1);
  const source = document.getElementById('printable-receipt');
  if (!source) return;

  let wrapper = document.getElementById('print-copies');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'print-copies';
    document.body.appendChild(wrapper);
  }
  wrapper.innerHTML = '';

  const pageSizes = { a4: 'A4', '58mm': '58mm auto', '80mm': '80mm auto' };
  const pageSize = pageSizes[settings.value.paperWidth] || '80mm auto';

  let styleEl = document.getElementById('print-page-css');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'print-page-css';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@page { size: ${pageSize}; margin: 0; }`;

  for (let i = 0; i < copies; i++) {
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.classList.add('print-copy');
    wrapper.appendChild(clone);
  }

  isPrinting.value = true;
  setTimeout(() => {
    window.print();
    wrapper.innerHTML = '';
    isPrinting.value = false;
  }, 100);
};

const resetPrintDefaults = () => {
  if (confirm('Reset print & receipt settings back to factory defaults?')) {
    settings.value.paperWidth = '80mm';
    settings.value.printCopies = 1;
    settings.value.autoPrintReceipt = true;
    settings.value.showBarcode = true;
    settings.value.showTaxBreakdown = true;
    settings.value.showCashier = true;
    settings.value.showCustomer = true;
    settings.value.showSku = true;
    settings.value.paperCut = true;
    settings.value.receiptFooter = 'Thank you for choosing Yum POS! Visit us again soon.';
    settings.value.vatNumber = 'TIN-008921447';
    settings.value.enableTax = true;
    settings.value.taxRate = 15;
    settings.value.currency = 'ETB';
    settings.value.currencyPosition = 'prefix';
    settings.value.storeAddress = 'Bole Sub-City, Addis Ababa, Ethiopia';
    settings.value.storePhone = '+251 91 123 4567';
    notifySaved();
  }
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Printer class="w-4 h-4" />
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Print Settings
          </h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-400">
          Configure thermal receipt formatting, paper roll width, auto-print triggers, and test receipt output.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <div
          v-if="saveStatus"
          class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in"
        >
          <Check class="w-3.5 h-3.5" />
          <span>{{ saveStatus }}</span>
        </div>

        <button
          @click="handleTestPrint"
          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center gap-2"
        >
          <Printer class="w-4 h-4" />
          <span>Test Print</span>
        </button>
      </div>
    </div>

    <!-- Main Two-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Controls & Configuration (7 cols) -->
      <div class="lg:col-span-7 space-y-5">
        <!-- 1. Print Format & Paper Size Dimensions -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <Sliders class="w-4 h-4 text-indigo-400" />
              <span>Print Format & Paper Size</span>
            </div>
            <span class="text-[11px] font-mono text-slate-400">
              {{ settings.paperWidth === 'a4' ? 'ISO 216 / A4' : 'ESC/POS Thermal' }}
            </span>
          </div>

          <!-- Paper Width Selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-2">Paper Format & Printer Type</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                @click="settings.paperWidth = '80mm'; notifySaved()"
                :class="[
                  'p-3.5 rounded-xl border text-left transition relative',
                  settings.paperWidth === '80mm' || (!settings.paperWidth && settings.paperWidth !== '58mm' && settings.paperWidth !== 'a4')
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700',
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-sm">80 mm Standard</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">3⅛ in</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  Standard counter POS thermal printers. 48 chars/line.
                </p>
              </button>

              <button
                type="button"
                @click="settings.paperWidth = '58mm'; notifySaved()"
                :class="[
                  'p-3.5 rounded-xl border text-left transition relative',
                  settings.paperWidth === '58mm'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700',
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-sm">58 mm Compact</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">2¼ in</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  Portable bluetooth & pocket thermal printers.
                </p>
              </button>

              <button
                type="button"
                @click="settings.paperWidth = 'a4'; notifySaved()"
                :class="[
                  'p-3.5 rounded-xl border text-left transition relative',
                  settings.paperWidth === 'a4'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700',
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-1.5">
                    <FileText class="w-3.5 h-3.5 text-indigo-400" />
                    <span class="font-bold text-sm text-indigo-200">A4 Full Sheet</span>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">210×297mm</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  Office laser & inkjet sheet printers. Commercial tax invoice format.
                </p>
              </button>
            </div>

            <!-- A4 Informational note -->
            <div
              v-if="settings.paperWidth === 'a4'"
              class="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5"
            >
              <FileText class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p class="text-xs text-indigo-200 leading-relaxed">
                <strong>A4 Invoice Mode Active:</strong> Receipts will print as full-page formatted commercial tax invoices with itemized tables, customer billing details, VAT breakdowns, and authorized signature sections.
              </p>
            </div>
          </div>

          <!-- Hardware Toggles -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div>
                <span class="text-xs font-semibold text-slate-200 block">Auto-Print on Checkout</span>
                <span class="text-[10px] text-slate-500">Automatically trigger print dialog</span>
              </div>
              <input
                v-model="settings.autoPrintReceipt"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div>
                <span class="text-xs font-semibold text-slate-200 block">Auto Paper Cut</span>
                <span class="text-[10px] text-slate-500">Send ESC/POS cut feed code</span>
              </div>
              <input
                v-model="settings.paperCut"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>

          <!-- Copies Count -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Print Copies</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="settings.printCopies = 1; notifySaved()"
                :class="[
                  'px-3 py-2 rounded-xl text-xs font-semibold border text-center transition',
                  (settings.printCopies || 1) === 1
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white',
                ]"
              >
                1 Copy (Customer Only)
              </button>
              <button
                type="button"
                @click="settings.printCopies = 2; notifySaved()"
                :class="[
                  'px-3 py-2 rounded-xl text-xs font-semibold border text-center transition',
                  settings.printCopies === 2
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white',
                ]"
              >
                2 Copies (Customer + Merchant)
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Receipt Header Details -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Building2 class="w-4 h-4 text-emerald-400" />
            <span>Store Header & Receipt Branding</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Receipt Business Name</label>
              <input
                v-model="settings.storeName"
                @change="notifySaved"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Header Tagline</label>
              <input
                v-model="settings.tagline"
                @change="notifySaved"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Printed Address</label>
              <input
                v-model="settings.storeAddress"
                @change="notifySaved"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                v-model="settings.storePhone"
                @change="notifySaved"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-300 mb-1">Tax Registration / VAT ID</label>
              <input
                v-model="settings.vatNumber"
                @change="notifySaved"
                type="text"
                placeholder="e.g. TIN-008921447"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        <!-- 3. Currency & Ethiopian Birr Localization -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <Banknote class="w-4 h-4 text-amber-400" />
              <span>Currency & Localization</span>
            </div>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
              Ethiopian Birr
            </span>
          </div>

          <!-- Currency Presets -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-2">
              Currency Symbol / Notation
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="settings.currency = 'ETB'; notifySaved();"
                :class="[
                  'p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1',
                  settings.currency === 'ETB'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                ]"
              >
                <span class="text-sm font-bold font-mono">ETB</span>
                <span class="text-[10px] text-slate-400">Official ISO</span>
              </button>

              <button
                type="button"
                @click="settings.currency = 'Br'; notifySaved();"
                :class="[
                  'p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1',
                  settings.currency === 'Br'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                ]"
              >
                <span class="text-sm font-bold font-mono">Br</span>
                <span class="text-[10px] text-slate-400">Short Latin</span>
              </button>

              <button
                type="button"
                @click="settings.currency = 'ብር'; notifySaved();"
                :class="[
                  'p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1',
                  settings.currency === 'ብር'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                ]"
              >
                <span class="text-base font-bold">ብር</span>
                <span class="text-[10px] text-slate-400">Amharic (Ge'ez)</span>
              </button>
            </div>
          </div>

          <!-- Position & Custom Symbol -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Custom Currency Display</label>
              <input
                v-model="settings.currency"
                @change="notifySaved"
                type="text"
                placeholder="ETB"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Position on Receipts</label>
              <div class="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  @click="settings.currencyPosition = 'prefix'; notifySaved();"
                  :class="[
                    'py-1.5 text-xs font-medium rounded-lg transition',
                    settings.currencyPosition !== 'suffix'
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  ]"
                >
                  Prefix ({{ settings.currency }} 100)
                </button>
                <button
                  type="button"
                  @click="settings.currencyPosition = 'suffix'; notifySaved();"
                  :class="[
                    'py-1.5 text-xs font-medium rounded-lg transition',
                    settings.currencyPosition === 'suffix'
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  ]"
                >
                  Suffix (100 {{ settings.currency }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Sales Tax & Rate Configuration (On / Off) -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <Percent class="w-4 h-4 text-emerald-400" />
              <span>Sales Tax & Receipt Calculation</span>
            </div>
            <span
              :class="[
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
                settings.enableTax
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              ]"
            >
              {{ settings.enableTax ? 'Tax ON' : 'Tax OFF' }}
            </span>
          </div>

          <!-- Master Tax Switch (ON / OFF) -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-100">Sales Tax Active</span>
                <span
                  v-if="settings.enableTax"
                  class="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium"
                >
                  Active ({{ settings.taxRate || 15 }}%)
                </span>
                <span
                  v-else
                  class="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-medium"
                >
                  Exempt / 0%
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">
                Toggle sales tax on or off for POS orders and customer receipts.
              </p>
            </div>

            <!-- Segmented Toggle Button -->
            <div class="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                @click="settings.enableTax = true; notifySaved()"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
                  settings.enableTax
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                <Check v-if="settings.enableTax" class="w-3.5 h-3.5" />
                <span>Tax ON</span>
              </button>
              <button
                type="button"
                @click="settings.enableTax = false; notifySaved()"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
                  !settings.enableTax
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                <span>Tax OFF</span>
              </button>
            </div>
          </div>

          <!-- Tax Rate Percentage Input & Quick Presets -->
          <div :class="['space-y-3 transition-opacity', !settings.enableTax ? 'opacity-40 pointer-events-none' : '']">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-300">
                  Tax Rate (%)
                </label>
                <span class="text-[10px] text-indigo-400 font-mono font-medium">
                  Standard Default: 15%
                </span>
              </div>

              <div class="relative">
                <input
                  v-model.number="settings.taxRate"
                  @change="notifySaved"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="15"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 pr-10"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <!-- Tax Rate Quick Presets -->
            <div>
              <span class="text-[10px] font-semibold uppercase text-slate-500 tracking-wider block mb-1.5">
                Quick Presets
              </span>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  @click="settings.taxRate = 15; notifySaved()"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                    settings.taxRate === 15
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                >
                  15% (Default)
                </button>
                <button
                  type="button"
                  @click="settings.taxRate = 10; notifySaved()"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                    settings.taxRate === 10
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                >
                  10%
                </button>
                <button
                  type="button"
                  @click="settings.taxRate = 8.5; notifySaved()"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                    settings.taxRate === 8.5
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                >
                  8.5%
                </button>
                <button
                  type="button"
                  @click="settings.taxRate = 5; notifySaved()"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                    settings.taxRate === 5
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                >
                  5%
                </button>
                <button
                  type="button"
                  @click="settings.taxRate = 0; notifySaved()"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                    settings.taxRate === 0
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-1 ring-indigo-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                >
                  0% (Zero-rated)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Receipt Line Items & Details Toggles -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-sm">
            <Receipt class="w-4 h-4 text-purple-400" />
            <span>Printed Content & Line Details</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div class="flex items-center gap-2">
                <Barcode class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-medium text-slate-300">Show Order Barcode</span>
              </div>
              <input
                v-model="settings.showBarcode"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div class="flex items-center gap-2">
                <Percent class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-medium text-slate-300">Show Tax Breakdown</span>
              </div>
              <input
                v-model="settings.showTaxBreakdown"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div class="flex items-center gap-2">
                <User class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-medium text-slate-300">Show Cashier Name</span>
              </div>
              <input
                v-model="settings.showCashier"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none">
              <div class="flex items-center gap-2">
                <User class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-medium text-slate-300">Show Customer Name</span>
              </div>
              <input
                v-model="settings.showCustomer"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer select-none sm:col-span-2">
              <div class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-medium text-slate-300">Show Item SKU on Lines</span>
              </div>
              <input
                v-model="settings.showSku"
                @change="notifySaved"
                type="checkbox"
                class="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        <!-- 4. Receipt Footer & Policy -->
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <FileText class="w-4 h-4 text-amber-400" />
              <span>Printed Receipt Footer Note</span>
            </h3>
          </div>

          <div>
            <textarea
              v-model="settings.receiptFooter"
              @change="notifySaved"
              rows="2"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Thank you for your business! Please keep receipt for returns."
            />
          </div>

          <div class="pt-2 flex items-center justify-between">
            <button
              type="button"
              @click="resetPrintDefaults"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset Print Defaults</span>
            </button>
            <span class="text-[11px] text-slate-500">Live preview reflects adjustments automatically</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Paper Output Preview (5 cols) -->
      <div class="lg:col-span-5 sticky top-6">
        <div class="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center">
          <div class="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-bold text-slate-200">
                {{ settings.paperWidth === 'a4' ? 'A4 Tax Invoice Output Preview' : 'Thermal Roll Output Preview' }}
              </span>
            </div>
            <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
              {{ settings.paperWidth === 'a4' ? 'A4 Sheet (210×297mm)' : (settings.paperWidth || '80mm') + ' Roll' }}
            </span>
          </div>

          <!-- Printable Preview Sheet -->
          <div
            id="printable-receipt"
            :class="[
              'w-full bg-white text-slate-900 shadow-2xl transition-all duration-200 border border-slate-200 relative overflow-hidden',
              settings.paperWidth === 'a4'
                ? 'paper-a4 max-w-[480px] p-6 rounded-2xl font-sans text-xs'
                : settings.paperWidth === '58mm'
                  ? 'paper-58mm max-w-[280px] p-4 rounded-xl font-mono text-xs'
                  : 'paper-80mm max-w-[340px] p-5 rounded-xl font-mono text-xs',
            ]"
          >
            <!-- ===================== 1. A4 INVOICE TEMPLATE ===================== -->
            <div v-if="settings.paperWidth === 'a4'" class="space-y-4">
              <!-- Top Row: Store & Invoice Meta -->
              <div class="flex items-start justify-between pb-3.5 border-b-2 border-slate-900">
                <div>
                  <h4 class="font-extrabold text-base tracking-tight text-slate-950 uppercase">
                    {{ settings.storeName || 'Yum POS' }}
                  </h4>
                  <p v-if="settings.tagline" class="text-[11px] text-slate-500 font-medium mt-0.5">
                    {{ settings.tagline }}
                  </p>
                  <p class="text-[10px] text-slate-600 mt-1">
                    {{ settings.storeAddress || 'Bole Sub-City, Addis Ababa, Ethiopia' }}
                  </p>
                  <p class="text-[10px] text-slate-600">
                    Tel: {{ settings.storePhone || '+251 91 123 4567' }}
                  </p>
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
                    <span class="font-bold font-mono text-slate-900">ORD-99042</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    {{ new Date().toLocaleDateString() }} {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                  <div class="mt-1 text-[10px] font-bold text-emerald-700 uppercase">
                    Status: PAID
                  </div>
                </div>
              </div>

              <!-- Customer & Attendant Strip -->
              <div class="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <div>
                  <span class="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Customer / Bill To</span>
                  <span class="font-semibold text-slate-900">
                    {{ settings.showCustomer !== false ? 'Walk-in Guest / Retail Customer' : 'Customer Account' }}
                  </span>
                </div>
                <div>
                  <span class="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Cashier / Staff</span>
                  <span class="font-semibold text-slate-900">
                    {{ settings.showCashier !== false ? 'Cashier' : 'Staff' }}
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
                    <tr>
                      <td class="py-2 px-2.5 font-medium text-slate-900">Nitro Cold Brew</td>
                      <td v-if="settings.showSku !== false" class="py-2 px-2.5 font-mono text-[10px] text-slate-500">NCB-016</td>
                      <td class="py-2 px-2 text-center font-mono">1</td>
                      <td class="py-2 px-2.5 text-right font-mono">{{ formatCurrency(180.00) }}</td>
                      <td class="py-2 px-2.5 text-right font-mono font-semibold text-slate-900">{{ formatCurrency(180.00) }}</td>
                    </tr>
                    <tr>
                      <td class="py-2 px-2.5 font-medium text-slate-900">Butter Croissant</td>
                      <td v-if="settings.showSku !== false" class="py-2 px-2.5 font-mono text-[10px] text-slate-500">BAK-001</td>
                      <td class="py-2 px-2 text-center font-mono">1</td>
                      <td class="py-2 px-2.5 text-right font-mono">{{ formatCurrency(120.00) }}</td>
                      <td class="py-2 px-2.5 text-right font-mono font-semibold text-slate-900">{{ formatCurrency(120.00) }}</td>
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
                      <span class="font-bold uppercase text-slate-800">CASH</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500 uppercase font-semibold">Tendered:</span>
                      <span class="font-mono text-slate-700">{{ formatCurrency(sampleTendered) }}</span>
                    </div>
                    <div class="flex justify-between font-bold">
                      <span class="text-slate-500 uppercase">Change Due:</span>
                      <span class="font-mono text-emerald-700">{{ formatCurrency(sampleChange) }}</span>
                    </div>
                  </div>

                  <p class="text-slate-600 text-[10px] leading-relaxed italic">
                    {{ settings.receiptFooter || 'Thank you for choosing Yum POS! Visit us again soon.' }}
                  </p>

                  <div v-if="settings.showBarcode !== false" class="pt-1">
                    <div class="h-6 bg-slate-900 rounded max-w-[140px] flex items-center justify-center text-white text-[7px] font-mono tracking-widest">
                      |||||| | |||| ||| |||| |
                    </div>
                    <span class="text-[8px] text-slate-400 font-mono tracking-widest block mt-0.5">ORD-99042</span>
                  </div>
                </div>

                <!-- Right: Financial Totals -->
                <div class="sm:col-span-6 space-y-1.5 text-[11px]">
                  <div class="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span class="font-mono">{{ formatCurrency(sampleSubtotal) }}</span>
                  </div>

                  <div
                    v-if="settings.enableTax && settings.showTaxBreakdown !== false"
                    class="flex justify-between text-slate-600"
                  >
                    <span>VAT ({{ settings.taxRate || 15 }}%):</span>
                    <span class="font-mono">{{ formatCurrency(sampleTax) }}</span>
                  </div>

                  <div
                    v-else-if="!settings.enableTax && settings.showTaxBreakdown !== false"
                    class="flex justify-between text-slate-400"
                  >
                    <span>Tax:</span>
                    <span class="font-mono text-[10px]">Exempt</span>
                  </div>

                  <div class="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t-2 border-slate-900">
                    <span>TOTAL:</span>
                    <span class="font-mono text-indigo-900">{{ formatCurrency(sampleTotal) }}</span>
                  </div>

                  <!-- Signature stamp line -->
                  <div class="pt-4 border-t border-dashed border-slate-300 text-center">
                    <div class="h-5 border-b border-slate-400 w-32 mx-auto mb-1"></div>
                    <span class="text-[8px] uppercase tracking-wider text-slate-400 block font-semibold">Authorized Signature / Stamp</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===================== 2. THERMAL ROLL TEMPLATE (80mm & 58mm) ===================== -->
            <div v-else class="space-y-0">
              <!-- Receipt Header -->
              <div class="text-center pb-3 border-b border-dashed border-slate-400">
                <h4 class="font-bold text-sm tracking-tight text-slate-950 uppercase">
                  {{ settings.storeName || 'Yum POS' }}
                </h4>
                <p v-if="settings.tagline" class="text-[10px] text-slate-600 mt-0.5">
                  {{ settings.tagline }}
                </p>
                <p class="text-[10px] text-slate-600 mt-1">
                  {{ settings.storeAddress || 'Bole Sub-City, Addis Ababa, Ethiopia' }}
                </p>
                <p class="text-[10px] text-slate-600">
                  Tel: {{ settings.storePhone || '+251 91 123 4567' }}
                </p>
                <p v-if="settings.vatNumber" class="text-[9px] text-slate-500 font-mono mt-0.5">
                  VAT: {{ settings.vatNumber }}
                </p>
                <p class="text-[9px] text-slate-400 mt-1">
                  {{ new Date().toLocaleDateString() }} {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>

              <!-- Meta Data -->
              <div class="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div class="flex justify-between">
                  <span class="text-slate-500">RECEIPT #:</span>
                  <span class="font-bold">ORD-99042</span>
                </div>
                <div v-if="settings.showCashier !== false" class="flex justify-between">
                  <span class="text-slate-500">CASHIER:</span>
                  <span>Cashier</span>
                </div>
                <div v-if="settings.showCustomer !== false" class="flex justify-between">
                  <span class="text-slate-500">CUSTOMER:</span>
                  <span>Walk-in Guest</span>
                </div>
              </div>

              <!-- Items -->
              <div class="py-2.5 border-b border-dashed border-slate-400 space-y-1.5 text-[11px]">
                <div>
                  <div class="flex justify-between font-bold">
                    <span class="truncate pr-1">1x Nitro Cold Brew</span>
                    <span>{{ formatCurrency(180.00) }}</span>
                  </div>
                  <div v-if="settings.showSku !== false" class="text-[9px] text-slate-500">
                    SKU: NCB-016
                  </div>
                </div>

                <div>
                  <div class="flex justify-between font-bold">
                    <span class="truncate pr-1">1x Butter Croissant</span>
                    <span>{{ formatCurrency(120.00) }}</span>
                  </div>
                  <div v-if="settings.showSku !== false" class="text-[9px] text-slate-500">
                    SKU: BAK-001
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                <div class="flex justify-between text-slate-600 text-[10px]">
                  <span>SUBTOTAL</span>
                  <span>{{ formatCurrency(sampleSubtotal) }}</span>
                </div>

                <div
                  v-if="settings.enableTax && settings.showTaxBreakdown !== false"
                  class="flex justify-between text-slate-600 text-[10px]"
                >
                  <span>TAX ({{ settings.taxRate || 15 }}%)</span>
                  <span>{{ formatCurrency(sampleTax) }}</span>
                </div>

                <div
                  v-else-if="!settings.enableTax && settings.showTaxBreakdown !== false"
                  class="flex justify-between text-slate-400 text-[9px]"
                >
                  <span>TAX (OFF / EXEMPT)</span>
                  <span>{{ formatCurrency(0) }}</span>
                </div>

                <div class="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL</span>
                  <span>{{ formatCurrency(sampleTotal) }}</span>
                </div>
              </div>

              <!-- Payment Info -->
              <div class="py-2 text-[10px] space-y-0.5 border-b border-dashed border-slate-400">
                <div class="flex justify-between">
                  <span class="text-slate-500">PAID BY:</span>
                  <span class="font-bold">CASH</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">TENDERED:</span>
                  <span>{{ formatCurrency(sampleTendered) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">CHANGE DUE:</span>
                  <span class="font-bold">{{ formatCurrency(sampleChange) }}</span>
                </div>
              </div>

              <!-- Footer Message -->
              <div class="pt-3 text-center text-[10px] text-slate-600 leading-snug">
                {{ settings.receiptFooter || 'Thank you for your visit!' }}
              </div>

              <!-- Barcode representation -->
              <div v-if="settings.showBarcode !== false" class="mt-3 text-center">
                <div class="h-8 bg-slate-900 rounded mx-auto max-w-[200px] flex items-center justify-center text-white text-[8px] font-mono tracking-widest">
                  |||||| | |||| ||| |||| | |||||
                </div>
                <span class="text-[8px] text-slate-500 font-mono tracking-widest mt-0.5 block">ORD-99042</span>
              </div>

              <div v-if="settings.paperCut !== false" class="mt-3 text-center text-[9px] text-slate-400 border-t border-dashed border-slate-300 pt-1 flex items-center justify-center gap-1">
                <Scissors class="w-3 h-3 text-slate-400" />
                <span>PAPER CUT FEED</span>
              </div>
            </div>
          </div>

          <!-- Bottom Info -->
          <div class="w-full mt-4 flex items-center justify-center gap-2">
            <Printer class="w-3.5 h-3.5 text-indigo-400" />
            <span class="text-[11px] text-slate-400">
              Ready for {{ settings.paperWidth === 'a4' ? 'A4 laser/inkjet sheet' : (settings.paperWidth || '80mm') + ' thermal' }} output
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
