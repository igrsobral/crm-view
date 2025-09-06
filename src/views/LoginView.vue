<template>
  <div class="min-h-screen flex overflow-hidden">
    <!-- Left Panel - Brand/Marketing -->
    <div
      class="hidden lg:flex justify-center lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-900 relative overflow-hidden">
      <!-- Animated gradient ripple background -->
      <div class="absolute inset-0">
        <!-- Base gradient layer -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-900"></div>

        <!-- Ripple animations -->
        <div class="absolute inset-0">
          <!-- Large ripple 1 -->
          <div class="absolute w-96 h-96 -top-48 -left-48 bg-gradient-radial from-blue-400/30 via-purple-500/20 to-transparent rounded-full animate-ripple-1"></div>

          <!-- Large ripple 2 -->
          <div class="absolute w-80 h-80 top-1/4 -right-40 bg-gradient-radial from-purple-400/25 via-blue-500/15 to-transparent rounded-full animate-ripple-2"></div>

          <!-- Medium ripple 3 -->
          <div class="absolute w-64 h-64 bottom-0 left-1/4 bg-gradient-radial from-indigo-400/20 via-blue-600/10 to-transparent rounded-full animate-ripple-3"></div>

          <!-- Small ripple 4 -->
          <div class="absolute w-48 h-48 top-3/4 right-1/4 bg-gradient-radial from-cyan-400/30 via-blue-500/20 to-transparent rounded-full animate-ripple-4"></div>

          <!-- Tiny ripples -->
          <div class="absolute w-32 h-32 top-1/3 left-1/3 bg-gradient-radial from-white/10 to-transparent rounded-full animate-ripple-5"></div>
          <div class="absolute w-24 h-24 bottom-1/4 right-1/3 bg-gradient-radial from-blue-300/20 to-transparent rounded-full animate-ripple-6"></div>
        </div>

        <!-- Animated floating blobs -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <!-- Subtle overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-blue-800/10"></div>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <!-- Logo and Brand -->
        <div class="mb-8 animate-slide-in-left">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm border border-white border-opacity-20">
              <svg class="w-7 h-7" fill="var(--color-blue-600)" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold">ContactlyPro</h1>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-md mb-60 animate-slide-in-left animation-delay-300">
          <h2 class="text-5xl font-bold mb-6 leading-tight">
            Effortlessly manage your team and operations.
          </h2>
        </div>

        <!-- Dashboard Preview Mockup -->
        <div class="absolute right-3 bottom-3 transform -translate-y-1/2 animate-float">
            <!-- Main dashboard card -->
            <div
              class="w-80 h-60 bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 animate-slide-in-right animation-delay-600">
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
              <div
                class="h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-between px-2 pb-2">
                <div class="w-2 bg-blue-400 rounded-t animate-bar-1" style="height: 40%"></div>
                <div class="w-2 bg-blue-500 rounded-t animate-bar-2" style="height: 60%"></div>
                <div class="w-2 bg-blue-400 rounded-t animate-bar-3" style="height: 35%"></div>
                <div class="w-2 bg-purple-500 rounded-t animate-bar-4" style="height: 80%"></div>
                <div class="w-2 bg-purple-400 rounded-t animate-bar-5" style="height: 45%"></div>
                <div class="w-2 bg-blue-600 rounded-t animate-bar-6" style="height: 90%"></div>
                <div class="w-2 bg-purple-600 rounded-t animate-bar-1" style="height: 55%"></div>
              </div>

              <!-- Floating notification -->
              <div
                class="absolute -top-4 -right-4 w-48 bg-white rounded-xl shadow-lg p-4 animate-slide-in-right animation-delay-1200">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">New Deal Closed</div>
                    <div class="text-xs text-gray-500">$25,000 - Acme Corp</div>
                  </div>
                </div>
              </div>

              <!-- Floating stats card -->
              <div
                class="absolute -bottom-6 -left-8 w-32 bg-white rounded-xl shadow-lg p-3 animate-slide-in-right animation-delay-900">
                <div class="text-xs text-gray-500 mb-1">This Month</div>
                <div class="text-lg font-bold text-gray-900">142%</div>
                <div class="flex items-center text-xs text-green-600">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clip-rule="evenodd" />
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
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
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
              <InputText id="email" v-model="form.email" type="email" autocomplete="email"
                placeholder="Enter your email" :invalid="!!errors.email" class="w-full" />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Password id="password" v-model="form.password" autocomplete="current-password"
                placeholder="Enter your password" :invalid="!!errors.password" :feedback="false" toggleMask
                inputClass="w-full" class="w-full" />
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <Button type="button" @click="showResetPassword = true" text link label="Forgot Password?"
                class="p-0 h-auto font-medium text-blue-600 hover:text-blue-500" />
            </div>
          </div>

          <div v-if="sessionExpiredMessage" class="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-amber-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-amber-800">{{ sessionExpiredMessage }}</p>
            </div>
          </div>

          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <div>
            <Button type="submit" :disabled="loading" :loading="loading" :label="loading ? 'Signing in...' : 'Sign In'"
              class="w-full justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" />
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

        <!-- Password Reset Dialog -->
        <Dialog
          v-model:visible="showResetPassword"
          header="Reset Password"
          modal
          :style="{ width: '25rem' }"
          :draggable="false"
          :resizable="false"
          @hide="closeResetModal"
        >
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
          </form>

          <template #footer>
            <div class="flex gap-3">
              <Button
                type="button"
                @click="closeResetModal"
                outlined
                severity="secondary"
                label="Cancel"
                class="flex-1"
              />
              <Button
                type="button"
                @click="handleResetPassword"
                :disabled="resetLoading"
                :loading="resetLoading"
                :label="resetLoading ? 'Sending...' : 'Send Reset Email'"
                class="flex-1"
              />
            </div>
          </template>
        </Dialog>
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
import Dialog from 'primevue/dialog'

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

  0%,
  100% {
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

  0%,
  20% {
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

  0%,
  30% {
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

  0%,
  40% {
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

  0%,
  50% {
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

  0%,
  60% {
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

  0%,
  70% {
    height: 50%;
  }

  100% {
    height: 90%;
  }
}

/* Ripple animations */
@keyframes ripple-1 {
  0% {
    transform: scale(0.8) translateX(0px) translateY(0px);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2) translateX(20px) translateY(-30px);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.8) translateX(0px) translateY(0px);
    opacity: 0.8;
  }
}

@keyframes ripple-2 {
  0% {
    transform: scale(1) translateX(0px) translateY(0px);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3) translateX(-25px) translateY(20px);
    opacity: 0.3;
  }
  100% {
    transform: scale(1) translateX(0px) translateY(0px);
    opacity: 0.6;
  }
}

@keyframes ripple-3 {
  0% {
    transform: scale(0.9) translateX(0px) translateY(0px);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.4) translateX(15px) translateY(-15px);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.9) translateX(0px) translateY(0px);
    opacity: 0.5;
  }
}

