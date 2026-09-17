<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Dashboard</h1>
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

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="text-xs text-slate-500 font-medium">Today's Sales</div>
                <div class="text-xl lg:text-2xl font-bold text-slate-800 mt-1">
                    {{ currency(sales.today) }}
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="text-xs text-slate-500 font-medium">Transactions Today</div>
                <div class="text-xl lg:text-2xl font-bold text-slate-800 mt-1">
                    {{ sales.todayCount }}
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="text-xs text-slate-500 font-medium">Products</div>
                <div class="text-xl lg:text-2xl font-bold text-slate-800 mt-1">
                    {{ productsCount }}
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="text-xs text-slate-500 font-medium">Low Stock</div>
                <div class="text-xl lg:text-2xl font-bold mt-1" :class="lowStock > 0 ? 'text-red-600' : 'text-slate-800'">
                    {{ lowStock }}
                </div>
            </div>
        </div>

        <div v-if="!isOnline" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            Showing local data. Refresh will update statistics when you're back online.
        </div>

        <!-- Recent sales -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-slate-700">Recent Sales</h2>
                <router-link :to="{ name: 'sales' }" class="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    View all
                </router-link>
            </div>
            <div class="divide-y divide-slate-100">
                <div v-if="!recent.length" class="px-4 py-6 text-center text-sm text-slate-400">
                    No sales yet
                </div>
                <router-link
                    v-for="sale in recent"
                    :key="sale.local_id || sale.id"
                    :to="{ name: 'sales' }"
                    class="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                >
                    <div class="min-w-0">
                        <div class="text-sm font-medium text-slate-700 truncate">
                            {{ sale.receipt_number || '—' }}
                        </div>
                        <div class="text-xs text-slate-400">
                            {{ formatDateTime(sale.created_at || sale.sale_date) }}
                            <span v-if="sale.sync_status === 'pending'" class="ml-1 text-amber-600">(pending sync)</span>
                            <span v-else-if="sale.sync_status === 'failed'" class="ml-1 text-red-600">(sync failed)</span>
                        </div>
                    </div>
                    <div class="text-sm font-semibold text-slate-800 shrink-0">
                        {{ currency(sale.total) }}
                    </div>
                </router-link>
            </div>
        </div>

        <!-- Daily totals -->
        <div v-if="daily.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200">
                <h2 class="text-sm font-semibold text-slate-700">This Month</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th class="text-left font-medium px-4 py-2">Date</th>
                            <th class="text-right font-medium px-4 py-2">Sales</th>
                            <th class="text-right font-medium px-4 py-2">Transactions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="row in daily" :key="row.date">
                            <td class="px-4 py-2.5 text-slate-600">{{ formatDate(row.date) }}</td>
                            <td class="px-4 py-2.5 text-right font-medium text-slate-800">{{ currency(row.total) }}</td>
                            <td class="px-4 py-2.5 text-right text-slate-600">{{ row.count }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import db from '../services/db';
import { isOnline } from '../services/sync';
import { useSettingsStore } from '../stores/settings';
import { formatMoney, formatDate, formatDateTime, todayString } from '../services/format';

const settings = useSettingsStore();

const sales = ref({ today: 0, todayCount: 0 });
const productsCount = ref(0);
const lowStock = ref(0);
const recent = ref([]);
const daily = ref([]);

function currency(value) {
    return formatMoney(value, settings.get('currency_symbol', 'ر.س'));
}

async function load() {
    if (isOnline.value) {
        try {
            const res = await api.get('/dashboard');
            if (res.status === 200) {
                sales.value = {
                    today: res.data.total_sales_today,
                    todayCount: res.data.total_transactions_today,
                };
                productsCount.value = res.data.total_products;
                lowStock.value = res.data.low_stock_products;
                recent.value = res.data.recent_sales.map((s) => ({
                    ...s,
                    sync_status: 'synced',
                }));
                daily.value = res.data.monthly_sales;
                return;
            }
        } catch (e) {
            /* offline fallthrough */
        }
    }

    // Offline: compute from local database
    const today = todayString();
    const [prods, allSales, pendingCount] = await Promise.all([
        db.products.toArray(),
        db.sales.orderBy('created_at').reverse().toArray(),
        db.sales.where('sync_status').equals('pending').count(),
    ]);

    const todaySales = allSales.filter((s) => (s.sale_date || (s.created_at || '').slice(0, 10)) === today);
    sales.value = {
        today: todaySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0),
        todayCount: todaySales.length,
    };
    productsCount.value = prods.filter((p) => p.is_active !== false).length;
    lowStock.value = prods.filter((p) => (p.stock ?? 0) <= 5 && p.is_active !== false).length;
    recent.value = allSales.slice(0, 10);

    const byDate = {};
    for (const s of allSales) {
        const key = s.sale_date || (s.created_at || '').slice(0, 10);
        if (!key) continue;
        byDate[key] = byDate[key] || { total: 0, count: 0 };
        byDate[key].total += Number(s.total) || 0;
        byDate[key].count += 1;
    }
    daily.value = Object.entries(byDate)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([date, v]) => ({ date, total: v.total, count: v.count }));
}

onMounted(load);
</script>