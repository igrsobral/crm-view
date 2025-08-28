import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

/**
 * Session monitor for handling automatic session expiration
 */
export class SessionMonitor {
  private static instance: SessionMonitor | null = null
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 60 * 1000 // Check every minute
  private router: any = null

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
  initialize(router: any) {
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
        console.log('Session refresh failed, signing out user')
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
      } else {
        console.log('Session refreshed proactively')
      }
    }
  }

  /**
   * Handle session expiration
   */
  private async handleSessionExpiration() {
    const authStore = useAuthStore()
    
    // Sign out the user
    await authStore.signOut()
    
    // Redirect to login with session expired message
    if (this.router) {
      const currentPath = this.router.currentRoute.value.fullPath
      
      await this.router.push({
        path: '/login',
        query: {
          expired: 'true',
          redirect: currentPath !== '/dashboard' ? currentPath : undefined
        }
      })
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