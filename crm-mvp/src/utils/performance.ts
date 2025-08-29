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