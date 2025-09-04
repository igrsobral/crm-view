import { supabase } from '@/utils/supabase'
import { ref } from 'vue'

export function useSupabase() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const handleError = (err: Record<string, unknown>) => {
    error.value = (err?.message as string) || 'An unexpected error occurred'
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