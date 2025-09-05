<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">Map CSV Fields</h2>
    <p class="text-sm text-gray-600 mb-6">
      Map your CSV columns to contact fields. Fields marked with * are required.
    </p>

    <!-- Field Mapping Table -->
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CSV Column
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sample Data
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Map to Contact Field
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="mapping in csvImportStore.fieldMapping" :key="mapping.csvField">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ mapping.csvField }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getSampleData(mapping.csvField) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="mapping.contactField"
                @change="updateMapping(mapping.csvField, ($event.target as HTMLSelectElement).value)"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': isFieldRequired(mapping.contactField) && !hasRequiredMapping(mapping.contactField)
                }"
              >
                <option value="skip">Skip this field</option>
                <option 
                  v-for="field in contactFields" 
                  :key="field.value"
                  :value="field.value"
                  :disabled="isFieldAlreadyMapped(field.value, mapping.csvField)"
                >
                  {{ field.label }}{{ field.required ? ' *' : '' }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Validation Messages -->
    <div v-if="validationErrors.length > 0" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 class="text-sm font-medium text-red-800 mb-2">Mapping Issues</h3>
      <ul class="text-sm text-red-700 space-y-1">
        <li v-for="error in validationErrors" :key="error" class="flex items-start">
          <span class="text-red-500 mr-2">•</span>
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- Field Descriptions -->
    <div class="mt-6 bg-gray-50 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Field Descriptions</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <p><strong>Name *:</strong> Full contact name (required)</p>
          <p><strong>Email:</strong> Contact email address</p>
          <p><strong>Phone:</strong> Contact phone number</p>
          <p><strong>Company:</strong> Company or organization name</p>
        </div>
        <div>
          <p><strong>Status:</strong> lead, prospect, customer, or inactive</p>
          <p><strong>Tags:</strong> Comma-separated tags (e.g., "vip,enterprise")</p>
          <p><strong>Notes:</strong> Additional notes or comments</p>
        </div>
      </div>
    </div>

    <!-- Preview Sample -->
    <div v-if="csvImportStore.csvRows.length > 0" class="mt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Preview First Row</h3>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div v-for="mapping in csvImportStore.fieldMapping" :key="mapping.csvField">
            <div v-if="mapping.contactField !== 'skip'" class="flex justify-between">
              <span class="font-medium text-gray-700">{{ getFieldLabel(mapping.contactField) }}:</span>
              <span class="text-gray-600">{{ csvImportStore.csvRows[0][mapping.csvField] || '(empty)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCSVImportStore } from '@/stores/csvImport'
import { CSVImportService } from '@/services/csvImportService'
import type { ContactInput } from '@/stores/contacts'

const csvImportStore = useCSVImportStore()

const contactFields = [
  { value: 'name', label: 'Name', required: true },
  { value: 'email', label: 'Email', required: false },
  { value: 'phone', label: 'Phone', required: false },
  { value: 'company', label: 'Company', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'tags', label: 'Tags', required: false },
  { value: 'notes', label: 'Notes', required: false }
]

const validationErrors = computed(() => {
  return CSVImportService.validateFieldMapping(csvImportStore.fieldMapping)
})

const getSampleData = (csvField: string): string => {
  const firstRow = csvImportStore.csvRows[0]
  if (!firstRow) return ''
  
  const value = firstRow[csvField] || ''
  return value.length > 30 ? value.substring(0, 30) + '...' : value
}

const updateMapping = (csvField: string, contactField: string) => {
  csvImportStore.updateFieldMapping(csvField, contactField as keyof ContactInput | 'skip')
}

const isFieldRequired = (field: string): boolean => {
  return contactFields.find(f => f.value === field)?.required || false
}

const hasRequiredMapping = (field: string): boolean => {
  return csvImportStore.fieldMapping.some(m => m.contactField === field)
}

const isFieldAlreadyMapped = (field: string, currentCsvField: string): boolean => {
  if (field === 'skip') return false
  return csvImportStore.fieldMapping.some(m => 
    m.contactField === field && m.csvField !== currentCsvField
  )
}

const getFieldLabel = (field: string): string => {
  return contactFields.find(f => f.value === field)?.label || field
}
</script>