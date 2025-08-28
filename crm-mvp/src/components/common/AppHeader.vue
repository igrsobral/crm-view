<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <!-- Mobile menu button -->
        <button
          type="button"
          class="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-150"
          @click="$emit('toggle-sidebar')"
          aria-label="Open navigation menu"
        >
          <span class="sr-only">Open sidebar</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- Page title -->
        <div class="flex-1 lg:flex-none">
          <h1 class="text-xl font-semibold text-gray-900 lg:hidden">
            {{ currentPageTitle }}
          </h1>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-x-2 rounded-full bg-white p-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            @click="userMenuOpen = !userMenuOpen"
            @keydown.escape="userMenuOpen = false"
            :aria-expanded="userMenuOpen"
            aria-haspopup="true"
          >
            <span class="sr-only">Open user menu</span>
            <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <span class="hidden lg:block text-sm font-medium text-gray-700">
              {{ userEmail }}
            </span>
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <!-- User dropdown menu -->
          <div
            v-if="userMenuOpen"
            ref="userMenuRef"
            class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out"
          >
            <button
              class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              @click="handleSignOut"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useClickAway } from '@/composables/useClickAway'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const authStore = useAuthStore()
const userMenuOpen = ref(false)

// Click away functionality for user menu
const userMenuRef = useClickAway(() => {
  userMenuOpen.value = false
})

const currentPageTitle = computed(() => {
  return route.meta.title as string || 'Dashboard'
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const userInitials = computed(() => {
  const email = userEmail.value
  if (!email) return 'U'
  
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email[0].toUpperCase()
})

const handleSignOut = async () => {
  userMenuOpen.value = false
  await authStore.signOut()
}
</script>