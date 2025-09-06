<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <Transition enter-active-class="transition-opacity duration-300 ease-linear" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300 ease-linear"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      </div>
    </Transition>

    <!-- Sidebar -->
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content area -->
    <div class="lg:pl-64" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <!-- Header -->
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Breadcrumb navigation -->
      <nav class="bg-white border-b border-gray-200 lg:hidden" aria-label="Breadcrumb">
        <div class="mx-auto  px-4 sm:px-6 lg:px-6">
          <div class="flex items-center py-4">
            <ol class="flex items-center space-x-2">
              <li>
                <div class="flex items-center">
                  <router-link to="/dashboard" class="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Dashboard
                  </router-link>
                </div>
              </li>
              <li v-if="currentPageTitle !== 'Dashboard'">
                <div class="flex items-center">
                  <svg class="h-4 w-4 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                  <span class="ml-2 text-sm font-medium text-gray-900">{{ currentPageTitle }}</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="py-6">
        <div class="mx-auto  px-4 sm:px-6 lg:px-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMobile, useTouchGestures } from '@/composables/useMobile'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()
const sidebarOpen = ref(false)

// Mobile optimizations
const { isMobile, isTouchDevice } = useMobile()
const { handleTouchStart, handleTouchMove, getSwipeDirection } = useTouchGestures()

// Auto-close sidebar on mobile when route changes
watch(() => route.path, () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
})

// Handle swipe gestures on mobile
const handleTouchEnd = () => {
  if (!isMobile.value || !isTouchDevice.value) return

  const direction = getSwipeDirection()

  if (direction === 'swipe-right' && !sidebarOpen.value) {
    // Swipe right to open sidebar
    sidebarOpen.value = true
  } else if (direction === 'swipe-left' && sidebarOpen.value) {
    // Swipe left to close sidebar
    sidebarOpen.value = false
  }
}

const currentPageTitle = computed(() => {
  return route.meta.title as string || 'Dashboard'
})

// Close sidebar on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
