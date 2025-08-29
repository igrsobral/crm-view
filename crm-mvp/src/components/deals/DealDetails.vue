<template>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xl font-semibold text-gray-900">{{ deal.name }}</h2>
                    <div class="flex items-center mt-1 space-x-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="stageClasses[deal.stage]">
                            {{ stageLabels[deal.stage] }}
                        </span>
                        <span v-if="deal.value" class="text-lg font-semibold text-green-600">
                            ${{ formatCurrency(deal.value) }}
                        </span>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button @click="$emit('edit', deal)" class="text-gray-400 hover:text-gray-600 p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 space-y-6">
            <!-- Contact Information -->
            <div v-if="deal.contact">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Contact</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-900">{{ deal.contact.name }}</p>
                            <div class="text-sm text-gray-600 space-y-1">
                                <p v-if="deal.contact.email">{{ deal.contact.email }}</p>
                                <p v-if="deal.contact.phone">{{ deal.contact.phone }}</p>
                                <p v-if="deal.contact.company">{{ deal.contact.company }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Deal Information -->
            <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Deal Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Expected Close Date
                        </label>
                        <p class="mt-1 text-sm text-gray-900" :class="closeDateClass">
                            {{ deal.expected_close_date ? formatDate(deal.expected_close_date) : 'Not set' }}
                            <span v-if="isOverdue" class="text-red-600 ml-2">(Overdue)</span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Created
                        </label>
                        <p class="mt-1 text-sm text-gray-900">
                            {{ formatDate(deal.created_at) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            <div v-if="deal.notes">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Notes</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ deal.notes }}</p>
                </div>
            </div>

            <!-- Stage Progress -->
            <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Pipeline Progress</h3>
                <div class="space-y-2">
                    <div v-for="(stage, index) in pipelineStages" :key="stage.value" class="flex items-center">
                        <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                            :class="getStageProgressClass(stage.value, index)">
                            <svg v-if="isStageCompleted(stage.value)" class="w-4 h-4 text-white" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <div v-else-if="stage.value === deal.stage" class="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm"
                                :class="stage.value === deal.stage ? 'font-medium text-gray-900' : 'text-gray-500'">
                                {{ stage.label }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'
import type { Deal } from '@/stores/deals'

interface Props {
    deal: Deal
}

interface Emits {
    (e: 'edit', deal: Deal): void
    (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const pipelineStages = [
    { value: DEAL_STAGES.LEAD, label: 'Lead' },
    { value: DEAL_STAGES.QUALIFIED, label: 'Qualified' },
    { value: DEAL_STAGES.PROPOSAL, label: 'Proposal' },
    { value: DEAL_STAGES.NEGOTIATION, label: 'Negotiation' },
    { value: DEAL_STAGES.CLOSED_WON, label: 'Closed Won' },
    { value: DEAL_STAGES.CLOSED_LOST, label: 'Closed Lost' }
]

const stageLabels: Record<DealStage, string> = {
    [DEAL_STAGES.LEAD]: 'Lead',
    [DEAL_STAGES.QUALIFIED]: 'Qualified',
    [DEAL_STAGES.PROPOSAL]: 'Proposal',
    [DEAL_STAGES.NEGOTIATION]: 'Negotiation',
    [DEAL_STAGES.CLOSED_WON]: 'Closed Won',
    [DEAL_STAGES.CLOSED_LOST]: 'Closed Lost'
}

const stageClasses: Record<DealStage, string> = {
    [DEAL_STAGES.LEAD]: 'bg-gray-100 text-gray-800',
    [DEAL_STAGES.QUALIFIED]: 'bg-blue-100 text-blue-800',
    [DEAL_STAGES.PROPOSAL]: 'bg-yellow-100 text-yellow-800',
    [DEAL_STAGES.NEGOTIATION]: 'bg-orange-100 text-orange-800',
    [DEAL_STAGES.CLOSED_WON]: 'bg-green-100 text-green-800',
    [DEAL_STAGES.CLOSED_LOST]: 'bg-red-100 text-red-800'
}

const isOverdue = computed(() => {
    if (!props.deal.expected_close_date) return false
    if (['closed_won', 'closed_lost'].includes(props.deal.stage)) return false

    const today = new Date().toISOString().split('T')[0]
    return props.deal.expected_close_date < today
})

const closeDateClass = computed(() => {
    if (isOverdue.value) return 'text-red-600'

    if (props.deal.expected_close_date) {
        const today = new Date()
        const closeDate = new Date(props.deal.expected_close_date)
        const diffDays = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays <= 7) return 'text-orange-600'
        if (diffDays <= 30) return 'text-yellow-600'
    }

    return 'text-gray-900'
})

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const getCurrentStageIndex = (): number => {
    return pipelineStages.findIndex(stage => stage.value === props.deal.stage)
}

const isStageCompleted = (stage: DealStage): boolean => {
    const currentIndex = getCurrentStageIndex()
    const stageIndex = pipelineStages.findIndex(s => s.value === stage)

    if (props.deal.stage === DEAL_STAGES.CLOSED_WON) {
        return stageIndex < pipelineStages.length - 2 // All except closed_lost
    }
    if (props.deal.stage === DEAL_STAGES.CLOSED_LOST) {
        return false
    }

    return stageIndex < currentIndex
}

const getStageProgressClass = (stage: DealStage, index: number): string => {
    if (isStageCompleted(stage)) {
        return 'bg-green-500'
    }
    if (stage === props.deal.stage) {
        return 'bg-blue-500'
    }
    return 'bg-gray-300'
}
</script>