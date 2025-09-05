<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Brand/Marketing -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-900 relative overflow-hidden">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <!-- Logo and Brand -->
        <div class="mb-8 animate-slide-in-left">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm border border-white border-opacity-20">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h1 class="text-3xl font-bold">ContactlyPro</h1>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="max-w-md mb-12 animate-slide-in-left animation-delay-300">
          <h2 class="text-5xl font-bold mb-6 leading-tight">
            Effortlessly manage your team and operations.
          </h2>
          <p class="text-xl text-blue-100 leading-relaxed opacity-90">
            Log in to access your CRM dashboard and manage your team.
          </p>
        </div>
        
        <!-- Dashboard Preview Mockup -->
        <div class="absolute right-8 top-1/2 transform -translate-y-1/2 animate-float">
          <div class="relative">
            <!-- Main dashboard card -->
            <div class="w-80 h-60 bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 animate-slide-in-right animation-delay-600">
              <!-- Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div class="text-sm text-gray-500 font-medium">Dashboard</div>
              </div>
              
              <!-- Stats Cards -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-blue-50 rounded-lg p-3">
                  <div class="text-sm text-blue-600 font-medium">Total Sales</div>
                  <div class="text-2xl font-bold text-blue-900 animate-pulse">$189,374</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                  <div class="text-sm text-purple-600 font-medium">Deals Won</div>
                  <div class="text-2xl font-bold text-purple-900">6,248</div>
                </div>
              </div>
              
              <!-- Chart placeholder -->
              <div class="h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-between px-2 pb-2">
                <div class="w-2 bg-blue-400 rounded-t animate-bar-1" style="height: 40%"></div>
                <div class="w-2 bg-blue-500 rounded-t animate-bar-2" style="height: 60%"></div>
                <div class="w-2 bg-blue-400 rounded-t animate-bar-3" style="height: 35%"></div>
                <div class="w-2 bg-purple-500 rounded-t animate-bar-4" style="height: 80%"></div>
                <div class="w-2 bg-purple-400 rounded-t animate-bar-5" style="height: 45%"></div>
                <div class="w-2 bg-blue-600 rounded-t animate-bar-6" style="height: 90%"></div>
                <div class="w-2 bg-purple-600 rounded-t animate-bar-1" style="height: 55%"></div>
              </div>
            </div>
            
            <!-- Floating notification -->
            <div class="absolute -top-4 -right-4 w-48 bg-white rounded-xl shadow-lg p-4 animate-slide-in-right animation-delay-1200">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">New Deal Closed</div>
                  <div class="text-xs text-gray-500">$25,000 - Acme Corp</div>
                </div>
              </div>
            </div>
            
            <!-- Floating stats card -->
            <div class="absolute -bottom-6 -left-8 w-32 bg-white rounded-xl shadow-lg p-3 animate-slide-in-right animation-delay-900">
              <div class="text-xs text-gray-500 mb-1">This Month</div>
              <div class="text-lg font-bold text-gray-900">142%</div>
              <div class="flex items-center text-xs text-green-600">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                +18%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white animate-slide-in-right">
      <div class="max-w-md w-full space-y-8">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="inline-flex items-center">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">ContactlyPro</h1>
          </div>
        </div>

        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p class="text-gray-600">
            Please sign in to your account
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="Enter your email"
                :invalid="!!errors.email"
                class="w-full"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Password
                id="password"
                v-model="form.password"
                autocomplete="current-password"
                placeholder="Enter your password"
                :invalid="!!errors.password"
                :feedback="false"
                toggleMask
                inputClass="w-full"
                class="w-full"
              />
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <Button
                type="button"
                @click="showResetPassword = true"
                text
                link
                label="Forgot Password?"
                class="p-0 h-auto font-medium text-blue-600 hover:text-blue-500"
              />
            </div>
          </div>

          <div v-if="sessionExpiredMessage" class="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-amber-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-amber-800">{{ sessionExpiredMessage }}</p>
            </div>
          </div>

          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              :disabled="loading"
              :loading="loading"
              :label="loading ? 'Signing in...' : 'LOGIN'"
              class="w-full justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            />
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up
              </router-link>
            </p>
          </div>
        </form>

        <!-- Password Reset Modal -->
        <div v-if="showResetPassword" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Reset Password</h3>
                <button
                  @click="closeResetModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <form @submit.prevent="handleResetPassword">
                <div class="mb-4">
                  <label for="reset-email" class="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <InputText
                    id="reset-email"
                    v-model="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    class="w-full"
                  />
                </div>
                
                <div v-if="resetError" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p class="text-sm text-red-800">{{ resetError }}</p>
                </div>
                
                <div v-if="resetSuccess" class="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p class="text-sm text-green-800">Password reset email sent! Check your inbox.</p>
                </div>
                
                <div class="flex space-x-3">
                  <Button
                    type="button"
                    @click="closeResetModal"
                    outlined
                    severity="secondary"
                    label="Cancel"
                    class="flex-1"
                  />
                  <Button
                    type="submit"
                    :disabled="resetLoading"
                    :loading="resetLoading"
                    :label="resetLoading ? 'Sending...' : 'Send Reset Email'"
                    class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// PrimeVue component imports
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const { signIn, resetPassword, loading, error } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const showResetPassword = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref(false)
const sessionExpiredMessage = ref('')

