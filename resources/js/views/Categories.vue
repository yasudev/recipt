<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
            <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Categories</h1>
            <div class="flex items-center gap-2">
                <button
                    @click="openCreate"
                    :disabled="!isOnline"
                    class="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-2 disabled:opacity-50"
                >
                    New Category
                </button>
            </div>
        </div>

        <div v-if="!isOnline" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            You are offline. Editing categories requires a connection.
        </div>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th class="text-left font-medium px-4 py-3">Name</th>
                            <th class="text-left font-medium px-4 py-3">Description</th>
                            <th class="text-right font-medium px-4 py-3">Products</th>
                            <th class="text-right font-medium px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="!catalog.categories.length">
                            <td colspan="4" class="px-4 py-8 text-center text-slate-400">
                                No categories yet
                            </td>
                        </tr>
                        <tr v-for="cat in catalog.categories" :key="cat.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-800">{{ cat.name }}</td>
                            <td class="px-4 py-3 text-slate-500">{{ cat.description || '—' }}</td>
                            <td class="px-4 py-3 text-right text-slate-600">
                                {{ countFor(cat.id) }}
                            </td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button @click="openEdit(cat)" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 mr-3">
                                    Edit
                                </button>
                                <button @click="confirmDelete(cat)" class="text-xs font-medium text-red-600 hover:text-red-700">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Category modal -->
        <Modal v-model="modalOpen" :title="editing ? 'Edit Category' : 'New Category'">
            <form @submit.prevent="save" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input v-model="form.name" required class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea v-model="form.description" rows="3" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
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
        <Modal v-model="deleteOpen" title="Delete category">
            <p class="text-sm text-slate-600">
                Are you sure you want to delete
                <span class="font-semibold text-slate-800">{{ toDelete?.name }}</span>?
            </p>
            <p v-if="countFor(toDelete?.id) > 0" class="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                This category contains {{ countFor(toDelete?.id) }} product(s). Deleting it will also delete those products.
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
import { isOnline } from '../services/sync';

const catalog = useCatalogStore();

const modalOpen = ref(false);
const deleteOpen = ref(false);
const editing = ref(false);
const saving = ref(false);
const error = ref('');
const toDelete = ref(null);

const form = ref({ id: null, name: '', description: '' });

const productCounts = computed(() => {
    const map = {};
    for (const p of catalog.products) {
        map[p.category_id] = (map[p.category_id] || 0) + 1;
    }
    return map;
});

function countFor(id) {
    if (id == null) return 0;
    return productCounts.value[id] || 0;
}

function openCreate() {
    error.value = '';
    editing.value = false;
    form.value = { id: null, name: '', description: '' };
    modalOpen.value = true;
}

function openEdit(cat) {
    error.value = '';
    editing.value = true;
    form.value = { id: cat.id, name: cat.name, description: cat.description || '' };
    modalOpen.value = true;
}

async function save() {
    error.value = '';
    saving.value = true;
    try {
        if (editing.value) {
            await catalog.updateCategory(form.value);
        } else {
            await catalog.createCategory(form.value);
        }
        modalOpen.value = false;
    } catch (e) {
        error.value = e.message || 'Failed to save category';
    } finally {
        saving.value = false;
    }
}

function confirmDelete(cat) {
    toDelete.value = cat;
    deleteOpen.value = true;
}

async function doDelete() {
    if (!toDelete.value) return;
    saving.value = true;
    try {
        await catalog.deleteCategory(toDelete.value.id);
        deleteOpen.value = false;
        toDelete.value = null;
    } catch (e) {
        error.value = e.message || 'Failed to delete category';
        deleteOpen.value = false;
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