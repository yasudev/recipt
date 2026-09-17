<template>
    <div class="space-y-4">
        <!-- Heading -->
        <div class="flex items-center justify-between">
            <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Point of Sale</h1>
            <div class="text-xs font-medium" :class="isOnline ? 'text-emerald-600' : 'text-amber-600'">
                {{ isOnline ? 'Online' : 'Offline' }}
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_370px] gap-4 lg:items-start">
            <!-- Left: products -->
            <div :class="{ 'hidden': showCart, 'lg:block': true }" class="space-y-4">
                <!-- Search + categories -->
                <div class="space-y-3">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            v-model="search"
                            type="search"
                            placeholder="Search products..."
                            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
                        <button
                            @click="activeCategory = null"
                            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
                            :class="activeCategory === null ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'"
                        >
                            All
                        </button>
                        <button
                            v-for="cat in catalog.categories"
                            :key="cat.id"
                            @click="activeCategory = cat.id"
                            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
                            :class="activeCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'"
                        >
                            {{ cat.name }}
                        </button>
                    </div>
                </div>

                <!-- Product grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    <button
                        v-for="product in filteredProducts"
                        :key="product.id"
                        @click="pos.addProduct(product)"
                        :disabled="!pos.canAdd(product)"
                        class="bg-white rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-400 hover:shadow-sm transition flex flex-col gap-2 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:shadow-none"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">{{ product.name }}</div>
                            <span
                                class="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                :class="(product.stock ?? 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
                            >
                                {{ product.stock }}
                            </span>
                        </div>
                        <div class="text-sm font-bold text-indigo-600 mt-auto">
                            {{ currency(product.price) }}
                        </div>
                        <div v-if="!pos.canAdd(product)" class="text-[10px] font-semibold text-red-500">
                            Out of stock
                        </div>
                    </button>
                </div>

                <div v-if="!filteredProducts.length" class="text-center text-sm text-slate-400 py-10">
                    {{ catalog.loaded ? 'No products found' : 'Loading products...' }}
                </div>
            </div>

            <!-- Right: cart -->
            <div
                :class="{ hidden: !showCart, 'lg:block': true }"
                class="lg:sticky lg:top-6"
            >
                <div class="bg-white rounded-xl border border-slate-200 flex flex-col max-h-[75vh]">
                    <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h2 class="text-sm font-semibold text-slate-700">Cart</h2>
                        <div class="flex items-center gap-2">
                            <button
                                v-if="pos.items.length"
                                @click="pos.clear()"
                                class="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                Clear
                            </button>
                            <button class="lg:hidden text-slate-500" @click="showCart = false">
                                Close
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4 space-y-3">
                        <div v-if="!pos.items.length" class="text-center text-sm text-slate-400 py-10">
                            Cart is empty.
                            <div class="text-xs mt-1">Tap products to add them.</div>
                        </div>
                        <div v-for="item in pos.items" :key="item.product_id" class="flex items-center gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-slate-700 truncate">{{ item.name }}</div>
                                <div class="text-xs text-slate-400">
                                    {{ currency(item.price) }} &times; {{ item.quantity }}
                                    <span class="text-slate-500">= {{ currency(item.price * item.quantity) }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button
                                    @click="pos.setQuantity(item.product_id, item.quantity - 1)"
                                    class="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                                >
                                    −
                                </button>
                                <input
                                    :value="item.quantity"
                                    type="number"
                                    min="1"
                                    :max="item.stock || 999"
                                    class="w-12 text-center text-sm border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    @change="pos.setQuantity(item.product_id, parseInt($event.target.value, 10))"
                                />
                                <button
                                    @click="pos.setQuantity(item.product_id, item.quantity + 1)"
                                    class="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-slate-200 p-4 space-y-2">
                        <div class="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>{{ currency(pos.subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-slate-500">
                            <span>VAT ({{ pos.vatRate }}%)</span>
                            <span>{{ currency(pos.vatAmount) }}</span>
                        </div>
                        <div class="flex justify-between text-base font-bold text-slate-800">
                            <span>Total</span>
                            <span>{{ currency(pos.total) }}</span>
                        </div>
                        <button
                            @click="pos.openCheckout()"
                            :disabled="!pos.items.length"
                            class="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 mt-2"
                        >
                            Check Out
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile floating cart button -->
        <button
            v-if="!showCart && pos.items.length"
            @click="showCart = true"
            class="lg:hidden fixed bottom-[4.5rem] inset-x-0 mx-auto w-max z-30 bg-indigo-600 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ pos.itemCount }} item{{ pos.itemCount === 1 ? '' : 's' }} &middot; {{ currency(pos.total) }}
        </button>

        <!-- Checkout modal -->
        <Modal v-model="pos.checkoutOpen" title="Checkout">
            <form @submit.prevent="confirmSale" class="space-y-4">
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            v-model="pos.saleDate"
                            type="date"
                            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Time (24-hour)</label>
                        <input
                            v-model="pos.saleTime"
                            type="time"
                            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <div class="text-xs text-slate-400 mt-1">Defaults to the current time minus 1 hour.</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Payment method</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                @click="pos.paymentMethod = 'cash'"
                                class="px-3 py-2.5 rounded-lg border text-sm font-medium"
                                :class="pos.paymentMethod === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'"
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                @click="pos.paymentMethod = 'card'"
                                class="px-3 py-2.5 rounded-lg border text-sm font-medium"
                                :class="pos.paymentMethod === 'card' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'"
                            >
                                Card
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm text-slate-500">
                        <span>Items ({{ pos.itemCount }})</span>
                        <span>{{ currency(pos.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-sm text-slate-500">
                        <span>VAT ({{ pos.vatRate }}%)</span>
                        <span>{{ currency(pos.vatAmount) }}</span>
                    </div>
                    <div class="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-200">
                        <span>Total</span>
                        <span>{{ currency(pos.total) }}</span>
                    </div>
                </div>

                <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {{ error }}
                </div>

                <button
                    type="submit"
                    :disabled="saving"
                    class="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Complete Sale
                </button>

                <div v-if="!isOnline" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    You are offline. This sale will be saved on this device and synced automatically when you're back online.
                </div>
            </form>
        </Modal>

        <!-- Receipt modal -->
        <ReceiptModal v-model="receiptOpen" :sale="pos.lastSale" :settings="settings.settings" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Modal from '../components/Modal.vue';
import ReceiptModal from '../components/ReceiptModal.vue';
import { usePosStore } from '../stores/pos';
import { useCatalogStore } from '../stores/catalog';
import { useSettingsStore } from '../stores/settings';
import { isOnline, runSync } from '../services/sync';
import db from '../services/db';
import { formatMoney } from '../services/format';

const pos = usePosStore();
const catalog = useCatalogStore();
const settings = useSettingsStore();

const search = ref('');
const activeCategory = ref(null);
const showCart = ref(false);
const receiptOpen = ref(false);
const saving = ref(false);
const error = ref('');

const filteredProducts = computed(() => {
    let list = catalog.activeProducts;
    if (activeCategory.value !== null) {
        list = list.filter((p) => p.category_id === activeCategory.value);
    }
    const q = search.value.trim().toLowerCase();
    if (q) {
        list = list.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q)
        );
    }
    return list;
});

function currency(value) {
    return formatMoney(value, settings.get('currency_symbol', 'ر.س'));
}

async function confirmSale() {
    error.value = '';
    saving.value = true;
    try {
        const sale = await pos.completeSale();
        if (isOnline.value && sale) {
            await runSync();
            const refreshed = await db.sales.get(sale.local_id);
            if (refreshed) {
                pos.setLastSale(refreshed);
            }
        }
        receiptOpen.value = true;
    } catch (e) {
        error.value = e.message || 'Could not complete the sale.';
    } finally {
        saving.value = false;
    }
}

onMounted(async () => {
    if (!catalog.loaded) {
        await catalog.loadLocal();
    }
});
</script>