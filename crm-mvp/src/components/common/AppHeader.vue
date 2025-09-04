<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <!-- Mobile menu button -->
        <button type="button"
          class="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-150"
          @click="$emit('toggle-sidebar')" aria-label="Open navigation menu">
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
        <div class="relative" ref="userMenuContainer">
          <button type="button"
            class="flex items-center gap-x-2 rounded-full bg-white p-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            @click="toggleUserMenu" @keydown.escape="userMenuOpen = false" :aria-expanded="userMenuOpen"
            aria-haspopup="true">
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
          <div v-if="userMenuOpen"
            class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            @click.stop
            style="border: 2px solid red; background-color: white !important;"
            data-testid="user-menu-dropdown">
            <!-- User Info -->
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userEmail }}</p>
              <p class="text-xs text-gray-500">Signed in</p>
            </div>

            <!-- Menu Items -->
            <div class="py-1">
              <!-- Profile/Settings (placeholder for future) -->
              <button
                class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                @click="handleProfileClick">
                <svg class="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </button>

              <!-- Keyboard Shortcuts -->
              <button
                class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                @click="showKeyboardShortcuts">
                <svg class="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                Keyboard Shortcuts
              </button>
            </div>

            <!-- Sign Out -->
            <div class="border-t border-gray-100 py-1">
              <button
                class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleSignOut" :disabled="authStore.loading">
                <svg v-if="authStore.loading" class="animate-spin mr-3 h-4 w-4 text-gray-500" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <svg v-else class="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="flex-1">{{ authStore.loading ? 'Signing out...' : 'Sign out' }}</span>
                <span class="text-xs text-gray-400">⌘⇧Q</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { useConfirmation } from '@/composables/useConfirmation'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()
const confirmation = inject<ReturnType<typeof useConfirmation>>('confirmation')
const userMenuOpen = ref(false)
const userMenuContainer = ref<HTMLElement>()

// Toggle user menu
const toggleUserMenu = (event: Event) => {
  event.stopPropagation()
  console.log('Toggle user menu clicked, current state:', userMenuOpen.value)
  userMenuOpen.value = !userMenuOpen.value
  console.log('New state:', userMenuOpen.value)
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    userMenuOpen.value = false
  }
}

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

  if (!confirmation) {
    await performSignOut()
    return
  }

  const confirmed = await confirmation.confirm({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    details: 'You will need to sign in again to access your account.',
    variant: 'info',
    confirmText: 'Sign Out',
    cancelText: 'Cancel'
  })

  if (confirmed) {
    await performSignOut()
  }
}

const performSignOut = async () => {
  try {
    const { error } = await authStore.signOut()

    if (error) {
      console.error('Logout error:', error)
      toastStore.error('Failed to sign out. Please try again.')
    } else {
      toastStore.success('Successfully signed out')
    }
  } catch (error) {
    console.error('Unexpected logout error:', error)
    toastStore.error('An unexpected error occurred during sign out')
  }
}

const handleProfileClick = () => {
  userMenuOpen.value = false
  toastStore.info('Profile settings coming soon!')
}

const showKeyboardShortcuts = () => {
  userMenuOpen.value = false
  if (confirmation) {
    confirmation.confirm({
      title: 'Keyboard Shortcuts',
      message: 'Available keyboard shortcuts:',
      details: '⌘⇧Q (Ctrl+Shift+Q) - Sign out\nEsc - Close dialogs/menus\n/ - Focus search (when available)',
      variant: 'info',
      confirmText: 'Got it',
      cancelText: ''
    })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Escape key to close menu
  if (event.key === 'Escape' && userMenuOpen.value) {
    userMenuOpen.value = false
    return
  }
  
  // Cmd/Ctrl + Shift + Q for logout
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Q') {
    event.preventDefault()
    handleSignOut()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>