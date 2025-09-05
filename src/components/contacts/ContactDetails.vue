<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ contact.name }}</h2>
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
          <button
            @click="$emit('edit')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            v-if="contact.email"
            @click="sendEmail"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>

          <button
            v-if="contact.phone"
            @click="makeCall"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>

          <button
            @click="showActivityForm = true"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Log Activity
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row">
      <!-- Contact Information Panel -->
      <div class="lg:w-1/3 p-6 border-r border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>

        <div class="space-y-4">
          <!-- Email -->
          <div v-if="contact.email">
            <label class="block text-sm font-medium text-gray-500">Email</label>
            <div class="mt-1">
              <a
                :href="`mailto:${contact.email}`"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ contact.email }}
              </a>
            </div>
          </div>

          <!-- Phone -->
          <div v-if="contact.phone">
            <label class="block text-sm font-medium text-gray-500">Phone</label>
            <div class="mt-1">
              <a
                :href="`tel:${contact.phone}`"
                class="text-blue-600 hover:text-blue-800"
              >
                {{ contact.phone }}
              </a>
            </div>
          </div>

          <!-- Company -->
          <div v-if="contact.company">
            <label class="block text-sm font-medium text-gray-500">Company</label>
            <div class="mt-1 text-gray-900">{{ contact.company }}</div>
          </div>

          <!-- Tags -->
          <div v-if="contact.tags && contact.tags.length > 0">
            <label class="block text-sm font-medium text-gray-500 mb-2">Tags</label>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in contact.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="contact.notes">
            <label class="block text-sm font-medium text-gray-500">Notes</label>
            <div class="mt-1 text-gray-900 whitespace-pre-wrap">{{ contact.notes }}</div>
          </div>

          <!-- Dates -->
          <div class="pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-500">
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
          <h3 class="text-lg font-medium text-gray-900">Activity Timeline</h3>
          <button
            @click="showActivityForm = true"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Activity
          </button>
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

    <!-- Activity Form Modal -->
    <div
      v-if="showActivityForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-lg" @click.stop>
        <ActivityForm
          :contact-id="contact.id"
          @save="handleActivitySave"
          @cancel="showActivityForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import { useToastStore } from '@/stores/toast'
import ActivityTimeline from '@/components/activities/ActivityTimeline.vue'
import ActivityForm from '@/components/activities/ActivityForm.vue'
import type { Contact } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'
import type { ActivityInput } from '@/stores/activities'

interface Props {
  contact: Contact
}

const props = defineProps<Props>()

// const emit = defineEmits<{
//   close: []
//   edit: []
// }>()

const activitiesStore = useActivitiesStore()
const toastStore = useToastStore()
const showActivityForm = ref(false)

const statusClasses: Record<ContactStatus, string> = {
  lead: 'bg-yellow-100 text-yellow-800',
  prospect: 'bg-blue-100 text-blue-800',
  customer: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

const statusLabels: Record<ContactStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  customer: 'Customer',
  inactive: 'Inactive'
}

const contactActivities = computed(() => {
  return activitiesStore.activities.filter(activity =>
    activity.contact_id === props.contact.id
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const activitiesLoading = computed(() => activitiesStore.loading)

const sendEmail = () => {
  if (props.contact.email) {
    window.open(`mailto:${props.contact.email}`, '_blank')
  }
}

const makeCall = () => {
  if (props.contact.phone) {
    window.open(`tel:${props.contact.phone}`, '_blank')
  }
}

const handleActivitySave = async (activityData: ActivityInput) => {
  const result = await activitiesStore.createActivity({
    ...activityData,
    contact_id: props.contact.id
  })

  if (!result.error) {
    showActivityForm.value = false
    toastStore.success('Activity logged successfully!')
  } else {
    toastStore.error(`Failed to log activity: ${result.error}`)
  }
}

const handleActivityCreated = () => {
  // Activity is already added to store by the timeline component
  console.log('Activity created')
}

const handleActivityUpdated = (activityId: string, updates: Record<string, unknown>) => {
  // Activity is already updated in store by the timeline component
  console.log('Activity updated:', activityId, updates)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}

onMounted(() => {
  // Fetch activities when component mounts
  if (activitiesStore.activities.length === 0) {
    activitiesStore.fetchActivities()
  }
})
</script>
