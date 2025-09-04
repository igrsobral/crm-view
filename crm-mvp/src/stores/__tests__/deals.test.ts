import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia } from '@/test/utils'
import { useDealsStore } from '../deals'
import { DealFactory } from '@/test/factories'
import { DEAL_STAGES } from '@/utils/constants'

vi.mock('@/services/dealsService', () => ({
  DealsService: {
    getDeals: vi.fn(),
    getDealsByStage: vi.fn(),
    getPipelineMetrics: vi.fn(),
    createDeal: vi.fn(),
    updateDeal: vi.fn(),
    moveDealToStage: vi.fn(),
    deleteDeal: vi.fn(),
    searchDeals: vi.fn(),
    getOverdueDeals: vi.fn(),
    bulkUpdateStage: vi.fn()
  }
}))

describe('Deals Store', () => {
  let dealsStore: ReturnType<typeof useDealsStore>

  beforeEach(() => {
    createTestPinia()
    dealsStore = useDealsStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(dealsStore.deals).toEqual([])
      expect(dealsStore.pipelineMetrics).toBeNull()
      expect(dealsStore.loading).toBe(false)
      expect(dealsStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      const deals = [
        DealFactory.build({ stage: 'lead', value: 1000 }),
        DealFactory.build({ stage: 'qualified', value: 2000 }),
        DealFactory.build({ stage: 'lead', value: 1500 }),
        DealFactory.build({ stage: 'closed_won', value: 3000 }),
        DealFactory.build({ 
          stage: 'proposal', 
          value: 2500, 
          expected_close_date: '2023-01-01' // Past date
        })
      ]
      dealsStore.deals = deals
    })

    it('should group deals by stage correctly', () => {
      const dealsByStage = dealsStore.dealsByStage
      
      expect(dealsByStage.lead).toHaveLength(2)
      expect(dealsByStage.qualified).toHaveLength(1)
      expect(dealsByStage.proposal).toHaveLength(1)
      expect(dealsByStage.closed_won).toHaveLength(1)
      expect(dealsByStage.negotiation).toHaveLength(0)
      expect(dealsByStage.closed_lost).toHaveLength(0)
    })

    it('should calculate total pipeline value correctly', () => {
      // Should exclude closed deals
      const expectedValue = 1000 + 2000 + 1500 + 2500 // 7000
      expect(dealsStore.totalPipelineValue).toBe(expectedValue)
    })

    it('should identify overdue deals correctly', () => {
      const overdueDeals = dealsStore.overdueDeals
      expect(overdueDeals).toHaveLength(1)
      expect(overdueDeals[0].stage).toBe('proposal')
    })

    it('should filter won deals correctly', () => {
      const wonDeals = dealsStore.wonDeals
      expect(wonDeals).toHaveLength(1)
      expect(wonDeals[0].stage).toBe('closed_won')
    })

    it('should filter lost deals correctly', () => {
      const lostDeals = dealsStore.lostDeals
      expect(lostDeals).toHaveLength(0)
    })
  })

  describe('fetchDeals', () => {
    it('should fetch deals successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const mockDeals = DealFactory.buildMany(3)

      vi.mocked(DealsService.getDeals).mockResolvedValue({
        data: mockDeals,
        error: null
      })

      await dealsStore.fetchDeals()

      expect(DealsService.getDeals).toHaveBeenCalled()
      expect(dealsStore.deals).toEqual(mockDeals)
      expect(dealsStore.loading).toBe(false)
    })

    it('should handle fetch deals error', async () => {
      const { DealsService } = await import('@/services/dealsService')

      vi.mocked(DealsService.getDeals).mockResolvedValue({
        data: null,
        error: 'Failed to fetch deals'
      })

      await dealsStore.fetchDeals()

      expect(dealsStore.error).toBe('Failed to fetch deals')
      expect(dealsStore.loading).toBe(false)
    })
  })

  describe('createDeal', () => {
    it('should create deal successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const dealInput = DealFactory.buildInput()
      const createdDeal = DealFactory.build(dealInput)

      vi.mocked(DealsService.createDeal).mockResolvedValue({
        data: createdDeal,
        error: null
      })

      vi.mocked(DealsService.getPipelineMetrics).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await dealsStore.createDeal(dealInput)

      expect(DealsService.createDeal).toHaveBeenCalledWith(dealInput)
      expect(result.data).toEqual(createdDeal)
      expect(dealsStore.deals).toHaveLength(1)
      expect(dealsStore.deals[0]).toEqual(createdDeal)
      expect(DealsService.getPipelineMetrics).toHaveBeenCalled()
    })

    it('should handle create deal error', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const dealInput = DealFactory.buildInput()

      vi.mocked(DealsService.createDeal).mockResolvedValue({
        data: null,
        error: 'Failed to create deal'
      })

      const result = await dealsStore.createDeal(dealInput)

      expect(result.error).toBe('Failed to create deal')
      expect(dealsStore.deals).toHaveLength(0)
    })
  })

  describe('updateDeal', () => {
    it('should update deal successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const existingDeal = DealFactory.build()
      const updates = { name: 'Updated Deal Name' }
      const updatedDeal = { ...existingDeal, ...updates }

      dealsStore.deals = [existingDeal]

      vi.mocked(DealsService.updateDeal).mockResolvedValue({
        data: updatedDeal,
        error: null
      })

      vi.mocked(DealsService.getPipelineMetrics).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await dealsStore.updateDeal(existingDeal.id, updates)

      expect(DealsService.updateDeal).toHaveBeenCalledWith(existingDeal.id, updates)
      expect(result.data).toEqual(updatedDeal)
      expect(dealsStore.deals[0]).toEqual(updatedDeal)
    })
  })

  describe('moveDealToStage', () => {
    it('should move deal to new stage successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const existingDeal = DealFactory.build({ stage: 'lead' })
      const movedDeal = { ...existingDeal, stage: 'qualified' as const }

      dealsStore.deals = [existingDeal]

      vi.mocked(DealsService.moveDealToStage).mockResolvedValue({
        data: movedDeal,
        error: null
      })

      vi.mocked(DealsService.getPipelineMetrics).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await dealsStore.moveDealToStage(existingDeal.id, 'qualified')

      expect(DealsService.moveDealToStage).toHaveBeenCalledWith(existingDeal.id, 'qualified')
      expect(result.data).toEqual(movedDeal)
      expect(dealsStore.deals[0].stage).toBe('qualified')
    })
  })

  describe('deleteDeal', () => {
    it('should delete deal successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const existingDeal = DealFactory.build()

      dealsStore.deals = [existingDeal]

      vi.mocked(DealsService.deleteDeal).mockResolvedValue({
        error: null
      })

      vi.mocked(DealsService.getPipelineMetrics).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await dealsStore.deleteDeal(existingDeal.id)

      expect(DealsService.deleteDeal).toHaveBeenCalledWith(existingDeal.id)
      expect(result.error).toBeNull()
      expect(dealsStore.deals).toHaveLength(0)
    })
  })

  describe('pipeline management', () => {
    it('should return correct stage order', () => {
      const stageOrder = dealsStore.getStageOrder()
      expect(stageOrder).toEqual(Object.values(DEAL_STAGES))
    })

    it('should get next stage correctly', () => {
      expect(dealsStore.getNextStage('lead')).toBe('qualified')
      expect(dealsStore.getNextStage('qualified')).toBe('proposal')
      expect(dealsStore.getNextStage('closed_lost')).toBeNull()
    })

    it('should get previous stage correctly', () => {
      expect(dealsStore.getPreviousStage('qualified')).toBe('lead')
      expect(dealsStore.getPreviousStage('proposal')).toBe('qualified')
      expect(dealsStore.getPreviousStage('lead')).toBeNull()
    })
  })

  describe('searchDeals', () => {
    it('should search deals successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const searchResults = DealFactory.buildMany(2)

      vi.mocked(DealsService.searchDeals).mockResolvedValue({
        data: searchResults,
        error: null
      })

      const result = await dealsStore.searchDeals('test query', 10)

      expect(DealsService.searchDeals).toHaveBeenCalledWith('test query', 10)
      expect(result.data).toEqual(searchResults)
    })
  })

  describe('bulkUpdateStage', () => {
    it('should bulk update stage successfully', async () => {
      const { DealsService } = await import('@/services/dealsService')
      const deals = DealFactory.buildMany(3)
      const updatedDeals = deals.map(d => ({ ...d, stage: 'qualified' as const }))

      dealsStore.deals = deals

      vi.mocked(DealsService.bulkUpdateStage).mockResolvedValue({
        data: updatedDeals,
        error: null
      })

      vi.mocked(DealsService.getPipelineMetrics).mockResolvedValue({
        data: null,
        error: null
      })

      const dealIds = deals.map(d => d.id)
      const result = await dealsStore.bulkUpdateStage(dealIds, 'qualified')

      expect(DealsService.bulkUpdateStage).toHaveBeenCalledWith(dealIds, 'qualified')
      expect(result.data).toEqual(updatedDeals)
      expect(dealsStore.deals.every(d => d.stage === 'qualified')).toBe(true)
    })
  })
})