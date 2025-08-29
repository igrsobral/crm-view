import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useMobile() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  const updateDimensions = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  // Breakpoints matching Tailwind CSS
  const isMobile = computed(() => windowWidth.value < 768) // md breakpoint
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024) // lg breakpoint
  const isDesktop = computed(() => windowWidth.value >= 1024)
  const isSmallScreen = computed(() => windowWidth.value < 640) // sm breakpoint

  // Device detection
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  const isIOS = computed(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  })

  const isAndroid = computed(() => {
    return /Android/.test(navigator.userAgent)
  })

  // Viewport utilities
  const viewportHeight = computed(() => windowHeight.value)
  const viewportWidth = computed(() => windowWidth.value)

  // Safe area utilities for mobile devices
  const safeAreaTop = computed(() => {
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
      return 'env(safe-area-inset-top)'
    }
    return '0px'
  })

  const safeAreaBottom = computed(() => {
    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')) {
      return 'env(safe-area-inset-bottom)'
    }
    return '0px'
  })

  return {
    // Dimensions
    windowWidth,
    windowHeight,
    viewportHeight,
    viewportWidth,

    // Breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,

    // Device detection
    isTouchDevice,
    isIOS,
    isAndroid,

    // Safe areas
    safeAreaTop,
    safeAreaBottom,

    // Methods
    updateDimensions
  }
}

// Touch gesture composable
export function useTouchGestures() {
  const startX = ref(0)
  const startY = ref(0)
  const endX = ref(0)
  const endY = ref(0)
  const isSwipe = ref(false)

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    isSwipe.value = false
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!event.touches[0]) return
    
    const touch = event.touches[0]
    endX.value = touch.clientX
    endY.value = touch.clientY
    
    const deltaX = Math.abs(endX.value - startX.value)
    const deltaY = Math.abs(endY.value - startY.value)
    
    // Consider it a swipe if moved more than 50px
    if (deltaX > 50 || deltaY > 50) {
      isSwipe.value = true
    }
  }

  const handleTouchEnd = () => {
    if (!isSwipe.value) return

    const deltaX = endX.value - startX.value
    const deltaY = endY.value - startY.value
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        return 'swipe-right'
      } else {
        return 'swipe-left'
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        return 'swipe-down'
      } else {
        return 'swipe-up'
      }
    }
  }

  const getSwipeDirection = () => {
    return handleTouchEnd()
  }

  return {
    // State
    startX,
    startY,
    endX,
    endY,
    isSwipe,

    // Event handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getSwipeDirection
  }
}