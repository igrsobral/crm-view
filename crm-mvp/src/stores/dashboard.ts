import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useContactsStore } from './contacts'
import { useDealsStore } from './deals'
import { useActivitiesStore } from './activities'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface DashboardMetrics {
    totalContacts: number
    contactsByStatus: Record<string, number>
    totalDeals: number
    totalPipelineValue: number
    dealsByStage: Record<string, number>
    wonDealsValue: number
    lostDealsValue: number
    conversionRate: number
    totalActivities: number
    completedActivities: number
    upcomingActivities: number
    overdueActivities: number
    activitiesThisWeek: number
}

export interface RecentActivity {
    id: string
    type: string
    subject?: string
    description?: string
    contact_name?: string
    deal_name?: string
    created_at: string
    completed: boolean
}

export const useDashboardStore = defineStore('dashboard', () => {
    const metrics = ref<DashboardMetrics>({
        totalContacts: 0,
        contactsByStatus: {},
        totalDeals: 0,
        totalPipelineValue: 0,
        dealsByStage: {},
        wonDealsValue: 0,
        lostDealsValue: 0,
        conversionRate: 0,
        totalActivities: 0,
        completedActivities: 0,
        upcomingActivities: 0,
        overdueActivities: 0,
        activitiesThisWeek: 0
    })

    const recentActivities = ref<RecentActivity[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    let realtimeChannel: RealtimeChannel | null = null

    const contactsStore = useContactsStore()
    const dealsStore = useDealsStore()
    const activitiesStore = useActivitiesStore()

    const setupRealtimeSubscription = () => {
        if (!isSupabaseConfigured() || realtimeChannel) return

        realtimeChannel = supabase
            .channel('dashboard_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'contacts'
                },
                () => {
                    refreshMetrics()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'deals'
                },
                () => {
                    refreshMetrics()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'activities'
                },
                () => {
                    refreshMetrics()
                    fetchRecentActivities()
                }
            )
            .subscribe()
    }

    const calculateMetrics = () => {
        const contacts = contactsStore.contacts
        const deals = dealsStore.deals
        const activities = activitiesStore.activities

        // Contact metrics
        const contactsByStatus = contacts.reduce((acc, contact) => {
            acc[contact.status] = (acc[contact.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Deal metrics
        const activeDeals = deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
        const wonDeals = deals.filter(deal => deal.stage === 'closed_won')
        const lostDeals = deals.filter(deal => deal.stage === 'closed_lost')

        const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
        const wonDealsValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
        const lostDealsValue = lostDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

        const totalClosedDeals = wonDeals.length + lostDeals.length
        const conversionRate = totalClosedDeals > 0 ? (wonDeals.length / totalClosedDeals) * 100 : 0

        const dealsByStage = deals.reduce((acc, deal) => {
            acc[deal.stage] = (acc[deal.stage] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Activity metrics
        const completedActivities = activities.filter(activity => activity.completed).length
        const now = new Date()
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const upcomingActivities = activities.filter(activity =>
            activity.scheduled_at &&
            !activity.completed &&
            new Date(activity.scheduled_at) >= now &&
            new Date(activity.scheduled_at) <= oneWeekFromNow
        ).length

        const overdueActivities = activities.filter(activity =>
            activity.scheduled_at &&
            !activity.completed &&
            new Date(activity.scheduled_at) < now
        ).length

        const activitiesThisWeek = activities.filter(activity =>
            new Date(activity.created_at) >= oneWeekAgo
        ).length

        metrics.value = {
            totalContacts: contacts.length,
            contactsByStatus,
            totalDeals: deals.length,
            totalPipelineValue,
            dealsByStage,
            wonDealsValue,
            lostDealsValue,
            conversionRate,
            totalActivities: activities.length,
            completedActivities,
            upcomingActivities,
            overdueActivities,
            activitiesThisWeek
        }
    }

    const fetchRecentActivities = async (limit = 10) => {
        try {
            if (!isSupabaseConfigured()) {
                return
            }

            const { data, error: fetchError } = await supabase
                .from('activities')
                .select(`
          id,
          type,
          subject,
          description,
          created_at,
          completed,
          contact:contacts(name),
          deal:deals(name)
        `)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (fetchError) {
                console.error('Failed to fetch recent activities:', fetchError)
                return
            }

            recentActivities.value = (data || []).map(activity => ({
                id: activity.id,
                type: activity.type,
                subject: activity.subject,
                description: activity.description,
                contact_name: activity.contact ? (activity.contact as any).name : undefined,
                deal_name: activity.deal ? (activity.deal as any).name : undefined,
                created_at: activity.created_at,
                completed: activity.completed
            }))
        } catch (err) {
            console.error('Failed to fetch recent activities:', err)
        }
    }

    const refreshMetrics = async () => {
        loading.value = true
        error.value = null

        try {
            // Ensure all stores have fresh data
            await Promise.all([
                contactsStore.fetchContacts(),
                dealsStore.fetchDeals(),
                activitiesStore.fetchActivities()
            ])

            calculateMetrics()
            await fetchRecentActivities()

            setupRealtimeSubscription()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to refresh dashboard metrics'
        } finally {
            loading.value = false
        }
    }

    const cleanup = () => {
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel)
            realtimeChannel = null
        }
    }

    return {
        // State
        metrics,
        recentActivities,
        loading,
        error,

        // Actions
        refreshMetrics,
        fetchRecentActivities,
        calculateMetrics,
        setupRealtimeSubscription,
        cleanup
    }
})