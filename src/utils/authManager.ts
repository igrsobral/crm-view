import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

/**
 * Authentication manager for handling session persistence and automatic token refresh
 */
export class AuthManager {
  private static refreshTimer: NodeJS.Timeout | null = null
  private static readonly REFRESH_BUFFER = 60 * 1000 // Refresh 1 minute before expiry

  /**
   * Initialize the auth manager with automatic token refresh
   */
  static initialize() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.scheduleTokenRefresh(session)
      } else if (event === 'SIGNED_OUT') {
        this.clearRefreshTimer()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.scheduleTokenRefresh(session)
      }
    })

    // Check for existing session on initialization
    this.checkExistingSession()
  }

  /**
   * Check for existing session and schedule refresh if needed
   */
  private static async checkExistingSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.scheduleTokenRefresh(session)
      }
    } catch (error) {
      console.error('Error checking existing session:', error)
    }
  }

  /**
   * Schedule automatic token refresh before expiry
   */
  private static scheduleTokenRefresh(session: Session) {
    this.clearRefreshTimer()

    if (!session.expires_at) return

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeUntilRefresh = expiresAt - now - this.REFRESH_BUFFER

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await supabase.auth.refreshSession()
        } catch (error) {
          console.error('Error refreshing session:', error)
        }
      }, timeUntilRefresh)
    } else {
      // Token is already expired or about to expire, refresh immediately
      supabase.auth.refreshSession().catch(error => {
        console.error('Error refreshing expired session:', error)
      })
    }
  }

  /**
   * Clear the refresh timer
   */
  private static clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Check if session is expired or about to expire
   */
  static isSessionExpired(session: Session | null): boolean {
    if (!session || !session.expires_at) return true
    
    const expiresAt = session.expires_at * 1000
    const now = Date.now()
    
    return expiresAt <= now
  }

  /**
   * Check if session needs refresh (within buffer time)
   */
  static needsRefresh(session: Session | null): boolean {
    if (!session || !session.expires_at) return false
    
    const expiresAt = session.expires_at * 1000
    const now = Date.now()
    
    return (expiresAt - now) <= this.REFRESH_BUFFER
  }

  /**
   * Manually refresh session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Clean up resources
   */
  static cleanup() {
    this.clearRefreshTimer()
  }
}