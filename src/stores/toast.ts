import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'
import type { ToastServiceMethods } from 'primevue/toastservice'

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
    let toastService: ToastServiceMethods | null = null

    const initToastService = () => {
        if (!toastService) {
            try {
                toastService = useToast()
            } catch (error) {
                console.warn('Toast service not available:', error)
                return null
            }
        }
        return toastService
    }

    const addToast = (toast: Omit<Toast, 'id' | 'createdAt'>) => {
        const service = initToastService()
        if (!service) {
            console.warn('Toast service not initialized')
            return
        }

        const id = Math.random().toString(36).substring(2, 9)
        const duration = toast.duration ?? (toast.type === 'error' ? 0 : 5000)

        service.add({
            severity: toast.type,
            summary: toast.title || getDefaultTitle(toast.type),
            detail: toast.message,
            life: duration,
            group: 'app'
        })

        return id
    }

    const removeToast = (id?: string) => {
        const service = initToastService()
        if (!service) return

        // PrimeVue doesn't support removing specific toasts by ID
        // This is a limitation of the service
        service.removeAllGroups()
    }

    const clearAllToasts = () => {
        const service = initToastService()
        if (!service) return
        service.removeAllGroups()
    }

    const getDefaultTitle = (type: string) => {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        }
        return titles[type as keyof typeof titles] || 'Notification'
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
        // Actions
        addToast,
        removeToast,
        clearAllToasts,
        initToastService,

        // Convenience methods
        success,
        error,
        warning,
        info
    }
})
