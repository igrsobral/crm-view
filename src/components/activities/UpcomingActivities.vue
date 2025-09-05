<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Upcoming Activities</h2>
            <div class="flex items-center space-x-2">
                <!-- View Toggle -->
                <div class="flex items-center bg-gray-100 rounded-md p-1">
                    <button @click="viewMode = 'upcoming'" :class="[
                        'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                        viewMode === 'upcoming'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                        Upcoming
                    </button>
                    <button @click="viewMode = 'overdue'" :class="[
                        'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                        viewMode === 'overdue'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                        Overdue
                        <span v-if="overdueCount > 0"
                            class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {{ overdueCount }}
                        </span>
                    </button>
                    <button @click="viewMode = 'today'" :class="[
                        'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                        viewMode === 'today'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                        Today
                        <span v-if="todayCount > 0"
                            class="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                            {{ todayCount }}
                        </span>
                    </button>
                </div>

                <!-- Refresh Button -->
                <button @click="refreshActivities" :disabled="loading"
                    class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md disabled:opacity-50">
                    <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Loading activities...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="displayedActivities.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-4">
                <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ getEmptyStateTitle() }}
            </h3>
            <p class="text-gray-600 mb-4">
                {{ getEmptyStateMessage() }}
            </p>
            <button @click="$emit('schedule-followup')"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Schedule Follow-up
            </button>
        </div>

        <!-- Activities List -->
        <div v-else class="space-y-3">
            <div v-for="activity in displayedActivities" :key="activity.id"
                class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow" :class="{
                    'border-red-200 bg-red-50': isOverdue(activity.scheduled_at!),
                    'border-yellow-200 bg-yellow-50': isToday(activity.scheduled_at!) && !isOverdue(activity.scheduled_at!),
                    'border-gray-200': !isOverdue(activity.scheduled_at!) && !isToday(activity.scheduled_at!)
                }">

                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <!-- Activity Icon -->
                        <div class="flex-shrink-0">
                            <span class="h-8 w-8 rounded-full flex items-center justify-center"
                                :class="getActivityIconClasses(activity.type)">
                                <component :is="getActivityIcon(activity.type)" class="h-4 w-4" />
                            </span>
                        </div>

                        <!-- Activity Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="text-sm font-medium text-gray-900 capitalize">
                                    {{ activity.type }}
                                </span>
                                <span v-if="isOverdue(activity.scheduled_at!)"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ getOverdueText(activity.scheduled_at!) }}
                                </span>
                                <span v-else-if="isToday(activity.scheduled_at!)"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Today
                                </span>
                                <span v-else
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {{ getUpcomingText(activity.scheduled_at!) }}
                                </span>
                            </div>

                            <h3 v-if="activity.subject" class="text-sm font-medium text-gray-900 mb-1">
                                {{ activity.subject }}
                            </h3>

                            <p v-if="activity.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                                {{ activity.description }}
                            </p>

                            <!-- Contact/Deal Info -->
                            <div class="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                <span v-if="activity.contact" class="flex items-center">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ activity.contact.name }}
                                </span>
                                <span v-if="activity.deal" class="flex items-center">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ activity.deal.name }}
                                </span>
                            </div>

                            <!-- Scheduled Time -->
                            <div class="text-xs font-medium" :class="{
                                'text-red-600': isOverdue(activity.scheduled_at!),
                                'text-blue-600': isToday(activity.scheduled_at!) && !isOverdue(activity.scheduled_at!),
                                'text-gray-600': !isOverdue(activity.scheduled_at!) && !isToday(activity.scheduled_at!)
                            }">
                                {{ formatScheduledTime(activity.scheduled_at!) }}
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center space-x-1 ml-4">
                        <!-- Complete Button -->
                        <button @click="completeActivity(activity)"
                            class="p-2 text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md"
                            title="Mark as complete">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <!-- Reschedule Button -->
                        <button @click="rescheduleActivity(activity)"
                            class="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            title="Reschedule">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <!-- More Actions Menu -->
                        <div class="relative">
                            <button @click="toggleActivityMenu(activity.id)"
                                class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-if="activeMenuId === activity.id"
                                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div class="py-1">
                                    <button @click="editActivity(activity)"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Edit Activity
                                    </button>
                                    <button @click="snoozeActivity(activity, 1)"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Snooze 1 hour
                                    </button>
                                    <button @click="snoozeActivity(activity, 24)"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Snooze 1 day
                                    </button>
                                    <button @click="deleteActivity(activity)"
                                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        Delete Activity
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMore" class="text-center pt-4">
                <button @click="loadMore" :disabled="loading"
                    class="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    Load More Activities
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import type { Activity } from '@/stores/activities'
import type { ActivityType } from '@/utils/constants'

interface Props {
    limit?: number
    autoRefresh?: boolean
    refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
    limit: 20,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
})

const emit = defineEmits<{
    'schedule-followup': []
    'activity-completed': [activity: Activity]
    'activity-rescheduled': [activity: Activity, newDate: string]
    'activity-edited': [activity: Activity]
    'activity-deleted': [activity: Activity]
}>()

const activitiesStore = useActivitiesStore()

