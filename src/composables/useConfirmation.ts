import { ref } from 'vue'

export interface ConfirmationOptions {
  title: string
  message: string
  details?: string
  variant?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  loadingText?: string
}

export interface ConfirmationState extends ConfirmationOptions {
  show: boolean
  loading: boolean
  resolve?: (value: boolean) => void
}

export function useConfirmation() {
  const state = ref<ConfirmationState>({
    show: false,
    loading: false,
    title: '',
    message: ''
  })

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        ...options,
        show: true,
        loading: false,
        resolve
      }
    })
  }

  const handleConfirm = () => {
    if (state.value.resolve) {
      state.value.resolve(true)
    }
    close()
  }

  const handleCancel = () => {
    if (state.value.resolve) {
      state.value.resolve(false)
    }
    close()
  }

  const close = () => {
    state.value.show = false
    state.value.loading = false
    state.value.resolve = undefined
  }

  const setLoading = (loading: boolean) => {
    state.value.loading = loading
  }

  const confirmDelete = (itemName: string, details?: string): Promise<boolean> => {
    return confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      details,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })
  }

  const confirmDiscard = (itemName?: string): Promise<boolean> => {
    return confirm({
      title: 'Discard Changes',
      message: `Are you sure you want to discard your changes${itemName ? ` to "${itemName}"` : ''}? All unsaved changes will be lost.`,
      variant: 'warning',
      confirmText: 'Discard',
      cancelText: 'Keep Editing'
    })
  }

  const confirmAction = (action: string, itemName?: string, details?: string): Promise<boolean> => {
    return confirm({
      title: 'Confirm Action',
      message: `Are you sure you want to ${action}${itemName ? ` "${itemName}"` : ''}?`,
      details,
      variant: 'info',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    })
  }

  return {
    // State
    state,

    // Actions
    confirm,
    handleConfirm,
    handleCancel,
    close,
    setLoading,

    // Convenience methods
    confirmDelete,
    confirmDiscard,
    confirmAction
  }
}