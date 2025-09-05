<template>
  <div :class="containerClass">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg :class="iconClass" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path v-if="variant === 'error'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          <path v-else-if="variant === 'warning'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 v-if="title" :class="titleClass">{{ title }}</h3>
        <div :class="messageClass">
          <p>{{ message }}</p>
        </div>
        <div v-if="showRetry || showDetails" class="mt-4 flex space-x-3">
          <button
            v-if="showRetry"
            @click="$emit('retry')"
            :disabled="retrying"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="retrying" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ retrying ? 'Retrying...' : 'Try Again' }}
          </button>
          <button
            v-if="showDetails"
            @click="showingDetails = !showingDetails"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {{ showingDetails ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>
        <div v-if="showingDetails && details" class="mt-3 p-3 bg-gray-50 rounded-md">
          <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ details }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  message: string
  title?: string
  variant?: 'error' | 'warning' | 'info'
  showRetry?: boolean
  showDetails?: boolean
  details?: string
  retrying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'error',
  showRetry: false,
  showDetails: false,
  retrying: false
})

defineEmits<{
  retry: []
}>()

const showingDetails = ref(false)

const containerClass = computed(() => {
  const variants = {
    error: 'bg-red-50 border border-red-200 rounded-md p-4',
    warning: 'bg-yellow-50 border border-yellow-200 rounded-md p-4',
    info: 'bg-blue-50 border border-blue-200 rounded-md p-4'
  }
  return variants[props.variant]
})

const iconClass = computed(() => {
  const variants = {
    error: 'h-5 w-5 text-red-400',
    warning: 'h-5 w-5 text-yellow-400',
    info: 'h-5 w-5 text-blue-400'
  }
  return variants[props.variant]
})

const titleClass = computed(() => {
  const variants = {
    error: 'text-sm font-medium text-red-800',
    warning: 'text-sm font-medium text-yellow-800',
    info: 'text-sm font-medium text-blue-800'
  }
  return variants[props.variant]
})

const messageClass = computed(() => {
  const variants = {
    error: 'text-sm text-red-700',
    warning: 'text-sm text-yellow-700',
    info: 'text-sm text-blue-700'
  }
  return variants[props.variant]
})
</script>