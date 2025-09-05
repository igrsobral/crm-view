/* eslint-disable @typescript-eslint/no-explicit-any */
export const optimizeImage = (src: string, width?: number, height?: number, quality = 80) => {
  const url = new URL(src, window.location.origin)
  
  if (width) url.searchParams.set('w', width.toString())
  if (height) url.searchParams.set('h', height.toString())
  if (quality !== 80) url.searchParams.set('q', quality.toString())
  
  return url.toString()
}

export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback)
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  )
}

export const analyzeBundleSize = () => {
  if (typeof window === 'undefined' || !window.performance) return null

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const analysis = {
    totalSize: 0,
    javascript: { size: 0, count: 0, files: [] as string[] },
    css: { size: 0, count: 0, files: [] as string[] },
    images: { size: 0, count: 0, files: [] as string[] },
    fonts: { size: 0, count: 0, files: [] as string[] },
    other: { size: 0, count: 0, files: [] as string[] }
  }

  resources.forEach(resource => {
    const size = resource.transferSize || 0
    const name = resource.name
    
    analysis.totalSize += size

    if (name.match(/\.(js|mjs)$/)) {
      analysis.javascript.size += size
      analysis.javascript.count++
      analysis.javascript.files.push(name)
    } else if (name.match(/\.css$/)) {
      analysis.css.size += size
      analysis.css.count++
      analysis.css.files.push(name)
    } else if (name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
      analysis.images.size += size
      analysis.images.count++
      analysis.images.files.push(name)
    } else if (name.match(/\.(woff|woff2|ttf|eot)$/i)) {
      analysis.fonts.size += size
      analysis.fonts.count++
      analysis.fonts.files.push(name)
    } else {
      analysis.other.size += size
      analysis.other.count++
      analysis.other.files.push(name)
    }
  })

  return analysis
}

export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
  return null
}

export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

export const checkPerformanceBudget = () => {
  const budget = {
    maxBundleSize: 1024 * 1024, // 1MB
    maxImageSize: 500 * 1024,   // 500KB
    maxLoadTime: 3000,          // 3 seconds
    maxMemoryUsage: 50          // 50% of heap limit
  }

  const analysis = analyzeBundleSize()
  const memory = getMemoryUsage()
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  const results = {
    bundleSize: {
      current: analysis?.totalSize || 0,
      budget: budget.maxBundleSize,
      passed: (analysis?.totalSize || 0) <= budget.maxBundleSize
    },
    loadTime: {
      current: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      budget: budget.maxLoadTime,
      passed: navigation ? (navigation.loadEventEnd - navigation.loadEventStart) <= budget.maxLoadTime : true
    },
    memoryUsage: {
      current: memory?.percentage || 0,
      budget: budget.maxMemoryUsage,
      passed: (memory?.percentage || 0) <= budget.maxMemoryUsage
    }
  }

  return results
}

export const addResourceHint = (href: string, as: string, type: 'preload' | 'prefetch' = 'preload') => {
  const link = document.createElement('link')
  link.rel = type
  link.href = href
  link.as = as
  
  // Add crossorigin for fonts
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }
  
  document.head.appendChild(link)
  
  return link
}

// Critical resource preloader
export const preloadCriticalResources = () => {
  addResourceHint('/fonts/inter-var.woff2', 'font')
  
  // Preload critical images
  // addResourceHint('/images/logo.svg', 'image')
  
  // Prefetch likely next pages
  addResourceHint('/contacts', 'document', 'prefetch')
  addResourceHint('/deals', 'document', 'prefetch')
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

// Performance observer for monitoring
export const startPerformanceMonitoring = () => {
  if ('PerformanceObserver' in window) {
    // Monitor Long Tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration, 'ms')
        }
      })
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })

    // Monitor Layout Shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      if (clsValue > 0.1) {
        console.warn('High Cumulative Layout Shift:', clsValue)
      }
    })
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })

    return {
      longTaskObserver,
      layoutShiftObserver
    }
  }
  return null
}

/**
 * Performance Monitoring Utilities
 * Tracks and reports application performance metrics
 */

interface PerformanceMetrics {
  navigationTiming: Record<string, number>
  resourceTiming: Array<{
    name: string
    duration: number
    size: number
    type: string
  }>
  vitals: {
    fcp?: number // First Contentful Paint
    lcp?: number // Largest Contentful Paint
    fid?: number // First Input Delay
    cls?: number // Cumulative Layout Shift
    ttfb?: number // Time to First Byte
  }
  customMetrics: Record<string, number>
}

