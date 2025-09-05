import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  async waitForLoadingToComplete() {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 })
  }

  async fillFormField(selector: string, value: string) {
    await this.page.fill(selector, value)
    await this.page.waitForTimeout(100)
  }

  async clickAndWait(selector: string, waitForSelector?: string) {
    await this.page.click(selector)
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector)
    }
    await this.page.waitForTimeout(500)
  }

  async expectToastMessage(message: string) {
    await expect(this.page.locator('[data-testid="toast-notification"]')).toContainText(message)
  }

  async dismissToast() {
    const toast = this.page.locator('[data-testid="toast-notification"]')
    if (await toast.isVisible()) {
      await toast.locator('button').click()
    }
  }

  async expectPageTitle(title: string) {
    await expect(this.page).toHaveTitle(new RegExp(title, 'i'))
  }

  async expectUrl(urlPattern: string) {
    await expect(this.page).toHaveURL(new RegExp(urlPattern))
  }

  async waitForNavigation(expectedUrl?: string) {
    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl)
    } else {
      await this.page.waitForLoadState('networkidle')
    }
  }
}

export const testData = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  },
  
  testContact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    status: 'lead',
    tags: ['prospect', 'high-value'],
    notes: 'Potential client from networking event'
  },
  
  testDeal: {
    name: 'Website Redesign Project',
    value: 15000,
    stage: 'qualified',
    expectedCloseDate: '2024-12-31',
    notes: 'Discussed requirements in initial meeting'
  },
  
  testActivity: {
    type: 'call',
    subject: 'Follow-up call',
    description: 'Discussed project timeline and budget',
    scheduledDate: '2024-02-15',
    scheduledTime: '14:00'
  }
}