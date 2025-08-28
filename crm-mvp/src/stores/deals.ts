import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import type { DealStage } from '@/utils/constants'
import type { Contact } from './contacts'

export interface Deal {
  id: string
  user_id: string
  contact_id: string
  name: string
  value?: number
  stage: DealStage
  expected_close_date?: string
  notes?: string
  created_at: string
  updated_at: string
  contact?: Contact
}

export interface DealInput {
  contact_id: string
  name: string
  value?: number
  stage: DealStage
  expected_close_date?: string
  notes?: string
}

export const useDealsStore = defineStore('deals', () => {
  const deals = ref<Deal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDeals = async () => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      deals.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch deals'
    } finally {
      loading.value = false
    }
  }

  const createDeal = async (dealData: DealInput) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: createError } = await supabase
        .from('deals')
        .insert([dealData])
        .select(`
          *,
          contact:contacts(*)
        `)
        .single()
      
      if (createError) throw createError
      deals.value.unshift(data)
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create deal'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateDeal = async (id: string, updates: Partial<DealInput>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(*)
        `)
        .single()
      
      if (updateError) throw updateError
      
      const index = deals.value.findIndex(d => d.id === id)
      if (index !== -1) {
        deals.value[index] = data
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update deal'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteDeal = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      deals.value = deals.value.filter(d => d.id !== id)
      return { error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete deal'
      return { error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    deals,
    loading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal
  }
})