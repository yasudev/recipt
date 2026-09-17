import { ref } from 'vue';
import api from './api';
import db from './db';

export const isOnline = ref(
    typeof navigator !== 'undefined' ? navigator.onLine : true
);

const syncListeners = new Set();

export function onSyncComplete(fn) {
    syncListeners.add(fn);
    return () => syncListeners.delete(fn);
}

export function notifySyncComplete() {
    syncListeners.forEach((fn) => {
        try {
            fn();
        } catch (e) {
            /* ignore */
        }
    });
}

export async function pullCatalog() {
    if (!isOnline.value) return false;

    const [productsRes, categoriesRes, settingsRes] = await Promise.all([
        api.get('/products?active_only=1'),
        api.get('/categories'),
        api.get('/settings'),
    ]);

    if (
        productsRes.status === 200 &&
        categoriesRes.status === 200 &&
        settingsRes.status === 200
    ) {
        const products = productsRes.data.map((p) => ({
            id: p.id,
            category_id: p.category_id,
            name: p.name,
            sku: p.sku,
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            is_active: p.is_active === true || p.is_active === 1,
            updated_at: new Date().toISOString(),
        }));
        const categories = categoriesRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description ?? '',
        }));

        await db.transaction('rw', db.products, db.categories, db.settings, async () => {
            await db.products.clear();
            await db.products.bulkPut(products);
            await db.categories.clear();
            await db.categories.bulkPut(categories);

            await db.settings.clear();
            const settings = settingsRes.data;
            await db.settings.bulkPut(
                Object.entries(settings).map(([key, value]) => ({ key, value: String(value ?? '') }))
            );
        });

        return true;
    }
    return false;
}

export async function pushPendingSales() {
    if (!isOnline.value) return { pushed: 0, pending: 0 };

    const pending = await db.sales
        .where('sync_status')
        .equalsAny(['pending', 'failed'])
        .toArray();
    if (!pending.length) return { pushed: 0, pending: 0 };

    const payload = pending.map((s) => ({
        local_id: s.local_id,
        items: (s.items || []).map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            total: i.total,
        })),
        subtotal: s.subtotal,
        vat_rate: s.vat_rate,
        vat_amount: s.vat_amount,
        total: s.total,
        payment_method: s.payment_method || 'cash',
        sale_date: s.sale_date || null,
        sale_time: s.sale_time || null,
    }));

    const res = await api.post('/sales/sync', { sales: payload });
    if (res.status !== 200) {
        throw new Error(res.data?.message || 'Sync failed');
    }

    let pushed = 0;
    for (const r of res.data.results) {
        if (r.status === 'synced') {
            await db.sales.update(r.local_id, {
                sync_status: 'synced',
                server_id: r.server_id,
                receipt_number: r.receipt_number,
            });
            pushed++;
        } else {
            await db.sales.update(r.local_id, {
                sync_status: 'failed',
                error: r.error || 'Sync failed',
            });
        }
    }

    return { pushed, pending: pending.length };
}

export async function runSync() {
    if (!isOnline.value) return;
    try {
        await pushPendingSales();
        await pullCatalog();
        notifySyncComplete();
    } catch (e) {
        console.error('Sync failed:', e);
    }
}

export function initSync() {
    window.addEventListener('online', () => {
        isOnline.value = true;
        runSync();
    });
    window.addEventListener('offline', () => {
        isOnline.value = false;
    });
}