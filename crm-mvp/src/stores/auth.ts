import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import { AuthService } from '@/services/authService'
import { AuthManager } from '@/utils/authManager'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value && !AuthManager.isSessionExpired(session.value))
  const isSessionExpired = computed(() => AuthManager.isSessionExpired(session.value))
  const needsRefresh = computed(() => AuthManager.needsRefresh(session.value))

  const initialize = async () => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured - skipping auth initialization')
        return
      }
      
      // Get current session using AuthService
      const { data: currentSession, error: sessionError } = await AuthService.getSession()
      
      if (sessionError) {
        throw sessionError
      }
      
      session.value = currentSession
      user.value = currentSession?.user ?? null
      
      // Set up auth state change listener for automatic token refresh
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          session.value = null
          user.value = null
        }
      })
      
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      console.error('Error initializing auth:', authError)
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Please add your Supabase credentials to .env file.')
      }
      
      const { data, error: signUpError } = await AuthService.signUp(email, password)
      
      if (signUpError) throw signUpError
      
      // Don't automatically set session for sign up - user needs to verify email first
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      return { data: null, error: authError }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured. Please add your Supabase credentials to .env file.')
      }
      
      const { data, error: signInError } = await AuthService.signIn(email, password)
      
      if (signInError) throw signInError
      
      // Session and user will be set automatically by the auth state change listener
      session.value = data!.session
      user.value = data!.user
      
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      return { data: null, error: authError }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: signOutError } = await AuthService.signOut()
      if (signOutError) throw signOutError
      
      // Session and user will be cleared automatically by the auth state change listener
      session.value = null
      user.value = null
      
      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      console.error('Error signing out:', authError)
      return { error: authError }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: resetError } = await AuthService.resetPassword(email)
      
      if (resetError) throw resetError
      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      return { error: authError }
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (newPassword: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await AuthService.updatePassword(newPassword)
      
      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      return { data: null, error: authError }
    } finally {
      loading.value = false
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error: refreshError } = await AuthManager.refreshSession()
      if (refreshError) throw refreshError
      
      session.value = data?.session ?? null
      user.value = data?.user ?? null
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      return { data: null, error: authError }
    }
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    isSessionExpired,
    needsRefresh,
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  }
})