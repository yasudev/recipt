<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50"
                @click.self="$emit('update:modelValue', false)"
            >
                <div class="modal-box w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-w-lg max-h-[90vh] flex flex-col">
                    <div v-if="title || closable" class="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
                        <h3 class="text-base font-semibold text-slate-800">{{ title }}</h3>
                        <button
                            v-if="closable !== false"
                            class="text-slate-400 hover:text-slate-600"
                            @click="$emit('update:modelValue', false)"
                            aria-label="Close"
                        >
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="p-5 overflow-y-auto">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' },
    closable: { type: Boolean, default: true },
});

defineEmits(['update:modelValue']);
</script>