<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Toast from 'primevue/toast'
import GlobalConfirmDialog from '@/components/common/GlobalConfirmDialog.vue'

// Initialize authentication
useAuth()
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView />
    <Toast group="app" class="min-w-80 max-w-md w-auto" />
    <GlobalConfirmDialog />
  </div>
</template>
