import type { Contact } from '@/stores/contacts'
import type { Deal } from '@/stores/deals'

export interface ExportField {
  key: string
  label: string
  selected: boolean
  category: 'basic' | 'contact' | 'business' | 'metadata'
}

export interface ExportOptions {
  format: 'csv'
  fields: ExportField[]
  includeHeaders: boolean
  dateFormat: 'iso' | 'us' | 'eu'
}

export interface ExportProgress {
  current: number
  total: number
  percentage: number
  status: 'preparing' | 'processing' | 'complete' | 'error'
  message: string
}

export class CSVExportService {
  private static readonly CONTACT_FIELDS: ExportField[] = [
    { key: 'name', label: 'Name', selected: true, category: 'basic' },
    { key: 'email', label: 'Email', selected: true, category: 'contact' },
    { key: 'phone', label: 'Phone', selected: true, category: 'contact' },
    { key: 'company', label: 'Company', selected: true, category: 'business' },
    { key: 'status', label: 'Status', selected: true, category: 'basic' },
    { key: 'tags', label: 'Tags', selected: true, category: 'basic' },
    { key: 'notes', label: 'Notes', selected: false, category: 'basic' },
    { key: 'last_contact_date', label: 'Last Contact Date', selected: false, category: 'metadata' },
    { key: 'created_at', label: 'Created Date', selected: false, category: 'metadata' },
    { key: 'updated_at', label: 'Updated Date', selected: false, category: 'metadata' }
  ]

  private static readonly DEAL_FIELDS: ExportField[] = [
    { key: 'name', label: 'Deal Name', selected: true, category: 'basic' },
    { key: 'contact_name', label: 'Contact Name', selected: true, category: 'contact' },
    { key: 'contact_email', label: 'Contact Email', selected: true, category: 'contact' },
    { key: 'contact_company', label: 'Contact Company', selected: true, category: 'contact' },
    { key: 'value', label: 'Deal Value', selected: true, category: 'business' },
    { key: 'stage', label: 'Stage', selected: true, category: 'basic' },
    { key: 'expected_close_date', label: 'Expected Close Date', selected: true, category: 'business' },
    { key: 'notes', label: 'Notes', selected: false, category: 'basic' },
    { key: 'created_at', label: 'Created Date', selected: false, category: 'metadata' },
    { key: 'updated_at', label: 'Updated Date', selected: false, category: 'metadata' }
  ]

  static getDefaultContactFields(): ExportField[] {
    return JSON.parse(JSON.stringify(this.CONTACT_FIELDS))
  }

  static getDefaultDealFields(): ExportField[] {
    return JSON.parse(JSON.stringify(this.DEAL_FIELDS))
  }

