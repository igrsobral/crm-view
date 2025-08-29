import { ref, onMounted } from 'vue'

export interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
  firstInputDelay?: number
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({
    loadTime: 0,
    domContentLoaded: 0
  })

  const measurePageLoad = () => {
    if (typeof window === 'undefined' || !window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      metrics.value.loadTime = navigation.loadEventEnd - navigation.loadEventStart
      metrics.value.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    }

    // Measure Web Vitals if available
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcp) {
          metrics.value.firstContentfulPaint = fcp.startTime
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          metrics.value.largestContentfulPaint = lastEntry.startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        metrics.value.cumulativeLayoutShift = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstInput = entries[0]
        if (firstInput) {
          metrics.value.firstInputDelay = (firstInput as any).processingStart - firstInput.startTime
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    }
  }

  const trackUserAction = (actionName: string, startTime?: number) => {
    const endTime = performance.now()
    const duration = startTime ? endTime - startTime : 0
    
    console.log(`Action: ${actionName}, Duration: ${duration.toFixed(2)}ms`)
    
    // You could send this to an analytics service
    return duration
  }

  const measureAsyncOperation = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      console.log(`Async operation: ${operationName}, Duration: ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.log(`Async operation failed: ${operationName}, Duration: ${duration.toFixed(2)}ms`)
      throw error
    }
  }

  const getResourceTimings = () => {
    if (typeof window === 'undefined' || !window.performance) return []

    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as any).transferSize || 0,
      type: (entry as any).initiatorType
    }))
  }

  const getBundleSize = () => {
    const resources = getResourceTimings()
    const jsResources = resources.filter(r => r.type === 'script' || r.name.endsWith('.js'))
    const cssResources = resources.filter(r => r.type === 'link' || r.name.endsWith('.css'))
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0)
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0)
    
    return {
      javascript: totalJSSize,
      css: totalCSSSize,
      total: totalJSSize + totalCSSSize,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length
    }
  }

  const logPerformanceReport = () => {
    console.group('Performance Report')
    console.log('Metrics:', metrics.value)
    console.log('Bundle Size:', getBundleSize())
    console.log('Resource Timings:', getResourceTimings())
    console.groupEnd()
  }

  onMounted(() => {
    setTimeout(measurePageLoad, 0)
  })

  return {
    // State
    metrics,

    // Methods
    measurePageLoad,
    trackUserAction,
    measureAsyncOperation,
    getResourceTimings,
    getBundleSize,
    logPerformanceReport
  }
}

// Debounce utility for performance optimization
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle utility for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}