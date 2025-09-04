<template>
  <div ref="containerRef">
    <Suspense>
      <template #default>
        <component 
          v-if="shouldLoad" 
          :is="lazyComponent" 
          v-bind="$attrs"
          @vue:mounted="onComponentMounted"
        />
      </template>
      <template #fallback>
        <div v-if="showFallback" :class="fallbackClass">
          <slot name="loading">
            <SkeletonLoader 
              :type="skeletonType" 
              :count="skeletonCount"
              class="animate-pulse"
            />
          </slot>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import SkeletonLoader from './SkeletonLoader.vue'

interface Props {
  // Component to lazy load
  component: () => Promise<unknown>
  // Intersection observer options
  rootMargin?: string
  threshold?: number
  // Loading behavior
  eager?: boolean // Load immediately without intersection observer
  showFallback?: boolean
  fallbackClass?: string
  // Skeleton options
  skeletonType?: 'card' | 'list' | 'table' | 'text'
  skeletonCount?: number
  // Performance options
  timeout?: number // Max time to wait for component load
}

const props = withDefaults(defineProps<Props>(), {
  rootMargin: '50px',
  threshold: 0.1,
  eager: false,
  showFallback: true,
  fallbackClass: 'min-h-[200px] flex items-center justify-center',
  skeletonType: 'card',
  skeletonCount: 3,
  timeout: 10000
})

const emit = defineEmits<{
  loaded: []
  error: [error: Error]
  visible: []
}>()

const containerRef = ref<HTMLElement>()
const shouldLoad = ref(props.eager)
const isVisible = ref(false)
const hasError = ref(false)

// Create the lazy component
const lazyComponent = defineAsyncComponent({
  loader: props.component,
  delay: 200,
  timeout: props.timeout,
  errorComponent: {
    template: `
      <div class="p-4 text-center text-red-600">
        <p>Failed to load component</p>
        <button @click="retry" class="mt-2 px-3 py-1 bg-red-100 rounded text-sm hover:bg-red-200">
          Retry
        </button>
      </div>
    `,
    methods: {
      retry() {
        hasError.value = false
        shouldLoad.value = false
        setTimeout(() => {
          shouldLoad.value = true
        }, 100)
      }
    }
  },
  loadingComponent: {
    template: '<div></div>' // We handle loading in the Suspense fallback
  }
})

let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!containerRef.value || props.eager) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !shouldLoad.value) {
        isVisible.value = true
        shouldLoad.value = true
        emit('visible')
        
        // Disconnect observer after loading
        if (observer) {
          observer.disconnect()
          observer = null
        }
      }
    },
    {
      rootMargin: props.rootMargin,
      threshold: props.threshold
    }
  )

  observer.observe(containerRef.value)
}

const onComponentMounted = () => {
  emit('loaded')
}

onMounted(() => {
  if (!props.eager) {
    setupIntersectionObserver()
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// Expose methods for manual control
defineExpose({
  load: () => {
    shouldLoad.value = true
  },
  unload: () => {
    shouldLoad.value = false
  },
  reload: () => {
    shouldLoad.value = false
    setTimeout(() => {
      shouldLoad.value = true
    }, 100)
  }
})
</script>