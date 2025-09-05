<template>
  <div>
    <div class="text-center mb-8">
      <!-- Success Icon -->
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 class="text-lg font-medium text-gray-900 mb-2">Import Complete!</h2>
      <p class="text-sm text-gray-600">
        Your contacts have been successfully imported into your CRM.
      </p>
    </div>

    <!-- Import Summary -->
    <div v-if="csvImportStore.importResult" class="mb-8">
      <h3 class="text-sm font-medium text-gray-900 mb-4">Import Summary</h3>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ csvImportStore.importResult.summary.total }}</div>
          <div class="text-sm text-blue-800">Total Processed</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ csvImportStore.importResult.summary.successful }}</div>
          <div class="text-sm text-green-800">Successfully Imported</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-red-600">{{ csvImportStore.importResult.summary.failed }}</div>
          <div class="text-sm text-red-800">Failed</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">{{ csvImportStore.importResult.summary.duplicates }}</div>
          <div class="text-sm text-yellow-800">Duplicates Skipped</div>
        </div>
      </div>

      <!-- Detailed Results -->
      <div v-if="csvImportStore.importResult.failed.length > 0 || csvImportStore.importResult.duplicates.length > 0" class="space-y-4">
        <!-- Failed Imports -->
        <div v-if="csvImportStore.importResult.failed.length > 0" class="border border-red-200 rounded-lg">
          <div class="bg-red-50 px-4 py-3 border-b border-red-200">
            <h4 class="text-sm font-medium text-red-800">
              Failed Imports ({{ csvImportStore.importResult.failed.length }})
            </h4>
          </div>
          <div class="p-4">
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div 
                v-for="failedRow in csvImportStore.importResult.failed" 
                :key="failedRow.rowIndex"
                class="flex justify-between items-start p-3 bg-white border border-gray-200 rounded"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    Row {{ failedRow.rowIndex }}: {{ failedRow.mappedData.name || 'Unknown' }}
                  </p>
                  <div class="mt-1 space-y-1">
                    <p 
                      v-for="error in failedRow.errors" 
                      :key="error"
                      class="text-xs text-red-600"
                    >
                      {{ error }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Duplicate Contacts -->
        <div v-if="csvImportStore.importResult.duplicates.length > 0" class="border border-yellow-200 rounded-lg">
          <div class="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
            <h4 class="text-sm font-medium text-yellow-800">
              Duplicate Contacts Skipped ({{ csvImportStore.importResult.duplicates.length }})
            </h4>
          </div>
          <div class="p-4">
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div 
                v-for="duplicateRow in csvImportStore.importResult.duplicates" 
                :key="duplicateRow.rowIndex"
                class="flex justify-between items-start p-3 bg-white border border-gray-200 rounded"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    Row {{ duplicateRow.rowIndex }}: {{ duplicateRow.mappedData.name || 'Unknown' }}
                  </p>
                  <p class="text-xs text-yellow-600 mt-1">
                    {{ duplicateRow.mappedData.email }} (already exists)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message for Perfect Import -->
    <div v-if="csvImportStore.importResult && csvImportStore.importResult.summary.failed === 0 && csvImportStore.importResult.summary.duplicates === 0" class="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-green-800">Perfect Import!</h3>
          <p class="mt-1 text-sm text-green-700">
            All {{ csvImportStore.importResult.summary.successful }} contacts were imported successfully without any issues.
          </p>
        </div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-900 mb-3">What's Next?</h3>
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Review your imported contacts in the Contacts section</span>
        </div>
        <div class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Create deals for your prospects and leads</span>
        </div>
        <div class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Start logging activities and scheduling follow-ups</span>
        </div>
        <div class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Use tags to organize and filter your contacts</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
      <router-link
        to="/contacts"
        class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        View All Contacts
      </router-link>
      
      <button
        @click="csvImportStore.reset()"
        class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Import More Contacts
      </button>
      
      <router-link
        to="/dashboard"
        class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Dashboard
      </router-link>
    </div>

    <!-- Download Report Option -->
    <div v-if="csvImportStore.importResult && (csvImportStore.importResult.summary.failed > 0 || csvImportStore.importResult.summary.duplicates > 0)" class="mt-6 text-center">
      <button
        @click="downloadImportReport"
        class="text-sm text-blue-600 hover:text-blue-500 underline"
      >
        Download detailed import report
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCSVImportStore } from '@/stores/csvImport'
import { CSVImportService } from '@/services/csvImportService'

const csvImportStore = useCSVImportStore()

const downloadImportReport = () => {
  if (!csvImportStore.importResult) return

  const report = generateImportReport()
  CSVImportService.createDownloadableFile(report, `import_report_${new Date().toISOString().split('T')[0]}.csv`)
}

const generateImportReport = (): string => {
  if (!csvImportStore.importResult) return ''

  const headers = ['Row', 'Name', 'Email', 'Status', 'Issues']
  const rows: string[] = [headers.join(',')]

  csvImportStore.importResult.failed.forEach(row => {
    const csvRow = [
      row.rowIndex.toString(),
      `"${row.mappedData.name || ''}"`,
      `"${row.mappedData.email || ''}"`,
      'Failed',
      `"${row.errors.join('; ')}"`
    ]
    rows.push(csvRow.join(','))
  })

  csvImportStore.importResult.duplicates.forEach(row => {
    const csvRow = [
      row.rowIndex.toString(),
      `"${row.mappedData.name || ''}"`,
      `"${row.mappedData.email || ''}"`,
      'Duplicate',
      `"${row.errors.join('; ')}"`
    ]
    rows.push(csvRow.join(','))
  })

  return rows.join('\n')
}
</script>