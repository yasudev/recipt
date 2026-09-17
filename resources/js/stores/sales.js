import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import db from '../services/db';
import api from '../services/api';
import { isOnline } from '../services/sync';

export const useSalesStore = defineStore('sales', () => {
    const sales = ref([]);
    const source = ref('local');
    const loading = ref(false);

    const pendingCount = computed(
        () => sales.value.filter((s) => s.sync_status === 'pending').length
    );

    async function loadFromLocal() {
        sales.value = await db.sales.orderBy('created_at').reverse().toArray();
        source.value = 'local';
    }

    async function loadFromServer() {
        if (!isOnline.value) return false;
        try {
            const res = await api.get('/sales');
            if (res.status === 200 && Array.isArray(res.data.data)) {
                sales.value = res.data.data;
                source.value = 'server';
                return true;
            }
        } catch (e) {
            /* offline */
        }
        return false;
    }

    async function load() {
        loading.value = true;
        try {
            const ok = await loadFromServer();
            if (!ok) {
                await loadFromLocal();
            }
        } finally {
            loading.value = false;
        }
    }

    async function getSaleByReceipt(receiptNumber) {
        if (source.value === 'server') {
            return sales.value.find((s) => s.receipt_number === receiptNumber) || null;
        }
        return (await db.sales.where('receipt_number').equals(receiptNumber).first()) || null;
    }

    return { sales, source, loading, pendingCount, load, loadFromLocal, loadFromServer, getSaleByReceipt };
});