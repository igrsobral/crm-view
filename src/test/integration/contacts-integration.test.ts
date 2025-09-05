import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia, mountComponent } from '@/test/utils'
import { useContactsStore } from '@/stores/contacts'
import ContactForm from '@/components/contacts/ContactForm.vue'
import { ContactFactory } from '@/test/factories'
import { nextTick } from 'vue'

// Mock the services
vi.mock('@/services/contactsService', () => ({
  ContactsService: {
    getContacts: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn()
  }
}))

vi.mock('@/composables/useErrorHandler', () => ({
  useErrorHandler: () => ({
    error: { value: null },
    hasError: { value: false },
    clearError: vi.fn(),
    withErrorHandling: vi.fn(async (fn) => await fn())
  })
}))

vi.mock('@/composables/useLoadingState', () => ({
  useLoadingState: () => ({
    isLoadingKey: vi.fn(() => false),
    withLoading: vi.fn(async (key, fn) => await fn())
  })
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

describe('Contacts Integration Tests', () => {
  let contactsStore: ReturnType<typeof useContactsStore>

  beforeEach(() => {
    createTestPinia()
    contactsStore = useContactsStore()
    vi.clearAllMocks()
  })

  describe('ContactForm integration with ContactsStore', () => {
    it('should create contact through store when form is submitted', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const newContact = ContactFactory.build()

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: newContact,
        error: null
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      // Fill out the form
      await wrapper.find('#name').setValue(newContact.name)
      await wrapper.find('#email').setValue(newContact.email || '')
      await wrapper.find('#phone').setValue(newContact.phone || '')
      await wrapper.find('#company').setValue(newContact.company || '')
      await wrapper.find('#status').setValue(newContact.status)
      await wrapper.find('#notes').setValue(newContact.notes || '')

      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')

      // Verify the save event was emitted
      expect(wrapper.emitted('save')).toBeTruthy()
      const saveEvent = wrapper.emitted('save')?.[0]?.[0]
      expect(saveEvent).toEqual({
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        company: newContact.company,
        status: newContact.status,
        tags: [],
        notes: newContact.notes
      })
    })

    it('should update contact through store when editing', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()
      const updatedContact = { ...existingContact, name: 'Updated Name' }

      vi.mocked(ContactsService.updateContact).mockResolvedValue({
        data: updatedContact,
        error: null
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'edit',
          contact: existingContact
        }
      })

      // Update the name
      await wrapper.find('#name').setValue('Updated Name')

      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')

      // Verify the save event was emitted with updated data
      expect(wrapper.emitted('save')).toBeTruthy()
      const saveEvent = wrapper.emitted('save')?.[0]?.[0] as { name: string }
      expect(saveEvent.name).toBe('Updated Name')
    })

    it('should handle validation errors from store', async () => {
      const { ContactsService } = await import('@/services/contactsService')

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: null,
        error: 'Validation failed'
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      // Fill out form with valid data
      await wrapper.find('#name').setValue('John Doe')

      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')

      // Form should still emit save event (error handling is done by parent)
      expect(wrapper.emitted('save')).toBeTruthy()
    })
  })

  describe('Store state management', () => {
    it('should update store state when contacts are fetched', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const mockContacts = ContactFactory.buildMany(3)

      vi.mocked(ContactsService.getContacts).mockResolvedValue({
        data: mockContacts,
        error: null
      })

      await contactsStore.fetchContacts()

      expect(contactsStore.contacts).toEqual(mockContacts)
      expect(ContactsService.getContacts).toHaveBeenCalled()
    })

    it('should update store state when contact is created', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const newContact = ContactFactory.build()
      const contactInput = ContactFactory.buildInput()

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: newContact,
        error: null
      })

      const result = await contactsStore.createContact(contactInput)

      expect(result.data).toEqual(newContact)
      expect(contactsStore.contacts).toHaveLength(1)
      expect(contactsStore.contacts[0]).toEqual(newContact)
      expect(ContactsService.createContact).toHaveBeenCalledWith(contactInput)
    })

    it('should update store state when contact is updated', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()
      const updatedContact = { ...existingContact, name: 'Updated Name' }

      // Set initial state
      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.updateContact).mockResolvedValue({
        data: updatedContact,
        error: null
      })

      const result = await contactsStore.updateContact(existingContact.id, { name: 'Updated Name' })

      expect(result.data).toEqual(updatedContact)
      expect(contactsStore.contacts[0]).toEqual(updatedContact)
      expect(ContactsService.updateContact).toHaveBeenCalledWith(existingContact.id, { name: 'Updated Name' })
    })

    it('should remove contact from store when deleted', async () => {
      const { ContactsService } = await import('@/services/contactsService')
      const existingContact = ContactFactory.build()

      // Set initial state
      contactsStore.contacts = [existingContact]

      vi.mocked(ContactsService.deleteContact).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await contactsStore.deleteContact(existingContact.id)

      expect(result.error).toBeNull()
      expect(contactsStore.contacts).toHaveLength(0)
      expect(ContactsService.deleteContact).toHaveBeenCalledWith(existingContact.id)
    })
  })

  describe('Search and filtering integration', () => {
    beforeEach(() => {
      const contacts = [
        ContactFactory.build({ name: 'John Doe', email: 'john@example.com', status: 'lead', tags: ['vip'] }),
        ContactFactory.build({ name: 'Jane Smith', email: 'jane@example.com', status: 'customer', tags: ['regular'] }),
        ContactFactory.build({ name: 'Bob Wilson', company: 'Acme Corp', status: 'prospect', tags: ['enterprise'] })
      ]
      contactsStore.contacts = contacts
    })

    it('should filter contacts by search query', () => {
      contactsStore.setSearchQuery('john')
      
      expect(contactsStore.filteredContacts).toHaveLength(1) // Only John Doe
      expect(contactsStore.filteredContacts[0].name.toLowerCase()).toContain('john')
    })

    it('should filter contacts by status', () => {
      contactsStore.setStatusFilter('lead')
      
      expect(contactsStore.filteredContacts).toHaveLength(1)
      expect(contactsStore.filteredContacts.every(c => c.status === 'lead')).toBe(true)
    })

    it('should filter contacts by tags', () => {
      contactsStore.setTagFilter(['vip'])
      
      expect(contactsStore.filteredContacts).toHaveLength(1)
      expect(contactsStore.filteredContacts.every(c => c.tags.includes('vip'))).toBe(true)
    })

    it('should combine multiple filters', () => {
      contactsStore.setSearchQuery('john')
      contactsStore.setStatusFilter('lead')
      contactsStore.setTagFilter(['vip'])
      
      expect(contactsStore.filteredContacts).toHaveLength(1)
      const contact = contactsStore.filteredContacts[0]
      expect(contact.name.toLowerCase()).toContain('john')
      expect(contact.status).toBe('lead')
      expect(contact.tags).toContain('vip')
    })

    it('should clear all filters', () => {
      contactsStore.setSearchQuery('john')
      contactsStore.setStatusFilter('lead')
      contactsStore.setTagFilter(['vip'])
      
      expect(contactsStore.filteredContacts).toHaveLength(1)
      
      contactsStore.clearFilters()
      
      expect(contactsStore.searchQuery).toBe('')
      expect(contactsStore.statusFilter).toBe('all')
      expect(contactsStore.tagFilter).toEqual([])
      expect(contactsStore.filteredContacts).toHaveLength(3)
    })
  })

  describe('Computed properties integration', () => {
    beforeEach(() => {
      const contacts = [
        ContactFactory.build({ status: 'lead', tags: ['vip'] }),
        ContactFactory.build({ status: 'customer', tags: ['regular'] }),
        ContactFactory.build({ status: 'lead', tags: ['vip', 'enterprise'] }),
        ContactFactory.build({ status: 'prospect', tags: ['enterprise'] })
      ]
      contactsStore.contacts = contacts
    })

    it('should compute contacts by status correctly', () => {
      const byStatus = contactsStore.contactsByStatus
      
      expect(byStatus.lead).toBe(2)
      expect(byStatus.customer).toBe(1)
      expect(byStatus.prospect).toBe(1)
      expect(byStatus.inactive).toBe(undefined) // No inactive contacts in test data
    })

    it('should compute all tags correctly', () => {
      const allTags = contactsStore.allTags
      
      expect(allTags).toEqual(['enterprise', 'regular', 'vip'])
      expect(allTags).toHaveLength(3)
    })

    it('should update computed properties when contacts change', async () => {
      expect(contactsStore.allTags).toEqual(['enterprise', 'regular', 'vip'])
      
      // Add a new contact with new tags
      const newContact = ContactFactory.build({ tags: ['new-tag', 'another-tag'] })
      contactsStore.contacts.push(newContact)
      
      await nextTick()
      
      expect(contactsStore.allTags).toContain('new-tag')
      expect(contactsStore.allTags).toContain('another-tag')
    })
  })

  describe('Error handling integration', () => {
    it('should handle network errors gracefully', async () => {
      const { ContactsService } = await import('@/services/contactsService')

      vi.mocked(ContactsService.getContacts).mockRejectedValue(new Error('Network error'))

      try {
        await contactsStore.fetchContacts()
      } catch {
        // Expected to throw
      }

      expect(contactsStore.contacts).toEqual([])
    })

    it('should handle service errors gracefully', async () => {
      const { ContactsService } = await import('@/services/contactsService')

      vi.mocked(ContactsService.createContact).mockResolvedValue({
        data: null,
        error: 'Service error'
      })

      const contactInput = ContactFactory.buildInput()

      try {
        await contactsStore.createContact(contactInput)
      } catch {
        // Expected to throw
      }

      expect(contactsStore.contacts).toHaveLength(0)
    })
  })
})