<template>
    <div class="space-y-4">
        <!-- Header with Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center space-x-4">
                <h2 class="text-lg font-semibold text-gray-900">Activities</h2>
                <span v-if="filteredActivities.length > 0" class="text-sm text-gray-500">
                    {{ filteredActivities.length }} {{ filteredActivities.length === 1 ? 'activity' : 'activities' }}
                </span>
            </div>

            <div class="flex items-center space-x-3">
                <!-- Activity Type Filter -->
                <select v-model="filters.type"
                    class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Types</option>
                    <option value="call">Calls</option>
                    <option value="email">Emails</option>
                    <option value="meeting">Meetings</option>
                    <option value="note">Notes</option>
                </select>

                <!-- Status Filter -->
                <select v-model="filters.status"
                    class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="upcoming">Upcoming</option>
                </select>

                <!-- Add Activity Button -->
                <button @click="$emit('create-activity')"
                    class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Activity
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Loading activities...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredActivities.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-4">
                <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ hasFilters ? 'No activities match your filters' : 'No activities yet' }}
            </h3>
            <p class="text-gray-600 mb-4">
                {{ hasFilters ? 'Try adjusting your filters to see more activities.' : 'Start tracking your interactions and follow-ups.' }}
            </p>
            <button v-if="!hasFilters" @click="$emit('create-activity')"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create First Activity
            </button>
        </div>

        <!-- Activities List -->
        <div v-else class="space-y-3">
            <div v-for="activity in paginatedActivities" :key="activity.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                <span v-if="activity.completed"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Completed
                                </span>
                                <span v-else-if="activity.scheduled_at && isOverdue(activity.scheduled_at)"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Overdue
                                </span>
                                <span v-else-if="activity.scheduled_at"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Scheduled
                                </span>
                            </div>

                            <h3 v-if="activity.subject" class="text-sm font-medium text-gray-900 mb-1">
                                {{ activity.subject }}
                            </h3>

                            <p v-if="activity.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                                {{ activity.description }}
                            </p>

                            <!-- Contact/Deal Info -->
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
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
                                <span>{{ formatDateTime(activity.created_at) }}</span>
                                <span v-if="activity.scheduled_at" class="font-medium">
                                    Due: {{ formatDateTime(activity.scheduled_at) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center space-x-1 ml-4">
                        <!-- Complete/Uncomplete Button -->
                        <button v-if="activity.scheduled_at && !activity.completed" @click="completeActivity(activity)"
                            class="p-1 text-gray-400 hover:text-green-600 focus:outline-none" title="Mark as complete">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <button v-else-if="activity.completed" @click="uncompleteActivity(activity)"
                            class="p-1 text-green-600 hover:text-gray-400 focus:outline-none"
                            title="Mark as incomplete">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>

                        <!-- Edit Button -->
                        <button @click="editActivity(activity)"
                            class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none" title="Edit activity">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        <!-- Delete Button -->
                        <button @click="deleteActivity(activity)"
                            class="p-1 text-gray-400 hover:text-red-600 focus:outline-none" title="Delete activity">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between pt-4">
                <div class="text-sm text-gray-700">
                    Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize,
                        filteredActivities.length) }}
                    of {{ filteredActivities.length }} activities
                </div>
                <div class="flex items-center space-x-2">
                    <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <span class="text-sm text-gray-700">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                    <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit Activity Modal -->
        <div v-if="editingActivity"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div class="w-full max-w-lg" @click.stop>
                <ActivityForm :activity="editingActivity" :contact-id="editingActivity.contact_id"
                    :deal-id="editingActivity.deal_id" mode="edit" @save="handleActivityUpdate"
                    @cancel="editingActivity = null" />
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="activityToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            @click="activityToDelete = null">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3 text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Activity</h3>
                    <div class="mt-2 px-7 py-3">
                        <p class="text-sm text-gray-500">
                            Are you sure you want to delete this activity? This action cannot be undone.
                        </p>
                    </div>
                    <div class="flex gap-3 px-4 py-3">
                        <button @click="activityToDelete = null"
                            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Cancel
                        </button>
                        <button @click="confirmDeleteActivity"
                            class="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, defineAsyncComponent } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import type { Activity, ActivityInput } from '@/stores/activities'
import type { ActivityType } from '@/utils/constants'

const ActivityForm = defineAsyncComponent(() => import('./ActivityForm.vue'))

interface Props {
    activities: Activity[]
    loading?: boolean
    pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    pageSize: 10
})

const emit = defineEmits<{
    'create-activity': []
    'activity-updated': [activityId: string, updates: Partial<Activity>]
}>()

const activitiesStore = useActivitiesStore()

const filters = ref({
    type: '' as ActivityType | '',
    status: '' as 'completed' | 'pending' | 'overdue' | 'upcoming' | ''
})
const currentPage = ref(1)
const editingActivity = ref<Activity | null>(null)
const activityToDelete = ref<Activity | null>(null)

const hasFilters = computed(() => {
    return filters.value.type !== '' || filters.value.status !== ''
})

const filteredActivities = computed(() => {
    let filtered = [...props.activities]

    if (filters.value.type) {
        filtered = filtered.filter(activity => activity.type === filters.value.type)
    }

    if (filters.value.status) {
        const now = new Date()
        filtered = filtered.filter(activity => {
            switch (filters.value.status) {
                case 'completed':
                    return activity.completed
                case 'pending':
                    return !activity.completed && (!activity.scheduled_at || new Date(activity.scheduled_at) >= now)
                case 'overdue':
                    return !activity.completed && activity.scheduled_at && new Date(activity.scheduled_at) < now
                case 'upcoming':
                    return !activity.completed && activity.scheduled_at &&
                        new Date(activity.scheduled_at) >= now &&
                        new Date(activity.scheduled_at) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                default:
                    return true
            }
        })
    }

    return filtered
})

const totalPages = computed(() => Math.ceil(filteredActivities.value.length / props.pageSize))

const paginatedActivities = computed(() => {
    const start = (currentPage.value - 1) * props.pageSize
    const end = start + props.pageSize
    return filteredActivities.value.slice(start, end)
})

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

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
        return `Yesterday`
    } else if (diffDays < 7) {
        return `${diffDays} days ago`
    } else {
        return date.toLocaleDateString()
    }
}

const completeActivity = async (activity: Activity) => {
    const result = await activitiesStore.completeActivity(activity.id)
    if (!result.error) {
        emit('activity-updated', activity.id, { completed: true })
    }
}

const uncompleteActivity = async (activity: Activity) => {
    const result = await activitiesStore.uncompleteActivity(activity.id)
    if (!result.error) {
        emit('activity-updated', activity.id, { completed: false })
    }
}

const editActivity = (activity: Activity) => {
    editingActivity.value = activity
}

const handleActivityUpdate = async (activityData: ActivityInput) => {
    if (editingActivity.value) {
        const result = await activitiesStore.updateActivity(editingActivity.value.id, activityData)
        if (!result.error) {
            emit('activity-updated', editingActivity.value.id, activityData)
            editingActivity.value = null
        }
    }
}

const deleteActivity = (activity: Activity) => {
    activityToDelete.value = activity
}

const confirmDeleteActivity = async () => {
    if (activityToDelete.value) {
        const result = await activitiesStore.deleteActivity(activityToDelete.value.id)
        if (!result.error) {
            // Activity is automatically removed from store
        }
        activityToDelete.value = null
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