import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia } from '@/test/utils'
import { useAuthStore } from '../auth'
import { UserFactory, SessionFactory } from '@/test/factories'
import type { AuthError } from '@supabase/supabase-js'

vi.mock('@/services/authService', () => ({
  AuthService: {
    getSession: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn()
  }
}))

vi.mock('@/utils/authManager', () => ({
  AuthManager: {
    isSessionExpired: vi.fn(),
    needsRefresh: vi.fn(),
    refreshSession: vi.fn()
  }
}))

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    createTestPinia()
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should compute isAuthenticated correctly', async () => {
      const { AuthManager } = await import('@/utils/authManager')
      const mockSession = SessionFactory.build()
      const mockUser = UserFactory.build()

      vi.mocked(AuthManager.isSessionExpired).mockReturnValue(false)

      authStore.user = mockUser
      authStore.session = mockSession

      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should compute isAuthenticated as false when session is expired', async () => {
      const { AuthManager } = await import('@/utils/authManager')
      const mockSession = SessionFactory.build()
      const mockUser = UserFactory.build()

      vi.mocked(AuthManager.isSessionExpired).mockReturnValue(true)

      authStore.user = mockUser
      authStore.session = mockSession

      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockUser = UserFactory.build()
      const mockSession = SessionFactory.build()

      vi.mocked(AuthService.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authStore.signUp('test@example.com', 'password123')

      expect(AuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result.error).toBeNull()
      expect(result.data).toEqual({ user: mockUser, session: mockSession })
      expect(authStore.loading).toBe(false)
    })

    it('should handle sign up error', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Invalid email',
        status: 400
      }

      vi.mocked(AuthService.signUp).mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await authStore.signUp('invalid-email', 'password123')

      expect(result.error).toEqual(mockError)
      expect(authStore.error).toBe('Invalid email')
      expect(authStore.loading).toBe(false)
    })
  })

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockUser = UserFactory.build()
      const mockSession = SessionFactory.build()

      vi.mocked(AuthService.signIn).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authStore.signIn('test@example.com', 'password123')

      expect(AuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result.error).toBeNull()
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.session).toEqual(mockSession)
      expect(authStore.loading).toBe(false)
    })

    it('should handle sign in error', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Invalid credentials',
        status: 401
      }

      vi.mocked(AuthService.signIn).mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await authStore.signIn('test@example.com', 'wrongpassword')

      expect(result.error).toEqual(mockError)
      expect(authStore.error).toBe('Invalid credentials')
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
      expect(authStore.loading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockUser = UserFactory.build()
      const mockSession = SessionFactory.build()

      authStore.user = mockUser
      authStore.session = mockSession

      vi.mocked(AuthService.signOut).mockResolvedValue({ error: null })

      const result = await authStore.signOut()

      expect(AuthService.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
      expect(authStore.loading).toBe(false)
    })

    it('should handle sign out error', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Sign out failed',
        status: 500
      }

      vi.mocked(AuthService.signOut).mockResolvedValue({ error: mockError })

      const result = await authStore.signOut()

      expect(result.error).toEqual(mockError)
      expect(authStore.error).toBe('Sign out failed')
      expect(authStore.loading).toBe(false)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const { AuthService } = await import('@/services/authService')

      vi.mocked(AuthService.resetPassword).mockResolvedValue({ error: null })

      const result = await authStore.resetPassword('test@example.com')

      expect(AuthService.resetPassword).toHaveBeenCalledWith('test@example.com')
      expect(result.error).toBeNull()
      expect(authStore.loading).toBe(false)
    })

    it('should handle reset password error', async () => {
      const { AuthService } = await import('@/services/authService')
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Email not found',
        status: 404
      }

      vi.mocked(AuthService.resetPassword).mockResolvedValue({ error: mockError })

      const result = await authStore.resetPassword('nonexistent@example.com')

      expect(result.error).toEqual(mockError)
      expect(authStore.error).toBe('Email not found')
      expect(authStore.loading).toBe(false)
    })
  })

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const { AuthManager } = await import('@/utils/authManager')
      const mockUser = UserFactory.build()
      const mockSession = SessionFactory.build()

      vi.mocked(AuthManager.refreshSession).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authStore.refreshSession()

      expect(AuthManager.refreshSession).toHaveBeenCalled()
      expect(result.error).toBeNull()
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.session).toEqual(mockSession)
    })

    it('should handle refresh session error', async () => {
      const { AuthManager } = await import('@/utils/authManager')
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Refresh failed',
        status: 401
      }

      vi.mocked(AuthManager.refreshSession).mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await authStore.refreshSession()

      expect(result.error).toEqual(mockError)
      expect(authStore.error).toBe('Refresh failed')
    })
  })
})