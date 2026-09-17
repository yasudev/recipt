<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
            <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Sales History</h1>
            <button
                @click="load"
                class="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5"
            >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
            </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div class="flex-1 flex gap-3">
                <div class="flex-1">
                    <label class="block text-xs font-medium text-slate-500 mb-1">From</label>
                    <input v-model="fromDate" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div class="flex-1">
                    <label class="block text-xs font-medium text-slate-500 mb-1">To</label>
                    <input v-model="toDate" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
            </div>
            <button
                @click="applyFilter"
                class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
                Filter
            </button>
        </div>

        <div v-if="!isOnline" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            Showing locally saved sales. New offline sales will appear here with a pending badge.
        </div>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th class="text-left font-medium px-4 py-3">Receipt</th>
                            <th class="text-left font-medium px-4 py-3">Date / Time</th>
                            <th class="text-center font-medium px-4 py-3">Items</th>
                            <th class="text-right font-medium px-4 py-3">Total</th>
                            <th class="text-center font-medium px-4 py-3">Sync</th>
                            <th class="text-right font-medium px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="!displayList.length">
                            <td colspan="6" class="px-4 py-8 text-center text-slate-400">
                                {{ loading ? 'Loading...' : 'No sales found' }}
                            </td>
                        </tr>
                        <tr v-for="sale in displayList" :key="sale.local_id || sale.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-800">
                                {{ sale.receipt_number || '—' }}
                            </td>
                            <td class="px-4 py-3 text-slate-500">
                                {{ formatDate(sale.sale_date || (sale.created_at || '').slice(0, 10)) }}
                                {{ sale.sale_time || '' }}
                            </td>
                            <td class="px-4 py-3 text-center text-slate-600">
                                {{ totalItems(sale) }}
                            </td>
                            <td class="px-4 py-3 text-right font-semibold text-slate-800">
                                {{ currency(sale.total) }}
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                    :class="syncBadge(sale.sync_status)"
                                >
                                    {{ syncLabel(sale.sync_status) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button
                                    @click="viewSale(sale)"
                                    class="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sale detail modal -->
        <Modal v-model="detailOpen" title="Sale details">
            <div v-if="detail" class="space-y-4">
                <div class="text-xs text-slate-500 space-y-1">
                    <div class="flex justify-between"><span>Receipt</span><span class="font-semibold text-slate-700">{{ detail.receipt_number }}</span></div>
                    <div class="flex justify-between"><span>Date</span><span>{{ formatDate(detail.sale_date || (detail.created_at || '').slice(0, 10)) }} {{ detail.sale_time || '' }}</span></div>
                    <div class="flex justify-between"><span>Payment</span><span class="capitalize">{{ detail.payment_method || 'cash' }}</span></div>
                    <div class="flex justify-between">
                        <span>Sync</span>
                        <span :class="detail.sync_status === 'synced' ? 'text-emerald-600' : detail.sync_status === 'pending' ? 'text-amber-600' : 'text-red-600'">
                            {{ syncLabel(detail.sync_status) }}
                        </span>
                    </div>
                </div>

                <div class="divide-y divide-slate-100 border-t border-slate-200">
                    <div v-for="(item, i) in detail.items || []" :key="i" class="py-2 flex items-center justify-between gap-2 text-sm">
                        <div class="min-w-0">
                            <div class="text-slate-700 truncate">{{ item.product_name }}</div>
                            <div class="text-xs text-slate-400">{{ item.quantity }} &times; {{ currency(item.price) }}</div>
                        </div>
                        <div class="font-medium text-slate-800 shrink-0">{{ currency(item.total) }}</div>
                    </div>
                </div>

                <div class="border-t border-slate-200 pt-3 space-y-1 text-sm">
                    <div class="flex justify-between text-slate-500">
                        <span>Subtotal</span><span>{{ currency(detail.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                        <span>VAT ({{ detail.vat_rate }}%)</span><span>{{ currency(detail.vat_amount) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-slate-800">
                        <span>Total</span><span>{{ currency(detail.total) }}</span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 pt-2">
                    <button @click="print('58')" class="flex-1 min-w-[96px] px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900">
                        Print 58mm
                    </button>
                    <button @click="print('80')" class="flex-1 min-w-[96px] px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900">
                        Print 80mm
                    </button>
                    <button @click="print('a4')" class="flex-1 min-w-[96px] px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
                        Print A4
                    </button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Modal from '../components/Modal.vue';
import { useSalesStore } from '../stores/sales';
import { useSettingsStore } from '../stores/settings';
import { isOnline } from '../services/sync';
import { formatMoney, formatDate } from '../services/format';
import { printSale } from '../services/printer';

const salesStore = useSalesStore();
const settings = useSettingsStore();

const fromDate = ref('');
const toDate = ref('');
const detailOpen = ref(false);
const detail = ref(null);
const loading = computed(() => salesStore.loading);

function currency(value) {
    return formatMoney(value, settings.get('currency_symbol', 'ر.س'));
}

const displayList = computed(() => {
    let list = salesStore.sales;
    if (fromDate.value) {
        list = list.filter((s) => (s.sale_date || (s.created_at || '').slice(0, 10)) >= fromDate.value);
    }
    if (toDate.value) {
        list = list.filter((s) => (s.sale_date || (s.created_at || '').slice(0, 10)) <= toDate.value);
    }
    return list;
});

function totalItems(sale) {
    return (sale.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
}

function syncBadge(status) {
    if (status === 'synced') return 'bg-emerald-50 text-emerald-700';
    if (status === 'pending') return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-600';
}

function syncLabel(status) {
    if (status === 'synced') return 'Synced';
    if (status === 'pending') return 'Pending';
    return 'Failed';
}

function viewSale(sale) {
    detail.value = sale;
    detailOpen.value = true;
}

function print(format) {
    if (!detail.value) return;
    printSale(detail.value, settings.settings, format);
}

function applyFilter() {
    // filter is applied via computed; this just keeps UI state honest
    load();
}

async function load() {
    await salesStore.load();
}

onMounted(load);
</script>