<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import ToastNotification from '@/components/common/ToastNotification.vue'
import GlobalConfirmDialog from '@/components/common/GlobalConfirmDialog.vue'

// Initialize authentication
useAuth()
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView />
    <ToastNotification />
    <GlobalConfirmDialog />
  </div>
</template>
