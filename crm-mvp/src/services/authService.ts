import { supabase } from '@/utils/supabase'
import type { AuthError, User, Session } from '@supabase/supabase-js'

export interface AuthResponse<T = any> {
  data: T | null
  error: AuthError | null
}

export interface SignUpData {
  user: User | null
  session: Session | null
}

export interface SignInData {
  user: User
  session: Session
}

/**
 * Authentication service wrapper for Supabase Auth
 * Provides a clean interface for all authentication operations
 */
export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string): Promise<AuthResponse<SignUpData>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          user: data.user,
          session: data.session
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse<SignInData>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { data: null, error }
      }

      return {
        data: {
          user: data.user,
          session: data.session
        },
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { data: null, error }
      }

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<AuthResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { data: null, error }
      }

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { data: null, error }
      }

      return { data: data.user, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<AuthResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        return { data: null, error }
      }

      return { data: data.session, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Refresh current session
   */
  static async refreshSession(): Promise<AuthResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return { data: null, error }
      }

      return { data: data.session, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        return { data: null, error }
      }

      return { data: data.user, error: null }
    } catch (error) {
      return {
        data: null,
        error: error as AuthError
      }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}