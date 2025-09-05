import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastAction {
    label: string
    handler: () => void
}

export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title?: string
    message: string
    duration?: number
    action?: ToastAction
    createdAt: number
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    const addToast = (toast: Omit<Toast, 'id' | 'createdAt'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            ...toast,
            id,
            createdAt: Date.now(),
            duration: toast.duration ?? (toast.type === 'error' ? 0 : 5000) // Errors don't auto-dismiss
        }

        toasts.value.push(newToast)

        // Auto-dismiss if duration is set
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(toast => toast.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const clearAllToasts = () => {
        toasts.value = []
    }

    const success = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
        return addToast({ ...options, type: 'success', message })
    }

    const error = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
        return addToast({ ...options, type: 'error', message })
    }

    const warning = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
        return addToast({ ...options, type: 'warning', message })
    }

    const info = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
        return addToast({ ...options, type: 'info', message })
    }

    return {
        // State
        toasts,

        // Actions
        addToast,
        removeToast,
        clearAllToasts,

        // Convenience methods
        success,
        error,
        warning,
        info
    }
})