onMounted(() => {
  // Check if user was redirected due to session expiration
  if (route.query.expired === 'true') {
    sessionExpiredMessage.value = 'Your session has expired. Please sign in again.'
  }
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }
  
  if (!form.email.includes('@')) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  
  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  const { error: signInError } = await signIn(form.email, form.password)
  
  if (!signInError) {
    // Redirect to intended destination or dashboard
    const redirectTo = route.query.redirect as string
    if (redirectTo && redirectTo !== '/login' && redirectTo !== '/register') {
      router.push(redirectTo)
    } else {
      router.push('/dashboard')
    }
  }
}

const handleResetPassword = async () => {
  if (!resetEmail.value) {
    resetError.value = 'Email is required'
    return
  }
  
  resetLoading.value = true
  resetError.value = ''
  resetSuccess.value = false
  
  const { error: resetErr } = await resetPassword(resetEmail.value)
  
  if (resetErr) {
    resetError.value = resetErr.message
  } else {
    resetSuccess.value = true
    setTimeout(() => {
      closeResetModal()
    }, 3000)
  }
  
  resetLoading.value = false
}

const closeResetModal = () => {
  showResetPassword.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSuccess.value = false
  resetLoading.value = false
}
</script>

<style scoped>
/* Ensure PrimeVue Password component has proper styling */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
  padding-right: 3rem;
}

:deep(.p-password .p-password-toggle-icon) {
  right: 0.75rem;
}

:deep(.p-password-input) {
  width: 100% !important;
}

/* Animation classes */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(-50%);
  }
  50% {
    transform: translateY(-10px) translateX(-50%);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes barGrow1 {
  0%, 20% {
    height: 20%;
  }
  50% {
    height: 40%;
  }
  100% {
    height: 40%;
  }
}

@keyframes barGrow2 {
  0%, 30% {
    height: 30%;
  }
  60% {
    height: 60%;
  }
  100% {
    height: 60%;
  }
}

@keyframes barGrow3 {
  0%, 40% {
    height: 15%;
  }
  70% {
    height: 35%;
  }
  100% {
    height: 35%;
  }
}

@keyframes barGrow4 {
  0%, 50% {
    height: 40%;
  }
  80% {
    height: 80%;
  }
  100% {
    height: 80%;
  }
}

@keyframes barGrow5 {
  0%, 60% {
    height: 25%;
  }
  90% {
    height: 45%;
  }
  100% {
    height: 45%;
  }
}

@keyframes barGrow6 {
  0%, 70% {
    height: 50%;
  }
  100% {
    height: 90%;
  }
}

/* Apply animations */
.animate-blob {
  animation: blob 7s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

.animate-bar-1 {
  animation: barGrow1 2s ease-out infinite;
}

.animate-bar-2 {
  animation: barGrow2 2s ease-out infinite;
}

.animate-bar-3 {
  animation: barGrow3 2s ease-out infinite;
}

.animate-bar-4 {
  animation: barGrow4 2s ease-out infinite;
}

.animate-bar-5 {
  animation: barGrow5 2s ease-out infinite;
}

.animate-bar-6 {
  animation: barGrow6 2s ease-out infinite;
}

/* Animation delays */
.animation-delay-300 {
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.animation-delay-600 {
  animation-delay: 0.6s;
  animation-fill-mode: both;
}

.animation-delay-900 {
  animation-delay: 0.9s;
  animation-fill-mode: both;
}

.animation-delay-1200 {
  animation-delay: 1.2s;
  animation-fill-mode: both;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Enhance form animations */
.w-full.lg\:w-1\/2 {
  animation: slideInRight 0.8s ease-out;
}

/* Form input hover effects */
:deep(.p-inputtext) {
  transition: all 0.3s ease;
}

:deep(.p-inputtext:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

:deep(.p-inputtext:focus) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

:deep(.p-button) {
  transition: all 0.3s ease;
}

:deep(.p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Responsive adjustments */
@media (max-width: 1280px) {
  .absolute.right-8 {
    right: 4px;
  }
  
  .w-80 {
    width: 16rem;
  }
}

@media (max-width: 1024px) {
  .absolute.right-8 {
    display: none;
  }
}
</style>