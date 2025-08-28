import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Authentication middleware for route protection
 * Handles authentication requirements and redirects for protected routes
 */
export async function authMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.loading) {
    try {
      await authStore.initialize()
    } catch (error) {
      console.error('Failed to initialize auth store:', error)
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      const redirectPath = to.fullPath !== '/dashboard' && to.fullPath !== '/' ? to.fullPath : null
      next({
        path: '/login',
        query: redirectPath ? { redirect: redirectPath } : {}
      })
      return
    }
    
    if (authStore.isSessionExpired) {
      console.log('Session expired, attempting refresh...')
      const { error } = await authStore.refreshSession()
      
      if (error) {
        console.log('Session refresh failed, redirecting to login')
        await authStore.signOut()
        next({
          path: '/login',
          query: { 
            redirect: to.fullPath !== '/dashboard' ? to.fullPath : undefined,
            expired: 'true' 
          }
        })
        return
      }
      console.log('Session refreshed successfully')
    }
  }

  if (requiresGuest && authStore.isAuthenticated) {
    const redirectTo = to.query.redirect as string
    if (redirectTo && redirectTo !== '/login' && redirectTo !== '/register') {
      next(redirectTo)
    } else {
      next('/dashboard')
    }
    return
  }

  next()
}

/**
 * Session validation middleware
 * Proactively refreshes sessions that are about to expire
 */
export async function sessionMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (!to.matched.some(record => record.meta.requiresAuth)) {
    next()
    return
  }

  if (authStore.needsRefresh && authStore.isAuthenticated) {
    try {
      console.log('Session needs refresh, refreshing proactively...')
      const { error } = await authStore.refreshSession()
      
      if (error) {
        console.warn('Proactive session refresh failed:', error.message)
      } else {
        console.log('Session refreshed proactively')
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }

  next()
}

/**
 * Role-based access control middleware (for future use)
 * Currently allows all authenticated users access to all routes
 */
export async function roleMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.roles as string[] | undefined

  if (!requiredRoles || requiredRoles.length === 0) {
    next()
    return
  }

  // For MVP, all authenticated users have access to all routes
  if (authStore.isAuthenticated) {
    next()
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}