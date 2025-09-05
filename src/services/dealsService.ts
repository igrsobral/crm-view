import { supabase } from '@/utils/supabase'
import type { Deal, DealInput } from '@/stores/deals'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'

export interface DealsServiceResponse<T> {
    data: T | null
    error: string | null
}

export interface DealFilters {
    search?: string
    stage?: DealStage | 'all'
    contactId?: string
    overdue?: boolean
    limit?: number
    offset?: number
}

export interface PipelineMetrics {
    totalValue: number
    totalDeals: number
    stageMetrics: Record<DealStage, { count: number; value: number }>
    conversionRates: Record<DealStage, number>
    averageDealValue: number
    overdueDeals: number
}

export class DealsService {
    static async getDeals(filters?: DealFilters): Promise<DealsServiceResponse<Deal[]>> {
        try {
            let query = supabase
                .from('deals')
                .select(`
          *,
          contact:contacts(*)
        `)

            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
            }

            if (filters?.stage && filters.stage !== 'all') {
                query = query.eq('stage', filters.stage)
            }

            if (filters?.contactId) {
                query = query.eq('contact_id', filters.contactId)
            }

            if (filters?.overdue) {
                const today = new Date().toISOString().split('T')[0]
                query = query.lt('expected_close_date', today)
                    .not('stage', 'in', '(closed_won,closed_lost)')
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
                error: err instanceof Error ? err.message : 'Failed to fetch deals'
            }
        }
    }

    static async getDealById(id: string): Promise<DealsServiceResponse<Deal>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .select(`
          *,
          contact:contacts(*)
        `)
                .eq('id', id)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch deal'
            }
        }
    }

    static async createDeal(dealData: DealInput): Promise<DealsServiceResponse<Deal>> {
        try {
            if (!dealData.name?.trim()) {
                throw new Error('Deal name is required')
            }

            if (!dealData.contact_id) {
                throw new Error('Contact is required for deal')
            }

            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                throw new Error('User must be authenticated to create deals')
            }

            const cleanData = {
                user_id: user.id,
                contact_id: dealData.contact_id,
                name: dealData.name.trim(),
                value: dealData.value || null,
                stage: dealData.stage || DEAL_STAGES.LEAD,
                expected_close_date: dealData.expected_close_date || null,
                notes: dealData.notes?.trim() || null
            }

            const { data, error } = await supabase
                .from('deals')
                .insert([cleanData])
                .select(`
          *,
          contact:contacts(*)
        `)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to create deal'
            }
        }
    }

    static async updateDeal(id: string, updates: Partial<DealInput>): Promise<DealsServiceResponse<Deal>> {
        try {
            const cleanUpdates: Partial<DealInput> = {}

            if (updates.name !== undefined) {
                cleanUpdates.name = updates.name.trim()
                if (!cleanUpdates.name) {
                    throw new Error('Deal name cannot be empty')
                }
            }

            if (updates.contact_id !== undefined) {
                cleanUpdates.contact_id = updates.contact_id
            }

            if (updates.value !== undefined) {
                cleanUpdates.value = updates.value
            }

            if (updates.stage !== undefined) {
                cleanUpdates.stage = updates.stage
            }

            if (updates.expected_close_date !== undefined) {
                cleanUpdates.expected_close_date = updates.expected_close_date
            }

            if (updates.notes !== undefined) {
                cleanUpdates.notes = updates.notes?.trim() || undefined
            }

            const { data, error } = await supabase
                .from('deals')
                .update(cleanUpdates)
                .eq('id', id)
                .select(`
          *,
          contact:contacts(*)
        `)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to update deal'
            }
        }
    }

    static async moveDealToStage(id: string, newStage: DealStage): Promise<DealsServiceResponse<Deal>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .update({ stage: newStage })
                .eq('id', id)
                .select(`
          *,
          contact:contacts(*)
        `)
                .single()

            if (error) throw error

            return { data, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to move deal'
            }
        }
    }

    static async deleteDeal(id: string): Promise<DealsServiceResponse<null>> {
        try {
            const { error } = await supabase
                .from('deals')
                .delete()
                .eq('id', id)

            if (error) throw error

            return { data: null, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to delete deal'
            }
        }
    }

    static async getDealsByStage(): Promise<DealsServiceResponse<Record<DealStage, Deal[]>>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .select(`
          *,
          contact:contacts(*)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error

            const dealsByStage = (data || []).reduce((acc, deal) => {
                const stage = deal.stage as DealStage
                if (!acc[stage]) {
                    acc[stage] = []
                }
                acc[stage].push(deal)
                return acc
            }, {} as Record<DealStage, Deal[]>)

            // Ensure all stages are present
            Object.values(DEAL_STAGES).forEach(stage => {
                if (!dealsByStage[stage]) {
                    dealsByStage[stage] = []
                }
            })

            return { data: dealsByStage, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch deals by stage'
            }
        }
    }

    static async getPipelineMetrics(): Promise<DealsServiceResponse<PipelineMetrics>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .select('*')

            if (error) throw error

            const deals = data || []
            const today = new Date().toISOString().split('T')[0]

            const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
            const totalDeals = deals.length
            const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

            const stageMetrics = deals.reduce((acc, deal) => {
                const stage = deal.stage as DealStage
                if (!acc[stage]) {
                    acc[stage] = { count: 0, value: 0 }
                }
                acc[stage].count++
                acc[stage].value += deal.value || 0
                return acc
            }, {} as Record<DealStage, { count: number; value: number }>)

            Object.values(DEAL_STAGES).forEach(stage => {
                if (!stageMetrics[stage]) {
                    stageMetrics[stage] = { count: 0, value: 0 }
                }
            })

            const conversionRates = {} as Record<DealStage, number>
            const totalActiveDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length
            const wonDeals = stageMetrics.closed_won.count
            const lostDeals = stageMetrics.closed_lost.count
            const closedDeals = wonDeals + lostDeals

            Object.values(DEAL_STAGES).forEach(stage => {
                if (stage === 'closed_won') {
                    conversionRates[stage] = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0
                } else if (stage === 'closed_lost') {
                    conversionRates[stage] = closedDeals > 0 ? (lostDeals / closedDeals) * 100 : 0
                } else {
                    conversionRates[stage] = totalActiveDeals > 0 ? (stageMetrics[stage].count / totalActiveDeals) * 100 : 0
                }
            })

            const overdueDeals = deals.filter(deal =>
                deal.expected_close_date &&
                deal.expected_close_date < today &&
                !['closed_won', 'closed_lost'].includes(deal.stage)
            ).length

            const metrics: PipelineMetrics = {
                totalValue,
                totalDeals,
                stageMetrics,
                conversionRates,
                averageDealValue,
                overdueDeals
            }

            return { data: metrics, error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to calculate pipeline metrics'
            }
        }
    }

    static async getOverdueDeals(): Promise<DealsServiceResponse<Deal[]>> {
        try {
            const today = new Date().toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('deals')
                .select(`
          *,
          contact:contacts(*)
        `)
                .lt('expected_close_date', today)
                .not('stage', 'in', '(closed_won,closed_lost)')
                .order('expected_close_date', { ascending: true })

            if (error) throw error

            return { data: data || [], error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to fetch overdue deals'
            }
        }
    }

    static async bulkUpdateStage(dealIds: string[], stage: DealStage): Promise<DealsServiceResponse<Deal[]>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .update({ stage })
                .in('id', dealIds)
                .select(`
          *,
          contact:contacts(*)
        `)

            if (error) throw error

            return { data: data || [], error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to bulk update deals'
            }
        }
    }

    static async searchDeals(query: string, limit = 10): Promise<DealsServiceResponse<Deal[]>> {
        try {
            const { data, error } = await supabase
                .from('deals')
                .select(`
          *,
          contact:contacts(*)
        `)
                .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
                .limit(limit)
                .order('created_at', { ascending: false })

            if (error) throw error

            return { data: data || [], error: null }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Failed to search deals'
            }
        }
    }
}