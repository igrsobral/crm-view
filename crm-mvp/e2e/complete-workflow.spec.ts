import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Complete CRM Workflow', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('should complete full CRM workflow from registration to deal closure', async ({ page }) => {
    // Step 1: User Registration
    await page.goto('/register')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Verify successful registration (might redirect to email verification or login)
    await expect(page.locator('[data-testid="success-message"], [data-testid="verification-message"]')).toBeVisible()
    
    // Step 2: Login (if not automatically logged in)
    if (await page.locator('input[type="email"]').isVisible()) {
      await helpers.fillFormField('input[type="email"]', testData.validUser.email)
      await helpers.fillFormField('input[type="password"]', testData.validUser.password)
      await helpers.clickAndWait('button[type="submit"]')
    }
    
    // Verify successful login - should be on dashboard
    await helpers.expectUrl('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Step 3: Create a new contact
    await page.goto('/contacts')
    await helpers.clickAndWait('[data-testid="add-contact-button"]', '[data-testid="contact-form"]')
    
    await helpers.fillFormField('input[name="name"]', testData.testContact.name)
    await helpers.fillFormField('input[name="email"]', testData.testContact.email)
    await helpers.fillFormField('input[name="phone"]', testData.testContact.phone)
    await helpers.fillFormField('input[name="company"]', testData.testContact.company)
    await page.selectOption('select[name="status"]', testData.testContact.status)
    await helpers.fillFormField('textarea[name="notes"]', testData.testContact.notes)
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Contact created successfully')
    
    // Step 4: Create a deal for the contact
    await page.goto('/deals')
    await helpers.clickAndWait('[data-testid="add-deal-button"]', '[data-testid="deal-form"]')
    
    await helpers.fillFormField('input[name="name"]', testData.testDeal.name)
    await helpers.fillFormField('input[name="value"]', testData.testDeal.value.toString())
    await page.selectOption('select[name="stage"]', testData.testDeal.stage)
    await helpers.fillFormField('input[name="expectedCloseDate"]', testData.testDeal.expectedCloseDate)
    await helpers.fillFormField('textarea[name="notes"]', testData.testDeal.notes)
    
    // Select the contact we just created
    await page.click('[data-testid="contact-selector"]')
    await page.click(`[data-testid="contact-option"]:has-text("${testData.testContact.name}")`)
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Deal created successfully')
    
    // Step 5: Log an activity for the contact
    await page.goto('/activities')
    await helpers.clickAndWait('[data-testid="add-activity-button"]', '[data-testid="activity-form"]')
    
    await page.selectOption('select[name="type"]', testData.testActivity.type)
    await helpers.fillFormField('input[name="subject"]', testData.testActivity.subject)
    await helpers.fillFormField('textarea[name="description"]', testData.testActivity.description)
    
    // Select the contact
    await page.click('[data-testid="contact-selector"]')
    await page.click(`[data-testid="contact-option"]:has-text("${testData.testContact.name}")`)
    
    // Mark as completed
    await page.check('input[name="completed"]')
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Activity logged successfully')
    
    // Step 6: Move deal through pipeline stages
    await page.goto('/deals')
    
    // Find our deal and move it to proposal stage
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${testData.testDeal.name}")`)
    await dealCard.click()
    
    await helpers.clickAndWait('[data-testid="move-to-proposal-button"]')
    await helpers.expectToastMessage('Deal updated successfully')
    
    // Move to negotiation stage
    await helpers.clickAndWait('[data-testid="move-to-negotiation-button"]')
    await helpers.expectToastMessage('Deal updated successfully')
    
    // Step 7: Schedule a follow-up activity
    await page.goto('/contacts')
    await page.locator(`[data-testid="contact-card"]:has-text("${testData.testContact.name}")`).click()
    
    await helpers.clickAndWait('[data-testid="schedule-followup-button"]', '[data-testid="activity-form"]')
    
    await page.selectOption('select[name="type"]', 'meeting')
    await helpers.fillFormField('input[name="subject"]', 'Contract Discussion Meeting')
    await helpers.fillFormField('input[name="scheduledDate"]', '2024-02-20')
    await helpers.fillFormField('input[name="scheduledTime"]', '14:00')
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Follow-up scheduled successfully')
    
    // Step 8: Close the deal as won
    await page.goto('/deals')
    await page.locator(`[data-testid="deal-card"]:has-text("${testData.testDeal.name}")`).click()
    
    await helpers.clickAndWait('[data-testid="mark-as-won-button"]')
    await helpers.clickAndWait('[data-testid="confirm-won-button"]')
    await helpers.expectToastMessage('Deal marked as won')
    
    // Step 9: Verify dashboard reflects the changes
    await page.goto('/dashboard')
    
    // Verify metrics have updated
    await expect(page.locator('[data-testid="total-contacts"]')).toContainText('1')
    await expect(page.locator('[data-testid="total-deals"]')).toContainText('1')
    await expect(page.locator('[data-testid="won-deals"]')).toContainText('1')
    
    // Verify recent activities show our logged activity
    const recentActivities = page.locator('[data-testid="recent-activities"]')
    await expect(recentActivities).toContainText(testData.testActivity.subject)
    
    // Verify upcoming activities show our scheduled follow-up
    const upcomingTasks = page.locator('[data-testid="upcoming-tasks"]')
    await expect(upcomingTasks).toContainText('Contract Discussion Meeting')
    
    // Step 10: Update contact status to customer
    await page.goto('/contacts')
    await page.locator(`[data-testid="contact-card"]:has-text("${testData.testContact.name}")`).click()
    
    await helpers.clickAndWait('[data-testid="edit-contact-button"]', '[data-testid="contact-form"]')
    await page.selectOption('select[name="status"]', 'customer')
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Contact updated successfully')
    
    // Step 11: Verify final dashboard state
    await page.goto('/dashboard')
    
    // Verify customer count has increased
    const contactStats = page.locator('[data-testid="contact-stats"]')
    await expect(contactStats.locator('[data-testid="customers-count"]')).toContainText('1')
    
    // Verify conversion rate is calculated
    const conversionRate = page.locator('[data-testid="conversion-rate"]')
    await expect(conversionRate).toBeVisible()
    
    // Verify pipeline value reflects the won deal
    const pipelineValue = page.locator('[data-testid="pipeline-value"]')
    await expect(pipelineValue).toContainText(testData.testDeal.value.toString())
  })

  test('should handle data import and export workflow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    // Step 1: Import contacts from CSV
    await page.goto('/contacts')
    await helpers.clickAndWait('[data-testid="import-contacts-button"]', '[data-testid="import-dialog"]')
    
    // Upload CSV file
    const csvContent = `name,email,phone,company,status
Jane Smith,jane@example.com,555-0124,Tech Corp,prospect
Bob Johnson,bob@example.com,555-0125,Design Inc,lead`
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    await helpers.clickAndWait('[data-testid="upload-button"]')
    
    // Verify import preview
    await expect(page.locator('[data-testid="import-preview"]')).toContainText('Jane Smith')
    await expect(page.locator('[data-testid="import-preview"]')).toContainText('Bob Johnson')
    
    // Confirm import
    await helpers.clickAndWait('[data-testid="confirm-import-button"]')
    await helpers.expectToastMessage('Contacts imported successfully')
    
    // Step 2: Verify imported contacts appear in list
    await expect(page.locator('[data-testid="contacts-list"]')).toContainText('Jane Smith')
    await expect(page.locator('[data-testid="contacts-list"]')).toContainText('Bob Johnson')
    
    // Step 3: Create deals for imported contacts
    await page.goto('/deals')
    
    // Create deal for Jane Smith
    await helpers.clickAndWait('[data-testid="add-deal-button"]', '[data-testid="deal-form"]')
    await helpers.fillFormField('input[name="name"]', 'Tech Consulting Project')
    await helpers.fillFormField('input[name="value"]', '25000')
    await page.selectOption('select[name="stage"]', 'qualified')
    
    await page.click('[data-testid="contact-selector"]')
    await page.click('[data-testid="contact-option"]:has-text("Jane Smith")')
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectToastMessage('Deal created successfully')
    
    // Step 4: Export all data
    await page.goto('/contacts')
    await helpers.clickAndWait('[data-testid="export-contacts-button"]')
    
    const downloadPromise = page.waitForEvent('download')
    await helpers.clickAndWait('[data-testid="confirm-export-button"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/contacts.*\.csv/)
    
    // Step 5: Export deals
    await page.goto('/deals')
    await helpers.clickAndWait('[data-testid="export-deals-button"]')
    
    const dealsDownloadPromise = page.waitForEvent('download')
    await helpers.clickAndWait('[data-testid="confirm-export-button"]')
    
    const dealsDownload = await dealsDownloadPromise
    expect(dealsDownload.suggestedFilename()).toMatch(/deals.*\.csv/)
    
    // Step 6: Verify dashboard shows updated metrics
    await page.goto('/dashboard')
    
    // Should now have multiple contacts and deals
    const totalContacts = await page.locator('[data-testid="total-contacts"]').textContent()
    const totalDeals = await page.locator('[data-testid="total-deals"]').textContent()
    
    expect(parseInt(totalContacts || '0')).toBeGreaterThan(1)
    expect(parseInt(totalDeals || '0')).toBeGreaterThan(0)
  })

  test('should handle session management and security', async ({ page }) => {
    // Step 1: Login
    await page.goto('/login')
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    await helpers.clickAndWait('button[type="submit"]')
    
    await helpers.expectUrl('/dashboard')
    
    // Step 2: Verify protected routes are accessible
    await page.goto('/contacts')
    await expect(page.locator('h1')).toContainText('Contacts')
    
    await page.goto('/deals')
    await expect(page.locator('h1')).toContainText('Deals')
    
    await page.goto('/activities')
    await expect(page.locator('h1')).toContainText('Activities')
    
    // Step 3: Test logout
    await helpers.clickAndWait('[data-testid="user-menu-button"]')
    await helpers.clickAndWait('[data-testid="logout-button"]')
    
    // Should redirect to login
    await helpers.expectUrl('/login')
    
    // Step 4: Verify protected routes redirect to login when not authenticated
    await page.goto('/dashboard')
    await helpers.expectUrl('/login')
    
    await page.goto('/contacts')
    await helpers.expectUrl('/login')
    
    await page.goto('/deals')
    await helpers.expectUrl('/login')
    
    // Step 5: Test "remember me" functionality (if implemented)
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    
    const rememberCheckbox = page.locator('input[name="remember"]')
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check()
    }
    
    await helpers.clickAndWait('button[type="submit"]')
    await helpers.expectUrl('/dashboard')
  })
})