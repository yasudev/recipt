import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import db from '../services/db';
import { useSettingsStore } from './settings';
import { defaultReceiptDate, defaultReceiptTime, randomReceiptNumber, randomLocalId } from '../services/format';

export const usePosStore = defineStore('pos', () => {
    const items = ref([]);
    const paymentMethod = ref('cash');
    const saleDate = ref(defaultReceiptDate());
    const saleTime = ref(defaultReceiptTime());
    const checkoutOpen = ref(false);
    const lastSale = ref(null);

    const subtotal = computed(() =>
        Math.round(items.value.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0) * 100) / 100
    );
    const vatRate = computed(() => {
        const settings = useSettingsStore();
        return Number(settings.get('vat_rate', '15')) || 0;
    });
    const vatAmount = computed(() =>
        Math.round((subtotal.value * vatRate.value) / 100 * 100) / 100
    );
    const total = computed(() => Math.round((subtotal.value + vatAmount.value) * 100) / 100);
    const itemCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));

    function canAdd(product) {
        const available = Number(product.stock) || 0;
        if (available <= 0) return false;
        const existing = items.value.find((i) => i.product_id === product.id);
        if (existing) return existing.quantity < available;
        return true;
    }

    function addProduct(product, qty = 1) {
        if (!product || !canAdd(product)) return;
        const existing = items.value.find((i) => i.product_id === product.id);
        if (existing) {
            existing.quantity = Math.min(existing.quantity + qty, product.stock);
        } else {
            items.value.push({
                product_id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                quantity: Math.min(qty, Number(product.stock) || 0),
                stock: Number(product.stock) || 0,
            });
        }
    }

    function setQuantity(productId, quantity) {
        const item = items.value.find((i) => i.product_id === Number(productId));
        if (!item) return;
        const qty = Math.max(0, Number(quantity) || 0);
        if (qty > item.stock) return;
        if (qty === 0) {
            items.value = items.value.filter((i) => i.product_id !== Number(productId));
        } else {
            item.quantity = qty;
        }
    }

    function removeItem(productId) {
        items.value = items.value.filter((i) => i.product_id !== Number(productId));
    }

    function clear() {
        items.value = [];
    }

    function openCheckout() {
        if (!items.value.length) return;
        saleDate.value = defaultReceiptDate();
        saleTime.value = defaultReceiptTime();
        checkoutOpen.value = true;
    }

    function closeCheckout() {
        checkoutOpen.value = false;
    }

    async function completeSale() {
        if (!items.value.length) return null;

        const sale = {
            local_id: randomLocalId(),
            receipt_number: randomReceiptNumber(),
            items: items.value.map((i) => ({
                product_id: i.product_id,
                product_name: i.name,
                quantity: i.quantity,
                price: i.price,
                total: (i.price || 0) * i.quantity,
            })),
            subtotal: subtotal.value,
            vat_rate: vatRate.value,
            vat_amount: vatAmount.value,
            total: total.value,
            payment_method: paymentMethod.value,
            sale_date: saleDate.value,
            sale_time: saleTime.value,
            status: 'completed',
            sync_status: 'pending',
            created_at: new Date().toISOString(),
        };

        await db.sales.put(sale);

        for (const i of items.value) {
            const p = await db.products.get(i.product_id);
            if (p) {
                await db.products.update(i.product_id, {
                    stock: Math.max(0, (p.stock || 0) - i.quantity),
                });
            }
        }

        lastSale.value = sale;
        items.value = [];
        checkoutOpen.value = false;
        return sale;
    }

    function setLastSale(sale) {
        lastSale.value = sale;
    }

    return {
        items,
        paymentMethod,
        saleDate,
        saleTime,
        checkoutOpen,
        lastSale,
        subtotal,
        vatRate,
        vatAmount,
        total,
        itemCount,
        canAdd,
        addProduct,
        setQuantity,
        removeItem,
        clear,
        openCheckout,
        closeCheckout,
        completeSale,
        setLastSale,
    };
});