  static getFieldsByCategory(fields: ExportField[]): Record<string, ExportField[]> {
    return fields.reduce((acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = []
      }
      acc[field.category].push(field)
      return acc
    }, {} as Record<string, ExportField[]>)
  }

  static async exportContacts(
    contacts: Contact[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<string> {
    const selectedFields = options.fields.filter(f => f.selected)
    
    if (selectedFields.length === 0) {
      throw new Error('At least one field must be selected for export')
    }

    onProgress?.({
      current: 0,
      total: contacts.length,
      percentage: 0,
      status: 'preparing',
      message: 'Preparing export...'
    })

    // Prepare headers
    const headers = selectedFields.map(field => field.label)
    const csvRows: string[] = []

    if (options.includeHeaders) {
      csvRows.push(this.formatCSVRow(headers))
    }

    const batchSize = 100
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      
      for (const contact of batch) {
        const row = selectedFields.map(field => {
          const value = this.getContactFieldValue(contact, field.key, options.dateFormat)
          return this.sanitizeCSVValue(value)
        })
        csvRows.push(this.formatCSVRow(row))
      }

      const processed = Math.min(i + batchSize, contacts.length)
      onProgress?.({
        current: processed,
        total: contacts.length,
        percentage: Math.round((processed / contacts.length) * 100),
        status: 'processing',
        message: `Processing contacts... ${processed}/${contacts.length}`
      })

      await new Promise(resolve => setTimeout(resolve, 0))
    }

    onProgress?.({
      current: contacts.length,
      total: contacts.length,
      percentage: 100,
      status: 'complete',
      message: 'Export complete!'
    })

    return csvRows.join('\n')
  }

  static async exportDeals(
    deals: Deal[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<string> {
    const selectedFields = options.fields.filter(f => f.selected)
    
    if (selectedFields.length === 0) {
      throw new Error('At least one field must be selected for export')
    }

    onProgress?.({
      current: 0,
      total: deals.length,
      percentage: 0,
      status: 'preparing',
      message: 'Preparing export...'
    })

    const headers = selectedFields.map(field => field.label)
    const csvRows: string[] = []

    if (options.includeHeaders) {
      csvRows.push(this.formatCSVRow(headers))
    }

    const batchSize = 100
    for (let i = 0; i < deals.length; i += batchSize) {
      const batch = deals.slice(i, i + batchSize)
      
      for (const deal of batch) {
        const row = selectedFields.map(field => {
          const value = this.getDealFieldValue(deal, field.key, options.dateFormat)
          return this.sanitizeCSVValue(value)
        })
        csvRows.push(this.formatCSVRow(row))
      }

      const processed = Math.min(i + batchSize, deals.length)
      onProgress?.({
        current: processed,
        total: deals.length,
        percentage: Math.round((processed / deals.length) * 100),
        status: 'processing',
        message: `Processing deals... ${processed}/${deals.length}`
      })

      await new Promise(resolve => setTimeout(resolve, 0))
    }

    onProgress?.({
      current: deals.length,
      total: deals.length,
      percentage: 100,
      status: 'complete',
      message: 'Export complete!'
    })

    return csvRows.join('\n')
  }

  private static getContactFieldValue(contact: Contact, fieldKey: string, dateFormat: string): string {
    switch (fieldKey) {
      case 'name':
        return contact.name || ''
      case 'email':
        return contact.email || ''
      case 'phone':
        return contact.phone || ''
      case 'company':
        return contact.company || ''
      case 'status':
        return contact.status || ''
      case 'tags':
        return Array.isArray(contact.tags) ? contact.tags.join(', ') : ''
      case 'notes':
        return contact.notes || ''
      case 'last_contact_date':
        return contact.last_contact_date ? this.formatDate(contact.last_contact_date, dateFormat) : ''
      case 'created_at':
        return this.formatDate(contact.created_at, dateFormat)
      case 'updated_at':
        return this.formatDate(contact.updated_at, dateFormat)
      default:
        return ''
    }
  }

  private static getDealFieldValue(deal: Deal, fieldKey: string, dateFormat: string): string {
    switch (fieldKey) {
      case 'name':
        return deal.name || ''
      case 'contact_name':
        return deal.contact?.name || ''
      case 'contact_email':
        return deal.contact?.email || ''
      case 'contact_company':
        return deal.contact?.company || ''
      case 'value':
        return deal.value ? deal.value.toString() : ''
      case 'stage':
        return deal.stage || ''
      case 'expected_close_date':
        return deal.expected_close_date ? this.formatDate(deal.expected_close_date, dateFormat) : ''
      case 'notes':
        return deal.notes || ''
      case 'created_at':
        return this.formatDate(deal.created_at, dateFormat)
      case 'updated_at':
        return this.formatDate(deal.updated_at, dateFormat)
      default:
        return ''
    }
  }

  private static formatDate(dateString: string, format: string): string {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return ''
    }

    switch (format) {
      case 'us':
        return date.toLocaleDateString('en-US')
      case 'eu':
        return date.toLocaleDateString('en-GB')
      case 'iso':
      default:
        return date.toISOString().split('T')[0]
    }
  }

  private static sanitizeCSVValue(value: string): string {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)
    
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
      const escapedValue = stringValue.replace(/"/g, '""')
      return `"${escapedValue}"`
    }

    return stringValue
  }

  private static formatCSVRow(values: string[]): string {
    return values.join(',')
  }

  static downloadCSV(content: string, filename: string): void {
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

  static generateFilename(type: 'contacts' | 'deals', format: 'csv' = 'csv'): string {
    const timestamp = new Date().toISOString().split('T')[0]
    return `${type}_export_${timestamp}.${format}`
  }

  static validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = []

    if (!options.fields || options.fields.length === 0) {
      errors.push('No fields specified for export')
    }

    const selectedFields = options.fields.filter(f => f.selected)
    if (selectedFields.length === 0) {
      errors.push('At least one field must be selected for export')
    }

    if (!['csv'].includes(options.format)) {
      errors.push('Invalid export format')
    }

    if (!['iso', 'us', 'eu'].includes(options.dateFormat)) {
      errors.push('Invalid date format')
    }

    return errors
  }

  static getExportPreview(
    data: Contact[] | Deal[],
    options: ExportOptions,
    maxRows: number = 5
  ): string[] {
    const selectedFields = options.fields.filter(f => f.selected)
    const previewData = data.slice(0, maxRows)
    const rows: string[] = []

    if (options.includeHeaders) {
      const headers = selectedFields.map(field => field.label)
      rows.push(this.formatCSVRow(headers))
    }

    previewData.forEach(item => {
      const row = selectedFields.map(field => {
        let value: string
        if ('email' in item) {
          // It's a contact
          value = this.getContactFieldValue(item as Contact, field.key, options.dateFormat)
        } else {
          // It's a deal
          value = this.getDealFieldValue(item as Deal, field.key, options.dateFormat)
        }
        return this.sanitizeCSVValue(value)
      })
      rows.push(this.formatCSVRow(row))
    })

    return rows
  }
}