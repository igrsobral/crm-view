import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContactsService } from '@/services/contactsService'
import { DealsService } from '@/services/dealsService'
import { ActivitiesService } from '@/services/activitiesService'
import { ContactFactory, DealFactory, ActivityFactory } from '@/test/factories'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn()
  }))
}

vi.mock('@/utils/supabase', () => ({
  supabase: mockSupabaseClient,
  isSupabaseConfigured: vi.fn(() => true)
}))

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ContactsService', () => {
    it('should fetch contacts with proper query', async () => {
      const mockContacts = ContactFactory.buildMany(3)
      const mockQuery = mockSupabaseClient.from().select()
      
      vi.mocked(mockQuery.order).mockResolvedValue({
        data: mockContacts,
        error: null
      })

      const result = await ContactsService.getContacts()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toEqual(mockContacts)
      expect(result.error).toBeNull()
    })

    it('should create contact with proper data', async () => {
      const contactInput = ContactFactory.buildInput()
      const createdContact = ContactFactory.build(contactInput)
      const mockQuery = mockSupabaseClient.from().insert()

      vi.mocked(mockQuery.select).mockResolvedValue({
        data: [createdContact],
        error: null
      })

      const result = await ContactsService.createContact(contactInput)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.insert).toHaveBeenCalledWith(contactInput)
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(result.data).toEqual(createdContact)
    })

    it('should update contact with proper data', async () => {
      const contactId = 'contact-1'
      const updates = { name: 'Updated Name' }
      const updatedContact = ContactFactory.build({ id: contactId, ...updates })
      const mockQuery = mockSupabaseClient.from().update()

      vi.mocked(mockQuery.single).mockResolvedValue({
        data: updatedContact,
        error: null
      })

      const result = await ContactsService.updateContact(contactId, updates)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', contactId)
      expect(result.data).toEqual(updatedContact)
    })

    it('should delete contact with proper ID', async () => {
      const contactId = 'contact-1'
      const mockQuery = mockSupabaseClient.from().delete()

      vi.mocked(mockQuery.eq).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await ContactsService.deleteContact(contactId)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', contactId)
      expect(result.error).toBeNull()
    })

    it('should handle Supabase errors properly', async () => {
      const mockError = { message: 'Database error', code: '23505' }
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.order).mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await ContactsService.getContacts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database error')
    })

    it('should search contacts with proper query', async () => {
      const searchQuery = 'john'
      const mockContacts = ContactFactory.buildMany(2)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.limit).mockResolvedValue({
        data: mockContacts,
        error: null
      })

      const result = await ContactsService.searchContacts(searchQuery, 10)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', `%${searchQuery}%`)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(result.data).toEqual(mockContacts)
    })
  })

  describe('DealsService', () => {
    it('should fetch deals with contact information', async () => {
      const mockDeals = DealFactory.buildMany(3)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.order).mockResolvedValue({
        data: mockDeals,
        error: null
      })

      const result = await DealsService.getDeals()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        contact:contacts(id, name, email, company)
      `)
      expect(result.data).toEqual(mockDeals)
    })

    it('should create deal with proper data', async () => {
      const dealInput = DealFactory.buildInput()
      const createdDeal = DealFactory.build(dealInput)
      const mockQuery = mockSupabaseClient.from().insert()

      vi.mocked(mockQuery.single).mockResolvedValue({
        data: createdDeal,
        error: null
      })

      const result = await DealsService.createDeal(dealInput)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.insert).toHaveBeenCalledWith(dealInput)
      expect(result.data).toEqual(createdDeal)
    })

    it('should move deal to new stage', async () => {
      const dealId = 'deal-1'
      const newStage = 'qualified'
      const updatedDeal = DealFactory.build({ id: dealId, stage: newStage })
      const mockQuery = mockSupabaseClient.from().update()

      vi.mocked(mockQuery.single).mockResolvedValue({
        data: updatedDeal,
        error: null
      })

      const result = await DealsService.moveDealToStage(dealId, newStage)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.update).toHaveBeenCalledWith({ stage: newStage })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', dealId)
      expect(result.data).toEqual(updatedDeal)
    })

    it('should fetch overdue deals with proper date filter', async () => {
      const mockOverdueDeals = DealFactory.buildMany(2)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.order).mockResolvedValue({
        data: mockOverdueDeals,
        error: null
      })

      const result = await DealsService.getOverdueDeals()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        contact:contacts(id, name, email, company)
      `)
      expect(mockQuery.lt).toHaveBeenCalledWith('expected_close_date', expect.any(String))
      expect(mockQuery.neq).toHaveBeenCalledWith('stage', 'closed_won')
      expect(mockQuery.neq).toHaveBeenCalledWith('stage', 'closed_lost')
      expect(result.data).toEqual(mockOverdueDeals)
    })
  })

  describe('ActivitiesService', () => {
    it('should fetch activities with related data', async () => {
      const mockActivities = ActivityFactory.buildMany(3)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.order).mockResolvedValue({
        data: mockActivities,
        error: null
      })

      const result = await ActivitiesService.getActivities()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        contact:contacts(id, name, email, company),
        deal:deals(id, name, value, stage)
      `)
      expect(result.data).toEqual(mockActivities)
    })

    it('should create activity with proper data', async () => {
      const activityInput = ActivityFactory.buildInput()
      const createdActivity = ActivityFactory.build(activityInput)
      const mockQuery = mockSupabaseClient.from().insert()

      vi.mocked(mockQuery.single).mockResolvedValue({
        data: createdActivity,
        error: null
      })

      const result = await ActivitiesService.createActivity(activityInput)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.insert).toHaveBeenCalledWith(activityInput)
      expect(result.data).toEqual(createdActivity)
    })

    it('should fetch upcoming activities with date filter', async () => {
      const mockUpcomingActivities = ActivityFactory.buildMany(5)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.limit).mockResolvedValue({
        data: mockUpcomingActivities,
        error: null
      })

      const result = await ActivitiesService.getUpcomingActivities(5)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.gte).toHaveBeenCalledWith('scheduled_at', expect.any(String))
      expect(mockQuery.eq).toHaveBeenCalledWith('completed', false)
      expect(mockQuery.limit).toHaveBeenCalledWith(5)
      expect(result.data).toEqual(mockUpcomingActivities)
    })

    it('should fetch overdue activities with date filter', async () => {
      const mockOverdueActivities = ActivityFactory.buildMany(3)
      const mockQuery = mockSupabaseClient.from().select()

      vi.mocked(mockQuery.limit).mockResolvedValue({
        data: mockOverdueActivities,
        error: null
      })

      const result = await ActivitiesService.getOverdueActivities(3)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.lt).toHaveBeenCalledWith('scheduled_at', expect.any(String))
      expect(mockQuery.eq).toHaveBeenCalledWith('completed', false)
      expect(mockQuery.limit).toHaveBeenCalledWith(3)
      expect(result.data).toEqual(mockOverdueActivities)
    })

    it('should schedule follow-up with proper data', async () => {
      const contactId = 'contact-1'
      const type = 'call'
      const scheduledAt = new Date().toISOString()
      const subject = 'Follow-up call'
      const description = 'Discuss proposal'
      
      const scheduledActivity = ActivityFactory.build({
        contact_id: contactId,
        type,
        scheduled_at: scheduledAt,
        subject,
        description
      })
      
      const mockQuery = mockSupabaseClient.from().insert()

      vi.mocked(mockQuery.single).mockResolvedValue({
        data: scheduledActivity,
        error: null
      })

      const result = await ActivitiesService.scheduleFollowUp(
        contactId,
        type,
        scheduledAt,
        subject,
        description
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        contact_id: contactId,
        deal_id: undefined,
        type,
        subject,
        description,
        scheduled_at: scheduledAt
      })
      expect(result.data).toEqual(scheduledActivity)
    })

    it('should bulk complete activities', async () => {
      const activityIds = ['activity-1', 'activity-2', 'activity-3']
      const completedActivities = ActivityFactory.buildMany(3, { completed: true })
      const mockQuery = mockSupabaseClient.from().update()

      vi.mocked(mockQuery.select).mockResolvedValue({
        data: completedActivities,
        error: null
      })

      const result = await ActivitiesService.bulkCompleteActivities(activityIds)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.update).toHaveBeenCalledWith({ completed: true })
      expect(mockQuery.in).toHaveBeenCalledWith('id', activityIds)
      expect(result.data).toEqual(completedActivities)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockQuery = mockSupabaseClient.from().select()
      vi.mocked(mockQuery.order).mockRejectedValue(new Error('Network error'))

      const result = await ContactsService.getContacts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Network error')
    })

    it('should handle Supabase constraint violations', async () => {
      const mockError = { 
        message: 'duplicate key value violates unique constraint',
        code: '23505'
      }
      const mockQuery = mockSupabaseClient.from().insert()

      vi.mocked(mockQuery.select).mockResolvedValue({
        data: null,
        error: mockError
      })

      const contactInput = ContactFactory.buildInput()
      const result = await ContactsService.createContact(contactInput)

      expect(result.data).toBeNull()
      expect(result.error).toBe('duplicate key value violates unique constraint')
    })

    it('should handle missing records', async () => {
      const mockQuery = mockSupabaseClient.from().select()
      vi.mocked(mockQuery.single).mockResolvedValue({
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      })

      const result = await ContactsService.getContactById('non-existent-id')

      expect(result.data).toBeNull()
      expect(result.error).toBe('No rows returned')
    })
  })
})