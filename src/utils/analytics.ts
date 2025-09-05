/**
 * Analytics and Tracking Utilities
 * Provides centralized analytics tracking with privacy compliance
 */

interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  userId?: string
}

interface UserProperties {
  userId: string
  email?: string
  signupDate?: string
  plan?: string
  [key: string]: unknown
}

class Analytics {
  private isEnabled: boolean
  private userId: string | null = null
  private sessionId: string
  private startTime: number

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    
    if (this.isEnabled) {
      this.initializeAnalytics()
    }
  }

  /**
   * Initialize analytics providers
   */
  private initializeAnalytics() {
    // Google Analytics 4
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      this.initializeGA4()
    }

    // Custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      this.initializeCustomAnalytics()
    }

    // Track initial page view
    this.trackPageView(window.location.pathname)
  }

  /**
   * Initialize Google Analytics 4
   */
  private initializeGA4() {
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID
    if (!gaId) return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', gaId, {
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true,
      allow_ad_personalization_signals: false
    })

    // Make gtag available globally
    window.gtag = gtag
  }

  /**
   * Initialize custom analytics
   */
  private initializeCustomAnalytics() {
    // Send initial session data
    this.sendCustomEvent('session_start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    })
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set user identity for tracking
   */
  setUser(properties: UserProperties) {
    if (!this.isEnabled) return

    this.userId = properties.userId

    // Set user properties in GA4
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        user_id: properties.userId
      })
      
      window.gtag('set', 'user_properties', {
        signup_date: properties.signupDate,
        plan: properties.plan
      })
    }

    // Send user properties to custom analytics
    this.sendCustomEvent('user_identify', properties)
  }

  /**
   * Track custom events
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return

    const eventData = {
      ...event,
      userId: event.userId || this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    }

    // Send to GA4
    if (window.gtag) {
      window.gtag('event', event.name, {
        ...event.properties,
        user_id: eventData.userId
      })
    }

    // Send to custom analytics
    this.sendCustomEvent(event.name, eventData)

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventData)
    }
  }

  /**
   * Track page views
   */
  trackPageView(path: string, title?: string) {
    if (!this.isEnabled) return

    const pageData = {
      page_path: path,
      page_title: title || document.title,
      user_id: this.userId,
      session_id: this.sessionId
    }

    // Send to GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', pageData)
    }

    // Send to custom analytics
    this.sendCustomEvent('page_view', pageData)
  }

  /**
   * Track CRM-specific events
   */
  trackContactEvent(action: string, contactId?: string, properties?: Record<string, unknown>) {
    this.trackEvent({
      name: `contact_${action}`,
      properties: {
        contact_id: contactId,
        ...properties
      }
    })
  }

  trackDealEvent(action: string, dealId?: string, properties?: Record<string, unknown>) {
    this.trackEvent({
      name: `deal_${action}`,
      properties: {
        deal_id: dealId,
        ...properties
      }
    })
  }

  trackActivityEvent(action: string, activityId?: string, properties?: Record<string, unknown>) {
    this.trackEvent({
      name: `activity_${action}`,
      properties: {
        activity_id: activityId,
        ...properties
      }
    })
  }

  /**
   * Track user engagement
   */
  trackEngagement() {
    const engagementTime = Date.now() - this.startTime
    
    this.trackEvent({
      name: 'user_engagement',
      properties: {
        engagement_time_msec: engagementTime,
        session_id: this.sessionId
      }
    })
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, unknown>) {
    this.trackEvent({
      name: 'exception',
      properties: {
        description: error.message,
        stack: error.stack,
        fatal: false,
        ...context
      }
    })
  }

  /**
   * Track performance metrics
   */
  trackPerformance() {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return

    const metrics = {
      dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
      connect_time: navigation.connectEnd - navigation.connectStart,
      response_time: navigation.responseEnd - navigation.requestStart,
      dom_load_time: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      load_time: navigation.loadEventEnd - navigation.fetchStart
    }

    this.trackEvent({
      name: 'performance_metrics',
      properties: metrics
    })
  }

  /**
   * Send events to custom analytics endpoint
   */
  private async sendCustomEvent(eventName: string, data: unknown) {
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT
    if (!endpoint) return

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Analytics] Failed to send custom event:', error)
      }
    }
  }

  /**
   * Clean up and send final events
   */
  cleanup() {
    if (!this.isEnabled) return

    this.trackEngagement()
    
    // Send session end event
    this.sendCustomEvent('session_end', {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime
    })
  }
}

// Create global analytics instance
export const analytics = new Analytics()

// Track page views on route changes
export const trackPageView = (path: string, title?: string) => {
  analytics.trackPageView(path, title)
}

// CRM-specific tracking helpers
export const trackContact = {
  create: (contactId: string, properties?: Record<string, unknown>) => 
    analytics.trackContactEvent('create', contactId, properties),
  update: (contactId: string, properties?: Record<string, unknown>) => 
    analytics.trackContactEvent('update', contactId, properties),
  delete: (contactId: string) => 
    analytics.trackContactEvent('delete', contactId),
  view: (contactId: string) => 
    analytics.trackContactEvent('view', contactId),
  search: (query: string, resultsCount: number) => 
    analytics.trackContactEvent('search', undefined, { query, results_count: resultsCount })
}

export const trackDeal = {
  create: (dealId: string, properties?: Record<string, unknown>) => 
    analytics.trackDealEvent('create', dealId, properties),
  update: (dealId: string, properties?: Record<string, unknown>) => 
    analytics.trackDealEvent('update', dealId, properties),
  delete: (dealId: string) => 
    analytics.trackDealEvent('delete', dealId),
  stageChange: (dealId: string, fromStage: string, toStage: string, value?: number) => 
    analytics.trackDealEvent('stage_change', dealId, { from_stage: fromStage, to_stage: toStage, value }),
  close: (dealId: string, won: boolean, value?: number) => 
    analytics.trackDealEvent('close', dealId, { won, value })
}

export const trackActivity = {
  create: (activityId: string, type: string) => 
    analytics.trackActivityEvent('create', activityId, { type }),
  complete: (activityId: string, type: string) => 
    analytics.trackActivityEvent('complete', activityId, { type }),
  overdue: (activityId: string, daysPastDue: number) => 
    analytics.trackActivityEvent('overdue', activityId, { days_past_due: daysPastDue })
}

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.cleanup()
  })

  // Track performance metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      analytics.trackPerformance()
    }, 1000)
  })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export default analytics
