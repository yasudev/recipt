<template>
    <div
        v-if="isOnline"
        class="bg-emerald-600 text-white text-xs font-medium text-center px-4 py-1.5"
    >
        Online &middot; synced
    </div>
    <div
        v-else
        class="bg-amber-500 text-white text-xs font-medium text-center px-4 py-1.5"
    >
        You are offline &middot; sales will be saved locally and synced automatically when back online
    </div>
</template>

<script setup>
import { isOnline } from '../services/sync';
</script>