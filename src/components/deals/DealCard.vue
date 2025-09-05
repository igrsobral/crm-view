<template>
    <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        :class="{ 'border-red-300 bg-red-50': isOverdue }" @click="$emit('click', deal)" draggable="true"
        @dragstart="onDragStart" @dragend="onDragEnd">
        <div class="flex items-start justify-between mb-2">
            <h3 class="font-medium text-gray-900 text-sm line-clamp-2">
                {{ deal.name }}
            </h3>
            <button @click.stop="$emit('edit', deal)" class="text-gray-400 hover:text-gray-600 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
        </div>

        <div class="space-y-2">
            <div v-if="deal.contact" class="flex items-center text-xs text-gray-600">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ deal.contact.name }}
            </div>

            <div v-if="deal.value" class="flex items-center text-sm font-semibold text-green-600">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                ${{ formatCurrency(deal.value) }}
            </div>

            <div v-if="deal.expected_close_date" class="flex items-center text-xs" :class="closeDateClass">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(deal.expected_close_date) }}
            </div>

            <div v-if="deal.notes" class="text-xs text-gray-500 line-clamp-2">
                {{ deal.notes }}
            </div>
        </div>

        <div v-if="isOverdue" class="mt-2 flex items-center text-xs text-red-600">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Overdue
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Deal } from '@/stores/deals'

interface Props {
    deal: Deal
}

interface Emits {
    (e: 'click', deal: Deal): void
    (e: 'edit', deal: Deal): void
    (e: 'dragStart', deal: Deal): void
    (e: 'dragEnd'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

    return 'text-gray-600'
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

const onDragStart = (event: DragEvent) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', props.deal.id)
        event.dataTransfer.effectAllowed = 'move'
    }
    emit('dragStart', props.deal)
}

const onDragEnd = () => {
    emit('dragEnd')
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>