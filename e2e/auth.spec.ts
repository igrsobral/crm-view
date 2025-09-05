import { test, expect } from '@playwright/test'
import { TestHelpers, testData } from './utils/test-helpers'

test.describe('Authentication Flow', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await page.goto('/')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await helpers.expectUrl('/login')
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Create Account')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login')
    
    await helpers.fillFormField('input[type="email"]', 'invalid-email')
    await helpers.fillFormField('input[type="password"]', '123')
    await helpers.clickAndWait('button[type="submit"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register')
    
    await helpers.fillFormField('input[type="email"]', 'invalid-email')
    await helpers.fillFormField('input[type="password"]', '123')
    await helpers.clickAndWait('button[type="submit"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('a[href="/register"]')
    await helpers.expectUrl('/register')
    await expect(page.locator('h1')).toContainText('Create Account')
    
    await page.click('a[href="/login"]')
    await helpers.expectUrl('/login')
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should display password reset form', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('a[href="/reset-password"]')
    await helpers.expectUrl('/reset-password')
    await expect(page.locator('h1')).toContainText('Reset Password')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should handle password reset request', async ({ page }) => {
    await page.goto('/reset-password')
    
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.clickAndWait('button[type="submit"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('reset link')
  })

  test('should show loading states during authentication', async ({ page }) => {
    await page.goto('/login')
    
    await helpers.fillFormField('input[type="email"]', testData.validUser.email)
    await helpers.fillFormField('input[type="password"]', testData.validUser.password)
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    await expect(submitButton).toBeDisabled()
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
  })

  test('should maintain form state during validation errors', async ({ page }) => {
    await page.goto('/login')
    
    const email = 'test@example.com'
    await helpers.fillFormField('input[type="email"]', email)
    await helpers.fillFormField('input[type="password"]', 'wrong')
    await helpers.clickAndWait('button[type="submit"]')
    
    await expect(page.locator('input[type="email"]')).toHaveValue(email)
    await expect(page.locator('input[type="password"]')).toHaveValue('')
  })
})