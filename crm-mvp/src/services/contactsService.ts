import { supabase } from '@/utils/supabase'
import type { Contact, ContactInput } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

export interface ContactsServiceResponse<T> {
  data: T | null
  error: string | null
}

export interface ContactFilters {
  search?: string
  status?: ContactStatus | 'all'
  tags?: string[]
  limit?: number
  offset?: number
}

export class ContactsService {
  static async getContacts(filters?: ContactFilters): Promise<ContactsServiceResponse<Contact[]>> {
    try {
      let query = supabase
        .from('contacts')
        .select('*')

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch contacts'
      }
    }
  }

  static async getContactById(id: string): Promise<ContactsServiceResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch contact'
      }
    }
  }

  static async createContact(contactData: ContactInput): Promise<ContactsServiceResponse<Contact>> {
    try {
      if (!contactData.name?.trim()) {
        throw new Error('Contact name is required')
      }

      const cleanData = {
        name: contactData.name.trim(),
        email: contactData.email?.trim() || undefined,
        phone: contactData.phone?.trim() || undefined,
        company: contactData.company?.trim() || undefined,
        status: contactData.status,
        tags: contactData.tags || [],
        notes: contactData.notes?.trim() || undefined
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([cleanData])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create contact'
      }
    }
  }

  static async updateContact(id: string, updates: Partial<ContactInput>): Promise<ContactsServiceResponse<Contact>> {
    try {
      const cleanUpdates: Partial<ContactInput> = {}
      
      if (updates.name !== undefined) {
        cleanUpdates.name = updates.name.trim()
        if (!cleanUpdates.name) {
          throw new Error('Contact name cannot be empty')
        }
      }
      
      if (updates.email !== undefined) {
        cleanUpdates.email = updates.email?.trim() || undefined
      }
      
      if (updates.phone !== undefined) {
        cleanUpdates.phone = updates.phone?.trim() || undefined
      }
      
      if (updates.company !== undefined) {
        cleanUpdates.company = updates.company?.trim() || undefined
      }
      
      if (updates.status !== undefined) {
        cleanUpdates.status = updates.status
      }
      
      if (updates.tags !== undefined) {
        cleanUpdates.tags = updates.tags
      }
      
      if (updates.notes !== undefined) {
        cleanUpdates.notes = updates.notes?.trim() || undefined
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update contact'
      }
    }
  }

  static async deleteContact(id: string): Promise<ContactsServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to delete contact'
      }
    }
  }

  static async bulkUpdateStatus(contactIds: string[], status: ContactStatus): Promise<ContactsServiceResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status })
        .in('id', contactIds)
        .select()

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to bulk update contacts'
      }
    }
  }

  static async getContactStats(): Promise<ContactsServiceResponse<Record<ContactStatus, number>>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('status')

      if (error) throw error

      const stats = (data || []).reduce((acc, contact) => {
        const status = contact.status as ContactStatus
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<ContactStatus, number>)

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch contact stats'
      }
    }
  }

  static async searchContacts(query: string, limit = 10): Promise<ContactsServiceResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to search contacts'
      }
    }
  }

  static async getContactsByTag(tag: string): Promise<ContactsServiceResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch contacts by tag'
      }
    }
  }

  static async getAllTags(): Promise<ContactsServiceResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('tags')

      if (error) throw error

      const allTags = new Set<string>()
      data?.forEach(contact => {
        contact.tags?.forEach((tag: string) => allTags.add(tag))
      })

      return { data: Array.from(allTags).sort(), error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch tags'
      }
    }
  }
}