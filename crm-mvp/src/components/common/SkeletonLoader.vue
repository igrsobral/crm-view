<template>
  <div :class="containerClass">
    <!-- Card skeleton -->
    <div v-if="type === 'card'" class="bg-white rounded-lg shadow p-6">
      <div class="animate-pulse">
        <div class="flex items-center space-x-4">
          <div v-if="showAvatar" class="rounded-full bg-gray-300 h-10 w-10"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div v-if="showContent" class="mt-4 space-y-3">
          <div class="h-3 bg-gray-300 rounded"></div>
          <div class="h-3 bg-gray-300 rounded w-5/6"></div>
          <div class="h-3 bg-gray-300 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in count" :key="i" class="animate-pulse">
        <div class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
          <div v-if="showAvatar" class="rounded-full bg-gray-300 h-8 w-8"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div class="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div v-else-if="type === 'table'" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="animate-pulse">
        <!-- Table header -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="flex space-x-4">
            <div v-for="i in columns" :key="i" class="h-4 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>
        <!-- Table rows -->
        <div v-for="i in count" :key="i" class="px-6 py-4 border-b border-gray-200">
          <div class="flex space-x-4">
            <div v-for="j in columns" :key="j" class="h-4 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text skeleton -->
    <div v-else-if="type === 'text'" class="animate-pulse space-y-2">
      <div v-for="i in count" :key="i" class="h-4 bg-gray-300 rounded" :class="getTextWidth(i)"></div>
    </div>

    <!-- Custom skeleton -->
    <div v-else class="animate-pulse">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'card' | 'list' | 'table' | 'text' | 'custom'
  count?: number
  columns?: number
  showAvatar?: boolean
  showContent?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 3,
  columns: 4,
  showAvatar: true,
  showContent: true,
  class: ''
})

const containerClass = computed(() => {
  return props.class
})

const getTextWidth = (index: number) => {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3']
  return widths[index % widths.length]
}
</script>