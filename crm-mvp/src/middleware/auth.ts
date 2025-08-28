import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Authentication middleware for route protection
 */
export async function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.loading) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      const redirectPath = to.fullPath !== '/dashboard' ? to.fullPath : null
      next({
        path: '/login',
        query: redirectPath ? { redirect: redirectPath } : {}
      })
      return
    }
    
    if (authStore.isSessionExpired) {
      const { error } = await authStore.refreshSession()
      if (error) {
        await authStore.signOut()
        next({
          path: '/login',
          query: { redirect: to.fullPath, expired: 'true' }
        })
        return
      }
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
 */
export async function sessionMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()

  if (!to.matched.some(record => record.meta.requiresAuth)) {
    next()
    return
  }

  if (authStore.needsRefresh) {
    try {
      await authStore.refreshSession()
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }

  next()
}

/**
 * Role-based access control middleware (for future use)
 */
export async function roleMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.roles as string[] | undefined

  if (!requiredRoles || requiredRoles.length === 0) {
    next()
    return
  }

  // For now, all authenticated users have access
  if (authStore.isAuthenticated) {
    next()
  } else {
    next('/login')
  }
}