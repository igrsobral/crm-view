import { createPinia, setActivePinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import type { Component } from 'vue'

export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function mountComponent<T extends Component>(
  component: T,
  options: any = {}
): VueWrapper<any> {
  const pinia = createTestPinia()
  
  return mount(component, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: true,
        RouterView: true
      }
    },
    ...options
  })
}

export function createMockSupabaseResponse<T>(data: T, error: string | null = null) {
  return {
    data,
    error: error ? new Error(error) : null
  }
}

export function createMockSupabaseQuery() {
  const query = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn()
  }
  
  return query
}

export function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function mockConsole() {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  return originalConsole
}

export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get store() {
      return { ...store }
    }
  }
}

export function mockTimers() {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })
}