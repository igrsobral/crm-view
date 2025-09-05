<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <!-- Mobile menu button -->
        <Button
          class="lg:hidden"
          variant="text"
          size="small"
          @click="$emit('toggle-sidebar')"
          aria-label="Open navigation menu">
          <template #icon>
            <i class="pi pi-bars" />
          </template>
        </Button>

        <!-- Page title -->
        <div class="flex-1 lg:flex-none">
          <h1 class="text-xl font-semibold text-gray-900 lg:hidden">
            {{ currentPageTitle }}
          </h1>
        </div>

        <!-- User menu -->
        <div class="relative" ref="userMenuContainer">
          <Button
            class="flex items-center gap-x-2 p-1.5"
            variant="text"
            @click="toggleUserMenu" 
            @keydown.escape="userMenuOpen = false" 
            :aria-expanded="userMenuOpen"
            aria-haspopup="true"
            ref="menuButton">
            <Avatar 
              :label="userInitials" 
              class="bg-blue-600 text-white" 
              size="small" 
              shape="circle" />
            <span class="hidden lg:block text-sm font-medium text-gray-700">
              {{ userEmail }}
            </span>
            <i class="pi pi-chevron-down text-gray-400" />
          </Button>

          <!-- User dropdown menu -->
          <Menu 
            ref="menu"
            :model="menuItems" 
            :popup="true"
            class="w-56"
            appendTo="body"
            data-testid="user-menu-dropdown">
            <template #start>
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900 truncate">{{ userEmail }}</p>
                <p class="text-xs text-gray-500">Signed in</p>
              </div>
            </template>
            <template #item="{ item }">
              <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                  <i :class="item.icon" class="mr-3" />
                  <span>{{ item.label }}</span>
                </div>
                <span v-if="typeof item.label === 'string' && item.label.includes('Sign out')" class="text-xs text-gray-400">⌘⇧Q</span>
              </div>
            </template>
          </Menu>
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
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()
const confirmation = inject<ReturnType<typeof useConfirmation>>('confirmation')
const userMenuOpen = ref(false)
const userMenuContainer = ref<HTMLElement>()
const menu = ref()
const menuButton = ref()

// Toggle user menu
const toggleUserMenu = (event: Event) => {
  event.stopPropagation()
  console.log('Toggle user menu clicked, current state:', userMenuOpen.value)
  if (menu.value) {
    menu.value.toggle(event)
  }
  userMenuOpen.value = !userMenuOpen.value
  console.log('New state:', userMenuOpen.value)
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    if (menu.value) {
      menu.value.hide()
    }
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

// Menu items for PrimeVue Menu
const menuItems = computed((): MenuItem[] => [
  {
    label: 'Profile Settings',
    icon: 'pi pi-user',
    command: () => handleProfileClick()
  },
  {
    label: 'Keyboard Shortcuts', 
    icon: 'pi pi-key',
    command: () => showKeyboardShortcuts()
  },
  {
    separator: true
  },
  {
    label: authStore.loading ? 'Signing out...' : 'Sign out',
    icon: authStore.loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-out',
    command: () => handleSignOut(),
    disabled: authStore.loading
  }
])

const handleSignOut = async () => {
  // Close the menu
  if (menu.value) {
    menu.value.hide()
  }
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
  if (menu.value) {
    menu.value.hide()
  }
  userMenuOpen.value = false
  toastStore.info('Profile settings coming soon!')
}

const showKeyboardShortcuts = () => {
  if (menu.value) {
    menu.value.hide()
  }
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
    if (menu.value) {
      menu.value.hide()
    }
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