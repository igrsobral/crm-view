import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware, sessionMiddleware } from '@/middleware/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    {
      path: '/',
      redirect: '/dashboard'
    },
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
    }
  ],
})

router.beforeEach(sessionMiddleware)
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
})

export default router
