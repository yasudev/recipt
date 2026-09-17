<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
            <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Products</h1>
            <div class="flex items-center gap-2">
                <router-link
                    :to="{ name: 'categories' }"
                    class="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                    Categories
                </router-link>
                <button
                    @click="openCreate"
                    :disabled="!isOnline"
                    class="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-2 disabled:opacity-50"
                >
                    New Product
                </button>
            </div>
        </div>

        <div v-if="!isOnline" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            You are offline. Editing products requires a connection, but you can still use the POS.
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    v-model="search"
                    type="search"
                    placeholder="Search by name or SKU..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>
            <select
                v-model="categoryFilter"
                class="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option :value="null">All categories</option>
                <option v-for="cat in catalog.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th class="text-left font-medium px-4 py-3">Name / SKU</th>
                            <th class="text-left font-medium px-4 py-3">Category</th>
                            <th class="text-right font-medium px-4 py-3">Price</th>
                            <th class="text-right font-medium px-4 py-3">Stock</th>
                            <th class="text-center font-medium px-4 py-3">Status</th>
                            <th class="text-right font-medium px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="!filtered.length">
                            <td colspan="6" class="px-4 py-8 text-center text-slate-400">
                                {{ catalog.loaded ? 'No products found' : 'Loading...' }}
                            </td>
                        </tr>
                        <tr v-for="product in filtered" :key="product.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3">
                                <div class="font-medium text-slate-800">{{ product.name }}</div>
                                <div class="text-xs text-slate-400">{{ product.sku }}</div>
                            </td>
                            <td class="px-4 py-3 text-slate-500">{{ catalog.categoryName(product.category_id) }}</td>
                            <td class="px-4 py-3 text-right font-medium text-slate-800">{{ currency(product.price) }}</td>
                            <td class="px-4 py-3 text-right">
                                <span
                                    class="font-medium"
                                    :class="(product.stock ?? 0) <= 5 ? 'text-red-600' : 'text-slate-700'"
                                >
                                    {{ product.stock }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                    :class="product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                                >
                                    {{ product.is_active ? 'Active' : 'Hidden' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button
                                    @click="openEdit(product)"
                                    class="text-xs font-medium text-indigo-600 hover:text-indigo-700 mr-3"
                                >
                                    Edit
                                </button>
                                <button
                                    @click="confirmDelete(product)"
                                    class="text-xs font-medium text-red-600 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Product modal -->
        <Modal v-model="modalOpen" :title="editing ? 'Edit Product' : 'New Product'">
            <form @submit.prevent="save" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input v-model="form.name" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                        <input v-model="form.sku" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select v-model="form.category_id" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                            <option v-for="cat in catalog.categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Price (before VAT)</label>
                        <input v-model.number="form.price" type="number" step="0.01" min="0" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                        <input v-model.number="form.stock" type="number" step="1" min="0" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div class="flex items-center justify-between sm:col-span-2">
                        <label class="text-sm font-medium text-slate-700">Active (show in POS)</label>
                        <input v-model="form.is_active" type="checkbox" class="w-4 h-4 accent-indigo-600" />
                    </div>
                </div>

                <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error }}</div>

                <div class="flex gap-2 justify-end">
                    <button type="button" @click="modalOpen = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" :disabled="saving" class="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60">
                        {{ saving ? 'Saving...' : 'Save' }}
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Delete confirm -->
        <Modal v-model="deleteOpen" title="Delete product">
            <p class="text-sm text-slate-600">
                Are you sure you want to delete
                <span class="font-semibold text-slate-800">{{ toDelete?.name }}</span>?
                This action cannot be undone.
            </p>
            <div class="flex gap-2 justify-end mt-5">
                <button @click="deleteOpen = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50">
                    Cancel
                </button>
                <button @click="doDelete" :disabled="saving" class="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
                    Delete
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Modal from '../components/Modal.vue';
import { useCatalogStore } from '../stores/catalog';
import { useSettingsStore } from '../stores/settings';
import { isOnline } from '../services/sync';
import { formatMoney } from '../services/format';

const catalog = useCatalogStore();
const settings = useSettingsStore();

const search = ref('');
const categoryFilter = ref(null);
const modalOpen = ref(false);
const deleteOpen = ref(false);
const editing = ref(false);
const saving = ref(false);
const error = ref('');
const toDelete = ref(null);

const form = ref({
    id: null,
    name: '',
    sku: '',
    category_id: null,
    price: 0,
    stock: 0,
    is_active: true,
});

const filtered = computed(() => {
    let list = catalog.products;
    if (categoryFilter.value !== null) {
        list = list.filter((p) => p.category_id === categoryFilter.value);
    }
    const q = search.value.trim().toLowerCase();
    if (q) {
        list = list.filter(
            (p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
        );
    }
    return [...list].sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
});

function currency(value) {
    return formatMoney(value, settings.get('currency_symbol', 'ر.س'));
}

function resetForm() {
    form.value = {
        id: null,
        name: '',
        sku: '',
        category_id: catalog.categories[0]?.id ?? null,
        price: 0,
        stock: 0,
        is_active: true,
    };
}

function openCreate() {
    error.value = '';
    resetForm();
    editing.value = false;
    modalOpen.value = true;
}

function openEdit(product) {
    error.value = '';
    editing.value = true;
    form.value = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        price: Number(product.price),
        stock: product.stock,
        is_active: !!product.is_active,
    };
    modalOpen.value = true;
}

async function save() {
    error.value = '';
    saving.value = true;
    try {
        if (editing.value) {
            await catalog.updateProduct(form.value);
        } else {
            await catalog.createProduct(form.value);
        }
        modalOpen.value = false;
    } catch (e) {
        error.value = e.message || 'Failed to save product';
    } finally {
        saving.value = false;
    }
}

function confirmDelete(product) {
    toDelete.value = product;
    deleteOpen.value = true;
}

async function doDelete() {
    if (!toDelete.value) return;
    saving.value = true;
    try {
        await catalog.deleteProduct(toDelete.value.id);
        deleteOpen.value = false;
        toDelete.value = null;
    } catch (e) {
        error.value = e.message || 'Failed to delete product';
        deleteOpen.value = false;
    } finally {
        saving.value = false;
    }
}

onMounted(async () => {
    if (!catalog.loaded) {
        await catalog.loadLocal();
    }
    if (!form.value.category_id && catalog.categories.length) {
        form.value.category_id = catalog.categories[0].id;
    }
});
</script>