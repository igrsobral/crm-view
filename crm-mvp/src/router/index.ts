import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware, sessionMiddleware } from '@/middleware/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (guest-only)
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        requiresGuest: true,
        title: 'Sign In'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { 
        requiresGuest: true,
        title: 'Create Account'
      }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallbackView.vue'),
      meta: {
        title: 'Verifying Account'
      }
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: {
        title: 'Reset Password'
      }
    },
    // Root redirect
    {
      path: '/',
      redirect: '/dashboard'
    },
    // Protected routes (require authentication)
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Dashboard'
      }
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: () => import('../views/ContactsView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Contacts'
      }
    },
    {
      path: '/contacts/import',
      name: 'contacts-import',
      component: () => import('../components/contacts/ContactImport.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Import Contacts'
      }
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('../components/contacts/ContactExport.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Export Data'
      }
    },
    {
      path: '/deals',
      name: 'deals',
      component: () => import('../views/DealsView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Deals'
      }
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('../views/ActivitiesView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Activities'
      }
    },
    // Catch-all route for 404s - redirect to dashboard if authenticated, login if not
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: () => {
        // This will be handled by the auth middleware
        // If user is authenticated, they'll go to dashboard
        // If not authenticated, they'll go to login
        return '/dashboard'
      }
    }
  ],
})

// Apply navigation guards in order
// Session middleware runs first to handle proactive token refresh
router.beforeEach(sessionMiddleware)
// Auth middleware runs second to handle authentication requirements
router.beforeEach(authMiddleware)

router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - Contactly CRM`
  } else {
    document.title = 'Contactly CRM'
  }
})

router.onError((error) => {
  console.error('Router navigation error:', error)
  
  if (error.message.includes('Loading chunk') || error.message.includes('Loading CSS chunk')) {
    console.log('Chunk loading error detected, reloading page...')
    window.location.reload()
  }
})

export default router
