<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">Preview Import Data</h2>
    
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ csvImportStore.previewData.length }}</div>
        <div class="text-sm text-blue-800">Total Rows</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ csvImportStore.validRows.length }}</div>
        <div class="text-sm text-green-800">Valid Rows</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-red-600">{{ csvImportStore.invalidRows.length }}</div>
        <div class="text-sm text-red-800">Invalid Rows</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">{{ csvImportStore.duplicateRows.length }}</div>
        <div class="text-sm text-yellow-800">Duplicates</div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="border-b border-gray-200 mb-4">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
          <span 
            :class="[
              'ml-2 py-0.5 px-2 rounded-full text-xs',
              tab.id === 'all' ? 'bg-blue-100 text-blue-800' :
              tab.id === 'valid' ? 'bg-green-100 text-green-800' :
              tab.id === 'invalid' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            ]"
          >
            {{ getTabCount(tab.id) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Data Table -->
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Row
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="row in filteredRows" 
              :key="row.rowIndex"
              :class="{
                'bg-red-50': !row.isValid,
                'bg-yellow-50': row.errors.some(e => e.includes('Duplicate'))
              }"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ row.rowIndex }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    row.isValid && !row.errors.some(e => e.includes('Duplicate'))
                      ? 'bg-green-100 text-green-800'
                      : row.errors.some(e => e.includes('Duplicate'))
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ 
                    row.isValid && !row.errors.some(e => e.includes('Duplicate'))
                      ? 'Valid'
                      : row.errors.some(e => e.includes('Duplicate'))
                      ? 'Duplicate'
                      : 'Invalid'
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ row.mappedData.name || '(empty)' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ row.mappedData.email || '(empty)' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ row.mappedData.company || '(empty)' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div v-if="row.errors.length > 0" class="space-y-1">
                  <div 
                    v-for="error in row.errors" 
                    :key="error"
                    class="text-xs text-red-600"
                  >
                    {{ error }}
                  </div>
                </div>
                <span v-else class="text-green-600 text-xs">No issues</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredRows.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No rows to display</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ activeTab === 'valid' ? 'No valid rows found' : 
           activeTab === 'invalid' ? 'No invalid rows found' :
           activeTab === 'duplicates' ? 'No duplicate rows found' :
           'No data available' }}
      </p>
    </div>

    <!-- Import Options -->
    <div v-if="csvImportStore.validRows.length > 0" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Import Options</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input 
            v-model="skipInvalid" 
            type="checkbox" 
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <span class="ml-2 text-sm text-gray-700">
            Skip invalid rows ({{ csvImportStore.invalidRows.length }} rows)
          </span>
        </label>
        <label class="flex items-center">
          <input 
            v-model="skipDuplicates" 
            type="checkbox" 
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <span class="ml-2 text-sm text-gray-700">
            Skip duplicate rows ({{ csvImportStore.duplicateRows.length }} rows)
          </span>
        </label>
      </div>
      
      <div class="mt-4 p-3 bg-blue-50 rounded-md">
        <p class="text-sm text-blue-800">
          <strong>{{ getImportCount() }}</strong> contacts will be imported with current settings.
        </p>
      </div>
    </div>

    <!-- Warning if no valid rows -->
    <div v-else class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">No Valid Rows</h3>
          <p class="mt-1 text-sm text-red-700">
            All rows contain validation errors. Please fix the issues or go back to adjust field mapping.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCSVImportStore } from '@/stores/csvImport'

const csvImportStore = useCSVImportStore()

const activeTab = ref<'all' | 'valid' | 'invalid' | 'duplicates'>('all')
const skipInvalid = ref(true)
const skipDuplicates = ref(true)

const tabs = [
  { id: 'all' as const, label: 'All Rows' },
  { id: 'valid' as const, label: 'Valid' },
  { id: 'invalid' as const, label: 'Invalid' },
  { id: 'duplicates' as const, label: 'Duplicates' }
]

const filteredRows = computed(() => {
  switch (activeTab.value) {
    case 'valid':
      return csvImportStore.validRows
    case 'invalid':
      return csvImportStore.invalidRows
    case 'duplicates':
      return csvImportStore.duplicateRows
    default:
      return csvImportStore.previewData
  }
})

const getTabCount = (tabId: string): number => {
  switch (tabId) {
    case 'all':
      return csvImportStore.previewData.length
    case 'valid':
      return csvImportStore.validRows.length
    case 'invalid':
      return csvImportStore.invalidRows.length
    case 'duplicates':
      return csvImportStore.duplicateRows.length
    default:
      return 0
  }
}

const getImportCount = (): number => {
  let count = csvImportStore.validRows.length
  
  if (!skipInvalid.value) {
    count += csvImportStore.invalidRows.length
  }
  
  if (!skipDuplicates.value) {
    count += csvImportStore.duplicateRows.length
  }
  
  return count
}

// Store import options for the execute step
csvImportStore.$patch({
  importOptions: {
    skipInvalid: skipInvalid.value,
    skipDuplicates: skipDuplicates.value
  }
})
</script>