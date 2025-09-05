import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Contact Management', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    
    // Mock authentication - in a real scenario, you'd set up test user authentication
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Navigate to contacts page
    await page.goto('/contacts')
    await helpers.waitForLoadingToComplete()
  })

  test('should display contacts list page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contacts')
    await expect(page.locator('[data-testid="contacts-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-contact-button"]')).toBeVisible()
  })

  test('should create a new contact', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-contact-button"]', '[data-testid="contact-form"]')
    
    // Fill contact form
    await helpers.fillFormField('input[name="name"]', testData.testContact.name)
    await helpers.fillFormField('input[name="email"]', testData.testContact.email)
    await helpers.fillFormField('input[name="phone"]', testData.testContact.phone)
    await helpers.fillFormField('input[name="company"]', testData.testContact.company)
    await page.selectOption('select[name="status"]', testData.testContact.status)
    await helpers.fillFormField('textarea[name="notes"]', testData.testContact.notes)
    
    // Add tags
    for (const tag of testData.testContact.tags) {
      await helpers.fillFormField('input[name="tags"]', tag)
      await page.keyboard.press('Enter')
    }
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Contact created successfully')
    await expect(page.locator('[data-testid="contacts-list"]')).toContainText(testData.testContact.name)
  })

  test('should search contacts', async ({ page }) => {
    // Assuming there are existing contacts
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('John')
    
    await page.waitForTimeout(500) // Wait for debounced search
    
    const contactCards = page.locator('[data-testid="contact-card"]')
    const count = await contactCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = contactCards.nth(i)
        await expect(card).toContainText('John', { ignoreCase: true })
      }
    }
  })

  test('should filter contacts by status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]')
    await statusFilter.selectOption('lead')
    
    await page.waitForTimeout(500)
    
    const contactCards = page.locator('[data-testid="contact-card"]')
    const count = await contactCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = contactCards.nth(i)
        await expect(card.locator('[data-testid="contact-status"]')).toContainText('lead', { ignoreCase: true })
      }
    }
  })

  test('should edit an existing contact', async ({ page }) => {
    // Click on first contact card
    const firstContact = page.locator('[data-testid="contact-card"]').first()
    await firstContact.click()
    
    // Click edit button
    await helpers.clickAndWait('[data-testid="edit-contact-button"]', '[data-testid="contact-form"]')
    
    // Update contact information
    const updatedName = 'Updated Contact Name'
    await helpers.fillFormField('input[name="name"]', updatedName)
    
    // Submit form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify success
    await helpers.expectToastMessage('Contact updated successfully')
    await expect(page.locator('[data-testid="contact-details"]')).toContainText(updatedName)
  })

  test('should delete a contact', async ({ page }) => {
    // Click on first contact card
    const firstContact = page.locator('[data-testid="contact-card"]').first()
    const contactName = await firstContact.locator('[data-testid="contact-name"]').textContent()
    await firstContact.click()
    
    // Click delete button
    await helpers.clickAndWait('[data-testid="delete-contact-button"]')
    
    // Confirm deletion in dialog
    await helpers.clickAndWait('[data-testid="confirm-delete-button"]')
    
    // Verify success
    await helpers.expectToastMessage('Contact deleted successfully')
    await helpers.expectUrl('/contacts')
    
    // Verify contact is no longer in list
    if (contactName) {
      await expect(page.locator('[data-testid="contacts-list"]')).not.toContainText(contactName)
    }
  })

  test('should view contact details', async ({ page }) => {
    // Click on first contact card
    const firstContact = page.locator('[data-testid="contact-card"]').first()
    await firstContact.click()
    
    // Verify contact details page
    await expect(page.locator('[data-testid="contact-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible()
  })

  test('should validate required fields in contact form', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-contact-button"]', '[data-testid="contact-form"]')
    
    // Try to submit empty form
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
  })

  test('should validate email format in contact form', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="add-contact-button"]', '[data-testid="contact-form"]')
    
    await helpers.fillFormField('input[name="name"]', 'Test Contact')
    await helpers.fillFormField('input[name="email"]', 'invalid-email')
    
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify email validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
  })

  test('should handle contact import', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="import-contacts-button"]', '[data-testid="import-dialog"]')
    
    // Upload CSV file (mock file upload)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('name,email,phone,company\nJohn Doe,john@example.com,555-0123,Acme Corp')
    })
    
    await helpers.clickAndWait('[data-testid="upload-button"]')
    
    // Verify import preview
    await expect(page.locator('[data-testid="import-preview"]')).toBeVisible()
    await expect(page.locator('[data-testid="import-preview"]')).toContainText('John Doe')
    
    // Confirm import
    await helpers.clickAndWait('[data-testid="confirm-import-button"]')
    
    // Verify success
    await helpers.expectToastMessage('Contacts imported successfully')
  })

  test('should handle contact export', async ({ page }) => {
    await helpers.clickAndWait('[data-testid="export-contacts-button"]')
    
    // Wait for download to start
    const downloadPromise = page.waitForEvent('download')
    await helpers.clickAndWait('[data-testid="confirm-export-button"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/contacts.*\.csv/)
  })
})