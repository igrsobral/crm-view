import { ref, computed } from 'vue'

export interface LoadingState {
  [key: string]: boolean
}

export function useLoadingState() {
  const loadingStates = ref<LoadingState>({})

  const isLoading = computed(() => {
    return Object.values(loadingStates.value).some(loading => loading)
  })

  const setLoading = (key: string, loading: boolean) => {
    loadingStates.value[key] = loading
  }

  const startLoading = (key: string) => {
    setLoading(key, true)
  }

  const stopLoading = (key: string) => {
    setLoading(key, false)
  }

  const isLoadingKey = (key: string) => {
    return loadingStates.value[key] || false
  }

  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    startLoading(key)
    try {
      const result = await operation()
      return result
    } finally {
      stopLoading(key)
    }
  }

  const clearAllLoading = () => {
    loadingStates.value = {}
  }

  return {
    // State
    loadingStates,
    
    // Computed
    isLoading,
    
    // Actions
    setLoading,
    startLoading,
    stopLoading,
    isLoadingKey,
    withLoading,
    clearAllLoading
  }
}

// Global loading state for app-wide loading indicators
export function useGlobalLoading() {
  const globalLoading = ref(false)
  const loadingMessage = ref('')

  const setGlobalLoading = (loading: boolean, message = '') => {
    globalLoading.value = loading
    loadingMessage.value = message
  }

  const withGlobalLoading = async <T>(
    operation: () => Promise<T>,
    message = 'Loading...'
  ): Promise<T> => {
    setGlobalLoading(true, message)
    try {
      const result = await operation()
      return result
    } finally {
      setGlobalLoading(false)
    }
  }

  return {
    globalLoading,
    loadingMessage,
    setGlobalLoading,
    withGlobalLoading
  }
}