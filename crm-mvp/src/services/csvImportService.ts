import type { Contact, ContactInput } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'
import { CONTACT_STATUSES } from '@/utils/constants'
import { type DuplicateDetectionResult } from './duplicateDetectionService'

export interface CSVRow {
  [key: string]: string
}

export interface ImportPreviewRow {
  rowIndex: number
  originalData: CSVRow
  mappedData: Partial<ContactInput>
  errors: string[]
  isValid: boolean
}

export interface ImportResult {
  successful: Contact[]
  failed: ImportPreviewRow[]
  duplicates: ImportPreviewRow[]
  duplicateDetectionResult?: DuplicateDetectionResult
  summary: {
    total: number
    successful: number
    failed: number
    duplicates: number
  }
}

export interface FieldMapping {
  csvField: string
  contactField: keyof ContactInput | 'skip'
}

export interface ImportValidationResult {
  isValid: boolean
  errors: string[]
  preview: ImportPreviewRow[]
}

export class CSVImportService {
  private static readonly REQUIRED_FIELDS: (keyof ContactInput)[] = ['name']
  private static readonly VALID_CONTACT_FIELDS: (keyof ContactInput)[] = [
    'name', 'email', 'phone', 'company', 'status', 'tags', 'notes'
  ]

  static parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row')
    }

    const headers = this.parseCSVLine(lines[0])
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length === 0 || values.every(v => !v.trim())) {
        continue 
      }

      const row: CSVRow = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row)
    }

    return rows
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
      i++
    }

    result.push(current.trim())
    return result
  }

  static getCSVHeaders(csvContent: string): string[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }
    return this.parseCSVLine(lines[0])
  }

  static validateFieldMapping(mapping: FieldMapping[]): string[] {
    const errors: string[] = []
    const mappedFields = new Set<string>()

    const hasRequiredFields = this.REQUIRED_FIELDS.every(field => {
      return mapping.some(m => m.contactField === field)
    })

    if (!hasRequiredFields) {
      errors.push(`Missing required field mapping: ${this.REQUIRED_FIELDS.join(', ')}`)
    }

    mapping.forEach(m => {
      if (m.contactField !== 'skip') {
        if (mappedFields.has(m.contactField)) {
          errors.push(`Duplicate mapping for field: ${m.contactField}`)
        }
        mappedFields.add(m.contactField)
      }
    })

    return errors
  }

  static validateAndPreviewImport(
    csvRows: CSVRow[],
    fieldMapping: FieldMapping[],
    existingContacts: Contact[] = []
  ): ImportValidationResult {
    const errors: string[] = []
    const preview: ImportPreviewRow[] = []

    const mappingErrors = this.validateFieldMapping(fieldMapping)
    if (mappingErrors.length > 0) {
      return {
        isValid: false,
        errors: mappingErrors,
        preview: []
      }
    }

    const fieldMap = new Map<string, keyof ContactInput>()
    fieldMapping.forEach(m => {
      if (m.contactField !== 'skip') {
        fieldMap.set(m.csvField, m.contactField)
      }
    })

    // Validate each row
    csvRows.forEach((row, index) => {
      const mappedData: Partial<ContactInput> = {}
      const rowErrors: string[] = []

      // Map fields
      Object.entries(row).forEach(([csvField, value]) => {
        const contactField = fieldMap.get(csvField)
        if (contactField) {
          mappedData[contactField] = this.transformFieldValue(contactField, value, rowErrors)
        }
      })

      this.REQUIRED_FIELDS.forEach(field => {
        if (!mappedData[field] || (typeof mappedData[field] === 'string' && !mappedData[field]?.trim())) {
          rowErrors.push(`Missing required field: ${field}`)
        }
      })

      if (mappedData.email && !this.isValidEmail(mappedData.email)) {
        rowErrors.push('Invalid email format')
      }

      const isDuplicate = existingContacts.some(contact => 
        contact.email && mappedData.email && 
        contact.email.toLowerCase() === mappedData.email.toLowerCase()
      )

      const previewRow: ImportPreviewRow = {
        rowIndex: index + 1,
        originalData: row,
        mappedData,
        errors: rowErrors,
        isValid: rowErrors.length === 0
      }

      preview.push(previewRow)

      if (isDuplicate) {
        previewRow.errors.push('Duplicate email found in existing contacts')
      }
    })

    const hasErrors = preview.some(row => row.errors.length > 0)

    return {
      isValid: !hasErrors,
      errors: hasErrors ? ['Some rows contain validation errors'] : [],
      preview
    }
  }

  private static transformFieldValue(
    field: keyof ContactInput,
    value: string,
    errors: string[]
  ): any {
    const trimmedValue = value.trim()

    switch (field) {
      case 'status':
        const status = trimmedValue.toLowerCase() as ContactStatus
        if (Object.values(CONTACT_STATUSES).includes(status)) {
          return status
        } else {
          errors.push(`Invalid status: ${trimmedValue}. Valid values: ${Object.values(CONTACT_STATUSES).join(', ')}`)
          return CONTACT_STATUSES.LEAD // Default fallback
        }

      case 'tags':
        if (!trimmedValue) return []
        return trimmedValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

      case 'name':
      case 'email':
      case 'phone':
      case 'company':
      case 'notes':
        return trimmedValue || undefined

      default:
        return trimmedValue
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static generateSampleCSV(): string {
    const headers = ['name', 'email', 'phone', 'company', 'status', 'tags', 'notes']
    const sampleData = [
      ['John Doe', 'john@example.com', '+1-555-0123', 'Acme Corp', 'lead', 'vip,enterprise', 'Interested in our premium package'],
      ['Jane Smith', 'jane@techstart.com', '+1-555-0124', 'TechStart Inc', 'prospect', 'startup,tech', 'Follow up next week'],
      ['Bob Johnson', 'bob@consulting.com', '+1-555-0125', 'Johnson Consulting', 'customer', 'consulting', 'Existing client since 2023']
    ]

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => 
        row.map(cell => cell.includes(',') || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell).join(',')
      )
    ].join('\n')

    return csvContent
  }

  static createDownloadableFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}