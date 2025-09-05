import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia } from '@/test/utils'
import { useActivitiesStore } from '../activities'
import { ActivityFactory } from '@/test/factories'

vi.mock('@/services/activitiesService', () => ({
  ActivitiesService: {
    getActivities: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
    scheduleFollowUp: vi.fn(),
    getUpcomingActivities: vi.fn(),
    getOverdueActivities: vi.fn(),
    getContactActivities: vi.fn(),
    getContactTimeline: vi.fn(),
    getActivityStats: vi.fn(),
    bulkCompleteActivities: vi.fn()
  }
}))

describe('Activities Store', () => {
  let activitiesStore: ReturnType<typeof useActivitiesStore>

  beforeEach(() => {
    createTestPinia()
    activitiesStore = useActivitiesStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(activitiesStore.activities).toEqual([])
      expect(activitiesStore.upcomingActivities).toEqual([])
      expect(activitiesStore.overdueActivities).toEqual([])
      expect(activitiesStore.activityStats).toBeNull()
      expect(activitiesStore.loading).toBe(false)
      expect(activitiesStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      
      const activities = [
        ActivityFactory.build({ completed: true, scheduled_at: null }),
        ActivityFactory.build({ completed: false, scheduled_at: null }),
        ActivityFactory.build({ completed: false, scheduled_at: tomorrow.toISOString() }),
        ActivityFactory.build({ completed: false, scheduled_at: today.toISOString() })
      ]
      activitiesStore.activities = activities
    })

    it('should filter completed activities correctly', () => {
      const completed = activitiesStore.completedActivities
      expect(completed).toHaveLength(1)
      expect(completed[0].completed).toBe(true)
    })

    it('should filter pending activities correctly', () => {
      const pending = activitiesStore.pendingActivities
      expect(pending).toHaveLength(3)
      expect(pending.every(a => !a.completed)).toBe(true)
    })

    it('should filter scheduled activities correctly', () => {
      const scheduled = activitiesStore.scheduledActivities
      expect(scheduled).toHaveLength(2)
      expect(scheduled.every(a => a.scheduled_at && !a.completed)).toBe(true)
    })

    it('should filter today\'s activities correctly', () => {
      const today = activitiesStore.todaysActivities
      expect(today).toHaveLength(1)
    })
  })

  describe('fetchActivities', () => {
    it('should fetch activities successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const mockActivities = ActivityFactory.buildMany(3)

      vi.mocked(ActivitiesService.getActivities).mockResolvedValue({
        data: mockActivities,
        error: null
      })

      await activitiesStore.fetchActivities()

      expect(ActivitiesService.getActivities).toHaveBeenCalled()
      expect(activitiesStore.activities).toEqual(mockActivities)
      expect(activitiesStore.loading).toBe(false)
    })

    it('should handle fetch activities error', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')

      vi.mocked(ActivitiesService.getActivities).mockResolvedValue({
        data: null,
        error: 'Failed to fetch activities'
      })

      await activitiesStore.fetchActivities()

      expect(activitiesStore.error).toBe('Failed to fetch activities')
      expect(activitiesStore.loading).toBe(false)
    })
  })

  describe('createActivity', () => {
    it('should create activity successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const activityInput = ActivityFactory.buildInput()
      const createdActivity = ActivityFactory.build(activityInput)

      vi.mocked(ActivitiesService.createActivity).mockResolvedValue({
        data: createdActivity,
        error: null
      })

      const result = await activitiesStore.createActivity(activityInput)

      expect(ActivitiesService.createActivity).toHaveBeenCalledWith(activityInput)
      expect(result.data).toEqual(createdActivity)
      expect(activitiesStore.activities).toHaveLength(1)
      expect(activitiesStore.activities[0]).toEqual(createdActivity)
    })

    it('should handle create activity error', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const activityInput = ActivityFactory.buildInput()

      vi.mocked(ActivitiesService.createActivity).mockResolvedValue({
        data: null,
        error: 'Failed to create activity'
      })

      const result = await activitiesStore.createActivity(activityInput)

      expect(result.error).toBe('Failed to create activity')
      expect(activitiesStore.activities).toHaveLength(0)
    })
  })

  describe('updateActivity', () => {
    it('should update activity successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const existingActivity = ActivityFactory.build()
      const updates = { subject: 'Updated Subject' }
      const updatedActivity = { ...existingActivity, ...updates }

      activitiesStore.activities = [existingActivity]

      vi.mocked(ActivitiesService.updateActivity).mockResolvedValue({
        data: updatedActivity,
        error: null
      })

      const result = await activitiesStore.updateActivity(existingActivity.id, updates)

      expect(ActivitiesService.updateActivity).toHaveBeenCalledWith(existingActivity.id, updates)
      expect(result.data).toEqual(updatedActivity)
      expect(activitiesStore.activities[0]).toEqual(updatedActivity)
    })
  })

  describe('deleteActivity', () => {
    it('should delete activity successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const existingActivity = ActivityFactory.build()

      activitiesStore.activities = [existingActivity]

      vi.mocked(ActivitiesService.deleteActivity).mockResolvedValue({
        error: null
      })

      const result = await activitiesStore.deleteActivity(existingActivity.id)

      expect(ActivitiesService.deleteActivity).toHaveBeenCalledWith(existingActivity.id)
      expect(result.error).toBeNull()
      expect(activitiesStore.activities).toHaveLength(0)
    })
  })

  describe('completeActivity', () => {
    it('should complete activity successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const existingActivity = ActivityFactory.build({ completed: false })
      const completedActivity = { ...existingActivity, completed: true }

      activitiesStore.activities = [existingActivity]

      vi.mocked(ActivitiesService.updateActivity).mockResolvedValue({
        data: completedActivity,
        error: null
      })

      const result = await activitiesStore.completeActivity(existingActivity.id)

      expect(ActivitiesService.updateActivity).toHaveBeenCalledWith(existingActivity.id, { completed: true })
      expect(result.data).toEqual(completedActivity)
    })
  })

  describe('scheduleFollowUp', () => {
    it('should schedule follow-up successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const scheduledActivity = ActivityFactory.build({
        type: 'call',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      vi.mocked(ActivitiesService.scheduleFollowUp).mockResolvedValue({
        data: scheduledActivity,
        error: null
      })

      const result = await activitiesStore.scheduleFollowUp(
        'contact-1',
        'call',
        scheduledActivity.scheduled_at!,
        'Follow-up call',
        'Call to discuss proposal'
      )

      expect(ActivitiesService.scheduleFollowUp).toHaveBeenCalledWith(
        'contact-1',
        'call',
        scheduledActivity.scheduled_at,
        'Follow-up call',
        'Call to discuss proposal',
        undefined
      )
      expect(result.data).toEqual(scheduledActivity)
      expect(activitiesStore.activities).toHaveLength(1)
      expect(activitiesStore.activities[0]).toEqual(scheduledActivity)
    })
  })

  describe('fetchUpcomingActivities', () => {
    it('should fetch upcoming activities successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const upcomingActivities = ActivityFactory.buildMany(5)

      vi.mocked(ActivitiesService.getUpcomingActivities).mockResolvedValue({
        data: upcomingActivities,
        error: null
      })

      await activitiesStore.fetchUpcomingActivities(5)

      expect(ActivitiesService.getUpcomingActivities).toHaveBeenCalledWith(5)
      expect(activitiesStore.upcomingActivities).toEqual(upcomingActivities)
    })
  })

  describe('fetchOverdueActivities', () => {
    it('should fetch overdue activities successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const overdueActivities = ActivityFactory.buildMany(3)

      vi.mocked(ActivitiesService.getOverdueActivities).mockResolvedValue({
        data: overdueActivities,
        error: null
      })

      await activitiesStore.fetchOverdueActivities(3)

      expect(ActivitiesService.getOverdueActivities).toHaveBeenCalledWith(3)
      expect(activitiesStore.overdueActivities).toEqual(overdueActivities)
    })
  })

  describe('utility methods', () => {
    beforeEach(() => {
      const activities = [
        ActivityFactory.build({ id: 'activity-1', contact_id: 'contact-1', deal_id: null }),
        ActivityFactory.build({ id: 'activity-2', contact_id: 'contact-2', deal_id: null }),
        ActivityFactory.build({ id: 'activity-3', contact_id: null, deal_id: 'deal-1' })
      ]
      activitiesStore.activities = activities
    })

    it('should get activity by id', () => {
      const activity = activitiesStore.getActivityById('activity-1')
      expect(activity).toBeDefined()
      expect(activity?.id).toBe('activity-1')
    })

    it('should get activities by contact', () => {
      const activities = activitiesStore.getActivitiesByContact('contact-1')
      expect(activities).toHaveLength(1)
      expect(activities[0].contact_id).toBe('contact-1')
    })

    it('should get activities by deal', () => {
      const activities = activitiesStore.getActivitiesByDeal('deal-1')
      expect(activities).toHaveLength(1)
      expect(activities[0].deal_id).toBe('deal-1')
    })

    it('should identify overdue activities', () => {
      const pastActivity = ActivityFactory.build({
        scheduled_at: '2023-01-01T10:00:00Z',
        completed: false
      })
      const futureActivity = ActivityFactory.build({
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      })
      const completedActivity = ActivityFactory.build({
        scheduled_at: '2023-01-01T10:00:00Z',
        completed: true
      })

      expect(activitiesStore.isActivityOverdue(pastActivity)).toBe(true)
      expect(activitiesStore.isActivityOverdue(futureActivity)).toBe(false)
      expect(activitiesStore.isActivityOverdue(completedActivity)).toBe(false)
    })

    it('should identify upcoming activities', () => {
      const nextWeekActivity = ActivityFactory.build({
        scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      })
      const farFutureActivity = ActivityFactory.build({
        scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      })

      expect(activitiesStore.isActivityUpcoming(nextWeekActivity)).toBe(true)
      expect(activitiesStore.isActivityUpcoming(farFutureActivity)).toBe(false)
    })
  })

  describe('bulkCompleteActivities', () => {
    it('should bulk complete activities successfully', async () => {
      const { ActivitiesService } = await import('@/services/activitiesService')
      const activities = ActivityFactory.buildMany(3, { completed: false })
      const completedActivities = activities.map(a => ({ ...a, completed: true }))

      activitiesStore.activities = activities

      vi.mocked(ActivitiesService.bulkCompleteActivities).mockResolvedValue({
        data: completedActivities,
        error: null
      })

      const activityIds = activities.map(a => a.id)
      const result = await activitiesStore.bulkCompleteActivities(activityIds)

      expect(ActivitiesService.bulkCompleteActivities).toHaveBeenCalledWith(activityIds)
      expect(result.data).toEqual(completedActivities)
      expect(activitiesStore.activities.every(a => a.completed)).toBe(true)
    })
  })
})