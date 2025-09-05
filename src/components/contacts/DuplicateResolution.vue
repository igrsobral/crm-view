<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Resolve Duplicates</h2>
      <p class="text-gray-600">
        We found {{ duplicates.length }} potential duplicate contacts. Review and choose how to handle each one.
      </p>
    </div>

    <!-- Summary Stats -->
    <div v-if="duplicateResult" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ duplicateResult.summary.total }}</div>
        <div class="text-sm text-blue-800">Total Records</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ duplicateResult.summary.unique }}</div>
        <div class="text-sm text-green-800">Unique Records</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">{{ duplicateResult.summary.duplicates }}</div>
        <div class="text-sm text-yellow-800">Potential Duplicates</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-red-600">{{ duplicateResult.summary.highConfidence }}</div>
        <div class="text-sm text-red-800">High Confidence</div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Bulk Actions</h3>
      <div class="flex flex-wrap gap-2">
        <button
          @click="bulkAction('skip')"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Skip All Duplicates
        </button>
        <button
          @click="bulkAction('merge')"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Merge All (Keep Existing + Import)
        </button>
        <button
          @click="bulkAction('replace')"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Replace All (Use Import Data)
        </button>
        <button
          @click="downloadReport"
          class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download Report
        </button>
      </div>
    </div>

    <!-- Duplicate List -->
    <div class="space-y-6">
      <div 
        v-for="(duplicate, index) in duplicates" 
        :key="index"
        class="bg-white border border-gray-200 rounded-lg p-6"
      >
        <!-- Duplicate Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span 
              :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-3',
                duplicate.confidence === 'high' ? 'bg-red-100 text-red-800' :
                duplicate.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              ]"
            >
              {{ duplicate.confidence }} confidence
            </span>
            <span class="text-sm text-gray-600">
              Match Score: {{ Math.round(duplicate.matchScore * 100) }}%
            </span>
          </div>
          <div class="text-sm text-gray-500">
            Duplicate {{ index + 1 }} of {{ duplicates.length }}
          </div>
        </div>

        <!-- Match Reasons -->
        <div class="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Why this is considered a duplicate:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li v-for="reason in duplicate.matchReasons" :key="reason" class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              {{ reason }}
            </li>
          </ul>
        </div>

        <!-- Comparison Table -->
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-4">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Existing Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Import Data
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="field in comparisonFields" :key="field.key">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ field.label }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span 
                    :class="{
                      'bg-green-100 px-2 py-1 rounded': getFieldValue(duplicate.existingContact, field.key) !== getFieldValue(duplicate.importRow, field.key) && getFieldValue(duplicate.existingContact, field.key)
                    }"
                  >
                    {{ getFieldValue(duplicate.existingContact, field.key) || '(empty)' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span 
                    :class="{
                      'bg-blue-100 px-2 py-1 rounded': getFieldValue(duplicate.existingContact, field.key) !== getFieldValue(duplicate.importRow, field.key) && getFieldValue(duplicate.importRow, field.key)
                    }"
                  >
                    {{ getFieldValue(duplicate.importRow, field.key) || '(empty)' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    v-model="resolutions[index].fieldActions[field.key]"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="keep_existing">Keep Existing</option>
                    <option value="use_import">Use Import</option>
                    <option v-if="field.key === 'tags' || field.key === 'notes'" value="merge">Merge</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resolution Actions -->
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <button
              @click="setResolution(index, 'skip')"
              :class="[
                'px-3 py-2 text-sm rounded-md border',
                resolutions[index].action === 'skip'
                  ? 'bg-gray-100 border-gray-400 text-gray-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              Skip This Duplicate
            </button>
            <button
              @click="setResolution(index, 'merge')"
              :class="[
                'px-3 py-2 text-sm rounded-md border',
                resolutions[index].action === 'merge'
                  ? 'bg-blue-100 border-blue-400 text-blue-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              Merge Contacts
            </button>
            <button
              @click="setResolution(index, 'replace')"
              :class="[
                'px-3 py-2 text-sm rounded-md border',
                resolutions[index].action === 'replace'
                  ? 'bg-green-100 border-green-400 text-green-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              Replace Existing
            </button>
          </div>
          
          <div class="text-sm text-gray-600">
            Action: <strong>{{ getActionLabel(resolutions[index].action) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-8 flex justify-between">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        @click="applyResolutions"
        class="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
      >
        Apply Resolutions ({{ duplicates.length }} duplicates)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DuplicateDetectionService, type DuplicateMatch, type DuplicateDetectionResult } from '@/services/duplicateDetectionService'

interface Props {
  duplicates: DuplicateMatch[]
  duplicateResult?: DuplicateDetectionResult
}

interface Resolution {
  action: 'skip' | 'merge' | 'replace'
  fieldActions: Record<string, 'keep_existing' | 'use_import' | 'merge'>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  resolve: [resolutions: Resolution[]]
}>()

const resolutions = ref<Resolution[]>([])

const comparisonFields = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'status', label: 'Status' },
  { key: 'tags', label: 'Tags' },
  { key: 'notes', label: 'Notes' }
]

const initializeResolutions = () => {
  resolutions.value = props.duplicates.map(() => ({
    action: 'skip',
    fieldActions: {
      name: 'keep_existing',
      email: 'keep_existing',
      phone: 'use_import',
      company: 'use_import',
      status: 'use_import',
      tags: 'merge',
      notes: 'merge'
    }
  }))
}

const getFieldValue = (contact: Record<string, unknown>, field: string): string => {
  const value = contact[field]
  if (field === 'tags' && Array.isArray(value)) {
    return value.join(', ')
  }
  return value || ''
}

const setResolution = (index: number, action: Resolution['action']) => {
  resolutions.value[index].action = action
}

const bulkAction = (action: Resolution['action']) => {
  resolutions.value.forEach(resolution => {
    resolution.action = action
  })
}

const getActionLabel = (action: Resolution['action']): string => {
  switch (action) {
    case 'skip':
      return 'Skip (keep existing, ignore import)'
    case 'merge':
      return 'Merge (combine data from both)'
    case 'replace':
      return 'Replace (use import data)'
    default:
      return 'Unknown'
  }
}

const applyResolutions = () => {
  emit('resolve', resolutions.value)
}

const downloadReport = () => {
  if (props.duplicateResult) {
    DuplicateDetectionService.downloadDuplicateReport(props.duplicateResult)
  }
}

onMounted(() => {
  initializeResolutions()
})
</script>