<template>
    <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900">Deal Pipeline</h3>
            <div class="flex space-x-2">
                <button @click="chartType = 'doughnut'" :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    chartType === 'doughnut'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                ]">
                    Doughnut
                </button>
                <button @click="chartType = 'bar'" :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    chartType === 'bar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                ]">
                    Bar
                </button>
            </div>
        </div>

        <div class="h-64 flex items-center justify-center" v-if="!hasData">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No deals yet</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by creating your first deal.</p>
            </div>
        </div>

        <div class="h-64" v-else>
            <Doughnut v-if="chartType === 'doughnut'" :data="doughnutData" :options="doughnutOptions" />
            <Bar v-else :data="barData" :options="barOptions" />
        </div>

        <!-- Legend -->
        <div class="mt-6 grid grid-cols-2 gap-4" v-if="hasData">
            <div v-for="(stage, index) in stageLabels" :key="stage" class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: stageColors[index] }"></div>
                <span class="text-sm text-gray-600">
                    {{ formatStageLabel(stage) }} ({{ dealsByStage[stage] || 0 }})
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js'
import { DEAL_STAGES } from '@/utils/constants'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

interface Props {
    dealsByStage: Record<string, number>
}

const props = defineProps<Props>()

const chartType = ref<'doughnut' | 'bar'>('doughnut')

const stageLabels = Object.values(DEAL_STAGES)
const stageColors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#6B7280'  // gray
]

const hasData = computed(() => {
    return Object.values(props.dealsByStage).some(count => count > 0)
})

const formatStageLabel = (stage: string): string => {
    return stage.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
}

const doughnutData = computed(() => ({
    labels: stageLabels.map(formatStageLabel),
    datasets: [
        {
            data: stageLabels.map(stage => props.dealsByStage[stage] || 0),
            backgroundColor: stageColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderWidth: 3,
        }
    ]
}))

const barData = computed(() => ({
    labels: stageLabels.map(formatStageLabel),
    datasets: [
        {
            label: 'Number of Deals',
            data: stageLabels.map(stage => props.dealsByStage[stage] || 0),
            backgroundColor: stageColors.map(color => color + '80'), // Add transparency
            borderColor: stageColors,
            borderWidth: 1,
        }
    ]
}))

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.label || ''
                    const value = context.parsed || 0
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                    return `${label}: ${value} (${percentage}%)`
                }
            }
        }
    },
    cutout: '60%'
}

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    return `${context.label}: ${context.parsed.y} deals`
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
}
</script>