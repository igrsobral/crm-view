import { ref, computed } from 'vue'

export interface ErrorState {
  message: string
  details?: string
  code?: string
  retryable?: boolean
}

export interface RetryConfig {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
}

export function useErrorHandler() {
  const error = ref<ErrorState | null>(null)
  const retryCount = ref(0)
  const isRetrying = ref(false)

  const hasError = computed(() => error.value !== null)
  const canRetry = computed(() => error.value?.retryable === true)

  const setError = (errorMessage: string, details?: string, retryable = true) => {
    error.value = {
      message: errorMessage,
      details,
      retryable
    }
  }

  const clearError = () => {
    error.value = null
    retryCount.value = 0
    isRetrying.value = false
  }

  const handleSupabaseError = (err: any): ErrorState => {
    if (err?.code) {
      switch (err.code) {
        case 'PGRST116':
          return {
            message: 'Record not found',
            details: err.message,
            retryable: false
          }
        case '23505':
          return {
            message: 'This record already exists',
            details: err.message,
            retryable: false
          }
        case 'auth/invalid-email':
          return {
            message: 'Please enter a valid email address',
            details: err.message,
            retryable: false
          }
        case 'auth/user-not-found':
          return {
            message: 'User not found',
            details: err.message,
            retryable: false
          }
        case 'auth/wrong-password':
          return {
            message: 'Invalid password',
            details: err.message,
            retryable: false
          }
        case 'auth/too-many-requests':
          return {
            message: 'Too many attempts. Please try again later.',
            details: err.message,
            retryable: true
          }
        default:
          return {
            message: 'An unexpected error occurred',
            details: err.message,
            retryable: true
          }
      }
    }

    if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        details: err.message,
        retryable: true
      }
    }

    return {
      message: err?.message || 'An unexpected error occurred',
      details: err?.stack,
      retryable: true
    }
  }

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T | null> => {
    const { maxAttempts = 3, delay = 1000, backoff = true } = config

    clearError()

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation()
        clearError()
        return result
      } catch (err) {
        const errorState = handleSupabaseError(err)
        
        if (!errorState.retryable || attempt === maxAttempts) {
          error.value = errorState
          return null
        }

        retryCount.value = attempt
        
        if (attempt < maxAttempts) {
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    return null
  }

  const retry = async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T | null> => {
    if (!canRetry.value) return null

    isRetrying.value = true
    const result = await withErrorHandling(operation, config)
    isRetrying.value = false
    
    return result
  }

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message
    }
    if (typeof err === 'string') {
      return err
    }
    return 'An unexpected error occurred'
  }

  const isNetworkError = (err: unknown): boolean => {
    const message = getErrorMessage(err).toLowerCase()
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection')
  }

  const isAuthError = (err: unknown): boolean => {
    const message = getErrorMessage(err).toLowerCase()
    return message.includes('auth') || 
           message.includes('unauthorized') || 
           message.includes('forbidden')
  }

  const isValidationError = (err: unknown): boolean => {
    const message = getErrorMessage(err).toLowerCase()
    return message.includes('validation') || 
           message.includes('invalid') || 
           message.includes('required')
  }

  return {
    // State
    error,
    retryCount,
    isRetrying,
    
    // Computed
    hasError,
    canRetry,
    
    // Actions
    setError,
    clearError,
    withErrorHandling,
    retry,
    
    // Utilities
    handleSupabaseError,
    getErrorMessage,
    isNetworkError,
    isAuthError,
    isValidationError
  }
}