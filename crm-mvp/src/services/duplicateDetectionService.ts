import type { Contact, ContactInput } from '@/stores/contacts'

export interface DuplicateMatch {
  importRow: ContactInput
  existingContact: Contact
  matchScore: number
  matchReasons: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface DuplicateDetectionResult {
  duplicates: DuplicateMatch[]
  unique: ContactInput[]
  summary: {
    total: number
    duplicates: number
    unique: number
    highConfidence: number
    mediumConfidence: number
    lowConfidence: number
  }
}

export interface MergeStrategy {
  field: keyof ContactInput
  strategy: 'keep_existing' | 'use_import' | 'merge' | 'ask_user'
}

export interface MergeOptions {
  strategies: MergeStrategy[]
  defaultStrategy: 'keep_existing' | 'use_import'
}

export class DuplicateDetectionService {
  private static readonly EMAIL_WEIGHT = 0.8
  private static readonly NAME_WEIGHT = 0.6
  private static readonly PHONE_WEIGHT = 0.4
  private static readonly COMPANY_WEIGHT = 0.3

  static detectDuplicates(
    importData: ContactInput[],
    existingContacts: Contact[]
  ): DuplicateDetectionResult {
    const duplicates: DuplicateMatch[] = []
    const unique: ContactInput[] = []

    for (const importRow of importData) {
      const matches = this.findMatches(importRow, existingContacts)
      
      if (matches.length > 0) {
        const bestMatch = matches.reduce((best, current) => 
          current.matchScore > best.matchScore ? current : best
        )
        duplicates.push(bestMatch)
      } else {
        unique.push(importRow)
      }
    }

    const highConfidence = duplicates.filter(d => d.confidence === 'high').length
    const mediumConfidence = duplicates.filter(d => d.confidence === 'medium').length
    const lowConfidence = duplicates.filter(d => d.confidence === 'low').length

    return {
      duplicates,
      unique,
      summary: {
        total: importData.length,
        duplicates: duplicates.length,
        unique: unique.length,
        highConfidence,
        mediumConfidence,
        lowConfidence
      }
    }
  }

  private static findMatches(
    importRow: ContactInput,
    existingContacts: Contact[]
  ): DuplicateMatch[] {
    const matches: DuplicateMatch[] = []

    for (const existingContact of existingContacts) {
      const match = this.calculateMatch(importRow, existingContact)
      
      if (match.matchScore > 0.3) { 
        matches.push(match)
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }

  private static calculateMatch(
    importRow: ContactInput,
    existingContact: Contact
  ): DuplicateMatch {
    let score = 0
    const reasons: string[] = []

    if (importRow.email && existingContact.email) {
      if (this.normalizeEmail(importRow.email) === this.normalizeEmail(existingContact.email)) {
        score += this.EMAIL_WEIGHT
        reasons.push('Exact email match')
      }
    }

    if (importRow.name && existingContact.name) {
      const nameScore = this.calculateNameSimilarity(importRow.name, existingContact.name)
      if (nameScore > 0.8) {
        score += this.NAME_WEIGHT * nameScore
        reasons.push(`Name similarity: ${Math.round(nameScore * 100)}%`)
      }
    }

    if (importRow.phone && existingContact.phone) {
      const normalizedImportPhone = this.normalizePhone(importRow.phone)
      const normalizedExistingPhone = this.normalizePhone(existingContact.phone)
      
      if (normalizedImportPhone === normalizedExistingPhone) {
        score += this.PHONE_WEIGHT
        reasons.push('Phone number match')
      }
    }

    if (importRow.company && existingContact.company) {
      const companyScore = this.calculateStringSimilarity(
        importRow.company.toLowerCase(),
        existingContact.company.toLowerCase()
      )
      if (companyScore > 0.8) {
        score += this.COMPANY_WEIGHT * companyScore
        reasons.push(`Company similarity: ${Math.round(companyScore * 100)}%`)
      }
    }

    let confidence: 'high' | 'medium' | 'low'
    if (score >= 0.8) {
      confidence = 'high'
    } else if (score >= 0.5) {
      confidence = 'medium'
    } else {
      confidence = 'low'
    }

    return {
      importRow,
      existingContact,
      matchScore: score,
      matchReasons: reasons,
      confidence
    }
  }

  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  private static normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '')
  }

