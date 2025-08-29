<template>
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Recent Activities</h3>
                <router-link to="/activities" class="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    View all
                </router-link>
            </div>
        </div>

        <div class="p-6" v-if="activities.length === 0">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No activities yet</h3>
                <p class="mt-1 text-sm text-gray-500">Start logging activities to see them here.</p>
            </div>
        </div>

        <div class="divide-y divide-gray-200" v-else>
            <div v-for="activity in activities" :key="activity.id" class="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <div :class="[
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            getActivityTypeColor(activity.type)
                        ]">
                            <component :is="getActivityIcon(activity.type)" class="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-medium text-gray-900">
                                {{ activity.subject || getDefaultSubject(activity.type) }}
                            </p>
                            <div class="flex items-center space-x-2">
                                <span v-if="activity.completed"
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                </span>
                                <time class="text-xs text-gray-500">
                                    {{ formatRelativeTime(activity.created_at) }}
                                </time>
                            </div>
                        </div>

                        <div class="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                            <span class="capitalize">{{ activity.type }}</span>
                            <span v-if="activity.contact_name || activity.deal_name">•</span>
                            <span v-if="activity.contact_name">{{ activity.contact_name }}</span>
                            <span v-if="activity.contact_name && activity.deal_name">•</span>
                            <span v-if="activity.deal_name">{{ activity.deal_name }}</span>
                        </div>

                        <p v-if="activity.description" class="mt-1 text-sm text-gray-600 line-clamp-2">
                            {{ activity.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { RecentActivity } from '@/stores/dashboard'

interface Props {
    activities: RecentActivity[]
}

defineProps<Props>()

const getActivityTypeColor = (type: string): string => {
    const colors = {
        call: 'bg-blue-500',
        email: 'bg-green-500',
        meeting: 'bg-purple-500',
        note: 'bg-gray-500'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const getActivityIcon = (type: string) => {
    const icons = {
        call: () => h('svg', {
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
            })
        ]),
        email: () => h('svg', {
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            })
        ]),
        meeting: () => h('svg', {
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
            })
        ]),
        note: () => h('svg', {
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            })
        ])
    }
    return icons[type as keyof typeof icons] || icons.note
}

const getDefaultSubject = (type: string): string => {
    const subjects = {
        call: 'Phone call',
        email: 'Email sent',
        meeting: 'Meeting',
        note: 'Note added'
    }
    return subjects[type as keyof typeof subjects] || 'Activity'
}

const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return 'Just now'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours}h ago`
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days}d ago`
    } else {
        return date.toLocaleDateString()
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