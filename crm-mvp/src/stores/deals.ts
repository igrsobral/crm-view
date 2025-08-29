import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isSupabaseConfigured } from '@/utils/supabase'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'
import type { Contact } from './contacts'
import {
  DealsService,
  type DealFilters,
  type PipelineMetrics
} from '@/services/dealsService'

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
  const pipelineMetrics = ref<PipelineMetrics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed getters
  const dealsByStage = computed(() => {
    const grouped = deals.value.reduce((acc, deal) => {
      const stage = deal.stage
      if (!acc[stage]) {
        acc[stage] = []
      }
      acc[stage].push(deal)
      return acc
    }, {} as Record<DealStage, Deal[]>)

    Object.values(DEAL_STAGES).forEach(stage => {
      if (!grouped[stage]) {
        grouped[stage] = []
      }
    })

    return grouped
  })

  const overdueDeals = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return deals.value.filter(deal =>
      deal.expected_close_date &&
      deal.expected_close_date < today &&
      !['closed_won', 'closed_lost'].includes(deal.stage)
    )
  })

  const totalPipelineValue = computed(() => {
    return deals.value
      .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + (deal.value || 0), 0)
  })

  const wonDeals = computed(() => {
    return deals.value.filter(deal => deal.stage === 'closed_won')
  })

  const lostDeals = computed(() => {
    return deals.value.filter(deal => deal.stage === 'closed_lost')
  })

  const fetchDeals = async (filters?: DealFilters) => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }

      const { data, error: fetchError } = await DealsService.getDeals(filters)

      if (fetchError) throw new Error(fetchError)
      deals.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch deals'
    } finally {
      loading.value = false
    }
  }

  const fetchDealsByStage = async () => {
    loading.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        error.value = 'Supabase not configured. Please add your Supabase credentials to .env file.'
        return
      }

      const { data, error: fetchError } = await DealsService.getDealsByStage()

      if (fetchError) throw new Error(fetchError)

      deals.value = Object.values(data || {}).flat()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch deals by stage'
    } finally {
      loading.value = false
    }
  }

  const fetchPipelineMetrics = async () => {
    try {
      if (!isSupabaseConfigured()) {
        return
      }

      const { data, error: fetchError } = await DealsService.getPipelineMetrics()

      if (fetchError) throw new Error(fetchError)
      pipelineMetrics.value = data
    } catch (err) {
      console.error('Failed to fetch pipeline metrics:', err)
    }
  }

  const createDeal = async (dealData: DealInput) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: createError } = await DealsService.createDeal(dealData)

      if (createError) throw new Error(createError)
      if (data) {
        deals.value.unshift(data)
        await fetchPipelineMetrics()
      }
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
      const { data, error: updateError } = await DealsService.updateDeal(id, updates)

      if (updateError) throw new Error(updateError)

      if (data) {
        const index = deals.value.findIndex(d => d.id === id)
        if (index !== -1) {
          deals.value[index] = data
        }
        await fetchPipelineMetrics()
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update deal'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const moveDealToStage = async (id: string, newStage: DealStage) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: moveError } = await DealsService.moveDealToStage(id, newStage)

      if (moveError) throw new Error(moveError)

      if (data) {
        const index = deals.value.findIndex(d => d.id === id)
        if (index !== -1) {
          deals.value[index] = data
        }
        await fetchPipelineMetrics()
      }
      return { data, error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move deal'
      return { data: null, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteDeal = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await DealsService.deleteDeal(id)

      if (deleteError) throw new Error(deleteError)

      deals.value = deals.value.filter(d => d.id !== id)
      await fetchPipelineMetrics()
      return { error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete deal'
      return { error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchDeals = async (query: string, limit?: number) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: searchError } = await DealsService.searchDeals(query, limit)

      if (searchError) throw new Error(searchError)
      return { data: data || [], error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search deals'
      return { data: [], error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchOverdueDeals = async () => {
    try {
      const { data, error: fetchError } = await DealsService.getOverdueDeals()

      if (fetchError) throw new Error(fetchError)
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Failed to fetch overdue deals' }
    }
  }

  const bulkUpdateStage = async (dealIds: string[], stage: DealStage) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await DealsService.bulkUpdateStage(dealIds, stage)

      if (updateError) throw new Error(updateError)

      if (data) {
        data.forEach(updatedDeal => {
          const index = deals.value.findIndex(d => d.id === updatedDeal.id)
          if (index !== -1) {
            deals.value[index] = updatedDeal
          }
        })
        await fetchPipelineMetrics()
      }
      return { data: data || [], error: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to bulk update deals'
      return { data: [], error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getStageOrder = () => {
    return Object.values(DEAL_STAGES)
  }

  const getNextStage = (currentStage: DealStage): DealStage | null => {
    const stages = getStageOrder()
    const currentIndex = stages.indexOf(currentStage)
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
  }

  const getPreviousStage = (currentStage: DealStage): DealStage | null => {
    const stages = getStageOrder()
    const currentIndex = stages.indexOf(currentStage)
    return currentIndex > 0 ? stages[currentIndex - 1] : null
  }

  const canMoveToStage = (fromStage: DealStage, toStage: DealStage): boolean => {
    return true
  }

  return {
    // State
    deals,
    pipelineMetrics,
    loading,
    error,

    // Computed
    dealsByStage,
    overdueDeals,
    totalPipelineValue,
    wonDeals,
    lostDeals,

    // Actions
    fetchDeals,
    fetchDealsByStage,
    fetchPipelineMetrics,
    createDeal,
    updateDeal,
    moveDealToStage,
    deleteDeal,
    searchDeals,
    fetchOverdueDeals,
    bulkUpdateStage,

    // Pipeline management
    getStageOrder,
    getNextStage,
    getPreviousStage,
    canMoveToStage
  }
})