@keyframes ripple-4 {
  0% {
    transform: scale(1.1) translateX(0px) translateY(0px);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.5) translateX(-20px) translateY(-25px);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.1) translateX(0px) translateY(0px);
    opacity: 0.7;
  }
}

@keyframes ripple-5 {
  0% {
    transform: scale(0.7) translateX(0px) translateY(0px);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1) translateX(10px) translateY(10px);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.7) translateX(0px) translateY(0px);
    opacity: 0.4;
  }
}

@keyframes ripple-6 {
  0% {
    transform: scale(1) translateX(0px) translateY(0px);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) translateX(-10px) translateY(15px);
    opacity: 0.1;
  }
  100% {
    transform: scale(1) translateX(0px) translateY(0px);
    opacity: 0.3;
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

/* Ripple animation classes */
.animate-ripple-1 {
  animation: ripple-1 8s ease-in-out infinite;
}

.animate-ripple-2 {
  animation: ripple-2 10s ease-in-out infinite;
}

.animate-ripple-3 {
  animation: ripple-3 12s ease-in-out infinite;
}

.animate-ripple-4 {
  animation: ripple-4 9s ease-in-out infinite;
}

.animate-ripple-5 {
  animation: ripple-5 7s ease-in-out infinite;
}

.animate-ripple-6 {
  animation: ripple-6 11s ease-in-out infinite;
}

/* Radial gradient utilities */
.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
}

/* Custom gradient combinations for ripples */
.from-blue-400\/30 {
  --tw-gradient-from: rgba(96, 165, 250, 0.3);
}

.via-purple-500\/20 {
  --tw-gradient-via: rgba(168, 85, 247, 0.2);
}

.from-purple-400\/25 {
  --tw-gradient-from: rgba(196, 181, 253, 0.25);
}

.via-blue-500\/15 {
  --tw-gradient-via: rgba(59, 130, 246, 0.15);
}

.from-indigo-400\/20 {
  --tw-gradient-from: rgba(129, 140, 248, 0.2);
}

.via-blue-600\/10 {
  --tw-gradient-via: rgba(37, 99, 235, 0.1);
}

.from-cyan-400\/30 {
  --tw-gradient-from: rgba(34, 211, 238, 0.3);
}

.from-white\/10 {
  --tw-gradient-from: rgba(255, 255, 255, 0.1);
}

.from-blue-300\/20 {
  --tw-gradient-from: rgba(147, 197, 253, 0.2);
}

.to-transparent {
  --tw-gradient-to: transparent;
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