  private static calculateNameSimilarity(name1: string, name2: string): number {
    const normalized1 = name1.toLowerCase().trim()
    const normalized2 = name2.toLowerCase().trim()

    if (normalized1 === normalized2) {
      return 1.0
    }

    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.9
    }

    return this.calculateStringSimilarity(normalized1, normalized2)
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) {
      return 1.0
    }

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  static mergeContacts(
    duplicateMatch: DuplicateMatch,
    mergeOptions: MergeOptions
  ): ContactInput {
    const merged: ContactInput = { ...duplicateMatch.importRow }

    for (const strategy of mergeOptions.strategies) {
      const field = strategy.field
      const importValue = duplicateMatch.importRow[field]
      const existingValue = duplicateMatch.existingContact[field]

      switch (strategy.strategy) {
        case 'keep_existing':
          if (existingValue !== undefined && existingValue !== null && existingValue !== '') {
            (merged as any)[field] = existingValue
          }
          break

        case 'use_import':
          // Keep the import value (already set)
          break

        case 'merge':
          if (field === 'tags' && Array.isArray(importValue) && Array.isArray(existingValue)) {
            // Merge tags arrays, removing duplicates
            const combinedTags = [...new Set([...existingValue, ...importValue])]
            merged.tags = combinedTags
          } else if (field === 'notes') {
            // Combine notes
            const importNotes = importValue as string || ''
            const existingNotes = existingValue as string || ''
            if (importNotes && existingNotes) {
              merged.notes = `${existingNotes}\n\n--- Imported Notes ---\n${importNotes}`
            } else {
              merged.notes = importNotes || existingNotes
            }
          }
          break

        case 'ask_user':
          // This would be handled by the UI component
          break
      }
    }

    return merged
  }

  static getDefaultMergeOptions(): MergeOptions {
    return {
      strategies: [
        { field: 'name', strategy: 'keep_existing' },
        { field: 'email', strategy: 'keep_existing' },
        { field: 'phone', strategy: 'use_import' },
        { field: 'company', strategy: 'use_import' },
        { field: 'status', strategy: 'use_import' },
        { field: 'tags', strategy: 'merge' },
        { field: 'notes', strategy: 'merge' }
      ],
      defaultStrategy: 'keep_existing'
    }
  }

  static generateDuplicateReport(result: DuplicateDetectionResult): string {
    const lines: string[] = []
    
    lines.push('Duplicate Detection Report')
    lines.push('=' .repeat(30))
    lines.push('')
    lines.push(`Total records processed: ${result.summary.total}`)
    lines.push(`Unique records: ${result.summary.unique}`)
    lines.push(`Potential duplicates: ${result.summary.duplicates}`)
    lines.push('')
    lines.push('Confidence Breakdown:')
    lines.push(`  High confidence: ${result.summary.highConfidence}`)
    lines.push(`  Medium confidence: ${result.summary.mediumConfidence}`)
    lines.push(`  Low confidence: ${result.summary.lowConfidence}`)
    lines.push('')
    
    if (result.duplicates.length > 0) {
      lines.push('Duplicate Details:')
      lines.push('-'.repeat(20))
      
      result.duplicates.forEach((duplicate, index) => {
        lines.push(`${index + 1}. ${duplicate.importRow.name} (${duplicate.confidence} confidence)`)
        lines.push(`   Import: ${duplicate.importRow.email || 'No email'}`)
        lines.push(`   Existing: ${duplicate.existingContact.email || 'No email'}`)
        lines.push(`   Match Score: ${Math.round(duplicate.matchScore * 100)}%`)
        lines.push(`   Reasons: ${duplicate.matchReasons.join(', ')}`)
        lines.push('')
      })
    }
    
    return lines.join('\n')
  }

  static downloadDuplicateReport(result: DuplicateDetectionResult): void {
    const report = this.generateDuplicateReport(result)
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `duplicate_report_${new Date().toISOString().split('T')[0]}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}