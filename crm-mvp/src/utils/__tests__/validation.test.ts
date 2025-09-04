import { describe, it, expect } from 'vitest'
import { validateContact, validateActivity, contactSchema, activitySchema } from '../validation'
import { CONTACT_STATUSES, ACTIVITY_TYPES } from '../constants'

describe('Validation Utils', () => {
  describe('contactSchema', () => {
    it('should validate a valid contact', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        status: CONTACT_STATUSES.LEAD,
        tags: ['vip', 'enterprise'],
        notes: 'Important client'
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validContact)
      }
    })

    it('should validate minimal contact with required fields only', () => {
      const minimalContact = {
        name: 'Jane Smith',
        status: CONTACT_STATUSES.CUSTOMER
      }

      const result = contactSchema.safeParse(minimalContact)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Jane Smith')
        expect(result.data.status).toBe(CONTACT_STATUSES.CUSTOMER)
        expect(result.data.tags).toEqual([])
      }
    })

    it('should reject contact without name', () => {
      const invalidContact = {
        email: 'test@example.com',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name'])
        expect(result.error.issues[0].message).toContain('expected string')
      }
    })

    it('should reject contact with empty name', () => {
      const invalidContact = {
        name: '',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required')
      }
    })

    it('should reject contact with name too long', () => {
      const invalidContact = {
        name: 'a'.repeat(101),
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be less than 100 characters')
      }
    })

    it('should reject contact with invalid email', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address')
      }
    })

    it('should accept empty string for optional email', () => {
      const validContact = {
        name: 'John Doe',
        email: '',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })

    it('should reject contact with invalid status', () => {
      const invalidContact = {
        name: 'John Doe',
        status: 'invalid-status'
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
    })

    it('should reject contact without status', () => {
      const invalidContact = {
        name: 'John Doe'
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
    })

    it('should validate all contact statuses', () => {
      Object.values(CONTACT_STATUSES).forEach(status => {
        const contact = {
          name: 'Test Contact',
          status
        }

        const result = contactSchema.safeParse(contact)
        expect(result.success).toBe(true)
      })
    })

    it('should trim whitespace from name', () => {
      const contact = {
        name: '  John Doe  ',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(contact)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Doe')
      }
    })

    it('should validate phone number length', () => {
      const invalidContact = {
        name: 'John Doe',
        phone: '+1234567890123456789012345',
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Phone number must be less than 20 characters')
      }
    })

    it('should validate company name length', () => {
      const invalidContact = {
        name: 'John Doe',
        company: 'a'.repeat(101),
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Company name must be less than 100 characters')
      }
    })

    it('should validate notes length', () => {
      const invalidContact = {
        name: 'John Doe',
        notes: 'a'.repeat(1001),
        status: CONTACT_STATUSES.LEAD
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Notes must be less than 1000 characters')
      }
    })

    it('should validate tags array', () => {
      const validContact = {
        name: 'John Doe',
        status: CONTACT_STATUSES.LEAD,
        tags: ['tag1', 'tag2', 'tag3']
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual(['tag1', 'tag2', 'tag3'])
      }
    })
  })

  describe('activitySchema', () => {
    it('should validate a valid activity', () => {
      const validActivity = {
        type: ACTIVITY_TYPES.CALL,
        subject: 'Follow-up call',
        description: 'Discuss proposal details',
        scheduled_at: '2024-12-01T10:00:00Z'
      }

      const result = activitySchema.safeParse(validActivity)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validActivity)
      }
    })

    it('should validate minimal activity with type only', () => {
      const minimalActivity = {
        type: ACTIVITY_TYPES.NOTE
      }

      const result = activitySchema.safeParse(minimalActivity)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe(ACTIVITY_TYPES.NOTE)
      }
    })

    it('should reject activity with invalid type', () => {
      const invalidActivity = {
        type: 'invalid-type'
      }

      const result = activitySchema.safeParse(invalidActivity)
      expect(result.success).toBe(false)
    })

    it('should reject activity without type', () => {
      const invalidActivity = {
        subject: 'Test subject'
      }

      const result = activitySchema.safeParse(invalidActivity)
      expect(result.success).toBe(false)
    })

    it('should validate all activity types', () => {
      Object.values(ACTIVITY_TYPES).forEach(type => {
        const activity = {
          type
        }

        const result = activitySchema.safeParse(activity)
        expect(result.success).toBe(true)
      })
    })

    it('should validate subject length', () => {
      const invalidActivity = {
        type: ACTIVITY_TYPES.CALL,
        subject: 'a'.repeat(201)
      }

      const result = activitySchema.safeParse(invalidActivity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Subject must be less than 200 characters')
      }
    })

    it('should validate description length', () => {
      const invalidActivity = {
        type: ACTIVITY_TYPES.CALL,
        description: 'a'.repeat(1001)
      }

      const result = activitySchema.safeParse(invalidActivity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be less than 1000 characters')
      }
    })

    it('should accept empty strings for optional fields', () => {
      const validActivity = {
        type: ACTIVITY_TYPES.EMAIL,
        subject: '',
        description: '',
        scheduled_at: ''
      }

      const result = activitySchema.safeParse(validActivity)
      expect(result.success).toBe(true)
    })

    it('should validate datetime format', () => {
      const invalidActivity = {
        type: ACTIVITY_TYPES.MEETING,
        scheduled_at: 'invalid-date'
      }

      const result = activitySchema.safeParse(invalidActivity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid date and time')
      }
    })

    it('should accept valid ISO datetime', () => {
      const validActivity = {
        type: ACTIVITY_TYPES.MEETING,
        scheduled_at: '2024-12-01T14:30:00.000Z'
      }

      const result = activitySchema.safeParse(validActivity)
      expect(result.success).toBe(true)
    })
  })

  describe('validateContact function', () => {
    it('should return success for valid contact', () => {
      const validContact = {
        name: 'John Doe',
        status: CONTACT_STATUSES.LEAD
      }

      const result = validateContact(validContact)
      expect(result.success).toBe(true)
    })

    it('should return error for invalid contact', () => {
      const invalidContact = {
        name: '',
        status: 'invalid'
      }

      const result = validateContact(invalidContact)
      expect(result.success).toBe(false)
    })
  })

  describe('validateActivity function', () => {
    it('should return success for valid activity', () => {
      const validActivity = {
        type: ACTIVITY_TYPES.CALL
      }

      const result = validateActivity(validActivity)
      expect(result.success).toBe(true)
    })

    it('should return error for invalid activity', () => {
      const invalidActivity = {
        type: 'invalid'
      }

      const result = validateActivity(invalidActivity)
      expect(result.success).toBe(false)
    })
  })
})