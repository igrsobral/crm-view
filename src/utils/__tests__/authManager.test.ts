import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthManager } from '../authManager'
import { SessionFactory } from '@/test/factories'

// Mock the supabase module
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(),
      refreshSession: vi.fn()
    }
  }
}))

describe('AuthManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    AuthManager.cleanup()
  })

  describe('isSessionExpired', () => {
    it('should return true for null session', () => {
      expect(AuthManager.isSessionExpired(null)).toBe(true)
    })

    it('should return true for session without expires_at', () => {
      const session = SessionFactory.build({ expires_at: undefined })
      expect(AuthManager.isSessionExpired(session)).toBe(true)
    })

    it('should return true for expired session', () => {
      const expiredTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const session = SessionFactory.build({ expires_at: expiredTime })
      expect(AuthManager.isSessionExpired(session)).toBe(true)
    })

    it('should return false for valid session', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const session = SessionFactory.build({ expires_at: futureTime })
      expect(AuthManager.isSessionExpired(session)).toBe(false)
    })

    it('should return true for session expiring right now', () => {
      const nowTime = Math.floor(Date.now() / 1000)
      const session = SessionFactory.build({ expires_at: nowTime })
      expect(AuthManager.isSessionExpired(session)).toBe(true)
    })
  })

  describe('needsRefresh', () => {
    it('should return false for null session', () => {
      expect(AuthManager.needsRefresh(null)).toBe(false)
    })

    it('should return false for session without expires_at', () => {
      const session = SessionFactory.build({ expires_at: undefined })
      expect(AuthManager.needsRefresh(session)).toBe(false)
    })

    it('should return true for session expiring within buffer time', () => {
      const soonTime = Math.floor(Date.now() / 1000) + 30 // 30 seconds from now
      const session = SessionFactory.build({ expires_at: soonTime })
      expect(AuthManager.needsRefresh(session)).toBe(true)
    })

    it('should return false for session with plenty of time left', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const session = SessionFactory.build({ expires_at: futureTime })
      expect(AuthManager.needsRefresh(session)).toBe(false)
    })

    it('should return true for expired session', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const session = SessionFactory.build({ expires_at: pastTime })
      expect(AuthManager.needsRefresh(session)).toBe(true)
    })
  })

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const { supabase } = await import('../supabase')
      const newSession = SessionFactory.build()

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: newSession, user: newSession.user },
        error: null
      })

      const result = await AuthManager.refreshSession()

      expect(supabase.auth.refreshSession).toHaveBeenCalled()
      expect(result.data).toEqual({ session: newSession, user: newSession.user })
      expect(result.error).toBeNull()
    })

    it('should handle refresh session error', async () => {
      const { supabase } = await import('../supabase')
      const mockError = new Error('Refresh failed')

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError
      })

      const result = await AuthManager.refreshSession()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('initialize', () => {
    it('should set up auth state change listener', async () => {
      const { supabase } = await import('../supabase')
      const mockSession = SessionFactory.build()

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockOnAuthStateChange = vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }))
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange)

      AuthManager.initialize()

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should handle existing session on initialization', async () => {
      const { supabase } = await import('../supabase')
      const mockSession = SessionFactory.build({
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      })

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      AuthManager.initialize()

      // Wait for async initialization
      await vi.runAllTimersAsync()

      expect(supabase.auth.getSession).toHaveBeenCalled()
    })

    it('should handle session initialization error', async () => {
      const { supabase } = await import('../supabase')
      const mockError = new Error('Session fetch failed')

      vi.mocked(supabase.auth.getSession).mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      AuthManager.initialize()

      // Wait for async initialization
      await vi.runAllTimersAsync()

      expect(consoleSpy).toHaveBeenCalledWith('Error checking existing session:', mockError)
      consoleSpy.mockRestore()
    })
  })

  describe('token refresh scheduling', () => {
    it('should schedule token refresh for valid session', async () => {
      const { supabase } = await import('../supabase')
      const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const mockSession = SessionFactory.build({ expires_at: futureTime })

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockRefreshSession = vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null
      })

      AuthManager.initialize()

      // Fast-forward to just before refresh time
      const refreshTime = (futureTime * 1000) - Date.now() - 60000 // 1 minute before expiry
      vi.advanceTimersByTime(refreshTime)

      await vi.runAllTimersAsync()

      expect(mockRefreshSession).toHaveBeenCalled()
    })

    it('should refresh immediately for expired session', async () => {
      const { supabase } = await import('../supabase')
      const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const mockSession = SessionFactory.build({ expires_at: pastTime })

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockRefreshSession = vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null
      })

      AuthManager.initialize()

      await vi.runAllTimersAsync()

      expect(mockRefreshSession).toHaveBeenCalled()
    })

    it('should handle refresh error gracefully', async () => {
      const { supabase } = await import('../supabase')
      const futureTime = Math.floor(Date.now() / 1000) + 3600
      const mockSession = SessionFactory.build({ expires_at: futureTime })

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockError = new Error('Refresh failed')
      vi.mocked(supabase.auth.refreshSession).mockRejectedValue(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      AuthManager.initialize()

      // Fast-forward to refresh time
      const refreshTime = (futureTime * 1000) - Date.now() - 60000
      vi.advanceTimersByTime(refreshTime)

      await vi.runAllTimersAsync()

      expect(consoleSpy).toHaveBeenCalledWith('Error refreshing expired session:', mockError)
      consoleSpy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('should clear refresh timer on cleanup', async () => {
      const { supabase } = await import('../supabase')
      const futureTime = Math.floor(Date.now() / 1000) + 3600
      const mockSession = SessionFactory.build({ expires_at: futureTime })

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      AuthManager.initialize()
      AuthManager.cleanup()

      // Advance time to when refresh should have happened
      const refreshTime = (futureTime * 1000) - Date.now() - 60000
      vi.advanceTimersByTime(refreshTime)

      // Refresh should not be called after cleanup
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled()
    })
  })
})