interface RouteMetrics {
  route: string
  loadTime: number
  renderTime: number
  timestamp: number
}

class PerformanceMonitor {
  private isEnabled: boolean
  private metrics: PerformanceMetrics
  private routeMetrics: RouteMetrics[] = []
  private observers: PerformanceObserver[] = []
  private startTime: number = performance.now()

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'
    this.metrics = {
      navigationTiming: {},
      resourceTiming: [],
      vitals: {},
      customMetrics: {}
    }

    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring() {
    // Collect navigation timing
    this.collectNavigationTiming()

    // Setup Web Vitals monitoring
    this.setupWebVitalsMonitoring()

    // Setup resource timing monitoring
    this.setupResourceTimingMonitoring()

    // Setup long task monitoring
    this.setupLongTaskMonitoring()

    // Setup memory monitoring
    this.setupMemoryMonitoring()

    // Report metrics periodically
    this.setupPeriodicReporting()
  }

  /**
   * Collect navigation timing metrics
   */
  private collectNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return

    this.metrics.navigationTiming = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connect: navigation.connectEnd - navigation.connectStart,
      ssl_handshake: navigation.connectEnd - navigation.secureConnectionStart,
      request_time: navigation.responseStart - navigation.requestStart,
      response_time: navigation.responseEnd - navigation.responseStart,
      dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      resource_loading: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
      total_load_time: navigation.loadEventEnd - navigation.fetchStart,
      ttfb: navigation.responseStart - navigation.fetchStart,
      dom_interactive: navigation.domInteractive - navigation.fetchStart,
      dom_complete: navigation.domComplete - navigation.fetchStart
    }

    this.metrics.vitals.ttfb = this.metrics.navigationTiming.ttfb
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitalsMonitoring() {
    // First Contentful Paint
    this.observePerformanceEntry('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.vitals.fcp = entry.startTime
      }
    })

    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.metrics.vitals.lcp = entry.startTime
    })

    // First Input Delay
    this.observePerformanceEntry('first-input', (entry) => {
      this.metrics.vitals.fid = (entry as any).processingStart - entry.startTime
    })

    // Cumulative Layout Shift
    let clsValue = 0
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value
        this.metrics.vitals.cls = clsValue
      }
    })
  }

  /**
   * Setup resource timing monitoring
   */
  private setupResourceTimingMonitoring() {
    this.observePerformanceEntry('resource', (entry) => {
      const resource = entry as PerformanceResourceTiming
      
      this.metrics.resourceTiming.push({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: this.getResourceType(resource.name)
      })
    })
  }

  /**
   * Setup long task monitoring
   */
  private setupLongTaskMonitoring() {
    this.observePerformanceEntry('longtask', (entry) => {
      this.reportLongTask({
        duration: entry.duration,
        startTime: entry.startTime,
        attribution: (entry as any).attribution || []
      })
    })
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.customMetrics.memory_used = memory.usedJSHeapSize
        this.metrics.customMetrics.memory_total = memory.totalJSHeapSize
        this.metrics.customMetrics.memory_limit = memory.jsHeapSizeLimit
      }, 30000) // Every 30 seconds
    }
  }

  /**
   * Setup periodic reporting
   */
  private setupPeriodicReporting() {
    // Report metrics every 5 minutes
    setInterval(() => {
      this.reportMetrics()
    }, 300000)

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics()
    })
  }

  /**
   * Observe performance entries
   */
  private observePerformanceEntry(type: string, callback: (entry: PerformanceEntry) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback)
      })
      observer.observe({ entryTypes: [type] })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`[PerformanceMonitor] Failed to observe ${type}:`, error)
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image'
    if (url.match(/\\.(woff|woff2|ttf|eot)$/)) return 'font'
    if (url.includes('api/') || url.includes('supabase')) return 'api'
    return 'other'
  }

  /**
   * Mark custom performance metrics
   */
  mark(name: string) {
    if (!this.isEnabled) return
    
    performance.mark(name)
    this.metrics.customMetrics[`mark_${name}`] = performance.now() - this.startTime
  }

  /**
   * Measure time between marks
   */
  measure(name: string, startMark: string, endMark?: string) {
    if (!this.isEnabled) return

    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name, 'measure')[0]
      this.metrics.customMetrics[`measure_${name}`] = measure.duration
    } catch (error) {
      console.warn(`[PerformanceMonitor] Failed to measure ${name}:`, error)
    }
  }

  /**
   * Track route navigation performance
   */
  trackRouteNavigation(route: string, startTime: number) {
    if (!this.isEnabled) return

    const loadTime = performance.now() - startTime
    
    this.routeMetrics.push({
      route,
      loadTime,
      renderTime: 0, // Will be updated by trackRouteRender
      timestamp: Date.now()
    })

    // Keep only last 50 route metrics
    if (this.routeMetrics.length > 50) {
      this.routeMetrics.shift()
    }
  }

  /**
   * Track route render performance
   */
  trackRouteRender(route: string, renderTime: number) {
    if (!this.isEnabled) return

    const lastMetric = this.routeMetrics[this.routeMetrics.length - 1]
    if (lastMetric && lastMetric.route === route) {
      lastMetric.renderTime = renderTime
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, method: string, duration: number, success: boolean) {
    if (!this.isEnabled) return

    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    this.metrics.customMetrics[metricName] = duration
    this.metrics.customMetrics[`${metricName}_success`] = success ? 1 : 0
  }

  /**
   * Track database operation performance
   */
  trackDbOperation(operation: string, table: string, duration: number) {
    if (!this.isEnabled) return

    const metricName = `db_${operation}_${table}`
    this.metrics.customMetrics[metricName] = duration
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return

    const metricName = `component_${componentName.toLowerCase()}_render`
    this.metrics.customMetrics[metricName] = renderTime
  }

  /**
   * Report long task
   */
  private reportLongTask(task: { duration: number; startTime: number; attribution: any[] }) {
    // Report tasks longer than 50ms
    if (task.duration > 50) {
      this.reportMetric('long_task', {
        duration: task.duration,
        start_time: task.startTime,
        attribution: task.attribution.map(attr => attr.name || 'unknown')
      })
    }
  }

  /**
   * Get performance budget status
   */
  getPerformanceBudget() {
    const budget = {
      fcp: { budget: 1500, actual: this.metrics.vitals.fcp || 0 },
      lcp: { budget: 2500, actual: this.metrics.vitals.lcp || 0 },
      fid: { budget: 100, actual: this.metrics.vitals.fid || 0 },
      cls: { budget: 0.1, actual: this.metrics.vitals.cls || 0 },
      ttfb: { budget: 600, actual: this.metrics.vitals.ttfb || 0 }
    }

    const status = {
      passing: 0,
      failing: 0,
      details: {} as Record<string, { passing: boolean; score: number }>
    }

    Object.entries(budget).forEach(([metric, { budget: budgetValue, actual }]) => {
      const passing = actual <= budgetValue
      const score = Math.max(0, Math.min(100, (budgetValue - actual) / budgetValue * 100))
      
      status.details[metric] = { passing, score }
      if (passing) {
        status.passing++
      } else {
        status.failing++
      }
    })

    return status
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Get route metrics
   */
  getRouteMetrics(): RouteMetrics[] {
    return [...this.routeMetrics]
  }

  /**
   * Report metrics to analytics
   */
  private async reportMetrics() {
    if (!this.isEnabled) return

    const report = {
      ...this.metrics,
      routeMetrics: this.routeMetrics,
      performanceBudget: this.getPerformanceBudget(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo()
    }

    // Send to analytics service
    this.reportMetric('performance_report', report)
  }

  /**
   * Get connection information
   */
  private getConnectionInfo() {
    const connection = (navigator as any).connection
    if (!connection) return null

    return {
      effective_type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      save_data: connection.saveData
    }
  }

  /**
   * Report individual metric
   */
  private async reportMetric(name: string, data: any) {
    // Send to analytics endpoint
    const endpoint = import.meta.env.VITE_PERFORMANCE_ENDPOINT
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            metric: name,
            data,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[PerformanceMonitor] Failed to report metric:', error)
        }
      }
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[PerformanceMonitor]', name, data)
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.reportMetrics()
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Export convenience functions
export const markPerformance = (name: string) => {
  performanceMonitor.mark(name)
}

export const measurePerformance = (name: string, startMark: string, endMark?: string) => {
  performanceMonitor.measure(name, startMark, endMark)
}

export const trackRouteNavigation = (route: string, startTime: number) => {
  performanceMonitor.trackRouteNavigation(route, startTime)
}

export const trackRouteRender = (route: string, renderTime: number) => {
  performanceMonitor.trackRouteRender(route, renderTime)
}

export const trackApiCall = (endpoint: string, method: string, duration: number, success: boolean) => {
  performanceMonitor.trackApiCall(endpoint, method, duration, success)
}

export const trackComponentRender = (componentName: string, renderTime: number) => {
  performanceMonitor.trackComponentRender(componentName, renderTime)
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup()
  })
}

export default performanceMonitor