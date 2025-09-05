<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Export Data</h1>
      <p class="text-gray-600">Export your contacts and deals to CSV format</p>
    </div>

    <!-- Export Type Selection -->
    <div class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">What would you like to export?</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          @click="csvExportStore.setExportType('contacts')"
          :class="[
            'p-6 border-2 rounded-lg text-left transition-colors',
            csvExportStore.exportType === 'contacts'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center mb-2">
            <svg class="h-6 w-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Contacts</h3>
          </div>
          <p class="text-sm text-gray-600 mb-2">Export your contact database</p>
          <p class="text-sm font-medium text-blue-600">{{ csvExportStore.totalRecords }} contacts available</p>
        </button>

        <button
          @click="csvExportStore.setExportType('deals')"
          :class="[
            'p-6 border-2 rounded-lg text-left transition-colors',
            csvExportStore.exportType === 'deals'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center mb-2">
            <svg class="h-6 w-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Deals</h3>
          </div>
          <p class="text-sm text-gray-600 mb-2">Export your sales pipeline</p>
          <p class="text-sm font-medium text-green-600">{{ csvExportStore.totalRecords }} deals available</p>
        </button>
      </div>
    </div>

    <!-- Field Selection -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900">Select Fields to Export</h2>
        <div class="flex space-x-2">
          <button
            @click="csvExportStore.selectAllFields()"
            class="text-sm text-blue-600 hover:text-blue-500"
          >
            Select All
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="csvExportStore.deselectAllFields()"
            class="text-sm text-blue-600 hover:text-blue-500"
          >
            Deselect All
          </button>
        </div>
      </div>

      <!-- Field Categories -->
      <div class="space-y-6">
        <div 
          v-for="(categoryFields, category) in csvExportStore.fieldsByCategory" 
          :key="category"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-900 capitalize">
              {{ category === 'basic' ? 'Basic Information' :
                 category === 'contact' ? 'Contact Details' :
                 category === 'business' ? 'Business Information' :
                 'Metadata' }}
            </h3>
            <div class="flex items-center space-x-2">
              <button
                @click="csvExportStore.toggleCategory(category, true)"
                class="text-xs text-blue-600 hover:text-blue-500"
              >
                Select All
              </button>
              <span class="text-gray-300">|</span>
              <button
                @click="csvExportStore.toggleCategory(category, false)"
                class="text-xs text-blue-600 hover:text-blue-500"
              >
                None
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <label 
              v-for="field in categoryFields" 
              :key="field.key"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :checked="field.selected"
                @change="csvExportStore.toggleField(field.key)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <span class="ml-2 text-sm text-gray-700">{{ field.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Export Options</h2>
      <div class="bg-gray-50 rounded-lg p-4 space-y-4">
        <div class="flex items-center">
          <input
            id="include-headers"
            v-model="csvExportStore.includeHeaders"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="include-headers" class="ml-2 text-sm text-gray-700">
            Include column headers in export
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            v-model="csvExportStore.dateFormat"
            class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="iso">ISO Format (YYYY-MM-DD)</option>
            <option value="us">US Format (MM/DD/YYYY)</option>
            <option value="eu">European Format (DD/MM/YYYY)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="csvExportStore.selectedFields.length > 0" class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Preview</h2>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="(row, index) in csvExportStore.previewData" 
                :key="index"
                :class="{ 'bg-gray-50': index === 0 && csvExportStore.includeHeaders }"
              >
                <td 
                  v-for="(cell, cellIndex) in row.split(',')" 
                  :key="cellIndex"
                  class="px-6 py-3 whitespace-nowrap text-sm"
                  :class="{ 
                    'font-medium text-gray-900': index === 0 && csvExportStore.includeHeaders,
                    'text-gray-500': index !== 0 || !csvExportStore.includeHeaders
                  }"
                >
                  {{ cell.replace(/^"|"$/g, '') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            Showing first {{ Math.max(0, csvExportStore.previewData.length - (csvExportStore.includeHeaders ? 1 : 0)) }} rows of {{ csvExportStore.totalRecords }} total records
          </p>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="csvExportStore.progress" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">{{ csvExportStore.progress.message }}</span>
        <span class="text-sm text-gray-500">{{ csvExportStore.progress.percentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="{
            'bg-blue-600': csvExportStore.progress.status === 'processing',
            'bg-green-600': csvExportStore.progress.status === 'complete',
            'bg-red-600': csvExportStore.progress.status === 'error'
          }"
          :style="{ width: `${csvExportStore.progress.percentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="csvExportStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Export Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ csvExportStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Export Summary -->
    <div v-if="csvExportStore.selectedFields.length > 0" class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-medium text-blue-800 mb-2">Export Summary</h3>
      <div class="text-sm text-blue-700 space-y-1">
        <p>Export type: <strong>{{ csvExportStore.exportType === 'contacts' ? 'Contacts' : 'Deals' }}</strong></p>
        <p>Records to export: <strong>{{ csvExportStore.totalRecords }}</strong></p>
        <p>Selected fields: <strong>{{ csvExportStore.selectedFields.length }}</strong></p>
        <p>Include headers: <strong>{{ csvExportStore.includeHeaders ? 'Yes' : 'No' }}</strong></p>
        <p>Date format: <strong>{{ 
          csvExportStore.dateFormat === 'iso' ? 'ISO (YYYY-MM-DD)' :
          csvExportStore.dateFormat === 'us' ? 'US (MM/DD/YYYY)' :
          'European (DD/MM/YYYY)'
        }}</strong></p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between">
      <router-link
        :to="csvExportStore.exportType === 'contacts' ? '/contacts' : '/deals'"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </router-link>

      <button
        @click="csvExportStore.executeExport()"
        :disabled="!csvExportStore.canExport"
        class="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="csvExportStore.loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </span>
        <span v-else>
          Export {{ csvExportStore.exportType === 'contacts' ? 'Contacts' : 'Deals' }} ({{ csvExportStore.totalRecords }})
        </span>
      </button>
    </div>

    <!-- Export Tips -->
    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-2">Export Tips</h3>
      <ul class="text-sm text-gray-600 space-y-1">
        <li class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Large exports may take a few moments to process</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>The CSV file will be automatically downloaded to your default download folder</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>You can open CSV files in Excel, Google Sheets, or any spreadsheet application</span>
        </li>
        <li class="flex items-start">
          <span class="text-blue-500 mr-2">•</span>
          <span>Use UTF-8 encoding when importing the CSV to preserve special characters</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCSVExportStore } from '@/stores/csvExport'

const csvExportStore = useCSVExportStore()

onMounted(() => {
  csvExportStore.updatePreview()
})
</script>