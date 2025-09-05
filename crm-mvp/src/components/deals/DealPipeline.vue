<template>
    <div class="h-full flex flex-col">
        <!-- Pipeline Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
                <p class="text-gray-600 mt-1">
                    {{ totalDeals }} deals • ${{ formatCurrency(totalValue) }} total value
                </p>
            </div>

            <div class="flex items-center space-x-3">
                <!-- Search -->
                <div class="relative">
                    <InputText 
                        v-model="searchQuery" 
                        placeholder="Search deals..."
                        class="pl-10 pr-4 py-2 w-64"
                    />
                </div>

                <!-- Stage Filter -->
                <Select 
                    v-model="selectedStage"
                    :options="stageFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="All Stages"
                    class="w-48"
                />

                <!-- Export Button -->
                <Button 
                    outlined
                    severity="secondary"
                    icon="pi pi-download"
                    label="Export"
                    @click="() => router.push('/export')"
                    class="px-4 py-2"
                />

                <!-- Add Deal Button -->
                <Button 
                    icon="pi pi-plus"
                    label="Add Deal"
                    @click="$emit('create-deal')"
                    class="px-4 py-2"
                />
            </div>
        </div>

        <!-- Pipeline Columns -->
        <div class="flex-1 overflow-x-auto">
            <div class="flex space-x-4 h-full min-w-max pb-4">
                <div v-for="stage in pipelineStages" :key="stage.value" class="flex-shrink-0 w-80">
                    <!-- Stage Header -->
                    <div class="bg-gray-50 rounded-t-lg p-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-semibold text-gray-900">{{ stage.label }}</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    {{ getStageDeals(stage.value).length }} deals
                                    <span v-if="getStageValue(stage.value) > 0">
                                        • ${{ formatCurrency(getStageValue(stage.value)) }}
                                    </span>
                                </p>
                            </div>
                            <div class="w-3 h-3 rounded-full" :class="stage.color"></div>
                        </div>
                    </div>

                    <!-- Drop Zone -->
                    <div class="bg-white rounded-b-lg border-l border-r border-b border-gray-200 min-h-96 p-4"
                        :class="{ 'bg-blue-50 border-blue-300': dragOverStage === stage.value }"
                        @dragover.prevent="onDragOver(stage.value)" @dragleave="onDragLeave"
                        @drop="onDrop(stage.value)">
                        <!-- Deal Cards -->
                        <div class="space-y-3">
                            <DealCard v-for="deal in getFilteredStageDeals(stage.value)" :key="deal.id" :deal="deal"
                                @click="$emit('select-deal', deal)" @edit="$emit('edit-deal', deal)"
                                @dragStart="onDealDragStart" @dragEnd="onDealDragEnd" />
                        </div>

                        <!-- Empty State -->
                        <div v-if="getFilteredStageDeals(stage.value).length === 0"
                            class="text-center py-8 text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p class="text-sm">No deals in this stage</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'
import type { Deal } from '@/stores/deals'
import DealCard from './DealCard.vue'

// PrimeVue component imports
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

interface Props {
    deals: Deal[]
    loading?: boolean
}

interface Emits {
    (e: 'create-deal'): void
    (e: 'select-deal', deal: Deal): void
    (e: 'edit-deal', deal: Deal): void
    (e: 'move-deal', dealId: string, newStage: DealStage): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const searchQuery = ref('')
const selectedStage = ref<DealStage | 'all'>('all')
const dragOverStage = ref<DealStage | null>(null)
const draggedDeal = ref<Deal | null>(null)

const pipelineStages = [
    { value: DEAL_STAGES.LEAD, label: 'Lead', color: 'bg-gray-400' },
    { value: DEAL_STAGES.QUALIFIED, label: 'Qualified', color: 'bg-blue-400' },
    { value: DEAL_STAGES.PROPOSAL, label: 'Proposal', color: 'bg-yellow-400' },
    { value: DEAL_STAGES.NEGOTIATION, label: 'Negotiation', color: 'bg-orange-400' },
    { value: DEAL_STAGES.CLOSED_WON, label: 'Closed Won', color: 'bg-green-400' },
    { value: DEAL_STAGES.CLOSED_LOST, label: 'Closed Lost', color: 'bg-red-400' }
]

const stageFilterOptions = computed(() => [
    { label: 'All Stages', value: 'all' },
    ...pipelineStages.map(stage => ({
        label: stage.label,
        value: stage.value
    }))
])

const dealsByStage = computed(() => {
    return props.deals.reduce((acc, deal) => {
        const stage = deal.stage
        if (!acc[stage]) {
            acc[stage] = []
        }
        acc[stage].push(deal)
        return acc
    }, {} as Record<DealStage, Deal[]>)
})

const filteredDeals = computed(() => {
    let filtered = props.deals

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(deal =>
            deal.name.toLowerCase().includes(query) ||
            deal.contact?.name.toLowerCase().includes(query) ||
            deal.contact?.company?.toLowerCase().includes(query) ||
            deal.notes?.toLowerCase().includes(query)
        )
    }

    if (selectedStage.value !== 'all') {
        filtered = filtered.filter(deal => deal.stage === selectedStage.value)
    }

    return filtered
})

const totalDeals = computed(() => filteredDeals.value.length)

const totalValue = computed(() => {
    return filteredDeals.value.reduce((sum, deal) => sum + (deal.value || 0), 0)
})

const getStageDeals = (stage: DealStage): Deal[] => {
    return dealsByStage.value[stage] || []
}

const getFilteredStageDeals = (stage: DealStage): Deal[] => {
    return filteredDeals.value.filter(deal => deal.stage === stage)
}

const getStageValue = (stage: DealStage): number => {
    return getStageDeals(stage).reduce((sum, deal) => sum + (deal.value || 0), 0)
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

const onDealDragStart = (deal: Deal) => {
    draggedDeal.value = deal
}

const onDealDragEnd = () => {
    draggedDeal.value = null
    dragOverStage.value = null
}

const onDragOver = (stage: DealStage) => {
    dragOverStage.value = stage
}

const onDragLeave = () => {
    dragOverStage.value = null
}

const onDrop = (newStage: DealStage) => {
    if (draggedDeal.value && draggedDeal.value.stage !== newStage) {
        emit('move-deal', draggedDeal.value.id, newStage)
    }
    dragOverStage.value = null
    draggedDeal.value = null
}

watch(searchQuery, () => {
    if (searchQuery.value.trim() && selectedStage.value !== 'all') {
        selectedStage.value = 'all'
    }
})
</script>