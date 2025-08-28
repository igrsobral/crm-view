import { useAuthStore } from '@/stores/auth'
import type { Router } from 'vue-router'

/**
 * Session monitor for handling automatic session expiration
 */
export class SessionMonitor {
  private static instance: SessionMonitor | null = null
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 60 * 1000 // Check every minute
  private router: Router | null = null

  private constructor() {}

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor()
    }
    return SessionMonitor.instance
  }

  /**
   * Initialize the session monitor
   */
  initialize(router: Router) {
    this.router = router
    this.startMonitoring()
  }

  /**
   * Start monitoring session expiration
   */
  private startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(() => {
      this.checkSession()
    }, this.CHECK_INTERVAL)
  }

  /**
   * Check current session status
   */
  private async checkSession() {
    try {
      const authStore = useAuthStore()

      // Only check if user is authenticated
      if (!authStore.isAuthenticated) {
        return
      }

      // Check if session is expired
      if (authStore.isSessionExpired) {
        console.log('Session expired, attempting refresh...')
        
        const { error } = await authStore.refreshSession()
        
        if (error) {
          console.log('Session refresh failed, signing out user:', error.message)
          await this.handleSessionExpiration()
        } else {
          console.log('Session refreshed successfully')
        }
      }
      // Check if session needs refresh soon
      else if (authStore.needsRefresh) {
        console.log('Session needs refresh, refreshing proactively...')
        
        const { error } = await authStore.refreshSession()
        
        if (error) {
          console.warn('Proactive session refresh failed:', error.message)
          // Don't sign out for proactive refresh failures
          // Let the next check handle it if the session actually expires
        } else {
          console.log('Session refreshed proactively')
        }
      }
    } catch (error) {
      console.error('Error during session check:', error)
      // Don't handle as session expiration for network errors
      // The user might just be offline temporarily
    }
  }

  /**
   * Handle session expiration
   */
  private async handleSessionExpiration() {
    try {
      const authStore = useAuthStore()
      
      // Sign out the user
      await authStore.signOut()
      
      // Redirect to login with session expired message
      if (this.router) {
        const currentPath = this.router.currentRoute.value.fullPath
        
        // Don't redirect if already on auth pages
        if (currentPath.startsWith('/login') || currentPath.startsWith('/register') || currentPath.startsWith('/auth/')) {
          return
        }
        
        await this.router.push({
          path: '/login',
          query: {
            expired: 'true',
            redirect: currentPath !== '/dashboard' && currentPath !== '/' ? currentPath : undefined
          }
        })
      }
    } catch (error) {
      console.error('Error handling session expiration:', error)
      // Force reload as fallback
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true'
      }
    }
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Manually trigger session check
   */
  async checkNow() {
    await this.checkSession()
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop()
    SessionMonitor.instance = null
  }
}