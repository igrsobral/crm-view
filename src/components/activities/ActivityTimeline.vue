<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading activities...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="activities?.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-4">
        <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
      <p class="text-gray-600 mb-4">Start tracking your interactions with this contact.</p>
    </div>

    <!-- Activity Timeline -->
    <div v-else class="flow-root">
      <ul class="-mb-8">
        <li v-for="(activity, index) in activities" :key="activity.id">
          <div class="relative pb-8">
            <!-- Timeline line -->
            <span
              v-if="index !== activities.length - 1"
              class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
              aria-hidden="true"
            ></span>

            <div class="relative flex space-x-3">
              <!-- Activity Icon -->
              <div>
                <span
                  class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                  :class="getActivityIconClasses(activity.type)"
                >
                  <component :is="getActivityIcon(activity.type)" class="h-4 w-4" />
                </span>
              </div>

              <!-- Activity Content -->
              <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900 capitalize">
                      {{ activity.type }}
                    </span>
                    <span
                      v-if="activity.completed"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      Completed
                    </span>
                    <span
                      v-else-if="activity.scheduled_at && isOverdue(activity.scheduled_at)"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      Overdue
                    </span>
                    <span
                      v-else-if="activity.scheduled_at"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      Scheduled
                    </span>
                  </div>

                  <p v-if="activity.subject" class="text-sm text-gray-900 mt-1 font-medium">
                    {{ activity.subject }}
                  </p>

                  <p
                    v-if="activity.description"
                    class="text-sm text-gray-600 mt-1 whitespace-pre-wrap"
                  >
                    {{ activity.description }}
                  </p>

                  <div v-if="activity.scheduled_at" class="text-xs text-gray-500 mt-2">
                    <span class="font-medium">Scheduled:</span>
                    {{ formatDateTime(activity.scheduled_at) }}
                  </div>
                </div>

                <!-- Activity Actions -->
                <div
                  class="text-right text-sm whitespace-nowrap text-gray-500 flex items-start space-x-2"
                >
                  <div>
                    <div>{{ formatDateTime(activity.created_at) }}</div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center space-x-1">
                    <!-- Complete/Uncomplete Button -->
                    <button
                      v-if="activity.scheduled_at"
                      @click="toggleActivityCompletion(activity)"
                      class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      :title="activity.completed ? 'Mark as incomplete' : 'Mark as complete'"
                    >
                      <svg
                        v-if="activity.completed"
                        class="h-4 w-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <svg
                        v-else
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>

                    <!-- Edit Button -->
                    <button
                      @click="editActivity(activity)"
                      class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Edit activity"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <!-- Delete Button -->
                    <button
                      @click="deleteActivity(activity)"
                      class="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                      title="Delete activity"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Edit Activity Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Activity"
      modal
      :style="{ width: '32rem', maxHeight: '90vh' }"
      :draggable="false"
      :resizable="false"
      class="p-fluid"
      @hide="closeEditDialog"
    >
      <ActivityForm
        :activity="editingActivity"
        :contact-id="contactId"
        :deal-id="dealId"
        mode="edit"
        @save="handleActivityUpdate"
        @cancel="closeEditDialog"
      />
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete Activity"
      modal
      :style="{ width: '25rem' }"
      :draggable="false"
      :resizable="false"
    >
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-500">
          Are you sure you want to delete this activity? This action cannot be undone.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <Button
            type="button"
            @click="closeDeleteDialog"
            outlined
            severity="secondary"
            label="Cancel"
            class="flex-1"
          />
          <Button
            type="button"
            @click="confirmDeleteActivity"
            severity="danger"
            label="Delete"
            class="flex-1"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, h, defineAsyncComponent, computed } from "vue";
import { useActivitiesStore } from "@/stores/activities";
import type { Activity, ActivityInput } from "@/stores/activities";
import type { ActivityType } from "@/utils/constants";
import Button from "primevue/button";
import Dialog from "primevue/dialog";

// Import ActivityForm component
const ActivityForm = defineAsyncComponent(() => import("./ActivityForm.vue"));

interface Props {
  contactId?: string;
  dealId?: string;
  activities: Activity[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  contactId: undefined,
  dealId: undefined,
  loading: false,
});

const emit = defineEmits<{
  "activity-created": [];
  "activity-updated": [activityId: string, updates: Partial<Activity>];
}>();

const activitiesStore = useActivitiesStore();
const editingActivity = ref<Activity | null>(null);
const activityToDelete = ref<Activity | null>(null);

// Dialog visibility computed properties
const showEditDialog = computed({
  get: () => editingActivity.value !== null,
  set: (value: boolean) => {
    if (!value) editingActivity.value = null;
  }
});

const showDeleteDialog = computed({
  get: () => activityToDelete.value !== null,
  set: (value: boolean) => {
    if (!value) activityToDelete.value = null;
  }
});

// Extract props for template access
const { contactId, dealId } = props;

const getActivityIcon = (type: ActivityType) => {
  const icons = {
    call: () =>
      h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
        }),
      ]),
    email: () =>
      h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        }),
      ]),
    meeting: () =>
      h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        }),
      ]),
    note: () =>
      h("svg", { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        }),
      ]),
  };
  return icons[type] || icons.note;
};

const getActivityIconClasses = (type: ActivityType) => {
  const classes = {
    call: "bg-green-500 text-white",
    email: "bg-blue-500 text-white",
    meeting: "bg-purple-500 text-white",
    note: "bg-gray-500 text-white",
  };
  return classes[type] || classes.note;
};

const isOverdue = (scheduledAt: string) => {
  return new Date(scheduledAt) < new Date();
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
};

const toggleActivityCompletion = async (activity: Activity) => {
  const result = await activitiesStore.updateActivity(activity.id, {
    completed: !activity.completed,
  });

  if (!result.error) {
    emit("activity-updated", activity.id, { completed: !activity.completed });
  }
};

const editActivity = (activity: Activity) => {
  editingActivity.value = activity;
};

const handleActivityUpdate = async (activityData: ActivityInput) => {
  if (editingActivity.value) {
    const result = await activitiesStore.updateActivity(editingActivity.value.id, activityData);

    if (!result.error) {
      emit("activity-updated", editingActivity.value.id, activityData);
      editingActivity.value = null;
    }
  }
};

const deleteActivity = (activity: Activity) => {
  activityToDelete.value = activity;
};

const closeEditDialog = () => {
  editingActivity.value = null;
};

const closeDeleteDialog = () => {
  activityToDelete.value = null;
};

const confirmDeleteActivity = async () => {
  if (activityToDelete.value) {
    const result = await activitiesStore.deleteActivity(activityToDelete.value.id);

    if (!result.error) {
      // Activity is automatically removed from store
    }

    activityToDelete.value = null;
  }
};
</script>
