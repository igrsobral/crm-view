import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountComponent } from '@/test/utils'
import ContactForm from '../ContactForm.vue'
import { ContactFactory } from '@/test/factories'
import { nextTick } from 'vue'

vi.mock('@/stores/contacts', () => ({
  useContactsStore: () => ({
    allTags: ['vip', 'enterprise', 'regular']
  })
}))

describe('ContactForm', () => {
  describe('create mode', () => {
    it('should render create form correctly', () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      expect(wrapper.find('h2').text()).toBe('Add New Contact')
      expect(wrapper.find('button[type="submit"]').text()).toContain('Create Contact')
    })

    it('should have empty initial form data', () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      expect(wrapper.find('#name').element.value).toBe('')
      expect(wrapper.find('#email').element.value).toBe('')
      expect(wrapper.find('#phone').element.value).toBe('')
      expect(wrapper.find('#company').element.value).toBe('')
      expect(wrapper.find('#status').element.value).toBe('lead')
      expect(wrapper.find('#notes').element.value).toBe('')
    })

    it('should emit save event with form data on submit', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('#name').setValue('John Doe')
      await wrapper.find('#email').setValue('john@example.com')
      await wrapper.find('#phone').setValue('+1234567890')
      await wrapper.find('#company').setValue('Acme Corp')
      await wrapper.find('#status').setValue('customer')
      await wrapper.find('#notes').setValue('Test notes')

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.emitted('save')).toBeTruthy()
      const saveEvent = wrapper.emitted('save')?.[0]?.[0]
      expect(saveEvent).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        status: 'customer',
        tags: [],
        notes: 'Test notes'
      })
    })

    it('should emit cancel event when cancel button is clicked', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('button[type="button"]').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('edit mode', () => {
    it('should render edit form correctly', () => {
      const contact = ContactFactory.build()
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'edit',
          contact
        }
      })

      expect(wrapper.find('h2').text()).toBe('Edit Contact')
      expect(wrapper.find('button[type="submit"]').text()).toContain('Update Contact')
    })

    it('should populate form with contact data', () => {
      const contact = ContactFactory.build({
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        company: 'Tech Corp',
        status: 'customer',
        tags: ['vip', 'enterprise'],
        notes: 'Important client'
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'edit',
          contact
        }
      })

      expect(wrapper.find('#name').element.value).toBe('Jane Smith')
      expect(wrapper.find('#email').element.value).toBe('jane@example.com')
      expect(wrapper.find('#phone').element.value).toBe('+9876543210')
      expect(wrapper.find('#company').element.value).toBe('Tech Corp')
      expect(wrapper.find('#status').element.value).toBe('customer')
      expect(wrapper.find('#notes').element.value).toBe('Important client')
    })

    it('should display existing tags', () => {
      const contact = ContactFactory.build({
        tags: ['vip', 'enterprise']
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'edit',
          contact
        }
      })

      const tagElements = wrapper.findAll('.bg-blue-100')
      expect(tagElements).toHaveLength(2)
      expect(tagElements[0].text()).toContain('vip')
      expect(tagElements[1].text()).toContain('enterprise')
    })
  })

  describe('form validation', () => {
    it('should show error for empty name', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.find('.text-red-600').exists()).toBe(true)
      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('should show error for invalid email', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('#name').setValue('John Doe')
      await wrapper.find('#email').setValue('invalid-email')
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.find('.text-red-600').exists()).toBe(true)
      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('should clear validation errors when field is corrected', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      // Trigger validation error
      await wrapper.find('form').trigger('submit.prevent')
      expect(wrapper.find('.text-red-600').exists()).toBe(true)

      // Fix the error
      await wrapper.find('#name').setValue('John Doe')
      await nextTick()

      // Error should be cleared
      expect(wrapper.find('.text-red-600').exists()).toBe(false)
    })
  })

  describe('tag management', () => {
    it('should add tag when Enter is pressed', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      const tagInput = wrapper.find('input[placeholder="Add tags..."]')
      await tagInput.setValue('new-tag')
      await tagInput.trigger('keydown', { key: 'Enter' })

      expect(wrapper.find('.bg-blue-100').text()).toContain('new-tag')
    })

    it('should add tag when comma is pressed', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      const tagInput = wrapper.find('input[placeholder="Add tags..."]')
      await tagInput.setValue('new-tag')
      await tagInput.trigger('keydown', { key: ',' })

      expect(wrapper.find('.bg-blue-100').text()).toContain('new-tag')
    })

    it('should remove tag when remove button is clicked', async () => {
      const contact = ContactFactory.build({
        tags: ['test-tag']
      })

      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'edit',
          contact
        }
      })

      expect(wrapper.find('.bg-blue-100').exists()).toBe(true)

      await wrapper.find('.bg-blue-100 button').trigger('click')

      expect(wrapper.find('.bg-blue-100').exists()).toBe(false)
    })

    it('should not add duplicate tags', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      const tagInput = wrapper.find('input[placeholder="Add tags..."]')
      
      // Add first tag
      await tagInput.setValue('duplicate-tag')
      await tagInput.trigger('keydown', { key: 'Enter' })
      
      // Try to add same tag again
      await tagInput.setValue('duplicate-tag')
      await tagInput.trigger('keydown', { key: 'Enter' })

      const tagElements = wrapper.findAll('.bg-blue-100')
      expect(tagElements).toHaveLength(1)
    })

    it('should show tag suggestions', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      const tagInput = wrapper.find('input[placeholder="Add tags..."]')
      await tagInput.trigger('focus')

      // Should show suggestions dropdown
      expect(wrapper.find('.absolute.z-10').exists()).toBe(true)
    })
  })

  describe('loading states', () => {
    it('should show loading state during submission', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('#name').setValue('John Doe')
      
      // Mock the submission to be slow
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Check if submit button shows loading state
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('character limits', () => {
    it('should show character count for notes', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('#notes').setValue('Test notes')

      expect(wrapper.text()).toContain('10/1000 characters')
    })

    it('should validate notes length', async () => {
      const wrapper = mountComponent(ContactForm, {
        props: {
          mode: 'create'
        }
      })

      await wrapper.find('#name').setValue('John Doe')
      await wrapper.find('#notes').setValue('a'.repeat(1001))
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.find('.text-red-600').exists()).toBe(true)
      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })
})