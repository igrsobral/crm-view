import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CSVImportService, type CSVRow, type FieldMapping, type ImportPreviewRow, type ImportResult } from '@/services/csvImportService'
import { DuplicateDetectionService, type DuplicateDetectionResult, type DuplicateMatch } from '@/services/duplicateDetectionService'
import { useContactsStore } from '@/stores/contacts'
import type { ContactInput } from '@/stores/contacts'

export interface ImportStep {
  id: 'upload' | 'mapping' | 'preview' | 'duplicates' | 'import' | 'complete'
  title: string
  description: string
}

export const useCSVImportStore = defineStore('csvImport', () => {
  // State
  const currentStep = ref<ImportStep['id']>('upload')
  const csvContent = ref('')
  const csvHeaders = ref<string[]>([])
  const csvRows = ref<CSVRow[]>([])
  const fieldMapping = ref<FieldMapping[]>([])
  const previewData = ref<ImportPreviewRow[]>([])
  const importResult = ref<ImportResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fileName = ref('')
  const importOptions = ref({ skipInvalid: true, skipDuplicates: true })
  const duplicateDetectionResult = ref<DuplicateDetectionResult | null>(null)
  const duplicateResolutions = ref<any[]>([])

  // Import steps configuration
  const steps: ImportStep[] = [
    { id: 'upload', title: 'Upload CSV', description: 'Select and upload your CSV file' },
    { id: 'mapping', title: 'Map Fields', description: 'Map CSV columns to contact fields' },
    { id: 'preview', title: 'Preview Data', description: 'Review and validate import data' },
    { id: 'duplicates', title: 'Handle Duplicates', description: 'Resolve duplicate contacts' },
    { id: 'import', title: 'Import', description: 'Import contacts to your CRM' },
    { id: 'complete', title: 'Complete', description: 'Import completed successfully' }
  ]

  // Computed
  const currentStepIndex = computed(() => {
    return steps.findIndex(step => step.id === currentStep.value)
  })

  const currentStepInfo = computed(() => {
    return steps[currentStepIndex.value]
  })

  const canProceedToNext = computed(() => {
    switch (currentStep.value) {
      case 'upload':
        return csvRows.value.length > 0
      case 'mapping':
        return fieldMapping.value.length > 0 && 
               CSVImportService.validateFieldMapping(fieldMapping.value).length === 0
      case 'preview':
        return previewData.value.length > 0 && 
               previewData.value.some(row => row.isValid)
      case 'duplicates':
        return duplicateDetectionResult.value !== null
      case 'import':
        return importResult.value !== null
      default:
        return false
    }
  })

  const validRows = computed(() => {
    return previewData.value.filter(row => row.isValid)
  })

  const invalidRows = computed(() => {
    return previewData.value.filter(row => !row.isValid)
  })

  const duplicateRows = computed(() => {
    return previewData.value.filter(row => 
      row.errors.some(error => error.includes('Duplicate'))
    )
  })

  const uploadCSV = async (file: File) => {
    loading.value = true
    error.value = null
    
    try {
      const content = await readFileAsText(file)
      csvContent.value = content
      fileName.value = file.name
      
      csvRows.value = CSVImportService.parseCSV(content)
      csvHeaders.value = CSVImportService.getCSVHeaders(content)
      
      initializeFieldMapping()
      
      currentStep.value = 'mapping'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to parse CSV file'
    } finally {
      loading.value = false
    }
  }

  const initializeFieldMapping = () => {
    const mapping: FieldMapping[] = []
    
    csvHeaders.value.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim()
      let contactField: keyof ContactInput | 'skip' = 'skip'
      
      if (normalizedHeader.includes('name') || normalizedHeader === 'contact') {
        contactField = 'name'
      } else if (normalizedHeader.includes('email') || normalizedHeader.includes('mail')) {
        contactField = 'email'
      } else if (normalizedHeader.includes('phone') || normalizedHeader.includes('tel')) {
        contactField = 'phone'
      } else if (normalizedHeader.includes('company') || normalizedHeader.includes('organization')) {
        contactField = 'company'
      } else if (normalizedHeader.includes('status')) {
        contactField = 'status'
      } else if (normalizedHeader.includes('tag')) {
        contactField = 'tags'
      } else if (normalizedHeader.includes('note') || normalizedHeader.includes('comment')) {
        contactField = 'notes'
      }
      
      mapping.push({
        csvField: header,
        contactField
      })
    })
    
    fieldMapping.value = mapping
  }

  const updateFieldMapping = (csvField: string, contactField: keyof ContactInput | 'skip') => {
    const mapping = fieldMapping.value.find(m => m.csvField === csvField)
    if (mapping) {
      mapping.contactField = contactField
    }
  }

  const validateAndPreview = async () => {
    loading.value = true
    error.value = null
    
    try {
      const contactsStore = useContactsStore()
      const result = CSVImportService.validateAndPreviewImport(
        csvRows.value,
        fieldMapping.value,
        contactsStore.contacts
      )
      
      if (!result.isValid && result.errors.length > 0) {
        error.value = result.errors.join(', ')
      }
      
      previewData.value = result.preview
      currentStep.value = 'preview'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to validate import data'
    } finally {
      loading.value = false
    }
  }

  const detectDuplicates = async () => {
    loading.value = true
    error.value = null
    
    try {
      const contactsStore = useContactsStore()
      const validRows = previewData.value
        .filter(row => row.isValid)
        .map(row => row.mappedData as ContactInput)
      
      duplicateDetectionResult.value = DuplicateDetectionService.detectDuplicates(
        validRows,
        contactsStore.contacts
      )
      
      currentStep.value = 'duplicates'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to detect duplicates'
    } finally {
      loading.value = false
    }
  }

  const resolveDuplicates = (resolutions: any[]) => {
    duplicateResolutions.value = resolutions
    currentStep.value = 'import'
  }

  const executeImport = async (options: { skipDuplicates: boolean; skipInvalid: boolean } = { skipDuplicates: true, skipInvalid: true }) => {
    loading.value = true
    error.value = null
    
    try {
      const contactsStore = useContactsStore()
      const rowsToImport = previewData.value.filter(row => {
        if (!options.skipInvalid && !row.isValid) return false
        if (!options.skipDuplicates && row.errors.some(e => e.includes('Duplicate'))) return false
        return row.isValid || !options.skipInvalid
      })
      
      const successful: any[] = []
      const failed: ImportPreviewRow[] = []
      const duplicates: ImportPreviewRow[] = []
      
      for (const row of rowsToImport) {
        try {
          if (row.errors.some(e => e.includes('Duplicate'))) {
            duplicates.push(row)
            continue
          }
          
          if (!row.isValid && options.skipInvalid) {
            failed.push(row)
            continue
          }
          
          const result = await contactsStore.createContact(row.mappedData as ContactInput)
          
          if (result.error) {
            row.errors.push(result.error)
            failed.push(row)
          } else if (result.data) {
            successful.push(result.data)
          }
        } catch (err) {
          row.errors.push(err instanceof Error ? err.message : 'Unknown error')
          failed.push(row)
        }
      }
      
      importResult.value = {
        successful,
        failed,
        duplicates,
        summary: {
          total: previewData.value.length,
          successful: successful.length,
          failed: failed.length,
          duplicates: duplicates.length
        }
      }
      
      currentStep.value = 'complete'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import contacts'
    } finally {
      loading.value = false
    }
  }

  const nextStep = async () => {
    switch (currentStep.value) {
      case 'mapping':
        await validateAndPreview()
        break
      case 'preview':
        await detectDuplicates()
        break
      case 'duplicates':
        currentStep.value = 'import'
        break
      default:
        const nextIndex = currentStepIndex.value + 1
        if (nextIndex < steps.length) {
          currentStep.value = steps[nextIndex].id
        }
    }
  }

  const previousStep = () => {
    const prevIndex = currentStepIndex.value - 1
    if (prevIndex >= 0) {
      currentStep.value = steps[prevIndex].id
    }
  }

  const reset = () => {
    currentStep.value = 'upload'
    csvContent.value = ''
    csvHeaders.value = []
    csvRows.value = []
    fieldMapping.value = []
    previewData.value = []
    importResult.value = null
    loading.value = false
    error.value = null
    fileName.value = ''
    importOptions.value = { skipInvalid: true, skipDuplicates: true }
    duplicateDetectionResult.value = null
    duplicateResolutions.value = []
  }

  const downloadSampleCSV = () => {
    const sampleContent = CSVImportService.generateSampleCSV()
    CSVImportService.createDownloadableFile(sampleContent, 'contacts_sample.csv')
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsText(file)
    })
  }

  return {
    // State
    currentStep,
    csvContent,
    csvHeaders,
    csvRows,
    fieldMapping,
    previewData,
    importResult,
    loading,
    error,
    fileName,
    importOptions,
    duplicateDetectionResult,
    duplicateResolutions,
    steps,

    // Computed
    currentStepIndex,
    currentStepInfo,
    canProceedToNext,
    validRows,
    invalidRows,
    duplicateRows,

    // Actions
    uploadCSV,
    updateFieldMapping,
    validateAndPreview,
    detectDuplicates,
    resolveDuplicates,
    executeImport,
    nextStep,
    previousStep,
    reset,
    downloadSampleCSV
  }
})