import { supabase } from '@/utils/supabase'
import type { Activity, ActivityInput } from '@/stores/activities'
import type { ActivityType } from '@/utils/constants'

export interface ActivitiesServiceResponse<T> {
    data: T | null
    error: string | null
}

export interface ActivityFilters {
    contactId?: string
    dealId?: string
    type?: ActivityType
    completed?: boolean
    scheduled?: boolean
    overdue?: boolean
    upcoming?: boolean
    limit?: number
    offset?: number
}

export interface ActivityStats {
    total: number
    completed: number
    pending: number
    overdue: number
    upcoming: number
    byType: Record<ActivityType, number>
}

export class ActivitiesService {
    /**
     * Get activities with optional filtering
     */
    static async getActivities(filters?: ActivityFilters): Promise<ActivitiesServiceResponse<Activity[]>> {
        try {
            let query = supabase
                .from('activities')
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)

            if (filters?.contactId) {
                query = query.eq('contact_id', filters.contactId)
            }

            if (filters?.dealId) {
                query = query.eq('deal_id', filters.dealId)
            }

            if (filters?.type) {
                query = query.eq('type', filters.type)
            }

            if (filters?.completed !== undefined) {
                query = query.eq('completed', filters.completed)
            }

            if (filters?.scheduled) {
                query = query.not('scheduled_at', 'is', null)
            }

            if (filters?.overdue) {
                const now = new Date().toISOString()
                query = query
                    .not('scheduled_at', 'is', null)
                    .lt('scheduled_at', now)
                    .eq('completed', false)
            }

            if (filters?.upcoming) {
                const now = new Date().toISOString()
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                query = query
                    .not('scheduled_at', 'is', null)
                    .gte('scheduled_at', now)
                    .lte('scheduled_at', nextWeek)
                    .eq('completed', false)
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
                error: err instanceof Error ? err.message : 'Failed to fetch activities'
            }
        }
    }

    /**
     * Get activity by ID
     */
    static async getActivityById(id: string): Promise<ActivitiesServiceResponse<Activity>> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
                .eq('id', id)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch activity'
            }
        }
    }

    /**
     * Create a new activity
     */
    static async createActivity(activityData: ActivityInput): Promise<ActivitiesServiceResponse<Activity>> {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                throw new Error('User must be authenticated to create activities')
            }

            // Validate required fields
            if (!activityData.type) {
                throw new Error('Activity type is required')
            }

            // Validate scheduled_at format if provided
            if (activityData.scheduled_at) {
                const scheduledDate = new Date(activityData.scheduled_at)
                if (isNaN(scheduledDate.getTime())) {
                    throw new Error('Invalid scheduled date format')
                }
            }

            const cleanData = {
                user_id: user.id,
                contact_id: activityData.contact_id || null,
                deal_id: activityData.deal_id || null,
                type: activityData.type,
                subject: activityData.subject?.trim() || null,
                description: activityData.description?.trim() || null,
                scheduled_at: activityData.scheduled_at || null,
                completed: false
            }

            const { data, error } = await supabase
                .from('activities')
                .insert([cleanData])
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to create activity'
            }
        }
    }

    /**
     * Update an existing activity
     */
    static async updateActivity(id: string, updates: Partial<ActivityInput & { completed: boolean }>): Promise<ActivitiesServiceResponse<Activity>> {
        try {
            const cleanUpdates: any = {}

            if (updates.type !== undefined) {
                cleanUpdates.type = updates.type
            }

            if (updates.subject !== undefined) {
                cleanUpdates.subject = updates.subject?.trim() || null
            }

            if (updates.description !== undefined) {
                cleanUpdates.description = updates.description?.trim() || null
            }

            if (updates.scheduled_at !== undefined) {
                if (updates.scheduled_at) {
                    const scheduledDate = new Date(updates.scheduled_at)
                    if (isNaN(scheduledDate.getTime())) {
                        throw new Error('Invalid scheduled date format')
                    }
                    cleanUpdates.scheduled_at = updates.scheduled_at
                } else {
                    cleanUpdates.scheduled_at = null
                }
            }

            if (updates.completed !== undefined) {
                cleanUpdates.completed = updates.completed
            }

            if (updates.contact_id !== undefined) {
                cleanUpdates.contact_id = updates.contact_id || null
            }

            if (updates.deal_id !== undefined) {
                cleanUpdates.deal_id = updates.deal_id || null
            }

            const { data, error } = await supabase
                .from('activities')
                .update(cleanUpdates)
                .eq('id', id)
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to update activity'
            }
        }
    }

    /**
     * Delete an activity
     */
    static async deleteActivity(id: string): Promise<ActivitiesServiceResponse<null>> {
        try {
            const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', id)

            if (error) throw error

            return { data: null, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to delete activity'
            }
        }
    }

    /**
     * Mark activity as completed
     */
    static async completeActivity(id: string): Promise<ActivitiesServiceResponse<Activity>> {
        return this.updateActivity(id, { completed: true })
    }

    /**
     * Mark activity as incomplete
     */
    static async uncompleteActivity(id: string): Promise<ActivitiesServiceResponse<Activity>> {
        return this.updateActivity(id, { completed: false })
    }

    /**
     * Get upcoming activities (next 7 days)
     */
    static async getUpcomingActivities(limit = 10): Promise<ActivitiesServiceResponse<Activity[]>> {
        return this.getActivities({
            upcoming: true,
            limit
        })
    }

    /**
     * Get overdue activities
     */
    static async getOverdueActivities(limit = 10): Promise<ActivitiesServiceResponse<Activity[]>> {
        return this.getActivities({
            overdue: true,
            limit
        })
    }

    /**
     * Get activities for a specific contact
     */
    static async getContactActivities(contactId: string, limit = 20): Promise<ActivitiesServiceResponse<Activity[]>> {
        return this.getActivities({
            contactId,
            limit
        })
    }

    /**
     * Get activities for a specific deal
     */
    static async getDealActivities(dealId: string, limit = 20): Promise<ActivitiesServiceResponse<Activity[]>> {
        return this.getActivities({
            dealId,
            limit
        })
    }

    /**
     * Get activity statistics
     */
    static async getActivityStats(): Promise<ActivitiesServiceResponse<ActivityStats>> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('type, completed, scheduled_at')

            if (error) throw error

            const now = new Date()
            const activities = data || []

            const stats: ActivityStats = {
                total: activities.length,
                completed: 0,
                pending: 0,
                overdue: 0,
                upcoming: 0,
                byType: {
                    call: 0,
                    email: 0,
                    meeting: 0,
                    note: 0
                }
            }

            activities.forEach(activity => {
                // Count by completion status
                if (activity.completed) {
                    stats.completed++
                } else {
                    stats.pending++

                    // Check if overdue or upcoming
                    if (activity.scheduled_at) {
                        const scheduledDate = new Date(activity.scheduled_at)
                        if (scheduledDate < now) {
                            stats.overdue++
                        } else if (scheduledDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                            stats.upcoming++
                        }
                    }
                }

                // Count by type
                if (activity.type in stats.byType) {
                    stats.byType[activity.type as ActivityType]++
                }
            })

            return { data: stats, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch activity stats'
            }
        }
    }

    /**
     * Schedule a follow-up activity
     */
    static async scheduleFollowUp(
        contactId: string,
        type: ActivityType,
        scheduledAt: string,
        subject?: string,
        description?: string,
        dealId?: string
    ): Promise<ActivitiesServiceResponse<Activity>> {
        return this.createActivity({
            contact_id: contactId,
            deal_id: dealId,
            type,
            subject: subject || `Follow-up ${type}`,
            description,
            scheduled_at: scheduledAt
        })
    }

    /**
     * Get activities timeline for a contact (chronological order)
     */
    static async getContactTimeline(contactId: string): Promise<ActivitiesServiceResponse<Activity[]>> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
                .eq('contact_id', contactId)
                .order('created_at', { ascending: true })

            if (error) throw error

            return { data: data || [], error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch contact timeline'
            }
        }
    }

    /**
     * Bulk update activities completion status
     */
    static async bulkCompleteActivities(activityIds: string[]): Promise<ActivitiesServiceResponse<Activity[]>> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .update({ completed: true })
                .in('id', activityIds)
                .select(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)

            if (error) throw error

            return { data: data || [], error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to bulk complete activities'
            }
        }
    }
}