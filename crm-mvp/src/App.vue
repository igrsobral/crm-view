<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Initialize authentication
useAuth()
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView />
  </div>
</template>
