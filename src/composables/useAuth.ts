import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()

  return {
    user: computed(() => authStore.user),
    session: computed(() => authStore.session),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isSessionExpired: computed(() => authStore.isSessionExpired),
    needsRefresh: computed(() => authStore.needsRefresh),
    signUp: authStore.signUp,
    signIn: authStore.signIn,
    signOut: authStore.signOut,
    resetPassword: authStore.resetPassword,
    updatePassword: authStore.updatePassword,
    refreshSession: authStore.refreshSession,
    initialize: authStore.initialize
  }
}