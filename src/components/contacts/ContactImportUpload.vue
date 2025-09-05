<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h2>
    
    <!-- File Upload Area -->
    <div 
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
      :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      
      <div class="text-sm text-gray-600 mb-4">
        <label for="file-upload" class="cursor-pointer">
          <span class="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
          <span> or drag and drop</span>
        </label>
        <input 
          id="file-upload" 
          name="file-upload" 
          type="file" 
          accept=".csv"
          class="sr-only" 
          @change="handleFileSelect"
        >
      </div>
      
      <p class="text-xs text-gray-500">CSV files only, up to 10MB</p>
    </div>

    <!-- File Info -->
    <div v-if="csvImportStore.fileName" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="text-sm font-medium text-green-800">{{ csvImportStore.fileName }}</p>
          <p class="text-xs text-green-600">{{ csvImportStore.csvRows.length }} rows detected</p>
        </div>
      </div>
    </div>

    <!-- Sample CSV Download -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-2">Need a template?</h3>
      <p class="text-sm text-gray-600 mb-3">
        Download our sample CSV file to see the expected format and column headers.
      </p>
      <button
        @click="csvImportStore.downloadSampleCSV()"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Sample CSV
      </button>
    </div>

    <!-- CSV Format Guidelines -->
    <div class="mt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3">CSV Format Guidelines</h3>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <ul class="text-sm text-gray-600 space-y-2">
          <li class="flex items-start">
            <span class="text-green-500 mr-2">•</span>
            <span><strong>Required field:</strong> Name (contact name is mandatory)</span>
          </li>
          <li class="flex items-start">
            <span class="text-blue-500 mr-2">•</span>
            <span><strong>Optional fields:</strong> Email, Phone, Company, Status, Tags, Notes</span>
          </li>
          <li class="flex items-start">
            <span class="text-blue-500 mr-2">•</span>
            <span><strong>Status values:</strong> lead, prospect, customer, inactive</span>
          </li>
          <li class="flex items-start">
            <span class="text-blue-500 mr-2">•</span>
            <span><strong>Tags format:</strong> Separate multiple tags with commas (e.g., "vip,enterprise")</span>
          </li>
          <li class="flex items-start">
            <span class="text-yellow-500 mr-2">•</span>
            <span><strong>Encoding:</strong> Use UTF-8 encoding for special characters</span>
          </li>
          <li class="flex items-start">
            <span class="text-yellow-500 mr-2">•</span>
            <span><strong>File size:</strong> Maximum 10MB per file</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCSVImportStore } from '@/stores/csvImport'

const csvImportStore = useCSVImportStore()
const isDragOver = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file: File) => {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    csvImportStore.error = 'Please select a CSV file'
    return
  }

  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    csvImportStore.error = 'File size must be less than 10MB'
    return
  }

  try {
    await csvImportStore.uploadCSV(file)
  } catch (error) {
    console.error('Error processing file:', error)
  }
}
</script>