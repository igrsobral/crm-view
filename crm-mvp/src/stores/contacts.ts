import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import type { ContactStatus } from '@/utils/constants'

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
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchContacts = async () => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      contacts.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch contacts'
    } finally {
      loading.value = false
    }
  }

  const createContact = async (contactData: ContactInput) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: createError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()
      
      if (createError) throw createError
      contacts.value.unshift(data)
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create contact'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (id: string, updates: Partial<ContactInput>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = data
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update contact'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteContact = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      contacts.value = contacts.value.filter(c => c.id !== id)
      return { error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete contact'
      return { error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
  }
})