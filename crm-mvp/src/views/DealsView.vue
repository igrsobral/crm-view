<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors" :class="activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-hidden">
        <!-- Pipeline Tab -->
        <div v-if="activeTab === 'pipeline'" class="h-full">
          <DealPipeline :deals="dealsStore.deals" :loading="dealsStore.loading" @create-deal="showCreateForm = true"
            @select-deal="selectDeal" @edit-deal="editDeal" @move-deal="moveDeal" />
        </div>

        <!-- Analytics Tab -->
        <div v-else-if="activeTab === 'analytics'" class="h-full overflow-y-auto">
          <DealAnalytics :deals="dealsStore.deals" :metrics="dealsStore.pipelineMetrics"
            @show-overdue-deals="showOverdueDeals" />
        </div>

        <!-- Reports Tab -->
        <div v-else-if="activeTab === 'reports'" class="h-full overflow-y-auto">
          <DealReports :deals="dealsStore.deals" />
        </div>
      </div>

      <!-- Deal Form Modal -->
      <div v-if="showCreateForm || showEditForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DealForm :deal="selectedDeal" :loading="dealsStore.loading" @save="saveDeal" @cancel="closeForm" />
        </div>
      </div>

      <!-- Deal Details Modal -->
      <div v-if="showDetailsModal && selectedDeal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DealDetails :deal="selectedDeal" @edit="editDeal" @close="closeDetailsModal" />
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="dealsStore.loading" class="fixed inset-0 bg-white bg-opacity-25 flex items-center justify-center z-40">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span class="text-gray-900">Loading deals...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="dealsStore.error"
        class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ dealsStore.error }}
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage"
        class="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { type DealStage } from '@/utils/constants'
import AppLayout from '@/components/common/AppLayout.vue'
import DealPipeline from '@/components/deals/DealPipeline.vue'
import DealForm from '@/components/deals/DealForm.vue'
import DealDetails from '@/components/deals/DealDetails.vue'
import DealAnalytics from '@/components/deals/DealAnalytics.vue'
import DealReports from '@/components/deals/DealReports.vue'
import { useDealsStore } from '@/stores/deals'
import type { Deal, DealInput } from '@/stores/deals'

const dealsStore = useDealsStore()

const tabs = [
  { id: 'pipeline', name: 'Pipeline' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'reports', name: 'Reports' }
]

const activeTab = ref('pipeline')
const showCreateForm = ref(false)
const showEditForm = ref(false)
const showDetailsModal = ref(false)
const selectedDeal = ref<Deal | null>(null)
const successMessage = ref('')

const selectDeal = (deal: Deal) => {
  selectedDeal.value = deal
  showDetailsModal.value = true
}

const editDeal = (deal: Deal) => {
  selectedDeal.value = deal
  showEditForm.value = true
  showDetailsModal.value = false
}

const closeForm = () => {
  showCreateForm.value = false
  showEditForm.value = false
  selectedDeal.value = null
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDeal.value = null
}

const saveDeal = async (dealData: DealInput) => {
  try {
    if (selectedDeal.value) {
      const { error } = await dealsStore.updateDeal(selectedDeal.value.id, dealData)
      if (!error) {
        showSuccessMessage('Deal updated successfully')
        closeForm()
      }
    } else {
      const { error } = await dealsStore.createDeal(dealData)
      if (!error) {
        showSuccessMessage('Deal created successfully')
        closeForm()
      }
    }
  } catch (error) {
    console.error('Error saving deal:', error)
  }
}

const moveDeal = async (dealId: string, newStage: DealStage) => {
  try {
    const { error } = await dealsStore.moveDealToStage(dealId, newStage)
    if (!error) {
      showSuccessMessage('Deal moved successfully')
    }
  } catch (error) {
    console.error('Error moving deal:', error)
  }
}

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const showOverdueDeals = () => {
  activeTab.value = 'pipeline'
}

onMounted(async () => {
  await dealsStore.fetchDealsByStage()
  await dealsStore.fetchPipelineMetrics()
})

watch(() => dealsStore.error, (error) => {
  if (error) {
    setTimeout(() => {
      dealsStore.error = null
    }, 5000)
  }
})
</script>