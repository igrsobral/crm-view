<template>
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
                <div class="flex items-center space-x-2">
                    <button @click="showOverdue = !showOverdue" :class="[
                        'px-3 py-1 text-xs rounded-full transition-colors',
                        showOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]" v-if="overdueCount > 0">
                        {{ overdueCount }} Overdue
                    </button>
                    <router-link to="/activities" class="text-sm text-blue-600 hover:text-blue-500 font-medium">
                        View all
                    </router-link>
                </div>
            </div>
        </div>

        <div class="p-6" v-if="displayTasks.length === 0">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">
                    {{ emptyStateTitle }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                    {{ emptyStateMessage }}
                </p>
            </div>
        </div>

        <div class="divide-y divide-gray-200" v-else>
            <div v-for="task in displayTasks" :key="task.id" class="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 pt-1">
                        <button @click="completeTask(task.id)" :disabled="completing.includes(task.id)"
                            class="w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                            :class="{
                                'bg-blue-500 border-blue-500': completing.includes(task.id)
                            }">
                            <svg v-if="completing.includes(task.id)" class="w-3 h-3 text-white" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">
                                    {{ task.subject || getDefaultSubject(task.type) }}
                                </p>

                                <div class="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                                    <span :class="[
                                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                        getActivityTypeStyle(task.type)
                                    ]">
                                        {{ task.type }}
                                    </span>
                                    <span v-if="task.contact_name || task.deal_name">•</span>
                                    <span v-if="task.contact_name">{{ task.contact_name }}</span>
                                    <span v-if="task.contact_name && task.deal_name">•</span>
                                    <span v-if="task.deal_name">{{ task.deal_name }}</span>
                                </div>

                                <p v-if="task.description" class="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {{ task.description }}
                                </p>
                            </div>

                            <div class="ml-4 flex-shrink-0 text-right">
                                <div :class="[
                                    'text-sm font-medium',
                                    isOverdue(task.scheduled_at) ? 'text-red-600' : 'text-gray-900'
                                ]">
                                    {{ formatScheduledTime(task.scheduled_at) }}
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    {{ formatScheduledDate(task.scheduled_at) }}
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="mt-3 flex items-center space-x-2">
                            <button @click="navigateToContact(task.contact_id)" v-if="task.contact_id"
                                class="text-xs text-blue-600 hover:text-blue-500 font-medium">
                                View Contact
                            </button>
                            <button @click="navigateToDeal(task.deal_id)" v-if="task.deal_id"
                                class="text-xs text-blue-600 hover:text-blue-500 font-medium">
                                View Deal
                            </button>
                            <button @click="rescheduleTask(task.id)"
                                class="text-xs text-gray-600 hover:text-gray-500 font-medium">
                                Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Activity } from '@/stores/activities'

interface Props {
    upcomingTasks: Activity[]
    overdueTasks: Activity[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    completeTask: [taskId: string]
    rescheduleTask: [taskId: string]
}>()

const router = useRouter()
const showOverdue = ref(false)
const completing = ref<string[]>([])

const overdueCount = computed(() => props.overdueTasks.length)

const displayTasks = computed(() => {
    const tasks = showOverdue.value ? props.overdueTasks : props.upcomingTasks
    return tasks.slice(0, 10) // Limit to 10 tasks
})

const emptyStateTitle = computed(() => {
    return showOverdue.value ? 'No overdue tasks' : 'No upcoming tasks'
})

const emptyStateMessage = computed(() => {
    return showOverdue.value ? 'Great job staying on top of your tasks!' : 'Schedule some follow-ups to see them here.'
})

const getActivityTypeStyle = (type: string): string => {
    const styles = {
        call: 'bg-blue-100 text-blue-800',
        email: 'bg-green-100 text-green-800',
        meeting: 'bg-purple-100 text-purple-800',
        note: 'bg-gray-100 text-gray-800'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
}

const getDefaultSubject = (type: string): string => {
    const subjects = {
        call: 'Follow-up call',
        email: 'Send email',
        meeting: 'Meeting scheduled',
        note: 'Add note'
    }
    return subjects[type as keyof typeof subjects] || 'Task'
}

const isOverdue = (scheduledAt?: string): boolean => {
    if (!scheduledAt) return false
    return new Date(scheduledAt) < new Date()
}

const formatScheduledTime = (scheduledAt?: string): string => {
    if (!scheduledAt) return ''
    const date = new Date(scheduledAt)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

const formatScheduledDate = (scheduledAt?: string): string => {
    if (!scheduledAt) return ''
    const date = new Date(scheduledAt)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
        return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow'
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }
}

const completeTask = async (taskId: string) => {
    completing.value.push(taskId)
    try {
        emit('completeTask', taskId)
    } finally {
        completing.value = completing.value.filter(id => id !== taskId)
    }
}

const rescheduleTask = (taskId: string) => {
    emit('rescheduleTask', taskId)
}

const navigateToContact = (contactId?: string) => {
    if (contactId) {
        router.push(`/contacts/${contactId}`)
    }
}

const navigateToDeal = (dealId?: string) => {
    if (dealId) {
        router.push(`/deals/${dealId}`)
    }
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