<template>
    <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Import Contacts</h2>

        <!-- Import Summary -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-sm font-medium text-blue-800 mb-2">Import Summary</h3>
            <div class="text-sm text-blue-700 space-y-1">
                <p>Total rows to process: <strong>{{ getImportCount() }}</strong></p>
                <p>Valid contacts: <strong>{{ csvImportStore.validRows.length }}</strong></p>
                <p v-if="csvImportStore.invalidRows.length > 0">
                    Invalid rows to skip: <strong>{{ csvImportStore.invalidRows.length }}</strong>
                </p>
                <p v-if="csvImportStore.duplicateRows.length > 0">
                    Duplicate rows to skip: <strong>{{ csvImportStore.duplicateRows.length }}</strong>
                </p>
            </div>
        </div>

        <!-- Import Options -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Import Options</h3>
            <div class="space-y-3">
                <label class="flex items-center">
                    <input v-model="skipInvalid" type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <span class="ml-2 text-sm text-gray-700">
                        Skip invalid rows ({{ csvImportStore.invalidRows.length }} rows)
                    </span>
                </label>
                <label class="flex items-center">
                    <input v-model="skipDuplicates" type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <span class="ml-2 text-sm text-gray-700">
                        Skip duplicate rows ({{ csvImportStore.duplicateRows.length }} rows)
                    </span>
                </label>
            </div>
        </div>

        <!-- Progress Bar (shown during import) -->
        <div v-if="csvImportStore.loading" class="mb-6">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Importing contacts...</span>
                <span class="text-sm text-gray-500">{{ Math.round(progress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-2">
                Processing row {{ currentRow }} of {{ totalRows }}
            </p>
        </div>

        <!-- Import Button -->
        <div class="flex justify-center">
            <button @click="startImport" :disabled="csvImportStore.loading || getImportCount() === 0"
                class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="csvImportStore.loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Importing...
                </span>
                <span v-else>
                    Start Import ({{ getImportCount() }} contacts)
                </span>
            </button>
        </div>

        <!-- Warning Messages -->
        <div v-if="getImportCount() === 0" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex">
                <svg class="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
                <div>
                    <h3 class="text-sm font-medium text-yellow-800">No Contacts to Import</h3>
                    <p class="mt-1 text-sm text-yellow-700">
                        With current settings, no contacts will be imported. Please adjust your options or go back to
                        fix data issues.
                    </p>
                </div>
            </div>
        </div>

        <!-- Import Tips -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Import Tips</h3>
            <ul class="text-sm text-gray-600 space-y-1">
                <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>The import process may take a few moments for large files</span>
                </li>
                <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>You can safely close this window during import - progress will be saved</span>
                </li>
                <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>Duplicate detection is based on email addresses</span>
                </li>
                <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>A detailed report will be shown after import completion</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCSVImportStore } from '@/stores/csvImport'

const csvImportStore = useCSVImportStore()

const skipInvalid = ref(true)
const skipDuplicates = ref(true)
const progress = ref(0)
const currentRow = ref(0)
const totalRows = ref(0)

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

const startImport = async () => {
    const importCount = getImportCount()
    if (importCount === 0) return

    progress.value = 0
    currentRow.value = 0
    totalRows.value = importCount

    const progressInterval = setInterval(() => {
        if (progress.value < 90) {
            progress.value += Math.random() * 10
            currentRow.value = Math.floor((progress.value / 100) * totalRows.value)
        }
    }, 200)

    try {
        await csvImportStore.executeImport({
            skipInvalid: skipInvalid.value,
            skipDuplicates: skipDuplicates.value
        })

        progress.value = 100
        currentRow.value = totalRows.value

        clearInterval(progressInterval)
    } catch (error) {
        clearInterval(progressInterval)
        console.error('Import failed:', error)
    }
}
</script>