/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Error Tracking and Reporting Utilities
 * Provides centralized error handling with integration to monitoring services
 */

import type { SeverityLevel } from '@sentry/browser'

interface ErrorContext {
  userId?: string
  sessionId?: string
  route?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

interface ErrorReport {
  error: Error
  context: ErrorContext
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  fingerprint?: string
}

class ErrorTracker {
  private isEnabled: boolean
  private userId: string | null = null
  private sessionId: string
  private errorQueue: ErrorReport[] = []
  private maxQueueSize = 50

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true'
    this.sessionId = this.generateSessionId()
    
    if (this.isEnabled) {
      this.initializeErrorTracking()
    }
  }

  /**
   * Initialize error tracking services
   */
  private initializeErrorTracking() {
    // Initialize Sentry if configured
    if (import.meta.env.VITE_SENTRY_DSN) {
      this.initializeSentry()
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers()

    // Set up unhandled promise rejection handler
    this.setupUnhandledRejectionHandler()
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry() {
    try {
      const { init, setTag, setContext } = await import('@sentry/browser')
      
      init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.NODE_ENV || 'development',
        release: import.meta.env.VITE_APP_VERSION || '1.0.0',
        integrations: [
          // Add browser integrations
        ],
        tracesSampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend: (event) => {
          // Filter out non-critical errors in production
          if (import.meta.env.NODE_ENV === 'production') {
            if (event.exception?.values?.[0]?.value?.includes('Non-Error')) {
              return null
            }
          }
          return event
        }
      })

      setTag('component', 'crm-mvp')
      setContext('app', {
        version: import.meta.env.VITE_APP_VERSION,
        build_time: import.meta.env.VITE_BUILD_TIME
      })
    } catch (error) {
      console.warn('[ErrorTracker] Failed to initialize Sentry:', error)
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        component: 'global',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
  }

  /**
   * Set up unhandled promise rejection handler
   */
  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      this.captureError(error, {
        component: 'promise',
        metadata: {
          type: 'unhandled_rejection'
        }
      })
    })
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    const message = error.message || 'Unknown error'
    const component = context.component || 'unknown'
    const action = context.action || 'unknown'
    
    // Simple fingerprint based on error message and context
    return btoa(`${message}-${component}-${action}`).replace(/[^a-zA-Z0-9]/g, '')
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): ErrorReport['severity'] {
    // Critical errors
    if (error.name === 'ChunkLoadError' || 
        error.message.includes('Loading chunk') ||
        error.message.includes('Network Error')) {
      return 'critical'
    }

    // High severity errors
    if (context.component === 'auth' || 
        context.component === 'payment' ||
        error.message.includes('Supabase')) {
      return 'high'
    }

    // Medium severity errors
    if (context.component === 'api' || 
        error.name === 'ValidationError') {
      return 'medium'
    }

    // Default to low severity
    return 'low'
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string) {
    this.userId = userId

    // Set user context in Sentry
    if (import.meta.env.VITE_SENTRY_DSN) {
      import('@sentry/browser').then(({ setUser }) => {
        setUser({
          id: userId,
          email: email
        })
      })
    }
  }

  /**
   * Capture and report errors
   */
  captureError(error: Error, context: ErrorContext = {}) {
    if (!this.isEnabled) {
      // Always log errors in development
      if (import.meta.env.DEV) {
        console.error('[ErrorTracker]', error, context)
      }
      return
    }

    const errorReport: ErrorReport = {
      error,
      context: {
        userId: context.userId || this.userId || undefined,
        sessionId: context.sessionId || this.sessionId,
        route: context.route || window.location.pathname,
        ...context
      },
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(error, context),
      fingerprint: this.generateFingerprint(error, context)
    }

    // Add to error queue
    this.addToQueue(errorReport)

    // Send to Sentry
    this.sendToSentry(errorReport)

    // Send to custom error endpoint
    this.sendToCustomEndpoint(errorReport)

    // Log in development
    if (import.meta.env.DEV) {
      console.error('[ErrorTracker]', errorReport)
    }
  }

  /**
   * Add error to local queue for batch processing
   */
  private addToQueue(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport)
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('crm_error_queue', JSON.stringify(this.errorQueue))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Send error to Sentry
   */
  private async sendToSentry(errorReport: ErrorReport) {
    if (!import.meta.env.VITE_SENTRY_DSN) return

    try {
      const { captureException, withScope } = await import('@sentry/browser')
      
      withScope((scope) => {
        scope.setLevel(this.mapSeverityToSentryLevel(errorReport.severity))
        if (errorReport.context.component) {
          scope.setTag('component', errorReport.context.component as string)
        }
        if (errorReport.context.action) {
          scope.setTag('action', errorReport.context.action as string)
        }
        scope.setContext('error_context', errorReport.context as Record<string, unknown>)
        if (errorReport.fingerprint) {
          scope.setFingerprint([errorReport.fingerprint])
        }
        
        captureException(errorReport.error)
      })
    } catch (error) {
      console.warn('[ErrorTracker] Failed to send to Sentry:', error)
    }
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorReport['severity']): SeverityLevel {
    switch (severity) {
      case 'critical': return 'fatal'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'error'
    }
  }

  /**
   * Send error to custom endpoint
   */
  private async sendToCustomEndpoint(errorReport: ErrorReport) {
    const endpoint = import.meta.env.VITE_ERROR_ENDPOINT
    if (!endpoint) return

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...errorReport,
          error: {
            name: errorReport.error.name,
            message: errorReport.error.message,
            stack: errorReport.error.stack
          }
        })
      })
    } catch (error) {
      // Silently fail for custom endpoint
      if (import.meta.env.DEV) {
        console.warn('[ErrorTracker] Failed to send to custom endpoint:', error)
      }
    }
  }

  /**
   * Capture API errors
   */
  captureApiError(error: Error, endpoint: string, method: string, statusCode?: number) {
    this.captureError(error, {
      component: 'api',
      action: `${method.toUpperCase()} ${endpoint}`,
      metadata: {
        endpoint,
        method,
        status_code: statusCode
      }
    })
  }

  /**
   * Capture database errors
   */
  captureDbError(error: Error, operation: string, table?: string) {
    this.captureError(error, {
      component: 'database',
      action: operation,
      metadata: {
        table,
        operation
      }
    })
  }

  /**
   * Capture authentication errors
   */
  captureAuthError(error: Error, action: string) {
    this.captureError(error, {
      component: 'auth',
      action,
      metadata: {
        auth_action: action
      }
    })
  }

  /**
   * Capture UI errors
   */
  captureUIError(error: Error, component: string, props?: Record<string, unknown>) {
    this.captureError(error, {
      component: 'ui',
      action: `render_${component}`,
      metadata: {
        ui_component: component,
        props
      }
    })
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      by_component: {} as Record<string, number>,
      recent: this.errorQueue.slice(-10)
    }

    this.errorQueue.forEach(error => {
      stats.by_severity[error.severity]++
      
      const component = error.context.component || 'unknown'
      stats.by_component[component] = (stats.by_component[component] || 0) + 1
    })

    return stats
  }

  /**
   * Clear error queue
   */
  clearErrors() {
    this.errorQueue = []
    try {
      localStorage.removeItem('crm_error_queue')
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Load persisted errors from localStorage
   */
  loadPersistedErrors() {
    try {
      const stored = localStorage.getItem('crm_error_queue')
      if (stored) {
        this.errorQueue = JSON.parse(stored)
      }
    } catch (_e) {
      // Ignore localStorage errors
    }
  }
}

// Create global error tracker instance
export const errorTracker = new ErrorTracker()

// Load any persisted errors
errorTracker.loadPersistedErrors()

// Export convenience functions
export const captureError = (error: Error, context?: ErrorContext) => {
  errorTracker.captureError(error, context)
}

export const captureApiError = (error: Error, endpoint: string, method: string, statusCode?: number) => {
  errorTracker.captureApiError(error, endpoint, method, statusCode)
}

export const captureDbError = (error: Error, operation: string, table?: string) => {
  errorTracker.captureDbError(error, operation, table)
}

export const captureAuthError = (error: Error, action: string) => {
  errorTracker.captureAuthError(error, action)
}

export const captureUIError = (error: Error, component: string, props?: Record<string, unknown>) => {
  errorTracker.captureUIError(error, component, props)
}

export default errorTracker