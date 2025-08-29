import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { AuthManager } from './utils/authManager'
import { SessionMonitor } from './utils/sessionMonitor'
import { 
  preloadCriticalResources, 
  registerServiceWorker, 
  startPerformanceMonitoring 
} from './utils/performance'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize authentication manager for automatic token refresh
AuthManager.initialize()

// Initialize session monitor for handling session expiration
SessionMonitor.getInstance().initialize(router)

if (import.meta.env.PROD) {
  preloadCriticalResources()
  
  registerServiceWorker()
}

if (import.meta.env.DEV) {
  startPerformanceMonitoring()
}

app.mount('#app')
