<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Import Contacts</h1>
      <p class="text-gray-600">Import your contacts from a CSV file</p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <div class="flex items-start">
        <div 
          v-for="(step, index) in csvImportStore.steps" 
          :key="step.id"
          class="flex-1 relative"
        >
          <!-- Step Content -->
          <div class="flex items-start">
            <!-- Step Circle -->
            <div class="flex-shrink-0">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2"
                :class="{
                  'bg-blue-600 border-blue-600 text-white': index <= csvImportStore.currentStepIndex,
                  'bg-white border-gray-300 text-gray-600': index > csvImportStore.currentStepIndex
                }"
              >
                <svg v-if="index < csvImportStore.currentStepIndex" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
            </div>
            
            <!-- Step Text -->
            <div class="ml-4 min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 whitespace-nowrap">{{ step.title }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ step.description }}</p>
            </div>
          </div>
          
          <!-- Connector Line -->
          <div 
            v-if="index < csvImportStore.steps.length - 1"
            class="absolute top-5 left-5 w-full h-0.5 -ml-5"
            style="width: calc(100% - 20px); margin-left: 40px;"
            :class="{
              'bg-blue-600': index < csvImportStore.currentStepIndex,
              'bg-gray-300': index >= csvImportStore.currentStepIndex
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="csvImportStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Import Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ csvImportStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <!-- Upload Step -->
      <div v-if="csvImportStore.currentStep === 'upload'">
        <ContactImportUpload />
      </div>

      <!-- Mapping Step -->
      <div v-else-if="csvImportStore.currentStep === 'mapping'">
        <ContactImportMapping />
      </div>

      <!-- Preview Step -->
      <div v-else-if="csvImportStore.currentStep === 'preview'">
        <ContactImportPreview />
      </div>

      <!-- Duplicates Step -->
      <div v-else-if="csvImportStore.currentStep === 'duplicates'">
        <DuplicateResolution 
          v-if="csvImportStore.duplicateDetectionResult"
          :duplicates="csvImportStore.duplicateDetectionResult.duplicates"
          :duplicate-result="csvImportStore.duplicateDetectionResult"
          @cancel="csvImportStore.previousStep()"
          @resolve="csvImportStore.resolveDuplicates"
        />
      </div>

      <!-- Import Step -->
      <div v-else-if="csvImportStore.currentStep === 'import'">
        <ContactImportExecute />
      </div>

      <!-- Complete Step -->
      <div v-else-if="csvImportStore.currentStep === 'complete'">
        <ContactImportComplete />
      </div>
    </div>

    <!-- Navigation -->
    <div class="mt-8 flex justify-between">
      <button
        v-if="csvImportStore.currentStepIndex > 0 && csvImportStore.currentStep !== 'complete'"
        @click="csvImportStore.previousStep()"
        :disabled="csvImportStore.loading"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <div v-else></div>

      <div class="flex space-x-3">
        <button
          v-if="csvImportStore.currentStep !== 'complete'"
          @click="handleCancel"
          :disabled="csvImportStore.loading"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <button
          v-if="csvImportStore.currentStep !== 'import' && csvImportStore.currentStep !== 'complete'"
          @click="csvImportStore.nextStep()"
          :disabled="!csvImportStore.canProceedToNext || csvImportStore.loading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="csvImportStore.loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>
            {{ 
              csvImportStore.currentStep === 'preview' ? 'Check for Duplicates' :
              csvImportStore.currentStep === 'duplicates' ? 'Start Import' :
              'Next' 
            }}
          </span>
        </button>

        <router-link
          v-if="csvImportStore.currentStep === 'complete'"
          to="/contacts"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Contacts
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCSVImportStore } from '@/stores/csvImport'
import { useRouter } from 'vue-router'
import ContactImportUpload from './ContactImportUpload.vue'
import ContactImportMapping from './ContactImportMapping.vue'
import ContactImportPreview from './ContactImportPreview.vue'
import DuplicateResolution from './DuplicateResolution.vue'
import ContactImportExecute from './ContactImportExecute.vue'
import ContactImportComplete from './ContactImportComplete.vue'

const csvImportStore = useCSVImportStore()
const router = useRouter()

const handleCancel = () => {
  csvImportStore.reset()
  router.push('/contacts')
}
</script>