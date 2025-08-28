import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import type { ActivityType } from '@/utils/constants'
import type { Contact } from './contacts'
import type { Deal } from './deals'

export interface Activity {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  type: ActivityType
  subject?: string
  description?: string
  scheduled_at?: string
  completed: boolean
  created_at: string
  contact?: Contact
  deal?: Deal
}

export interface ActivityInput {
  contact_id?: string
  deal_id?: string
  type: ActivityType
  subject?: string
  description?: string
  scheduled_at?: string
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchActivities = async () => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      activities.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch activities'
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (activityData: ActivityInput) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: createError } = await supabase
        .from('activities')
        .insert([{ ...activityData, completed: false }])
        .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
        .single()
      
      if (createError) throw createError
      activities.value.unshift(data)
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create activity'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (id: string, updates: Partial<ActivityInput & { completed: boolean }>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
        .single()
      
      if (updateError) throw updateError
      
      const index = activities.value.findIndex(a => a.id === id)
      if (index !== -1) {
        activities.value[index] = data
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update activity'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      activities.value = activities.value.filter(a => a.id !== id)
      return { error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete activity'
      return { error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity
  }
})