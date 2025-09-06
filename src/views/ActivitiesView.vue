<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Activities</h1>
          <p class="text-gray-600 mt-1">Track and manage your interactions</p>
        </div>
        <button
          @click="handleLogActivityClick"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Log Activity
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Activities</p>
              <p class="text-2xl font-semibold text-gray-900">{{ activities.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Completed</p>
              <p class="text-2xl font-semibold text-gray-900">{{ completedActivities.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Upcoming</p>
              <p class="text-2xl font-semibold text-gray-900">{{ upcomingActivities.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Overdue</p>
              <p class="text-2xl font-semibold text-gray-900">{{ overdueActivities.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <label for="type-filter" class="block text-sm font-medium text-gray-700 mb-1"
              >Type</label
            >
            <Select
              id="type-filter"
              v-model="filters.type"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Types"
              class="w-64"
            />
          </div>

          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1"
              >Status</label
            >
            <Select
              id="status-filter"
              v-model="filters.completed"
              :options="statusFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Activities"
              class="w-64"
            />
          </div>

          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <InputText
              id="search"
              v-model="searchQuery"
              placeholder="Search activities..."
              class="w-full"
            />
          </div>

          <div class="flex-1 items-end">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1"
              >Clear filters</label
            >
            <button
              @click="clearFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            Activities ({{ filteredActivities.length }})
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading activities...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <svg
                class="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error loading activities</h3>
                <p class="text-sm text-red-700 mt-1">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Timeline -->
        <div v-else class="p-6">
          <ActivityTimeline
            :activities="filteredActivities"
            :loading="loading"
            @activity-updated="handleActivityUpdate"
          />
        </div>
      </div>

      <!-- Activity Form Dialog -->
      <Dialog
        v-model:visible="showActivityForm"
        header="Log Activity"
        modal
        :style="{ width: '32rem', maxHeight: '90vh' }"
        :draggable="false"
        :resizable="false"
        class="p-fluid"
        @hide="closeActivityForm"
      >
        <Suspense>
          <ActivityForm @save="handleActivitySave" @cancel="closeActivityForm" />
          <template #fallback>
            <div class="p-6 text-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
              ></div>
              <p class="mt-2 text-gray-600">Loading activity form...</p>
            </div>
          </template>
        </Suspense>
      </Dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import AppLayout from "@/components/common/AppLayout.vue";
import ActivityTimeline from "@/components/activities/ActivityTimeline.vue";
import ActivityForm from "@/components/activities/ActivityForm.vue";
import { useActivitiesStore } from "@/stores/activities";
import { useToastStore } from "@/stores/toast";
import type { ActivityInput, Activity } from "@/stores/activities";
import type { ActivityType } from "@/utils/constants";

import Select from "primevue/select";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";

const activitiesStore = useActivitiesStore();
const toastStore = useToastStore();
const showActivityForm = ref(false);
const searchQuery = ref("");

const filters = ref<{
  type: ActivityType | "";
  completed: string;
}>({
  type: "",
  completed: "",
});

const typeFilterOptions = [
  { label: "All Types", value: "" },
  { label: "Phone Call", value: "call" },
  { label: "Email", value: "email" },
  { label: "Meeting", value: "meeting" },
  { label: "Note", value: "note" },
];

const statusFilterOptions = [
  { label: "All Activities", value: "" },
  { label: "Pending", value: "false" },
  { label: "Completed", value: "true" },
];

const activities = computed(() => activitiesStore.activities);
const loading = computed(() => activitiesStore.loading);
const error = computed(() => activitiesStore.error);

const completedActivities = computed(() =>
  activities.value.filter((activity) => activity.completed),
);

const upcomingActivities = computed(() => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return activities.value.filter(
    (activity) =>
      activity.scheduled_at &&
      !activity.completed &&
      new Date(activity.scheduled_at) >= now &&
      new Date(activity.scheduled_at) <= nextWeek,
  );
});

const overdueActivities = computed(() => {
  const now = new Date();
  return activities.value.filter(
    (activity) =>
      activity.scheduled_at && !activity.completed && new Date(activity.scheduled_at) < now,
  );
});

const filteredActivities = computed(() => {
  let filtered = activities.value;

  if (filters.value.type) {
    filtered = filtered.filter((activity) => activity.type === filters.value.type);
  }

  if (filters.value.completed !== "") {
    const isCompleted = filters.value.completed === "true";
    filtered = filtered.filter((activity) => activity.completed === isCompleted);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (activity) =>
        activity.subject?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query) ||
        activity.contact?.name?.toLowerCase().includes(query) ||
        activity.deal?.name?.toLowerCase().includes(query),
    );
  }

  return filtered;
});

const handleActivitySave = async (activityData: ActivityInput) => {
  console.log("Attempting to save activity:", activityData);

  try {
    const result = await activitiesStore.createActivity(activityData);
    console.log("Create activity result:", result);

    if (!result.error) {
      showActivityForm.value = false;
      toastStore.success("Activity logged successfully!");
      // Refresh activities list
      await activitiesStore.fetchActivities();
    } else {
      console.error("Activity creation error:", result.error);
      toastStore.error(`Failed to log activity: ${result.error}`);
    }
  } catch (error) {
    console.error("Exception in handleActivitySave:", error);
    toastStore.error("An unexpected error occurred while logging the activity");
  }
};

const closeActivityForm = () => {
  showActivityForm.value = false;
};

const handleActivityUpdate = (activityId: string, updates: Partial<Activity>) => {
  // Activity is automatically updated in the store
  console.log("Activity updated:", activityId, updates);
};

const handleLogActivityClick = () => {
  console.log("Log Activity button clicked!");
  showActivityForm.value = true;
};

const clearFilters = () => {
  filters.value = {
    type: "",
    completed: "",
  };
  searchQuery.value = "";
};

watch([filters, searchQuery], () => {}, { deep: true });

onMounted(async () => {
  await activitiesStore.fetchActivities();
});
</script>
