<template>
    <Modal :model-value="modelValue" title="Receipt" @update:model-value="$emit('update:modelValue', $event)">
        <div class="space-y-4">
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <iframe
                    :srcdoc="html"
                    class="w-full h-[420px] bg-white"
                    title="Receipt preview"
                ></iframe>
            </div>

            <div class="flex flex-wrap gap-2">
                <button
                    class="flex-1 min-w-[96px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900"
                    @click="print('58')"
                >
                    Print 58mm
                </button>
                <button
                    class="flex-1 min-w-[96px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900"
                    @click="print('80')"
                >
                    Print 80mm
                </button>
                <button
                    class="flex-1 min-w-[96px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    @click="print('a4')"
                >
                    Print A4
                </button>
            </div>

            <div v-if="sale?.sync_status === 'pending'" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                This sale is pending sync and will be uploaded automatically when you are back online.
            </div>

            <div class="text-center text-xs text-slate-500">
                Receipt no: {{ sale?.receipt_number }}
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { computed } from 'vue';
import Modal from './Modal.vue';
import { buildReceiptHtml, printSale } from '../services/printer';

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    sale: { type: Object, default: null },
    settings: { type: Object, default: () => ({}) },
});

defineEmits(['update:modelValue']);

const html = computed(() =>
    props.sale ? buildReceiptHtml(props.sale, props.settings, '80') : ''
);

function print(format) {
    if (!props.sale) return;
    printSale(props.sale, props.settings, format);
}
</script>