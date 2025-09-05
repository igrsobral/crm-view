<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <Password
              id="password"
              v-model="form.password"
              autocomplete="new-password"
              placeholder="New password (min. 6 characters)"
              :invalid="!!errors.password"
              :feedback="false"
              toggleMask
              class="mt-1 w-full"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              placeholder="Confirm your new password"
              :invalid="!!errors.confirmPassword"
              :feedback="false"
              toggleMask
              class="mt-1 w-full"
            />
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
                Password updated successfully! Redirecting to dashboard...
              </h3>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            :disabled="loading"
            :loading="loading"
            :label="loading ? 'Updating password...' : 'Update password'"
            class="w-full justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          />
        </div>

        <div class="text-center">
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// PrimeVue component imports
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const { updatePassword, loading, error } = useAuth()

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const success = ref(false)

onMounted(() => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  
  if (!accessToken || !refreshToken) {
    router.push('/login')
  }
})

const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''
  
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
  
  const { error: updateError } = await updatePassword(form.password)
  
  if (!updateError) {
    success.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }
}
</script>