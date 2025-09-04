import type { Contact, ContactInput } from '@/stores/contacts'
import type { Deal, DealInput } from '@/stores/deals'
import type { Activity, ActivityInput } from '@/stores/activities'
import type { User, Session } from '@supabase/supabase-js'

let idCounter = 1

export const ContactFactory = {
  build: (overrides?: Partial<Contact>): Contact => ({
    id: `contact-${idCounter++}`,
    user_id: 'user-1',
    name: `Test Contact ${idCounter}`,
    email: `test${idCounter}@example.com`,
    phone: '+1234567890',
    company: `Test Company ${idCounter}`,
    status: 'lead',
    tags: ['test', 'sample'],
    notes: 'Test notes',
    last_contact_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  buildInput: (overrides?: Partial<ContactInput>): ContactInput => ({
    name: `Test Contact ${idCounter++}`,
    email: `test${idCounter}@example.com`,
    phone: '+1234567890',
    company: `Test Company ${idCounter}`,
    status: 'lead',
    tags: ['test'],
    notes: 'Test notes',
    ...overrides
  }),

  buildMany: (count: number, overrides?: Partial<Contact>): Contact[] => {
    return Array.from({ length: count }, (_, index) => 
      ContactFactory.build({ ...overrides, name: `Test Contact ${index + 1}` })
    )
  }
}

export const DealFactory = {
  build: (overrides?: Partial<Deal>): Deal => ({
    id: `deal-${idCounter++}`,
    user_id: 'user-1',
    contact_id: 'contact-1',
    name: `Test Deal ${idCounter}`,
    value: 10000,
    stage: 'lead',
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Test deal notes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  buildInput: (overrides?: Partial<DealInput>): DealInput => ({
    contact_id: 'contact-1',
    name: `Test Deal ${idCounter++}`,
    value: 10000,
    stage: 'lead',
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Test deal notes',
    ...overrides
  }),

  buildMany: (count: number, overrides?: Partial<Deal>): Deal[] => {
    return Array.from({ length: count }, (_, index) => 
      DealFactory.build({ ...overrides, name: `Test Deal ${index + 1}` })
    )
  }
}

export const ActivityFactory = {
  build: (overrides?: Partial<Activity>): Activity => ({
    id: `activity-${idCounter++}`,
    user_id: 'user-1',
    contact_id: 'contact-1',
    deal_id: null,
    type: 'call',
    subject: `Test Activity ${idCounter}`,
    description: 'Test activity description',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    created_at: new Date().toISOString(),
    ...overrides
  }),

  buildInput: (overrides?: Partial<ActivityInput>): ActivityInput => ({
    contact_id: 'contact-1',
    deal_id: null,
    type: 'call',
    subject: `Test Activity ${idCounter++}`,
    description: 'Test activity description',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  }),

  buildMany: (count: number, overrides?: Partial<Activity>): Activity[] => {
    return Array.from({ length: count }, (_, index) => 
      ActivityFactory.build({ ...overrides, subject: `Test Activity ${index + 1}` })
    )
  }
}

export const UserFactory = {
  build: (overrides?: Partial<User>): User => ({
    id: 'user-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    ...overrides
  })
}

export const SessionFactory = {
  build: (overrides?: Partial<Session>): Session => ({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: UserFactory.build(),
    ...overrides
  })
}