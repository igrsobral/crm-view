import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Deal Management', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    
    // Mock authentication
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Navigate to deals page
    await page.goto('/deals')
    await helpers.waitForLoadingToComplete()
  })

  test('should display deal pipeline page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Deals')
    await expect(page.locator('[data-testid="deal-pipeline"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-deal-button"]')).toBeVisible()
  })

  test('should display pipeline stages', async ({ page }) => {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    
    for (const stage of stages) {
      await expect(page.locator(`[data-testid="pipeline-stage-${stage}"]`)).toBeVisible()
    }
  })

  test('should create a new deal', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-deal-button"]', '[data-testid="deal-form"]')
    
    // Fill deal form
    await helpers.fillFormField('input[name="name"]', testData.testDeal.name)
    await helpers.fillFormField('input[name="value"]', testData.testDeal.value.toString())
    await page.selectOption('select[name="stage"]', testData.testDeal.stage)
    await helpers.fillFormField('input[name="expectedCloseDate"]', testData.testDeal.expectedCloseDate)
    await helpers.fillFormField('textarea[name="notes"]', testData.testDeal.notes)
    
    // Select associated contact
    await page.click('[data-testid="contact-selector"]')
    await page.click('[data-testid="contact-option"]')
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Deal created successfully')
    await expect(page.locator('[data-testid="deal-pipeline"]')).toContainText(testData.testDeal.name)
  })

  test('should move deal between pipeline stages', async ({ page }) => {
    // Find a deal card in the pipeline
    const dealCard = page.locator('[data-testid="deal-card"]').first()
    const dealName = await dealCard.locator('[data-testid="deal-name"]').textContent()
    
    // Drag deal to next stage (simplified - in real implementation would use drag and drop)
    await dealCard.click()
    await helpers.clickAndWait('[data-testid="move-to-qualified-button"]')
    
    // Verify deal moved to qualified stage
    const qualifiedStage = page.locator('[data-testid="pipeline-stage-qualified"]')
    if (dealName) {
      await expect(qualifiedStage).toContainText(dealName)
    }
    
    await helpers.expectToastMessage('Deal updated successfully')
  })

  test('should edit an existing deal', async ({ page }) => {
    // Click on first deal card
    const firstDeal = page.locator('[data-testid="deal-card"]').first()
    await firstDeal.click()
    
    // Click edit button
    await helpers.clickAndWait('[data-testid="edit-deal-button"]', '[data-testid="deal-form"]')
    
    // Update deal information
    const updatedName = 'Updated Deal Name'
    await helpers.fillFormField('input[name="name"]', updatedName)
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Deal updated successfully')
    await expect(page.locator('[data-testid="deal-details"]')).toContainText(updatedName)
  })

  test('should delete a deal', async ({ page }) => {
    // Click on first deal card
    const firstDeal = page.locator('[data-testid="deal-card"]').first()
    const dealName = await firstDeal.locator('[data-testid="deal-name"]').textContent()
    await firstDeal.click()
    
    // Click delete button
    await helpers.clickAndWait('[data-testid="delete-deal-button"]')
    
    // Confirm deletion in dialog
    await helpers.clickAndWait('[data-testid="confirm-delete-button"]')
    
    // Verify success
    await helpers.expectToastMessage('Deal deleted successfully')
    await helpers.expectUrl('/deals')
    
    // Verify deal is no longer in pipeline
    if (dealName) {
      await expect(page.locator('[data-testid="deal-pipeline"]')).not.toContainText(dealName)
    }
  })

  test('should view deal details', async ({ page }) => {
    // Click on first deal card
    const firstDeal = page.locator('[data-testid="deal-card"]').first()
    await firstDeal.click()
    
    // Verify deal details page
    await expect(page.locator('[data-testid="deal-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="deal-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="deal-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="deal-stage"]')).toBeVisible()
    await expect(page.locator('[data-testid="associated-contact"]')).toBeVisible()
  })

  test('should validate required fields in deal form', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-deal-button"]', '[data-testid="deal-form"]')
    
    // Try to submit empty form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-error"]')).toBeVisible()
  })

  test('should validate deal value format', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-deal-button"]', '[data-testid="deal-form"]')
    
    await helpers.fillFormField('input[name="name"]', 'Test Deal')
    await helpers.fillFormField('input[name="value"]', 'invalid-number')
    
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify value validation error
    await expect(page.locator('[data-testid="value-error"]')).toBeVisible()
  })

  test('should filter deals by stage', async ({ page }) => {
    // Click on qualified stage filter
    await helpers.clickAndWait('[data-testid="filter-qualified"]')
    
    // Verify only qualified deals are shown
    const dealCards = page.locator('[data-testid="deal-card"]')
    const count = await dealCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = dealCards.nth(i)
        await expect(card.locator('[data-testid="deal-stage"]')).toContainText('qualified', { ignoreCase: true })
      }
    }
  })

  test('should calculate pipeline metrics', async ({ page }) => {
    // Verify pipeline metrics are displayed
    await expect(page.locator('[data-testid="total-pipeline-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="deals-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible()
  })

  test('should highlight overdue deals', async ({ page }) => {
    // Look for deals with past expected close dates
    const overdueDeal = page.locator('[data-testid="deal-card"][data-overdue="true"]').first()
    
    if (await overdueDeal.isVisible()) {
      await expect(overdueDeal).toHaveClass(/overdue/)
      await expect(overdueDeal.locator('[data-testid="overdue-indicator"]')).toBeVisible()
    }
  })

  test('should export deals data', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="export-deals-button"]')
    
    // Wait for download to start
    const downloadPromise = page.waitForEvent('download')
    await helpers.clickAndWait('[data-testid="confirm-export-button"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/deals.*\.csv/)
  })
})