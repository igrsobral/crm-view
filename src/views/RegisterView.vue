<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <InputText id="email" v-model="form.email" type="email" autocomplete="email" placeholder="Email address"
              :invalid="!!errors.email" class="mt-1 w-full" />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Password 
              id="password" v-model="form.password" autocomplete="current-password"
              placeholder="Enter your password" :invalid="!!errors.password" :feedback="false" toggleMask
              inputClass="w-full" class="w-full" />
            <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
             <Password 
              id="confirmPassword" v-model="form.confirmPassword" autocomplete="current-password"
              placeholder="Confirm your password" :invalid="!!errors.confirmPassword" :feedback="false" toggleMask
              inputClass="w-full" class="w-full" />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Account created successfully! Please check your email to verify your account before signing in.
              </h3>
            </div>
          </div>
        </div>

        <div>
          <Button type="submit" :disabled="loading" :loading="loading"
            :label="loading ? 'Creating account...' : 'Create account'"
            class="w-full justify-center py-2 px-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white" />
        </div>

        <div class="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// PrimeVue component imports
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const { signUp, loading, error } = useAuth()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const success = ref(false)

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

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

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  success.value = false

  const { error: signUpError } = await signUp(form.email, form.password)

  if (!signUpError) {
    success.value = true
    form.email = ''
    form.password = ''
    form.confirmPassword = ''

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
}
</script>