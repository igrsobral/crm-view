import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia } from '@/test/utils'
import { useContactsStore } from '../contacts'
import { ContactFactory } from '@/test/factories'

vi.mock('@/services/contactsService', () => ({
  ContactsService: {
    getContacts: vi.fn(),
    getContactById: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    searchContacts: vi.fn()
  }
}))

vi.mock('@/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    error: { value: null },
    hasError: { value: false },
    clearError: vi.fn(),
    withErrorHandling: vi.fn(async (fn) => {
      try {
        return await fn()
      } catch (error) {
        throw error
      }
    })
  })
}))

vi.mock('@/composables/useLoadingState', () => ({
  useLoadingState: () => ({
    isLoadingKey: vi.fn(() => false),
    withLoading: vi.fn((key, fn) => fn())
  })
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

describe('Contacts Store', () => {
  let contactsStore: ReturnType<typeof useContactsStore>

  beforeEach(() => {
    createTestPinia()
    contactsStore = useContactsStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(contactsStore.contacts).toEqual([])
      expect(contactsStore.searchQuery).toBe('')
      expect(contactsStore.statusFilter).toBe('all')
      expect(contactsStore.tagFilter).toEqual([])
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      const contacts = [
        ContactFactory.build({ name: 'John Doe', email: 'john@example.com', status: 'lead', tags: ['vip'] }),
        ContactFactory.build({ name: 'Jane Smith', email: 'jane@example.com', status: 'customer', tags: ['regular'] }),
        ContactFactory.build({ name: 'Bob Johnson', company: 'Acme Corp', status: 'lead', tags: ['vip', 'enterprise'] })
      ]
      contactsStore.contacts = contacts
    })

    it('should filter contacts by search query', () => {
      contactsStore.setSearchQuery('john')
      expect(contactsStore.filteredContacts).toHaveLength(2) // John Doe and Bob Johnson
    })

    it('should filter contacts by status', () => {
      contactsStore.setStatusFilter('lead')
      expect(contactsStore.filteredContacts).toHaveLength(2)
      expect(contactsStore.filteredContacts.every(c => c.status === 'lead')).toBe(true)
    })

    it('should filter contacts by tags', () => {
      contactsStore.setTagFilter(['vip'])
      expect(contactsStore.filteredContacts).toHaveLength(2)
      expect(contactsStore.filteredContacts.every(c => c.tags.includes('vip'))).toBe(true)
    })

    it('should compute contacts by status correctly', () => {
      const byStatus = contactsStore.contactsByStatus
      expect(byStatus.lead).toBe(2)
      expect(byStatus.customer).toBe(1)
    })

    it('should compute all tags correctly', () => {
      const allTags = contactsStore.allTags
      expect(allTags).toEqual(['enterprise', 'regular', 'vip'])
    })
  })

  describe('fetchContacts', () => {
    it('should fetch contacts successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const mockContacts = ContactFactory.buildMany(3)

      vi.mocked(ContactsService.getContacts).mockResolvedValue({
        data: mockContacts,
        error: null
      })

      const result = await contactsStore.fetchContacts()

      expect(ContactsService.getContacts).toHaveBeenCalled()
      expect(contactsStore.contacts).toEqual(mockContacts)
      expect(result).toEqual(mockContacts)
    })

    it('should handle fetch contacts error', async () => {
      const { ContactsService } = await import('@/services/contactsService')

      vi.mocked(ContactsService.getContacts).mockResolvedValue({
        data: null,
        error: 'Failed to fetch contacts'
      })

      try {
        await contactsStore.fetchContacts()
      } catch (error) {
        // Expected to throw
      }

      expect(contactsStore.contacts).toEqual([])
    })
  })

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const contactInput = ContactFactory.buildInput()
      const createdContact = ContactFactory.build(contactInput)

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: createdContact,
        error: null
      })

      const result = await contactsStore.createContact(contactInput)

      expect(ContactsService.createContact).toHaveBeenCalledWith(contactInput)
      expect(result.data).toEqual(createdContact)
      expect(contactsStore.contacts).toHaveLength(1)
      expect(contactsStore.contacts[0]).toEqual(createdContact)
    })

    it('should handle create contact error', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const contactInput = ContactFactory.buildInput()

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: null,
        error: 'Failed to create contact'
      })

      try {
        await contactsStore.createContact(contactInput)
      } catch (error) {
        // Expected to throw
      }

      expect(contactsStore.contacts).toHaveLength(0)
    })
  })

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()
      const updates = { name: 'Updated Name' }
      const updatedContact = { ...existingContact, ...updates }

      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.updateContact).mockResolvedValue({
        data: updatedContact,
        error: null
      })

      const result = await contactsStore.updateContact(existingContact.id, updates)

      expect(ContactsService.updateContact).toHaveBeenCalledWith(existingContact.id, updates)
      expect(result.data).toEqual(updatedContact)
      expect(contactsStore.contacts[0]).toEqual(updatedContact)
    })

    it('should handle update contact error', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()
      const updates = { name: 'Updated Name' }

      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.updateContact).mockResolvedValue({
        data: null,
        error: 'Failed to update contact'
      })

      try {
        await contactsStore.updateContact(existingContact.id, updates)
      } catch (error) {
        // Expected to throw
      }

      expect(contactsStore.contacts[0]).toEqual(existingContact) // Should remain unchanged
    })
  })

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()

      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.deleteContact).mockResolvedValue({
        error: null
      })

      const result = await contactsStore.deleteContact(existingContact.id)

      expect(ContactsService.deleteContact).toHaveBeenCalledWith(existingContact.id)
      expect(result.error).toBeNull()
      expect(contactsStore.contacts).toHaveLength(0)
    })

    it('should handle delete contact error', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()

      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.deleteContact).mockResolvedValue({
        error: 'Failed to delete contact'
      })

      try {
        await contactsStore.deleteContact(existingContact.id)
      } catch (error) {
        // Expected to throw
      }

      expect(contactsStore.contacts).toHaveLength(1) // Should remain unchanged
    })
  })

  describe('search and filter methods', () => {
    it('should set search query', () => {
      contactsStore.setSearchQuery('test query')
      expect(contactsStore.searchQuery).toBe('test query')
    })

    it('should set status filter', () => {
      contactsStore.setStatusFilter('customer')
      expect(contactsStore.statusFilter).toBe('customer')
    })

    it('should set tag filter', () => {
      contactsStore.setTagFilter(['tag1', 'tag2'])
      expect(contactsStore.tagFilter).toEqual(['tag1', 'tag2'])
    })

    it('should clear all filters', () => {
      contactsStore.setSearchQuery('test')
      contactsStore.setStatusFilter('customer')
      contactsStore.setTagFilter(['tag1'])

      contactsStore.clearFilters()

      expect(contactsStore.searchQuery).toBe('')
      expect(contactsStore.statusFilter).toBe('all')
      expect(contactsStore.tagFilter).toEqual([])
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should bulk update status successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const contacts = ContactFactory.buildMany(3)
      const updatedContacts = contacts.map(c => ({ ...c, status: 'customer' as const }))

      contactsStore.contacts = contacts

      vi.mocked(ContactsService.bulkUpdateStatus).mockResolvedValue({
        data: updatedContacts,
        error: null
      })

      const contactIds = contacts.map(c => c.id)
      const result = await contactsStore.bulkUpdateStatus(contactIds, 'customer')

      expect(ContactsService.bulkUpdateStatus).toHaveBeenCalledWith(contactIds, 'customer')
      expect(result.data).toEqual(updatedContacts)
      expect(contactsStore.contacts.every(c => c.status === 'customer')).toBe(true)
    })
  })

  describe('searchContacts', () => {
    it('should search contacts successfully', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const searchResults = ContactFactory.buildMany(2)

      vi.mocked(ContactsService.searchContacts).mockResolvedValue({
        data: searchResults,
        error: null
      })

      const result = await contactsStore.searchContacts('test query', 10)

      expect(ContactsService.searchContacts).toHaveBeenCalledWith('test query', 10)
      expect(result.data).toEqual(searchResults)
    })

    it('should handle search contacts error', async () => {
      const { ContactsService } = await import('@/services/contactsService')

      vi.mocked(ContactsService.searchContacts).mockResolvedValue({
        data: null,
        error: 'Search failed'
      })

      const result = await contactsStore.searchContacts('test query')

      expect(result.error).toBe('Search failed')
      expect(result.data).toBeNull()
    })
  })
})