import { supabase } from '@/utils/supabase'
import { ref } from 'vue'

export function useSupabase() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const handleError = (err: any) => {
    error.value = err?.message || 'An unexpected error occurred'
    console.error('Supabase error:', err)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    supabase,
    loading,
    error,
    handleError,
    clearError
  }
}