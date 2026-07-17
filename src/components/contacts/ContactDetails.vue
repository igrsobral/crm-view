<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button
            variant="text"
            @click="$emit('close')"
            aria-label="Close"
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <template #icon>
              <i class="pi pi-arrow-left"/>
            </template>
          </Button>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ contact.name }}</h2>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
              :class="statusClasses[contact.status]"
            >
              {{ statusLabels[contact.status] }}
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center space-x-2">
          <Button
            @click="$emit('edit')"
            variant="outlined"
            size="small"
            label="Edit"
            icon="pi pi-pencil"
          />

          <Button
            v-if="contact.email"
            @click="sendEmail"
            variant="outlined"
            size="small"
            label="Email"
            icon="pi pi-envelope"
          />

          <Button
            v-if="contact.phone"
            @click="makeCall"
            variant="outlined"
            size="small"
            label="Call"
            icon="pi pi-phone"
          />

          <Button
            @click="showActivityForm = true"
            size="small"
            label="Log Activity"
            icon="pi pi-plus"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row">
      <!-- Contact Information Panel -->
      <div class="lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>

        <div class="space-y-4">
          <!-- Email -->
          <div v-if="contact.email">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <div class="mt-1">
              <a :href="`mailto:${contact.email}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {{ contact.email }}
              </a>
            </div>
          </div>

          <!-- Phone -->
          <div v-if="contact.phone">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
            <div class="mt-1">
              <a :href="`tel:${contact.phone}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {{ contact.phone }}
              </a>
            </div>
          </div>

          <!-- Company -->
          <div v-if="contact.company">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
            <div class="mt-1 text-gray-900 dark:text-white">{{ contact.company }}</div>
          </div>

          <!-- Tags -->
          <div v-if="contact.tags && contact.tags.length > 0">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</label>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in contact.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="contact.notes">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
            <div class="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{{ contact.notes }}</div>
          </div>

          <!-- Dates -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <div>Created {{ formatDate(contact.created_at) }}</div>
              <div v-if="contact.last_contact_date" class="mt-1">
                Last contact {{ formatDate(contact.last_contact_date!) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Timeline Panel -->
      <div class="lg:w-2/3 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Activity Timeline</h3>
          <Button
            @click="showActivityForm = true"
            variant="text"
            label="Add Activity"
            icon="pi pi-plus"
            size="small"
          />
        </div>

        <!-- Activity Timeline -->
        <ActivityTimeline
          :contact-id="contact.id"
          :activities="contactActivities"
          :loading="activitiesLoading"
          @activity-created="handleActivityCreated"
          @activity-updated="handleActivityUpdated"
        />
      </div>
    </div>

    <!-- Activity Form Dialog -->
    <Dialog
      v-model:visible="showActivityForm"
      header="Add Activity"
      modal
      :style="{ width: '32rem', maxHeight: '90vh' }"
      :draggable="false"
      :resizable="false"
      class="p-fluid"
      @hide="closeActivityForm"
    >
      <ActivityForm
        :contact-id="contact.id"
        @save="handleActivitySave"
        @cancel="closeActivityForm"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useActivitiesStore } from "@/stores/activities";
import { useToastStore } from "@/stores/toast";
import ActivityTimeline from "@/components/activities/ActivityTimeline.vue";
import ActivityForm from "@/components/activities/ActivityForm.vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import type { Contact } from "@/stores/contacts";
import type { ContactStatus } from "@/utils/constants";
import type { ActivityInput } from "@/stores/activities";

interface Props {
  contact: Contact;
}

const props = defineProps<Props>();

// const emit = defineEmits<{
//   close: []
//   edit: []
// }>()

const activitiesStore = useActivitiesStore();
const toastStore = useToastStore();
const showActivityForm = ref(false);

const statusClasses: Record<ContactStatus, string> = {
  lead: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
  prospect: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
  customer: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
  inactive: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
};

const statusLabels: Record<ContactStatus, string> = {
  lead: "Lead",
  prospect: "Prospect",
  customer: "Customer",
  inactive: "Inactive",
};

const contactActivities = computed(() => {
  return activitiesStore.activities
    .filter((activity) => activity.contact_id === props.contact.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const activitiesLoading = computed(() => activitiesStore.loading);

const sendEmail = () => {
  if (props.contact.email) {
    window.open(`mailto:${props.contact.email}`, "_blank");
  }
};

const makeCall = () => {
  if (props.contact.phone) {
    window.open(`tel:${props.contact.phone}`, "_blank");
  }
};

const handleActivitySave = async (activityData: ActivityInput) => {
  const result = await activitiesStore.createActivity({
    ...activityData,
    contact_id: props.contact.id,
  });

  if (!result.error) {
    showActivityForm.value = false;
    toastStore.success("Activity logged successfully!");
  } else {
    toastStore.error(`Failed to log activity: ${result.error}`);
  }
};

const closeActivityForm = () => {
  showActivityForm.value = false;
};

const handleActivityCreated = () => {
  // Open the activity form modal to create a new activity
  showActivityForm.value = true;
};

const handleActivityUpdated = (activityId: string, updates: Record<string, unknown>) => {
  // Activity is already updated in store by the timeline component
  console.log("Activity updated:", activityId, updates);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

onMounted(() => {
  // Fetch activities when component mounts
  if (activitiesStore.activities.length === 0) {
    activitiesStore.fetchActivities();
  }
});
</script>
