import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import { ContactsService } from '@/services/contactsService'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoadingState } from '@/composables/useLoadingState'
import { useToastStore } from '@/stores/toast'
import type { ContactStatus } from '@/utils/constants'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: ContactStatus
  tags: string[]
  notes?: string
  last_contact_date?: string
  created_at: string
  updated_at: string
}

export interface ContactInput {
  name: string
  email?: string
  phone?: string
  company?: string
  status: ContactStatus
  tags: string[]
  notes?: string
}

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref<Contact[]>([])
  const searchQuery = ref('')
  const statusFilter = ref<ContactStatus | 'all'>('all')
  const tagFilter = ref<string[]>([])
  const initialized = ref(false)

  const { error, hasError, clearError, withErrorHandling } = useErrorHandler()
  const { isLoadingKey, withLoading } = useLoadingState()
  const toast = useToastStore()

  let realtimeChannel: RealtimeChannel | null = null

  const loading = computed(() => isLoadingKey('fetch'))
  const creating = computed(() => isLoadingKey('create'))
  const updating = computed(() => isLoadingKey('update'))
  const deleting = computed(() => isLoadingKey('delete'))

  const filteredContacts = computed(() => {
    let filtered = contacts.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter.value)
    }

    if (tagFilter.value.length > 0) {
      filtered = filtered.filter(contact =>
        tagFilter.value.some(tag => contact.tags.includes(tag))
      )
    }

    return filtered
  })

  const contactsByStatus = computed(() => {
    return contacts.value.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1
      return acc
    }, {} as Record<ContactStatus, number>)
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    contacts.value.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const setupRealtimeSubscription = () => {
    if (!isSupabaseConfigured() || realtimeChannel) return

    realtimeChannel = supabase
      .channel('contacts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          handleRealtimeEvent(payload)
        }
      )
      .subscribe()
  }

  const handleRealtimeEvent = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        if (newRecord && !contacts.value.find(c => c.id === newRecord.id)) {
          contacts.value.unshift(newRecord)
        }
        break
      case 'UPDATE':
        if (newRecord) {
          const index = contacts.value.findIndex(c => c.id === newRecord.id)
          if (index !== -1) {
            contacts.value[index] = newRecord
          }
        }
        break
      case 'DELETE':
        if (oldRecord) {
          contacts.value = contacts.value.filter(c => c.id !== oldRecord.id)
        }
        break
    }
  }

  const fetchContacts = async () => {
    const result = await withLoading('fetch', async () => {
      return await withErrorHandling(async () => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase not configured. Please add your Supabase credentials to .env file.')
        }

        const result = await ContactsService.getContacts()

        if (result.error) {
          throw new Error(result.error)
        }

        contacts.value = result.data || []
        initialized.value = true
        setupRealtimeSubscription()
        
        return result.data
      })
    })

    return result
  }

  const getContactById = async (id: string) => {
    return await ContactsService.getContactById(id)
  }

  const createContact = async (contactData: ContactInput) => {
    const result = await withLoading('create', async () => {
      return await withErrorHandling(async () => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase not configured')
        }

        const result = await ContactsService.createContact(contactData)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data && !contacts.value.find(c => c.id === result.data!.id)) {
          contacts.value.unshift(result.data)
          toast.success(`Contact "${result.data.name}" created successfully`)
        }

        return result
      })
    })

    return result || { data: null, error: error.value?.message || 'Failed to create contact' }
  }

  const updateContact = async (id: string, updates: Partial<ContactInput>) => {
    const result = await withLoading('update', async () => {
      return await withErrorHandling(async () => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase not configured')
        }

        const result = await ContactsService.updateContact(id, updates)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data) {
          const index = contacts.value.findIndex(c => c.id === id)
          if (index !== -1) {
            contacts.value[index] = result.data
            toast.success(`Contact "${result.data.name}" updated successfully`)
          }
        }

        return result
      })
    })

    return result || { data: null, error: error.value?.message || 'Failed to update contact' }
  }

  const deleteContact = async (id: string) => {
    const result = await withLoading('delete', async () => {
      return await withErrorHandling(async () => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase not configured')
        }

        const result = await ContactsService.deleteContact(id)

        if (result.error) {
          throw new Error(result.error)
        }

        const deletedContact = contacts.value.find(c => c.id === id)
        contacts.value = contacts.value.filter(c => c.id !== id)
        
        if (deletedContact) {
          toast.success(`Contact "${deletedContact.name}" deleted successfully`)
        }

        return result
      })
    })

    return result || { error: error.value?.message || 'Failed to delete contact' }
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setStatusFilter = (status: ContactStatus | 'all') => {
    statusFilter.value = status
  }

  const setTagFilter = (tags: string[]) => {
    tagFilter.value = tags
  }

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    tagFilter.value = []
  }

  const bulkUpdateStatus = async (contactIds: string[], status: ContactStatus) => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      const result = await ContactsService.bulkUpdateStatus(contactIds, status)

      if (result.error) {
        throw new Error(result.error)
      }

      result.data?.forEach(updatedContact => {
        const index = contacts.value.findIndex(c => c.id === updatedContact.id)
        if (index !== -1) {
          contacts.value[index] = updatedContact
        }
      })

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to bulk update contacts'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchContacts = async (query: string, limit = 10) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      const result = await ContactsService.searchContacts(query, limit)

      if (result.error) {
        throw new Error(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search contacts'
      return { data: null, error: errorMessage }
    }
  }

  const cleanup = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    contacts,
    searchQuery,
    statusFilter,
    tagFilter,
    initialized,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error handling
    error,
    hasError,
    clearError,

    // Computed
    filteredContacts,
    contactsByStatus,
    allTags,

    // Actions
    fetchContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    bulkUpdateStatus,
    searchContacts,

    // Search and filter
    setSearchQuery,
    setStatusFilter,
    setTagFilter,
    clearFilters,

    // Utilities
    setupRealtimeSubscription,
    cleanup
  }
})