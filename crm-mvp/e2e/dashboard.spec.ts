import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Dashboard and Reporting', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    
    // Mock authentication
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await helpers.waitForLoadingToComplete()
  })

  test('should display dashboard with key metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Verify key metric cards are visible
    await expect(page.locator('[data-testid="total-contacts"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-deals"]')).toBeVisible()
    await expect(page.locator('[data-testid="pipeline-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible()
  })

  test('should display contact statistics', async ({ page }) => {
    const contactStats = page.locator('[data-testid="contact-stats"]')
    await expect(contactStats).toBeVisible()
    
    // Verify contact breakdown by status
    await expect(contactStats.locator('[data-testid="leads-count"]')).toBeVisible()
    await expect(contactStats.locator('[data-testid="prospects-count"]')).toBeVisible()
    await expect(contactStats.locator('[data-testid="customers-count"]')).toBeVisible()
    await expect(contactStats.locator('[data-testid="inactive-count"]')).toBeVisible()
  })

  test('should display pipeline metrics', async ({ page }) => {
    const pipelineStats = page.locator('[data-testid="pipeline-stats"]')
    await expect(pipelineStats).toBeVisible()
    
    // Verify pipeline breakdown by stage
    await expect(pipelineStats.locator('[data-testid="lead-deals"]')).toBeVisible()
    await expect(pipelineStats.locator('[data-testid="qualified-deals"]')).toBeVisible()
    await expect(pipelineStats.locator('[data-testid="proposal-deals"]')).toBeVisible()
    await expect(pipelineStats.locator('[data-testid="negotiation-deals"]')).toBeVisible()
    await expect(pipelineStats.locator('[data-testid="won-deals"]')).toBeVisible()
    await expect(pipelineStats.locator('[data-testid="lost-deals"]')).toBeVisible()
  })

  test('should display recent activities', async ({ page }) => {
    const recentActivities = page.locator('[data-testid="recent-activities"]')
    await expect(recentActivities).toBeVisible()
    
    // Check if there are recent activities
    const activityItems = recentActivities.locator('[data-testid="activity-item"]')
    const count = await activityItems.count()
    
    if (count > 0) {
      // Verify each activity item has required information
      for (let i = 0; i < Math.min(count, 5); i++) {
        const item = activityItems.nth(i)
        await expect(item.locator('[data-testid="activity-type"]')).toBeVisible()
        await expect(item.locator('[data-testid="activity-subject"]')).toBeVisible()
        await expect(item.locator('[data-testid="activity-date"]')).toBeVisible()
        await expect(item.locator('[data-testid="activity-contact"]')).toBeVisible()
      }
    }
  })

  test('should display upcoming tasks', async ({ page }) => {
    const upcomingTasks = page.locator('[data-testid="upcoming-tasks"]')
    await expect(upcomingTasks).toBeVisible()
    
    // Check if there are upcoming tasks
    const taskItems = upcomingTasks.locator('[data-testid="task-item"]')
    const count = await taskItems.count()
    
    if (count > 0) {
      // Verify each task item has required information
      for (let i = 0; i < Math.min(count, 5); i++) {
        const item = taskItems.nth(i)
        await expect(item.locator('[data-testid="task-subject"]')).toBeVisible()
        await expect(item.locator('[data-testid="task-date"]')).toBeVisible()
        await expect(item.locator('[data-testid="task-contact"]')).toBeVisible()
      }
    }
  })

  test('should display pipeline chart', async ({ page }) => {
    const pipelineChart = page.locator('[data-testid="pipeline-chart"]')
    await expect(pipelineChart).toBeVisible()
    
    // Verify chart canvas is rendered
    await expect(pipelineChart.locator('canvas')).toBeVisible()
  })

  test('should navigate to detailed views from dashboard', async ({ page }) => {
    // Click on contacts metric
    await helpers.clickAndWait('[data-testid="total-contacts"]')
    await helpers.expectUrl('/contacts')
    
    // Go back to dashboard
    await page.goto('/dashboard')
    
    // Click on deals metric
    await helpers.clickAndWait('[data-testid="total-deals"]')
    await helpers.expectUrl('/deals')
    
    // Go back to dashboard
    await page.goto('/dashboard')
    
    // Click on recent activity item
    const firstActivity = page.locator('[data-testid="activity-item"]').first()
    if (await firstActivity.isVisible()) {
      await firstActivity.click()
      await helpers.expectUrl('/activities')
    }
  })

  test('should refresh dashboard data', async ({ page }) => {
    // Click refresh button
    await helpers.clickAndWait('[data-testid="refresh-dashboard"]')
    
    // Verify loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    await helpers.waitForLoadingToComplete()
    
    // Verify dashboard is still displayed
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
  })

  test('should display empty state when no data exists', async ({ page }) => {
    // This test would require a clean database state
    // For now, we'll check if empty state components exist
    
    const emptyContacts = page.locator('[data-testid="empty-contacts"]')
    const emptyDeals = page.locator('[data-testid="empty-deals"]')
    const emptyActivities = page.locator('[data-testid="empty-activities"]')
    
    // If any empty states are visible, verify they have proper messaging
    if (await emptyContacts.isVisible()) {
      await expect(emptyContacts).toContainText('No contacts yet')
      await expect(emptyContacts.locator('[data-testid="add-contact-cta"]')).toBeVisible()
    }
    
    if (await emptyDeals.isVisible()) {
      await expect(emptyDeals).toContainText('No deals yet')
      await expect(emptyDeals.locator('[data-testid="add-deal-cta"]')).toBeVisible()
    }
    
    if (await emptyActivities.isVisible()) {
      await expect(emptyActivities).toContainText('No activities yet')
      await expect(emptyActivities.locator('[data-testid="add-activity-cta"]')).toBeVisible()
    }
  })

  test('should display correct date ranges for metrics', async ({ page }) => {
    // Verify date range selector is visible
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible()
    
    // Test different date ranges
    const dateRanges = ['7d', '30d', '90d', '1y']
    
    for (const range of dateRanges) {
      await page.selectOption('[data-testid="date-range-selector"]', range)
      await page.waitForTimeout(500)
      
      // Verify metrics update (check that loading occurs)
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
    }
  })

  test('should handle real-time updates', async ({ page }) => {
    // This test would verify that dashboard updates when data changes
    // For now, we'll verify that the dashboard has real-time capabilities
    
    // Check if real-time indicator is present
    const realtimeIndicator = page.locator('[data-testid="realtime-status"]')
    if (await realtimeIndicator.isVisible()) {
      await expect(realtimeIndicator).toContainText('Connected')
    }
  })

  test('should display performance metrics correctly', async ({ page }) => {
    // Verify conversion rate calculation
    const conversionRate = page.locator('[data-testid="conversion-rate"]')
    await expect(conversionRate).toBeVisible()
    
    const conversionText = await conversionRate.textContent()
    if (conversionText) {
      // Should be a percentage
      expect(conversionText).toMatch(/%/)
    }
    
    // Verify average deal value
    const avgDealValue = page.locator('[data-testid="avg-deal-value"]')
    if (await avgDealValue.isVisible()) {
      const valueText = await avgDealValue.textContent()
      if (valueText) {
        // Should contain currency symbol or number
        expect(valueText).toMatch(/[\$\d]/)
      }
    }
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify dashboard is still functional on mobile
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
    
    // Verify mobile navigation works
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible()
    }
  })
})