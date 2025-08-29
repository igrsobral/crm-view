import { z } from 'zod'
import { CONTACT_STATUSES } from './constants'

export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  status: z.enum([
    CONTACT_STATUSES.LEAD,
    CONTACT_STATUSES.PROSPECT,
    CONTACT_STATUSES.CUSTOMER,
    CONTACT_STATUSES.INACTIVE
  ]),
  
  tags: z.array(z.string().trim().min(1)).default([]),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal(''))
})

export type ContactFormData = z.infer<typeof contactSchema>

export const validateContact = (data: unknown) => {
  return contactSchema.safeParse(data)
}