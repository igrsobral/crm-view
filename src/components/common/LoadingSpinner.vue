<template>
  <div :class="containerClass">
    <div class="flex items-center">
      <!-- Spinner -->
      <svg 
        :class="spinnerClass" 
        class="animate-spin" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        />
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      <!-- Message -->
      <span v-if="message" :class="messageClass">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'white'
  center?: boolean
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  size: 'md',
  variant: 'primary',
  center: false,
  overlay: false
})

const containerClass = computed(() => {
  let classes = ''
  
  if (props.center) {
    classes += 'flex justify-center items-center '
  }
  
  if (props.overlay) {
    classes += 'fixed inset-0 bg-white bg-opacity-75 z-50 '
  }
  
  return classes.trim()
})

const spinnerClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  const variants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }
  
  return `${sizes[props.size]} ${variants[props.variant]}`
})

const messageClass = computed(() => {
  const variants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }
  
  return `ml-3 text-sm font-medium ${variants[props.variant]}`
})
</script>