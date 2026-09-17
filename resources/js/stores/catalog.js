import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import db from '../services/db';
import api from '../services/api';
import { isOnline } from '../services/sync';

export const useCatalogStore = defineStore('catalog', () => {
    const products = ref([]);
    const loaded = ref(false);

    const activeProducts = computed(() =>
        products.value.filter((p) => p.is_active === true || p.is_active === 1)
    );

    function normalizeProduct(p) {
        return {
            ...p,
            is_active: p.is_active === true || p.is_active === 1,
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
        };
    }

    async function loadLocal() {
        const prods = await db.products.toArray();
        products.value = prods.map(normalizeProduct);
        loaded.value = true;
    }

    function productById(id) {
        return products.value.find((p) => p.id === Number(id));
    }

    function assertOnline() {
        if (!isOnline.value) {
            throw new Error('Product management requires an internet connection.');
        }
    }

    async function createProduct(payload) {
        assertOnline();
        const res = await api.post('/products', payload);
        if (res.status !== 201) {
            throw new Error(res.data?.errors?.sku?.[0] || res.data?.message || 'Failed to create product');
        }
        await db.products.put(normalizeProduct(res.data));
        await loadLocal();
        return res.data;
    }

    async function updateProduct(product) {
        assertOnline();
        const res = await api.put(`/products/${product.id}`, product);
        if (res.status !== 200) {
            throw new Error(res.data?.errors?.sku?.[0] || res.data?.message || 'Failed to update product');
        }
        await db.products.put(normalizeProduct(res.data));
        await loadLocal();
        return res.data;
    }

    async function deleteProduct(id) {
        assertOnline();
        const res = await api.delete(`/products/${id}`);
        if (res.status !== 200) {
            throw new Error('Failed to delete product');
        }
        await db.products.delete(id);
        await loadLocal();
    }

    return {
        products,
        loaded,
        activeProducts,
        productById,
        loadLocal,
        createProduct,
        updateProduct,
        deleteProduct,
    };
});