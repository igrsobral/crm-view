import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Activity Management', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    
    // Mock authentication
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Navigate to activities page
    await page.goto('/activities')
    await helpers.waitForLoadingToComplete()
  })

  test('should display activities page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Activities')
    await expect(page.locator('[data-testid="activities-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-activity-button"]')).toBeVisible()
  })

  test('should create a new activity', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-activity-button"]', '[data-testid="activity-form"]')
    
    // Fill activity form
    await page.selectOption('select[name="type"]', testData.testActivity.type)
    await helpers.fillFormField('input[name="subject"]', testData.testActivity.subject)
    await helpers.fillFormField('textarea[name="description"]', testData.testActivity.description)
    
    // Select associated contact
    await page.click('[data-testid="contact-selector"]')
    await page.click('[data-testid="contact-option"]')
    
    // Set scheduled date and time
    await helpers.fillFormField('input[name="scheduledDate"]', testData.testActivity.scheduledDate)
    await helpers.fillFormField('input[name="scheduledTime"]', testData.testActivity.scheduledTime)
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Activity created successfully')
    await expect(page.locator('[data-testid="activities-list"]')).toContainText(testData.testActivity.subject)
  })

  test('should log a completed activity', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-activity-button"]', '[data-testid="activity-form"]')
    
    // Fill activity form for completed activity
    await page.selectOption('select[name="type"]', 'call')
    await helpers.fillFormField('input[name="subject"]', 'Completed Call')
    await helpers.fillFormField('textarea[name="description"]', 'Discussed project requirements')
    
    // Select associated contact
    await page.click('[data-testid="contact-selector"]')
    await page.click('[data-testid="contact-option"]')
    
    // Mark as completed
    await page.check('input[name="completed"]')
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Activity logged successfully')
    
    // Verify activity appears as completed
    const activityCard = page.locator('[data-testid="activity-card"]').filter({ hasText: 'Completed Call' })
    await expect(activityCard.locator('[data-testid="completed-indicator"]')).toBeVisible()
  })

  test('should edit an existing activity', async ({ page }) => {
    // Click on first activity card
    const firstActivity = page.locator('[data-testid="activity-card"]').first()
    await firstActivity.click()
    
    // Click edit button
    await helpers.clickAndWait('[data-testid="edit-activity-button"]', '[data-testid="activity-form"]')
    
    // Update activity information
    const updatedSubject = 'Updated Activity Subject'
    await helpers.fillFormField('input[name="subject"]', updatedSubject)
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Activity updated successfully')
    await expect(page.locator('[data-testid="activity-details"]')).toContainText(updatedSubject)
  })

  test('should delete an activity', async ({ page }) => {
    // Click on first activity card
    const firstActivity = page.locator('[data-testid="activity-card"]').first()
    const activitySubject = await firstActivity.locator('[data-testid="activity-subject"]').textContent()
    await firstActivity.click()
    
    // Click delete button
    await helpers.clickAndWait('[data-testid="delete-activity-button"]')
    
    // Confirm deletion in dialog
    await helpers.clickAndWait('[data-testid="confirm-delete-button"]')
    
    // Verify success
    await helpers.expectToastMessage('Activity deleted successfully')
    await helpers.expectUrl('/activities')
    
    // Verify activity is no longer in list
    if (activitySubject) {
      await expect(page.locator('[data-testid="activities-list"]')).not.toContainText(activitySubject)
    }
  })

  test('should mark activity as completed', async ({ page }) => {
    // Find an incomplete activity
    const incompleteActivity = page.locator('[data-testid="activity-card"][data-completed="false"]').first()
    
    if (await incompleteActivity.isVisible()) {
      // Click complete button
      await incompleteActivity.locator('[data-testid="complete-activity-button"]').click()
      
      // Verify success
      await helpers.expectToastMessage('Activity marked as completed')
      
      // Verify activity is now marked as completed
      await expect(incompleteActivity.locator('[data-testid="completed-indicator"]')).toBeVisible()
    }
  })

  test('should filter activities by type', async ({ page }) => {
    // Select call filter
    await page.selectOption('[data-testid="type-filter"]', 'call')
    
    await page.waitForTimeout(500)
    
    const activityCards = page.locator('[data-testid="activity-card"]')
    const count = await activityCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = activityCards.nth(i)
        await expect(card.locator('[data-testid="activity-type"]')).toContainText('call', { ignoreCase: true })
      }
    }
  })

  test('should filter activities by completion status', async ({ page }) => {
    // Select completed filter
    await page.selectOption('[data-testid="status-filter"]', 'completed')
    
    await page.waitForTimeout(500)
    
    const activityCards = page.locator('[data-testid="activity-card"]')
    const count = await activityCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = activityCards.nth(i)
        await expect(card.locator('[data-testid="completed-indicator"]')).toBeVisible()
      }
    }
  })

  test('should display upcoming activities', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verify upcoming activities widget
    await expect(page.locator('[data-testid="upcoming-activities"]')).toBeVisible()
    
    // Check if there are upcoming activities
    const upcomingActivities = page.locator('[data-testid="upcoming-activity-item"]')
    const count = await upcomingActivities.count()
    
    if (count > 0) {
      // Verify each upcoming activity has required information
      for (let i = 0; i < Math.min(count, 5); i++) {
        const activity = upcomingActivities.nth(i)
        await expect(activity.locator('[data-testid="activity-subject"]')).toBeVisible()
        await expect(activity.locator('[data-testid="activity-date"]')).toBeVisible()
        await expect(activity.locator('[data-testid="activity-contact"]')).toBeVisible()
      }
    }
  })

  test('should display overdue activities', async ({ page }) => {
    // Look for overdue activities
    const overdueActivity = page.locator('[data-testid="activity-card"][data-overdue="true"]').first()
    
    if (await overdueActivity.isVisible()) {
      await expect(overdueActivity).toHaveClass(/overdue/)
      await expect(overdueActivity.locator('[data-testid="overdue-indicator"]')).toBeVisible()
    }
  })

  test('should validate required fields in activity form', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-activity-button"]', '[data-testid="activity-form"]')
    
    // Try to submit empty form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="type-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="subject-error"]')).toBeVisible()
  })

  test('should schedule follow-up activity', async ({ page }) => {
    // Navigate to a contact details page
    await page.goto('/contacts')
    await page.locator('[data-testid="contact-card"]').first().click()
    
    // Click schedule follow-up button
    await helpers.clickAndWait('[data-testid="schedule-followup-button"]', '[data-testid="activity-form"]')
    
    // Fill follow-up form
    await page.selectOption('select[name="type"]', 'call')
    await helpers.fillFormField('input[name="subject"]', 'Follow-up Call')
    await helpers.fillFormField('input[name="scheduledDate"]', '2024-02-20')
    await helpers.fillFormField('input[name="scheduledTime"]', '10:00')
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Follow-up scheduled successfully')
  })

  test('should display activity timeline on contact page', async ({ page }) => {
    // Navigate to a contact details page
    await page.goto('/contacts')
    await page.locator('[data-testid="contact-card"]').first().click()
    
    // Verify activity timeline is visible
    await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible()
    
    // Check if there are activities in the timeline
    const timelineItems = page.locator('[data-testid="timeline-item"]')
    const count = await timelineItems.count()
    
    if (count > 0) {
      // Verify timeline items have required information
      for (let i = 0; i < Math.min(count, 3); i++) {
        const item = timelineItems.nth(i)
        await expect(item.locator('[data-testid="activity-type"]')).toBeVisible()
        await expect(item.locator('[data-testid="activity-subject"]')).toBeVisible()
        await expect(item.locator('[data-testid="activity-date"]')).toBeVisible()
      }
    }
  })
})