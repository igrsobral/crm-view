// Contact status options
export const CONTACT_STATUSES = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  INACTIVE: 'inactive'
} as const

export type ContactStatus = typeof CONTACT_STATUSES[keyof typeof CONTACT_STATUSES]

// Deal pipeline stages
export const DEAL_STAGES = {
  LEAD: 'lead',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
} as const

export type DealStage = typeof DEAL_STAGES[keyof typeof DEAL_STAGES]

// Activity types
export const ACTIVITY_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note'
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]

// App configuration
export const APP_CONFIG = {
  MAX_CONTACTS: 1000,
  PAGINATION_SIZE: 20,
  DEBOUNCE_DELAY: 300
} as const