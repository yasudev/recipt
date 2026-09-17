<template>
    <div class="space-y-4 max-w-3xl">
        <h1 class="text-xl lg:text-2xl font-bold text-slate-800">Settings</h1>

        <div v-if="!isOnline" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            You are offline. Settings can only be saved when online.
        </div>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200">
                <h2 class="text-sm font-semibold text-slate-700">Receipt &amp; Company</h2>
            </div>
            <form @submit.prevent="save" class="p-5 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Company name</label>
                        <input v-model="form.company_name" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea v-model="form.company_address" rows="2" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input v-model="form.company_phone" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input v-model="form.company_email" type="email" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">VAT rate (%)</label>
                        <input v-model.number="form.vat_rate" type="number" step="0.01" min="0" max="100" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                        <div class="text-xs text-slate-400 mt-1">Applied on top of prices (before VAT).</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Currency symbol</label>
                        <input v-model="form.currency_symbol" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Receipt footer message</label>
                        <input v-model="form.receipt_footer" class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                </div>

                <div v-if="message" class="text-sm rounded-lg px-3 py-2" :class="messageType === 'error' ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'">
                    {{ message }}
                </div>

                <div class="flex gap-2 justify-end">
                    <button type="submit" :disabled="!isOnline || saving" class="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                        {{ saving ? 'Saving...' : 'Save settings' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { isOnline } from '../services/sync';

const settings = useSettingsStore();

const form = ref({});
const message = ref('');
const messageType = ref('success');
const saving = ref(false);

function toForm() {
    form.value = {
        company_name: settings.get('company_name', ''),
        company_address: settings.get('company_address', ''),
        company_phone: settings.get('company_phone', ''),
        company_email: settings.get('company_email', ''),
        vat_rate: settings.get('vat_rate', '15'),
        currency_symbol: settings.get('currency_symbol', 'ر.س'),
        receipt_footer: settings.get('receipt_footer', ''),
    };
}

async function save() {
    message.value = '';
    saving.value = true;
    try {
        await settings.save(form.value);
        messageType.value = 'success';
        message.value = 'Settings saved successfully.';
    } catch (e) {
        messageType.value = 'error';
        message.value = e.message || 'Failed to save settings';
    } finally {
        saving.value = false;
    }
}

onMounted(async () => {
    await settings.loadLocal();
    toForm();
});
</script>