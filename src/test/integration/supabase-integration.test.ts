import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContactsService } from '@/services/contactsService'
import { DealsService } from '@/services/dealsService'
import { ActivitiesService } from '@/services/activitiesService'
import { ContactFactory, DealFactory, ActivityFactory } from '@/test/factories'

// Mock Supabase client
vi.mock('@/utils/supabase', () => {
  const mockQuery = {
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
  }
  
  return {
    supabase: {
      from: vi.fn(() => mockQuery)
    },
    isSupabaseConfigured: vi.fn(() => true)
  }
})

describe('Supabase Integration Tests', () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>
    auth?: {
      getUser: ReturnType<typeof vi.fn>
    }
  }
  let mockQuery: {
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    neq: ReturnType<typeof vi.fn>
    gt: ReturnType<typeof vi.fn>
    gte: ReturnType<typeof vi.fn>
    lt: ReturnType<typeof vi.fn>
    lte: ReturnType<typeof vi.fn>
    like: ReturnType<typeof vi.fn>
    ilike: ReturnType<typeof vi.fn>
    in: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
    single: ReturnType<typeof vi.fn>
    maybeSingle: ReturnType<typeof vi.fn>
    or: ReturnType<typeof vi.fn>
    not: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked supabase client
    const supabaseModule = await import('@/utils/supabase')
    mockSupabase = supabaseModule.supabase as unknown as {
      from: ReturnType<typeof vi.fn>
      auth?: {
        getUser: ReturnType<typeof vi.fn>
      }
    }
    
    // Create a fresh mock query for each test
    mockQuery = {
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
      maybeSingle: vi.fn(),
      or: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis()
    }
    
    mockSupabase.from.mockReturnValue(mockQuery)
  })

  describe('ContactsService', () => {
    it('should fetch contacts with proper query', async () => {
      const mockContacts = ContactFactory.buildMany(3)
      
      mockQuery.order.mockResolvedValue({
        data: mockContacts,
        error: null
      })

      const result = await ContactsService.getContacts()

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toEqual(mockContacts)
      expect(result.error).toBeNull()
    })

    it('should create contact with proper data', async () => {
      const contactInput = ContactFactory.buildInput()
      const createdContact = ContactFactory.build(contactInput)

      mockQuery.single.mockResolvedValue({
        data: createdContact,
        error: null
      })

      // Mock auth.getUser for create contact
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null
        })
      }
      
      // Add auth to the mocked supabase
      mockSupabase.auth = mockAuth

      const result = await ContactsService.createContact(contactInput)

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        name: contactInput.name,
        email: contactInput.email,
        phone: contactInput.phone,
        company: contactInput.company,
        status: contactInput.status,
        tags: contactInput.tags,
        notes: contactInput.notes
      }])
      expect(mockQuery.select).toHaveBeenCalledWith()
      expect(result.data).toEqual(createdContact)
    })

    it('should update contact with proper data', async () => {
      const contactId = 'contact-1'
      const updates = { name: 'Updated Name' }
      const updatedContact = ContactFactory.build({ id: contactId, ...updates })

      mockQuery.single.mockResolvedValue({
        data: updatedContact,
        error: null
      })

      const result = await ContactsService.updateContact(contactId, updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', contactId)
      expect(result.data).toEqual(updatedContact)
    })

    it('should delete contact with proper ID', async () => {
      const contactId = 'contact-1'

      mockQuery.eq.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await ContactsService.deleteContact(contactId)

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', contactId)
      expect(result.error).toBeNull()
    })

    it('should handle Supabase errors properly', async () => {
      const mockError = new Error('Database error')

      mockQuery.order.mockRejectedValue(mockError)

      const result = await ContactsService.getContacts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database error')
    })

    it('should search contacts with proper query', async () => {
      const searchQuery = 'john'
      const mockContacts = ContactFactory.buildMany(2)

      mockQuery.order.mockResolvedValue({
        data: mockContacts,
        error: null
      })

      const result = await ContactsService.searchContacts(searchQuery, 10)

      expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.or).toHaveBeenCalledWith(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(result.data).toEqual(mockContacts)
    })
  })

  describe('DealsService', () => {
    it('should fetch deals with contact information', async () => {
      const mockDeals = DealFactory.buildMany(3)

      mockQuery.order.mockResolvedValue({
        data: mockDeals,
        error: null
      })

      const result = await DealsService.getDeals()

      expect(mockSupabase.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.select).toHaveBeenCalledWith(`
          *,
          contact:contacts(*)
        `)
      expect(result.data).toEqual(mockDeals)
    })

    it('should create deal with proper data', async () => {
      const dealInput = DealFactory.buildInput()
      const createdDeal = DealFactory.build(dealInput)

      mockQuery.single.mockResolvedValue({
        data: createdDeal,
        error: null
      })

      // Mock auth.getUser for create deal
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null
        })
      }
      
            mockSupabase.auth = mockAuth

      const result = await DealsService.createDeal(dealInput)

      expect(mockSupabase.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        contact_id: dealInput.contact_id,
        name: dealInput.name,
        value: dealInput.value || null,
        stage: dealInput.stage || 'lead',
        expected_close_date: dealInput.expected_close_date || null,
        notes: dealInput.notes || null
      }])
      expect(result.data).toEqual(createdDeal)
    })

    it('should move deal to new stage', async () => {
      const dealId = 'deal-1'
      const newStage = 'qualified'
      const updatedDeal = DealFactory.build({ id: dealId, stage: newStage })

      mockQuery.single.mockResolvedValue({
        data: updatedDeal,
        error: null
      })

      const result = await DealsService.moveDealToStage(dealId, newStage)

      expect(mockSupabase.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.update).toHaveBeenCalledWith({ stage: newStage })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', dealId)
      expect(result.data).toEqual(updatedDeal)
    })

    it('should fetch overdue deals with proper date filter', async () => {
      const mockOverdueDeals = DealFactory.buildMany(2)

      mockQuery.order.mockResolvedValue({
        data: mockOverdueDeals,
        error: null
      })

      const result = await DealsService.getOverdueDeals()

      expect(mockSupabase.from).toHaveBeenCalledWith('deals')
      expect(mockQuery.select).toHaveBeenCalledWith(`
          *,
          contact:contacts(*)
        `)
      expect(mockQuery.lt).toHaveBeenCalledWith('expected_close_date', expect.any(String))
      expect(mockQuery.not).toHaveBeenCalledWith('stage', 'in', '(closed_won,closed_lost)')
      expect(result.data).toEqual(mockOverdueDeals)
    })
  })

  describe('ActivitiesService', () => {
    it('should fetch activities with related data', async () => {
      const mockActivities = ActivityFactory.buildMany(3)

      mockQuery.order.mockResolvedValue({
        data: mockActivities,
        error: null
      })

      const result = await ActivitiesService.getActivities()

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.select).toHaveBeenCalledWith(`
          *,
          contact:contacts(*),
          deal:deals(*)
        `)
      expect(result.data).toEqual(mockActivities)
    })

    it('should create activity with proper data', async () => {
      const activityInput = ActivityFactory.buildInput()
      const createdActivity = ActivityFactory.build(activityInput)

      mockQuery.single.mockResolvedValue({
        data: createdActivity,
        error: null
      })

      // Mock auth.getUser for create activity
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null
        })
      }
      
            mockSupabase.auth = mockAuth

      const result = await ActivitiesService.createActivity(activityInput)

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        contact_id: activityInput.contact_id || null,
        deal_id: activityInput.deal_id || null,
        type: activityInput.type,
        subject: activityInput.subject || null,
        description: activityInput.description || null,
        scheduled_at: activityInput.scheduled_at || null,
        completed: false
      }])
      expect(result.data).toEqual(createdActivity)
    })

    it('should fetch upcoming activities with date filter', async () => {
      const mockUpcomingActivities = ActivityFactory.buildMany(5)

      mockQuery.order.mockResolvedValue({
        data: mockUpcomingActivities,
        error: null
      })

      const result = await ActivitiesService.getUpcomingActivities(5)

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.not).toHaveBeenCalledWith('scheduled_at', 'is', null)
      expect(mockQuery.gte).toHaveBeenCalledWith('scheduled_at', expect.any(String))
      expect(mockQuery.lte).toHaveBeenCalledWith('scheduled_at', expect.any(String))
      expect(mockQuery.eq).toHaveBeenCalledWith('completed', false)
      expect(mockQuery.limit).toHaveBeenCalledWith(5)
      expect(result.data).toEqual(mockUpcomingActivities)
    })

    it('should fetch overdue activities with date filter', async () => {
      const mockOverdueActivities = ActivityFactory.buildMany(3)

      mockQuery.order.mockResolvedValue({
        data: mockOverdueActivities,
        error: null
      })

      const result = await ActivitiesService.getOverdueActivities(3)

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.not).toHaveBeenCalledWith('scheduled_at', 'is', null)
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
      
      mockQuery.single.mockResolvedValue({
        data: scheduledActivity,
        error: null
      })

      // Mock auth.getUser for create activity
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null
        })
      }
      
            mockSupabase.auth = mockAuth

      const result = await ActivitiesService.scheduleFollowUp(
        contactId,
        type,
        scheduledAt,
        subject,
        description
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        contact_id: contactId,
        deal_id: null,
        type,
        subject,
        description,
        scheduled_at: scheduledAt,
        completed: false
      }])
      expect(result.data).toEqual(scheduledActivity)
    })

    it('should bulk complete activities', async () => {
      const activityIds = ['activity-1', 'activity-2', 'activity-3']
      const completedActivities = ActivityFactory.buildMany(3, { completed: true })

      mockQuery.select.mockResolvedValue({
        data: completedActivities,
        error: null
      })

      const result = await ActivitiesService.bulkCompleteActivities(activityIds)

      expect(mockSupabase.from).toHaveBeenCalledWith('activities')
      expect(mockQuery.update).toHaveBeenCalledWith({ completed: true })
      expect(mockQuery.in).toHaveBeenCalledWith('id', activityIds)
      expect(result.data).toEqual(completedActivities)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockQuery.order.mockRejectedValue(new Error('Network error'))

      const result = await ContactsService.getContacts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Network error')
    })

    it('should handle Supabase constraint violations', async () => {
      const mockError = new Error('duplicate key value violates unique constraint')
      
      mockQuery.single.mockRejectedValue(mockError)

      // Mock auth.getUser
      const mockAuth = {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null
        })
      }
      
            mockSupabase.auth = mockAuth

      const contactInput = ContactFactory.buildInput()
      const result = await ContactsService.createContact(contactInput)

      expect(result.data).toBeNull()
      expect(result.error).toBe('duplicate key value violates unique constraint')
    })

    it('should handle missing records', async () => {
      const mockError = new Error('No rows returned')
      
      mockQuery.single.mockRejectedValue(mockError)

      const result = await ContactsService.getContactById('non-existent-id')

      expect(result.data).toBeNull()
      expect(result.error).toBe('No rows returned')
    })
  })
})