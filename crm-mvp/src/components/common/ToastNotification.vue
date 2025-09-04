<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClass(toast.type)"
          class="min-w-80 max-w-md w-auto shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <!-- Success Icon -->
                <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="getIconClass(toast.type)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                <!-- Error Icon -->
                <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="getIconClass(toast.type)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                
                <!-- Warning Icon -->
                <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="getIconClass(toast.type)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                
                <!-- Info Icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" :class="getIconClass(toast.type)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p v-if="toast.title" class="text-sm font-medium" :class="getTitleClass(toast.type)">
                  {{ toast.title }}
                </p>
                <p class="text-sm" :class="getMessageClass(toast.type)">
                  {{ toast.message }}
                </p>
                <div v-if="toast.action" class="mt-3 flex space-x-7">
                  <button
                    @click="toast.action.handler"
                    class="text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="getActionClass(toast.type)"
                  >
                    {{ toast.action.label }}
                  </button>
                </div>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeToast(toast.id)"
                  class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span class="sr-only">Close</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="h-1 bg-black bg-opacity-10"
          >
            <div
              class="h-full transition-all ease-linear"
              :class="getProgressClass(toast.type)"
              :style="{ width: `${getProgress(toast)}%` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts, removeToast } = toastStore

const getToastClass = (type: string) => {
  const variants = {
    success: 'bg-white',
    error: 'bg-white',
    warning: 'bg-white',
    info: 'bg-white'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getIconClass = (type: string) => {
  const variants = {
    success: 'h-6 w-6 text-green-400',
    error: 'h-6 w-6 text-red-400',
    warning: 'h-6 w-6 text-yellow-400',
    info: 'h-6 w-6 text-blue-400'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getTitleClass = (type: string) => {
  const variants = {
    success: 'text-gray-900',
    error: 'text-gray-900',
    warning: 'text-gray-900',
    info: 'text-gray-900'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getMessageClass = (type: string) => {
  const variants = {
    success: 'text-gray-500',
    error: 'text-gray-500',
    warning: 'text-gray-500',
    info: 'text-gray-500'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getActionClass = (type: string) => {
  const variants = {
    success: 'text-green-600 hover:text-green-500 focus:ring-green-500',
    error: 'text-red-600 hover:text-red-500 focus:ring-red-500',
    warning: 'text-yellow-600 hover:text-yellow-500 focus:ring-yellow-500',
    info: 'text-blue-600 hover:text-blue-500 focus:ring-blue-500'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getProgressClass = (type: string) => {
  const variants = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400'
  }
  return variants[type as keyof typeof variants] || variants.info
}

const getProgress = (toast: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title?: string | undefined;
    message: string;
    duration?: number | undefined;
    action?: {
        label: string;
        handler: () => void;
    } | undefined;
    createdAt: number;
}) => {
  if (!toast.duration || toast.duration <= 0) return 0
  const elapsed = Date.now() - toast.createdAt
  const progress = Math.max(0, Math.min(100, (elapsed / toast.duration) * 100))
  return 100 - progress
}
</script>