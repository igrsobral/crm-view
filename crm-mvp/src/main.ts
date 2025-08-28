import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { AuthManager } from './utils/authManager'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize authentication manager for automatic token refresh
AuthManager.initialize()

app.mount('#app')
