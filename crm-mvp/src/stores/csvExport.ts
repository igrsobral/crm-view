import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CSVExportService, type ExportField, type ExportOptions, type ExportProgress } from '@/services/csvExportService'
import { useContactsStore } from '@/stores/contacts'
import { useDealsStore } from '@/stores/deals'
import type { Contact } from '@/stores/contacts'
import type { Deal } from '@/stores/deals'

export type ExportType = 'contacts' | 'deals'

export const useCSVExportStore = defineStore('csvExport', () => {
  // State
  const exportType = ref<ExportType>('contacts')
  const fields = ref<ExportField[]>([])
  const includeHeaders = ref(true)
  const dateFormat = ref<'iso' | 'us' | 'eu'>('iso')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref<ExportProgress | null>(null)
  const previewData = ref<string[]>([])

  // Computed
  const selectedFields = computed(() => fields.value.filter(f => f.selected))
  
  const fieldsByCategory = computed(() => {
    return CSVExportService.getFieldsByCategory(fields.value)
  })

  const exportOptions = computed((): ExportOptions => ({
    format: 'csv',
    fields: fields.value,
    includeHeaders: includeHeaders.value,
    dateFormat: dateFormat.value
  }))

  const canExport = computed(() => {
    return selectedFields.value.length > 0 && !loading.value
  })

  const totalRecords = computed(() => {
    if (exportType.value === 'contacts') {
      const contactsStore = useContactsStore()
      return contactsStore.filteredContacts.length
    } else {
      const dealsStore = useDealsStore()
      return dealsStore.filteredDeals.length
    }
  })

  // Actions
  const setExportType = (type: ExportType) => {
    exportType.value = type
    initializeFields()
    updatePreview()
  }

  const initializeFields = () => {
    if (exportType.value === 'contacts') {
      fields.value = CSVExportService.getDefaultContactFields()
    } else {
      fields.value = CSVExportService.getDefaultDealFields()
    }
  }

  const toggleField = (fieldKey: string) => {
    const field = fields.value.find(f => f.key === fieldKey)
    if (field) {
      field.selected = !field.selected
      updatePreview()
    }
  }

  const toggleCategory = (category: string, selected: boolean) => {
    fields.value.forEach(field => {
      if (field.category === category) {
        field.selected = selected
      }
    })
    updatePreview()
  }

  const selectAllFields = () => {
    fields.value.forEach(field => {
      field.selected = true
    })
    updatePreview()
  }

  const deselectAllFields = () => {
    fields.value.forEach(field => {
      field.selected = false
    })
    updatePreview()
  }

  const updatePreview = () => {
    if (selectedFields.value.length === 0) {
      previewData.value = []
      return
    }

    try {
      let data: Contact[] | Deal[]
      
      if (exportType.value === 'contacts') {
        const contactsStore = useContactsStore()
        data = contactsStore.filteredContacts.slice(0, 5)
      } else {
        const dealsStore = useDealsStore()
        data = dealsStore.filteredDeals.slice(0, 5)
      }

      previewData.value = CSVExportService.getExportPreview(data, exportOptions.value, 5)
    } catch (err) {
      console.error('Error generating preview:', err)
      previewData.value = []
    }
  }

  const executeExport = async () => {
    loading.value = true
    error.value = null
    progress.value = null

    try {
      // Validate options
      const validationErrors = CSVExportService.validateExportOptions(exportOptions.value)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      let csvContent: string
      let filename: string

      if (exportType.value === 'contacts') {
        const contactsStore = useContactsStore()
        const contacts = contactsStore.filteredContacts

        if (contacts.length === 0) {
          throw new Error('No contacts to export')
        }

        csvContent = await CSVExportService.exportContacts(
          contacts,
          exportOptions.value,
          (progressUpdate) => {
            progress.value = progressUpdate
          }
        )
        filename = CSVExportService.generateFilename('contacts')
      } else {
        const dealsStore = useDealsStore()
        const deals = dealsStore.filteredDeals

        if (deals.length === 0) {
          throw new Error('No deals to export')
        }

        csvContent = await CSVExportService.exportDeals(
          deals,
          exportOptions.value,
          (progressUpdate) => {
            progress.value = progressUpdate
          }
        )
        filename = CSVExportService.generateFilename('deals')
      }

      CSVExportService.downloadCSV(csvContent, filename)

      setTimeout(() => {
        progress.value = null
      }, 2000)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      progress.value = {
        current: 0,
        total: 0,
        percentage: 0,
        status: 'error',
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    exportType.value = 'contacts'
    fields.value = []
    includeHeaders.value = true
    dateFormat.value = 'iso'
    loading.value = false
    error.value = null
    progress.value = null
    previewData.value = []
    initializeFields()
  }

  initializeFields()

  return {
    // State
    exportType,
    fields,
    includeHeaders,
    dateFormat,
    loading,
    error,
    progress,
    previewData,

    // Computed
    selectedFields,
    fieldsByCategory,
    exportOptions,
    canExport,
    totalRecords,

    // Actions
    setExportType,
    toggleField,
    toggleCategory,
    selectAllFields,
    deselectAllFields,
    updatePreview,
    executeExport,
    reset
  }
})