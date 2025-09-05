<template>
    <div class="space-y-6">
        <!-- Pipeline Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Pipeline Value -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Pipeline Value</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            ${{ formatCurrency(metrics?.totalValue || 0) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Total Deals -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Total Deals</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            {{ metrics?.totalDeals || 0 }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Average Deal Value -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Avg Deal Value</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            ${{ formatCurrency(metrics?.averageDealValue || 0) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Overdue Deals -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Overdue Deals</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            {{ metrics?.overdueDeals || 0 }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pipeline Stage Breakdown -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pipeline Breakdown</h3>
            <div class="space-y-4">
                <div v-for="stage in pipelineStages" :key="stage.value"
                    class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <div class="w-4 h-4 rounded-full mr-3" :class="stage.color"></div>
                        <div>
                            <p class="font-medium text-gray-900">{{ stage.label }}</p>
                            <p class="text-sm text-gray-600">
                                {{ getStageMetrics(stage.value).count }} deals
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-gray-900">
                            ${{ formatCurrency(getStageMetrics(stage.value).value) }}
                        </p>
                        <p class="text-sm text-gray-600">
                            {{ getStagePercentage(stage.value) }}% of total
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Win/Loss Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Conversion Rates -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Win Rate</span>
                        <div class="flex items-center">
                            <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${winRate}%` }"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-900">{{ winRate.toFixed(1) }}%</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Loss Rate</span>
                        <div class="flex items-center">
                            <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div class="bg-red-500 h-2 rounded-full" :style="{ width: `${lossRate}%` }"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-900">{{ lossRate.toFixed(1) }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Wins & Losses</h3>
                <div class="space-y-3">
                    <div v-for="deal in recentClosedDeals" :key="deal.id"
                        class="flex items-center justify-between p-3 rounded-lg"
                        :class="deal.stage === 'closed_won' ? 'bg-green-50' : 'bg-red-50'">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full mr-3"
                                :class="deal.stage === 'closed_won' ? 'bg-green-500' : 'bg-red-500'"></div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ deal.name }}</p>
                                <p class="text-xs text-gray-600">{{ deal.contact?.name }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-gray-900">
                                ${{ formatCurrency(deal.value || 0) }}
                            </p>
                            <p class="text-xs text-gray-600">
                                {{ formatDate(deal.updated_at) }}
                            </p>
                        </div>
                    </div>
                    <div v-if="recentClosedDeals.length === 0" class="text-center py-4 text-gray-500 text-sm">
                        No recent wins or losses
                    </div>
                </div>
            </div>
        </div>

        <!-- Overdue Deals Alert -->
        <div v-if="overdueDeals.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-center mb-4">
                <svg class="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-lg font-semibold text-red-900">Overdue Deals Require Attention</h3>
            </div>
            <div class="space-y-2">
                <div v-for="deal in overdueDeals.slice(0, 5)" :key="deal.id"
                    class="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div>
                        <p class="font-medium text-gray-900">{{ deal.name }}</p>
                        <p class="text-sm text-gray-600">{{ deal.contact?.name }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-red-600">
                            Due: {{ formatDate(deal.expected_close_date!) }}
                        </p>
                        <p class="text-sm text-gray-600">
                            ${{ formatCurrency(deal.value || 0) }}
                        </p>
                    </div>
                </div>
                <div v-if="overdueDeals.length > 5" class="text-center pt-2">
                    <button @click="$emit('showOverdueDeals')"
                        class="text-red-600 hover:text-red-700 text-sm font-medium">
                        View all {{ overdueDeals.length }} overdue deals
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'
import type { Deal } from '@/stores/deals'
import type { PipelineMetrics } from '@/services/dealsService'

interface Props {
    deals: Deal[]
    metrics: PipelineMetrics | null
}


const props = defineProps<Props>()

const pipelineStages = [
    { value: DEAL_STAGES.LEAD, label: 'Lead', color: 'bg-gray-400' },
    { value: DEAL_STAGES.QUALIFIED, label: 'Qualified', color: 'bg-blue-400' },
    { value: DEAL_STAGES.PROPOSAL, label: 'Proposal', color: 'bg-yellow-400' },
    { value: DEAL_STAGES.NEGOTIATION, label: 'Negotiation', color: 'bg-orange-400' },
    { value: DEAL_STAGES.CLOSED_WON, label: 'Closed Won', color: 'bg-green-400' },
    { value: DEAL_STAGES.CLOSED_LOST, label: 'Closed Lost', color: 'bg-red-400' }
]

const overdueDeals = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return props.deals.filter(deal =>
        deal.expected_close_date &&
        deal.expected_close_date < today &&
        !['closed_won', 'closed_lost'].includes(deal.stage)
    ).sort((a, b) => (a.expected_close_date || '').localeCompare(b.expected_close_date || ''))
})

const recentClosedDeals = computed(() => {
    return props.deals
        .filter(deal => ['closed_won', 'closed_lost'].includes(deal.stage))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
})

const winRate = computed(() => {
    const closedDeals = props.deals.filter(deal => ['closed_won', 'closed_lost'].includes(deal.stage))
    const wonDeals = props.deals.filter(deal => deal.stage === 'closed_won')
    return closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0
})

const lossRate = computed(() => {
    const closedDeals = props.deals.filter(deal => ['closed_won', 'closed_lost'].includes(deal.stage))
    const lostDeals = props.deals.filter(deal => deal.stage === 'closed_lost')
    return closedDeals.length > 0 ? (lostDeals.length / closedDeals.length) * 100 : 0
})

const getStageMetrics = (stage: DealStage) => {
    return props.metrics?.stageMetrics[stage] || { count: 0, value: 0 }
}

const getStagePercentage = (stage: DealStage): number => {
    const stageValue = getStageMetrics(stage).value
    const totalValue = props.metrics?.totalValue || 0
    return totalValue > 0 ? (stageValue / totalValue) * 100 : 0
}

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
</script>