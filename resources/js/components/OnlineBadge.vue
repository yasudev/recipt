<template>
    <span class="inline-flex items-center gap-1 text-[11px] font-medium">
        <span
            class="inline-block w-2 h-2 rounded-full"
            :class="isOnline ? 'bg-emerald-500' : 'bg-amber-500'"
        ></span>
        <span :class="isOnline ? 'text-emerald-600' : 'text-amber-600'">
            {{ isOnline ? 'Online' : 'Offline' }}
        </span>
    </span>
</template>

<script setup>
import { isOnline } from '../services/sync';
</script>