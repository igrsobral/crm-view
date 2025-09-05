<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button 
          @click="refreshDashboard" 
          :disabled="dashboardStore.loading"
          :loading="dashboardStore.loading"
          icon="pi pi-refresh"
          label="Refresh"
          outlined
          severity="secondary"
          class="px-4 py-2"
        />
      </div>

      <!-- Loading State -->
      <div v-if="dashboardStore.loading && !hasData" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6 animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div class="h-64 bg-gray-200 rounded"></div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div class="space-y-3">
              <div v-for="i in 5" :key="i" class="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="dashboardStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p class="mt-1 text-sm text-red-700">{{ dashboardStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        <!-- Key Metrics -->
        <DashboardStats :metrics="dashboardStore.metrics" />

        <!-- Charts and Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Pipeline Chart -->
          <PipelineChart :deals-by-stage="dashboardStore.metrics.dealsByStage" />

          <!-- Recent Activities -->
          <RecentActivities :activities="dashboardStore.recentActivities" />
        </div>

        <!-- Upcoming Tasks -->
        <UpcomingTasks :upcoming-tasks="upcomingTasks" :overdue-tasks="overdueTasks" @complete-task="handleCompleteTask"
          @reschedule-task="handleRescheduleTask" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import PipelineChart from '@/components/dashboard/PipelineChart.vue'
import RecentActivities from '@/components/dashboard/RecentActivities.vue'
import UpcomingTasks from '@/components/dashboard/UpcomingTasks.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useActivitiesStore } from '@/stores/activities'

import Button from 'primevue/button'

const dashboardStore = useDashboardStore()
const activitiesStore = useActivitiesStore()

const hasData = computed(() => {
  return dashboardStore.metrics.totalContacts > 0 ||
    dashboardStore.metrics.totalDeals > 0 ||
    dashboardStore.metrics.totalActivities > 0
})

const upcomingTasks = computed(() => {
  return activitiesStore.activities.filter(activity =>
    activity.scheduled_at &&
    !activity.completed &&
    new Date(activity.scheduled_at) >= new Date() &&
    new Date(activity.scheduled_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).sort((a, b) =>
    new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
  )
})

const overdueTasks = computed(() => {
  return activitiesStore.activities.filter(activity =>
    activity.scheduled_at &&
    !activity.completed &&
    new Date(activity.scheduled_at) < new Date()
  ).sort((a, b) =>
    new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
  )
})

const refreshDashboard = async () => {
  await dashboardStore.refreshMetrics()
}

const handleCompleteTask = async (taskId: string) => {
  await activitiesStore.completeActivity(taskId)
  dashboardStore.calculateMetrics()
}

const handleRescheduleTask = (taskId: string) => {
  console.log('Reschedule task:', taskId)
}

onMounted(async () => {
  await refreshDashboard()
})
</script>