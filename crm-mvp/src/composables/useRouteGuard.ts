import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth'

/**
 * Composable for handling route protection and navigation
 */
export function useRouteGuard() {
  const router = useRouter()
  const route = useRoute()
  const { isAuthenticated, isSessionExpired, refreshSession, signOut } = useAuth()

  const requiresAuth = computed(() => 
    route.matched.some(record => record.meta.requiresAuth)
  )

  const requiresGuest = computed(() => 
    route.matched.some(record => record.meta.requiresGuest)
  )

  /**
   * Check if current route requires authentication
   */
  const checkAuthRequired = async () => {
    if (!requiresAuth.value) return true

    if (!isAuthenticated.value) {
      await redirectToLogin()
      return false
    }

    if (isSessionExpired.value) {
      const { error } = await refreshSession()
      if (error) {
        await signOut()
        await redirectToLogin(true)
        return false
      }
    }

    return true
  }

  /**
   * Redirect to login with optional session expired flag
   */
  const redirectToLogin = async (sessionExpired = false) => {
    const currentPath = route.fullPath
    const query: Record<string, string> = {}
    
    if (currentPath !== '/dashboard' && currentPath !== '/') {
      query.redirect = currentPath
    }
    
    if (sessionExpired) {
      query.expired = 'true'
    }

    await router.push({
      path: '/login',
      query
    })
  }

  /**
   * Redirect to dashboard or intended destination
   */
  const redirectAfterAuth = async () => {
    const redirectTo = route.query.redirect as string
    
    if (redirectTo && redirectTo !== '/login' && redirectTo !== '/register') {
      await router.push(redirectTo)
    } else {
      await router.push('/dashboard')
    }
  }

  /**
   * Check if user should be redirected from guest-only routes
   */
  const checkGuestOnly = async () => {
    if (!requiresGuest.value) return true

    if (isAuthenticated.value) {
      await redirectAfterAuth()
      return false
    }

    return true
  }

  /**
   * Handle session expiration
   */
  const handleSessionExpiration = async () => {
    await signOut()
    await redirectToLogin(true)
  }

  /**
   * Navigate to a protected route
   */
  const navigateToProtectedRoute = async (path: string) => {
    if (!isAuthenticated.value) {
      await router.push({
        path: '/login',
        query: { redirect: path }
      })
      return false
    }

    if (isSessionExpired.value) {
      const { error } = await refreshSession()
      if (error) {
        await handleSessionExpiration()
        return false
      }
    }

    await router.push(path)
    return true
  }

  return {
    requiresAuth,
    requiresGuest,
    checkAuthRequired,
    checkGuestOnly,
    redirectToLogin,
    redirectAfterAuth,
    handleSessionExpiration,
    navigateToProtectedRoute
  }
}