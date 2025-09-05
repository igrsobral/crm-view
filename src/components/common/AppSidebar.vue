<template>
  <!-- Mobile sidebar -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div 
      v-if="open"
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
    >
    <div class="flex h-16 items-center justify-between px-6 border-b border-gray-200">
      <div class="flex items-center">
        <div class="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
          <span class="text-white font-bold text-sm">C</span>
        </div>
        <span class="ml-2 text-lg font-semibold text-gray-900">Contactly</span>
      </div>
      <button
        type="button"
        class="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
        @click="$emit('close')"
      >
        <span class="sr-only">Close sidebar</span>
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <nav class="flex-1 px-4 py-6">
      <ul class="space-y-1">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              isActiveRoute(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <svg
              :class="[
                'mr-3 h-5 w-5 flex-shrink-0',
                isActiveRoute(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
    </div>
  </Transition>

  <!-- Desktop sidebar -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
    <div class="flex h-16 items-center px-6 border-b border-gray-200">
      <div class="flex items-center">
        <div class="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
          <span class="text-white font-bold text-sm">C</span>
        </div>
        <span class="ml-2 text-lg font-semibold text-gray-900">Contactly</span>
      </div>
    </div>
    <nav class="flex-1 px-4 py-6">
      <ul class="space-y-1">
        <li v-for="item in navigationItems" :key="item.name">
          <router-link
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              isActiveRoute(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <svg
              :class="[
                'mr-3 h-5 w-5 flex-shrink-0',
                isActiveRoute(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
// No additional imports needed
import { useRoute } from 'vue-router'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
  },
  {
    name: 'Deals',
    href: '/deals',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8h2a2 2 0 012 2v6a2 2 0 01-2 2H9m0-8v8'
  }
]

const isActiveRoute = (href: string) => {
  return route.path === href
}
</script>