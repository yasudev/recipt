import { defineStore } from 'pinia';
import { ref } from 'vue';
import db from '../services/db';
import api from '../services/api';
import { isOnline } from '../services/sync';

const DEFAULTS = {
    company_name: 'YumInventory POS',
    company_address: '',
    company_phone: '',
    company_email: '',
    vat_rate: '15',
    receipt_footer: 'Thank you for your purchase!',
    currency: 'SAR',
    currency_symbol: 'ر.س',
};

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref({ ...DEFAULTS });

    function get(key, fallback = '') {
        return settings.value[key] ?? fallback ?? '';
    }

    async function loadLocal() {
        const rows = await db.settings.toArray();
        const values = {};
        for (const row of rows) {
            values[row.key] = row.value;
        }
        settings.value = { ...DEFAULTS, ...values };
    }

    async function save(payload = null) {
        if (!isOnline.value) {
            throw new Error('Online connection required to save settings.');
        }
        const body = payload ?? { ...settings.value };
        const res = await api.put('/settings', body);
        if (res.status !== 200) {
            throw new Error(res.data?.message || 'Failed to save settings');
        }
        await db.settings.clear();
        await db.settings.bulkPut(
            Object.entries(body).map(([key, value]) => ({ key, value: String(value ?? '') }))
        );
        await loadLocal();
        return true;
    }

    return { settings, get, loadLocal, save };
});