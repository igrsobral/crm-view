import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isSupabaseConfigured } from '@/utils/supabase'
import { ActivitiesService, type ActivityFilters, type ActivityStats } from '@/services/activitiesService'
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
  const upcomingActivities = ref<Activity[]>([])
  const overdueActivities = ref<Activity[]>([])
  const activityStats = ref<ActivityStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const completedActivities = computed(() =>
    activities.value.filter(activity => activity.completed)
  )

  const pendingActivities = computed(() =>
    activities.value.filter(activity => !activity.completed)
  )

  const scheduledActivities = computed(() =>
    activities.value.filter(activity => activity.scheduled_at && !activity.completed)
  )

  const todaysActivities = computed(() => {
    const today = new Date().toDateString()
    return activities.value.filter(activity => {
      if (!activity.scheduled_at) return false
      return new Date(activity.scheduled_at).toDateString() === today
    })
  })

  const fetchActivities = async (filters?: ActivityFilters) => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }

      const { data, error: fetchError } = await ActivitiesService.getActivities(filters)

      if (fetchError) {
        error.value = fetchError
        return
      }

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
      const { data, error: createError } = await ActivitiesService.createActivity(activityData)

      if (createError) {
        error.value = createError
        return { data: null, error: createError }
      }

      if (data) {
        activities.value.unshift(data)
      }
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
      const { data, error: updateError } = await ActivitiesService.updateActivity(id, updates)

      if (updateError) {
        error.value = updateError
        return { data: null, error: updateError }
      }

      if (data) {
        const index = activities.value.findIndex(a => a.id === id)
        if (index !== -1) {
          activities.value[index] = data
        }
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
      const { error: deleteError } = await ActivitiesService.deleteActivity(id)

      if (deleteError) {
        error.value = deleteError
        return { error: deleteError }
      }

      activities.value = activities.value.filter(a => a.id !== id)
      return { error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete activity'
      return { error: error.value }
    } finally {
      loading.value = false
    }
  }

  const completeActivity = async (id: string) => {
    return updateActivity(id, { completed: true })
  }

  const uncompleteActivity = async (id: string) => {
    return updateActivity(id, { completed: false })
  }

  const scheduleFollowUp = async (
    contactId: string,
    type: ActivityType,
    scheduledAt: string,
    subject?: string,
    description?: string,
    dealId?: string
  ) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: scheduleError } = await ActivitiesService.scheduleFollowUp(
        contactId,
        type,
        scheduledAt,
        subject,
        description,
        dealId
      )

      if (scheduleError) {
        error.value = scheduleError
        return { data: null, error: scheduleError }
      }

      if (data) {
        activities.value.unshift(data)
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to schedule follow-up'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchUpcomingActivities = async (limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await ActivitiesService.getUpcomingActivities(limit)

      if (fetchError) {
        error.value = fetchError
        return
      }

      upcomingActivities.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch upcoming activities'
    } finally {
      loading.value = false
    }
  }

  const fetchOverdueActivities = async (limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await ActivitiesService.getOverdueActivities(limit)

      if (fetchError) {
        error.value = fetchError
        return
      }

      overdueActivities.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch overdue activities'
    } finally {
      loading.value = false
    }
  }

  const fetchContactActivities = async (contactId: string, limit = 20) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await ActivitiesService.getContactActivities(contactId, limit)

      if (fetchError) {
        error.value = fetchError
        return { data: [], error: fetchError }
      }

      return { data: data || [], error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch contact activities'
      return { data: [], error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchContactTimeline = async (contactId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await ActivitiesService.getContactTimeline(contactId)

      if (fetchError) {
        error.value = fetchError
        return { data: [], error: fetchError }
      }

      return { data: data || [], error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch contact timeline'
      return { data: [], error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchActivityStats = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await ActivitiesService.getActivityStats()

      if (fetchError) {
        error.value = fetchError
        return
      }

      activityStats.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch activity stats'
    } finally {
      loading.value = false
    }
  }

  const bulkCompleteActivities = async (activityIds: string[]) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: bulkError } = await ActivitiesService.bulkCompleteActivities(activityIds)

      if (bulkError) {
        error.value = bulkError
        return { data: [], error: bulkError }
      }

      if (data) {
        data.forEach(updatedActivity => {
          const index = activities.value.findIndex(a => a.id === updatedActivity.id)
          if (index !== -1) {
            activities.value[index] = updatedActivity
          }
        })
      }

      return { data: data || [], error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to bulk complete activities'
      return { data: [], error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getActivityById = (id: string) => {
    return activities.value.find(activity => activity.id === id)
  }

  const getActivitiesByContact = (contactId: string) => {
    return activities.value.filter(activity => activity.contact_id === contactId)
  }

  const getActivitiesByDeal = (dealId: string) => {
    return activities.value.filter(activity => activity.deal_id === dealId)
  }

  const isActivityOverdue = (activity: Activity) => {
    if (!activity.scheduled_at || activity.completed) return false
    return new Date(activity.scheduled_at) < new Date()
  }

  const isActivityUpcoming = (activity: Activity) => {
    if (!activity.scheduled_at || activity.completed) return false
    const scheduledDate = new Date(activity.scheduled_at)
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return scheduledDate >= now && scheduledDate <= nextWeek
  }

  return {
    // State
    activities,
    upcomingActivities,
    overdueActivities,
    activityStats,
    loading,
    error,

    // Computed
    completedActivities,
    pendingActivities,
    scheduledActivities,
    todaysActivities,

    // Actions
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    uncompleteActivity,
    scheduleFollowUp,
    fetchUpcomingActivities,
    fetchOverdueActivities,
    fetchContactActivities,
    fetchContactTimeline,
    fetchActivityStats,
    bulkCompleteActivities,

    // Utilities
    getActivityById,
    getActivitiesByContact,
    getActivitiesByDeal,
    isActivityOverdue,
    isActivityUpcoming
  }
})