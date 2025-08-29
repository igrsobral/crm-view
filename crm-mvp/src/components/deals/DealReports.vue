<template>
    <div class="space-y-6">
        <!-- Report Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Deal Reports</h2>
                <p class="text-gray-600 mt-1">Analyze your sales performance and pipeline health</p>
            </div>
            <div class="flex items-center space-x-3">
                <!-- Date Range Filter -->
                <select v-model="selectedPeriod"
                    class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="all">All time</option>
                </select>

                <!-- Export Button -->
                <button @click="exportReport"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Deals Won</p>
                        <p class="text-2xl font-semibold text-gray-900">{{ filteredWonDeals.length }}</p>
                        <p class="text-sm text-green-600">
                            ${{ formatCurrency(wonDealsValue) }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Deals Lost</p>
                        <p class="text-2xl font-semibold text-gray-900">{{ filteredLostDeals.length }}</p>
                        <p class="text-sm text-red-600">
                            ${{ formatCurrency(lostDealsValue) }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Win Rate</p>
                        <p class="text-2xl font-semibold text-gray-900">{{ winRate.toFixed(1) }}%</p>
                        <p class="text-sm text-gray-600">
                            {{ filteredClosedDeals.length }} total closed
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600">Avg Deal Size</p>
                        <p class="text-2xl font-semibold text-gray-900">
                            ${{ formatCurrency(averageDealSize) }}
                        </p>
                        <p class="text-sm text-gray-600">
                            Won deals only
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Reports -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Won Deals List -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Recent Wins</h3>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <div v-for="deal in filteredWonDeals.slice(0, 10)" :key="deal.id"
                            class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div>
                                <p class="font-medium text-gray-900">{{ deal.name }}</p>
                                <p class="text-sm text-gray-600">{{ deal.contact?.name }}</p>
                                <p class="text-xs text-gray-500">
                                    Closed: {{ formatDate(deal.updated_at) }}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-green-600">
                                    ${{ formatCurrency(deal.value || 0) }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ getDealDuration(deal) }} days
                                </p>
                            </div>
                        </div>
                        <div v-if="filteredWonDeals.length === 0" class="text-center py-8 text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No won deals in this period</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lost Deals List -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Recent Losses</h3>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <div v-for="deal in filteredLostDeals.slice(0, 10)" :key="deal.id"
                            class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                                <p class="font-medium text-gray-900">{{ deal.name }}</p>
                                <p class="text-sm text-gray-600">{{ deal.contact?.name }}</p>
                                <p class="text-xs text-gray-500">
                                    Closed: {{ formatDate(deal.updated_at) }}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-red-600">
                                    ${{ formatCurrency(deal.value || 0) }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ getDealDuration(deal) }} days
                                </p>
                            </div>
                        </div>
                        <div v-if="filteredLostDeals.length === 0" class="text-center py-8 text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p>No lost deals in this period</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pipeline Health -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pipeline Health Analysis</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600 mb-2">
                        {{ activeDealsCount }}
                    </div>
                    <p class="text-sm text-gray-600">Active Deals</p>
                    <p class="text-xs text-gray-500 mt-1">
                        ${{ formatCurrency(activePipelineValue) }} total value
                    </p>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-orange-600 mb-2">
                        {{ averageDealAge }}
                    </div>
                    <p class="text-sm text-gray-600">Avg Deal Age (days)</p>
                    <p class="text-xs text-gray-500 mt-1">
                        For active deals
                    </p>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-purple-600 mb-2">
                        {{ averageClosingTime }}
                    </div>
                    <p class="text-sm text-gray-600">Avg Closing Time (days)</p>
                    <p class="text-xs text-gray-500 mt-1">
                        For closed deals
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Deal } from '@/stores/deals'

interface Props {
    deals: Deal[]
}

const props = defineProps<Props>()

const selectedPeriod = ref<string>('30')

const cutoffDate = computed(() => {
    if (selectedPeriod.value === 'all') return null

    const days = parseInt(selectedPeriod.value)
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString()
})

const filteredDeals = computed(() => {
    if (!cutoffDate.value) return props.deals

    return props.deals.filter(deal =>
        new Date(deal.updated_at) >= new Date(cutoffDate.value!)
    )
})

const filteredWonDeals = computed(() => {
    return filteredDeals.value.filter(deal => deal.stage === 'closed_won')
})

const filteredLostDeals = computed(() => {
    return filteredDeals.value.filter(deal => deal.stage === 'closed_lost')
})

const filteredClosedDeals = computed(() => {
    return [...filteredWonDeals.value, ...filteredLostDeals.value]
})

const wonDealsValue = computed(() => {
    return filteredWonDeals.value.reduce((sum, deal) => sum + (deal.value || 0), 0)
})

const lostDealsValue = computed(() => {
    return filteredLostDeals.value.reduce((sum, deal) => sum + (deal.value || 0), 0)
})

const winRate = computed(() => {
    const totalClosed = filteredClosedDeals.value.length
    return totalClosed > 0 ? (filteredWonDeals.value.length / totalClosed) * 100 : 0
})

const averageDealSize = computed(() => {
    const wonDeals = filteredWonDeals.value
    return wonDeals.length > 0 ? wonDealsValue.value / wonDeals.length : 0
})

const activeDeals = computed(() => {
    return props.deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
})

const activeDealsCount = computed(() => activeDeals.value.length)

const activePipelineValue = computed(() => {
    return activeDeals.value.reduce((sum, deal) => sum + (deal.value || 0), 0)
})

const averageDealAge = computed(() => {
    const active = activeDeals.value
    if (active.length === 0) return 0

    const totalAge = active.reduce((sum, deal) => {
        const created = new Date(deal.created_at)
        const now = new Date()
        const ageInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return sum + ageInDays
    }, 0)

    return Math.round(totalAge / active.length)
})

const averageClosingTime = computed(() => {
    const closed = filteredClosedDeals.value
    if (closed.length === 0) return 0

    const totalTime = closed.reduce((sum, deal) => {
        const created = new Date(deal.created_at)
        const updated = new Date(deal.updated_at)
        const timeInDays = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return sum + timeInDays
    }, 0)

    return Math.round(totalTime / closed.length)
})

// Helper functions
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

const getDealDuration = (deal: Deal): number => {
    const created = new Date(deal.created_at)
    const updated = new Date(deal.updated_at)
    return Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

const exportReport = () => {
    const headers = ['Deal Name', 'Contact', 'Stage', 'Value', 'Created', 'Updated', 'Duration (days)']
    const rows = filteredDeals.value.map(deal => [
        deal.name,
        deal.contact?.name || '',
        deal.stage,
        deal.value || 0,
        formatDate(deal.created_at),
        formatDate(deal.updated_at),
        getDealDuration(deal)
    ])

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deal-report-${selectedPeriod.value}-days.csv`
    link.click()
    window.URL.revokeObjectURL(url)
}
</script>