// Local state
const viewMode = ref<'upcoming' | 'overdue' | 'today'>('upcoming')
const loading = ref(false)
const activeMenuId = ref<string | null>(null)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

// Computed properties
const upcomingActivities = computed(() => activitiesStore.upcomingActivities)
const overdueActivities = computed(() => activitiesStore.overdueActivities)
const todaysActivities = computed(() => activitiesStore.todaysActivities)

const overdueCount = computed(() => overdueActivities.value.length)
const todayCount = computed(() => todaysActivities.value.length)

const displayedActivities = computed(() => {
    switch (viewMode.value) {
        case 'overdue':
            return overdueActivities.value.slice(0, props.limit)
        case 'today':
            return todaysActivities.value.slice(0, props.limit)
        case 'upcoming':
        default:
            return upcomingActivities.value.slice(0, props.limit)
    }
})

const hasMore = computed(() => {
    const total = viewMode.value === 'overdue' ? overdueCount.value :
        viewMode.value === 'today' ? todayCount.value :
            upcomingActivities.value.length
    return total > props.limit
})

// Methods
const getActivityIcon = (type: ActivityType) => {
    const icons = {
        call: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' })
        ]),
        email: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
        ]),
        meeting: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
        ]),
        note: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
        ])
    }
    return icons[type] || icons.note
}

const getActivityIconClasses = (type: ActivityType) => {
    const classes = {
        call: 'bg-green-500 text-white',
        email: 'bg-blue-500 text-white',
        meeting: 'bg-purple-500 text-white',
        note: 'bg-gray-500 text-white'
    }
    return classes[type] || classes.note
}

const isOverdue = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date()
}

const isToday = (scheduledAt: string) => {
    const scheduled = new Date(scheduledAt)
    const today = new Date()
    return scheduled.toDateString() === today.toDateString()
}

const getOverdueText = (scheduledAt: string) => {
    const scheduled = new Date(scheduledAt)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - scheduled.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) {
        return 'Just overdue'
    } else if (diffHours < 24) {
        return `${diffHours}h overdue`
    } else {
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d overdue`
    }
}

const getUpcomingText = (scheduledAt: string) => {
    const scheduled = new Date(scheduledAt)
    const now = new Date()
    const diffHours = Math.floor((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) {
        return 'Soon'
    } else if (diffHours < 24) {
        return `In ${diffHours}h`
    } else {
        const diffDays = Math.floor(diffHours / 24)
        return `In ${diffDays}d`
    }
}

const formatScheduledTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt)
    const now = new Date()

    if (isToday(scheduledAt)) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()) {
        return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
}

const getEmptyStateTitle = () => {
    switch (viewMode.value) {
        case 'overdue':
            return 'No overdue activities'
        case 'today':
            return 'No activities for today'
        case 'upcoming':
        default:
            return 'No upcoming activities'
    }
}

const getEmptyStateMessage = () => {
    switch (viewMode.value) {
        case 'overdue':
            return 'Great! You\'re all caught up with your overdue activities.'
        case 'today':
            return 'You have no activities scheduled for today.'
        case 'upcoming':
        default:
            return 'Schedule some follow-ups to stay on top of your relationships.'
    }
}

const refreshActivities = async () => {
    loading.value = true
    try {
        await Promise.all([
            activitiesStore.fetchUpcomingActivities(props.limit),
            activitiesStore.fetchOverdueActivities(props.limit)
        ])
    } finally {
        loading.value = false
    }
}

const completeActivity = async (activity: Activity) => {
    const result = await activitiesStore.completeActivity(activity.id)
    if (!result.error) {
        emit('activity-completed', activity)
        await refreshActivities()
    }
}

const rescheduleActivity = (activity: Activity) => {
    // This would open a reschedule modal
    emit('activity-rescheduled', activity, '')
}

const editActivity = (activity: Activity) => {
    activeMenuId.value = null
    emit('activity-edited', activity)
}

const snoozeActivity = async (activity: Activity, hours: number) => {
    const newDate = new Date(activity.scheduled_at!)
    newDate.setHours(newDate.getHours() + hours)

    const result = await activitiesStore.updateActivity(activity.id, {
        scheduled_at: newDate.toISOString()
    })

    if (!result.error) {
        activeMenuId.value = null
        await refreshActivities()
    }
}

const deleteActivity = async (activity: Activity) => {
    if (confirm('Are you sure you want to delete this activity?')) {
        const result = await activitiesStore.deleteActivity(activity.id)
        if (!result.error) {
            activeMenuId.value = null
            emit('activity-deleted', activity)
            await refreshActivities()
        }
    }
}

const toggleActivityMenu = (activityId: string) => {
    activeMenuId.value = activeMenuId.value === activityId ? null : activityId
}

const loadMore = () => {
    // This would load more activities - implementation depends on pagination strategy
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.relative')) {
        activeMenuId.value = null
    }
}

// Lifecycle
onMounted(async () => {
    await refreshActivities()

    // Set up auto-refresh
    if (props.autoRefresh) {
        refreshTimer.value = setInterval(refreshActivities, props.refreshInterval)
    }

    // Add click outside listener
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
    }
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>