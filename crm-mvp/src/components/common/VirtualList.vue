<template>
  <div 
    ref="containerRef"
    :style="{ height: containerHeight }"
    class="overflow-auto"
    @scroll="handleScroll"
  >
    <!-- Spacer for items before visible range -->
    <div :style="{ height: `${offsetY}px` }"></div>
    
    <!-- Visible items -->
    <div
      v-for="(item, index) in visibleItems"
      :key="getItemKey(item, startIndex + index)"
      :style="{ height: `${itemHeight}px` }"
      class="flex-shrink-0"
    >
      <slot 
        :item="item" 
        :index="startIndex + index"
        :isVisible="true"
      />
    </div>
    
    <!-- Spacer for items after visible range -->
    <div :style="{ height: `${remainingHeight}px` }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useThrottle } from '@/composables/usePerformance'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight?: string
  overscan?: number // Number of items to render outside visible area
  keyField?: string // Field to use as key, defaults to index
}

const props = withDefaults(defineProps<Props>(), {
  containerHeight: '400px',
  overscan: 5,
  keyField: 'id'
})

const emit = defineEmits<{
  scroll: [{ scrollTop: number; scrollLeft: number }]
  visibleRangeChange: [{ start: number; end: number }]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// Calculate visible range
const containerHeightPx = computed(() => {
  return parseInt(props.containerHeight.replace('px', '')) || 400
})

const visibleCount = computed(() => {
  return Math.ceil(containerHeightPx.value / props.itemHeight)
})

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.overscan
  return Math.max(0, index)
})

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value + props.overscan * 2
  return Math.min(props.items.length - 1, index)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1)
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

const remainingHeight = computed(() => {
  const totalHeight = props.items.length * props.itemHeight
  const visibleHeight = visibleItems.value.length * props.itemHeight
  return Math.max(0, totalHeight - offsetY.value - visibleHeight)
})

const getItemKey = (item: any, index: number) => {
  if (props.keyField && item[props.keyField] !== undefined) {
    return item[props.keyField]
  }
  return index
}

// Throttled scroll handler for performance
const handleScroll = useThrottle((event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  emit('scroll', {
    scrollTop: target.scrollTop,
    scrollLeft: target.scrollLeft
  })
}, 16) // ~60fps

// Watch for visible range changes
watch([startIndex, endIndex], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart !== oldStart || newEnd !== oldEnd) {
    emit('visibleRangeChange', {
      start: newStart,
      end: newEnd
    })
  }
})

// Scroll to specific item
const scrollToItem = (index: number, behavior: ScrollBehavior = 'smooth') => {
  if (!containerRef.value) return
  
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTo({
    top: targetScrollTop,
    behavior
  })
}

// Scroll to top
const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollToItem(0, behavior)
}

// Scroll to bottom
const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  scrollToItem(props.items.length - 1, behavior)
}

// Get current scroll position as percentage
const getScrollPercentage = () => {
  if (!containerRef.value) return 0
  
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  const maxScroll = scrollHeight - clientHeight
  
  if (maxScroll <= 0) return 0
  
  return (scrollTop / maxScroll) * 100
}

// Expose methods
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  getScrollPercentage,
  containerRef
})

onMounted(() => {
  // Initial scroll position setup if needed
  nextTick(() => {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop
    }
  })
})
</script>