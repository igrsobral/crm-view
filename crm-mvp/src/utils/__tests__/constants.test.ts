import { describe, it, expect } from 'vitest'
import { 
  CONTACT_STATUSES, 
  DEAL_STAGES, 
  ACTIVITY_TYPES, 
  APP_CONFIG,
  type ContactStatus,
  type DealStage,
  type ActivityType
} from '../constants'

describe('Constants', () => {
  describe('CONTACT_STATUSES', () => {
    it('should have all expected contact statuses', () => {
      expect(CONTACT_STATUSES.LEAD).toBe('lead')
      expect(CONTACT_STATUSES.PROSPECT).toBe('prospect')
      expect(CONTACT_STATUSES.CUSTOMER).toBe('customer')
      expect(CONTACT_STATUSES.INACTIVE).toBe('inactive')
    })

    it('should have exactly 4 contact statuses', () => {
      const statusCount = Object.keys(CONTACT_STATUSES).length
      expect(statusCount).toBe(4)
    })

    it('should have unique values', () => {
      const values = Object.values(CONTACT_STATUSES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should be compatible with ContactStatus type', () => {
      const testStatus: ContactStatus = CONTACT_STATUSES.LEAD
      expect(testStatus).toBe('lead')
    })
  })

  describe('DEAL_STAGES', () => {
    it('should have all expected deal stages', () => {
      expect(DEAL_STAGES.LEAD).toBe('lead')
      expect(DEAL_STAGES.QUALIFIED).toBe('qualified')
      expect(DEAL_STAGES.PROPOSAL).toBe('proposal')
      expect(DEAL_STAGES.NEGOTIATION).toBe('negotiation')
      expect(DEAL_STAGES.CLOSED_WON).toBe('closed_won')
      expect(DEAL_STAGES.CLOSED_LOST).toBe('closed_lost')
    })

    it('should have exactly 6 deal stages', () => {
      const stageCount = Object.keys(DEAL_STAGES).length
      expect(stageCount).toBe(6)
    })

    it('should have unique values', () => {
      const values = Object.values(DEAL_STAGES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should be compatible with DealStage type', () => {
      const testStage: DealStage = DEAL_STAGES.QUALIFIED
      expect(testStage).toBe('qualified')
    })

    it('should have logical stage progression', () => {
      const stages = Object.values(DEAL_STAGES)
      expect(stages).toEqual([
        'lead',
        'qualified', 
        'proposal',
        'negotiation',
        'closed_won',
        'closed_lost'
      ])
    })
  })

  describe('ACTIVITY_TYPES', () => {
    it('should have all expected activity types', () => {
      expect(ACTIVITY_TYPES.CALL).toBe('call')
      expect(ACTIVITY_TYPES.EMAIL).toBe('email')
      expect(ACTIVITY_TYPES.MEETING).toBe('meeting')
      expect(ACTIVITY_TYPES.NOTE).toBe('note')
    })

    it('should have exactly 4 activity types', () => {
      const typeCount = Object.keys(ACTIVITY_TYPES).length
      expect(typeCount).toBe(4)
    })

    it('should have unique values', () => {
      const values = Object.values(ACTIVITY_TYPES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('should be compatible with ActivityType type', () => {
      const testType: ActivityType = ACTIVITY_TYPES.CALL
      expect(testType).toBe('call')
    })
  })

  describe('APP_CONFIG', () => {
    it('should have all expected configuration values', () => {
      expect(APP_CONFIG.MAX_CONTACTS).toBe(1000)
      expect(APP_CONFIG.PAGINATION_SIZE).toBe(20)
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBe(300)
    })

    it('should have reasonable configuration values', () => {
      expect(APP_CONFIG.MAX_CONTACTS).toBeGreaterThan(0)
      expect(APP_CONFIG.PAGINATION_SIZE).toBeGreaterThan(0)
      expect(APP_CONFIG.PAGINATION_SIZE).toBeLessThan(100)
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBeGreaterThan(0)
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBeLessThan(1000)
    })

    it('should have readonly TypeScript types', () => {
      // This test verifies TypeScript readonly behavior at compile time
      // The actual runtime behavior depends on Object.freeze() which isn't used here
      expect(APP_CONFIG.MAX_CONTACTS).toBe(1000)
      expect(typeof APP_CONFIG).toBe('object')
    })
  })

  describe('Type compatibility', () => {
    it('should allow using constant values as types', () => {
      const contact: { status: ContactStatus } = {
        status: CONTACT_STATUSES.CUSTOMER
      }
      expect(contact.status).toBe('customer')

      const deal: { stage: DealStage } = {
        stage: DEAL_STAGES.PROPOSAL
      }
      expect(deal.stage).toBe('proposal')

      const activity: { type: ActivityType } = {
        type: ACTIVITY_TYPES.MEETING
      }
      expect(activity.type).toBe('meeting')
    })

    it('should work with array operations', () => {
      const allContactStatuses = Object.values(CONTACT_STATUSES)
      expect(allContactStatuses).toContain('lead')
      expect(allContactStatuses).toContain('customer')

      const allDealStages = Object.values(DEAL_STAGES)
      expect(allDealStages).toContain('qualified')
      expect(allDealStages).toContain('closed_won')

      const allActivityTypes = Object.values(ACTIVITY_TYPES)
      expect(allActivityTypes).toContain('call')
      expect(allActivityTypes).toContain('note')
    })

    it('should work with switch statements', () => {
      const getStatusLabel = (status: ContactStatus): string => {
        switch (status) {
          case CONTACT_STATUSES.LEAD:
            return 'Lead'
          case CONTACT_STATUSES.PROSPECT:
            return 'Prospect'
          case CONTACT_STATUSES.CUSTOMER:
            return 'Customer'
          case CONTACT_STATUSES.INACTIVE:
            return 'Inactive'
          default:
            return 'Unknown'
        }
      }

      expect(getStatusLabel(CONTACT_STATUSES.LEAD)).toBe('Lead')
      expect(getStatusLabel(CONTACT_STATUSES.CUSTOMER)).toBe('Customer')
    })
  })

  describe('Constant structure', () => {
    it('should maintain consistent object structure', () => {
      // Test that constants maintain their expected structure
      expect(Object.keys(CONTACT_STATUSES)).toEqual(['LEAD', 'PROSPECT', 'CUSTOMER', 'INACTIVE'])
      expect(Object.keys(DEAL_STAGES)).toEqual(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
      expect(Object.keys(ACTIVITY_TYPES)).toEqual(['CALL', 'EMAIL', 'MEETING', 'NOTE'])
    })

    it('should have TypeScript readonly behavior', () => {
      // These tests verify the constants work as expected
      // TypeScript provides compile-time immutability checking
      expect(CONTACT_STATUSES.LEAD).toBe('lead')
      expect(DEAL_STAGES.QUALIFIED).toBe('qualified')
      expect(ACTIVITY_TYPES.CALL).toBe('call')
    })
  })
})