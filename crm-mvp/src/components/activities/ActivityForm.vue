<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Activity' : 'Log New Activity' }}
        </h2>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
      <!-- Activity Type -->
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
          Activity Type <span class="text-red-500">*</span>
        </label>
        <select id="type" v-model="formData.type"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.type }">
          <option value="call">Phone Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="note">Note</option>
        </select>
        <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
      </div>

      <!-- Subject -->
      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input id="subject" v-model="formData.subject" type="text" placeholder="Brief summary of the activity"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.subject }" />
        <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea id="description" v-model="formData.description" rows="4"
          placeholder="Detailed notes about this activity..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.description }"></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ (formData.description?.length || 0) }}/1000 characters
        </p>
      </div>

      <!-- Scheduled Date/Time -->
      <div>
        <label for="scheduled_at" class="block text-sm font-medium text-gray-700 mb-1">
          Schedule for Later
        </label>
        <div class="flex items-center space-x-2">
          <input type="checkbox" id="schedule-checkbox" v-model="isScheduled"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label for="schedule-checkbox" class="text-sm text-gray-700">
            Schedule this activity for a future date/time
          </label>
        </div>

        <div v-if="isScheduled" class="mt-3">
          <input id="scheduled_at" v-model="formData.scheduled_at" type="datetime-local" :min="minDateTime"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.scheduled_at }" />
          <p v-if="errors.scheduled_at" class="mt-1 text-sm text-red-600">{{ errors.scheduled_at }}</p>
          <p class="mt-1 text-sm text-gray-500">
            Leave empty to log as completed activity
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button type="button" @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>
        <button type="submit" :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ isEditing ? 'Updating...' : 'Saving...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Update Activity' : 'Save Activity' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Activity, ActivityInput } from '@/stores/activities'
import type { ActivityType } from '@/utils/constants'

interface Props {
  contactId?: string
  dealId?: string
  activity?: Activity | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  contactId: undefined,
  dealId: undefined,
  activity: null,
  mode: 'create'
})

const emit = defineEmits<{
  save: [activity: ActivityInput]
  cancel: []
}>()

const formData = ref<{
  type: ActivityType
  subject: string
  description: string
  scheduled_at: string
}>({
  type: 'call',
  subject: '',
  description: '',
  scheduled_at: ''
})

const errors = ref<Partial<Record<keyof typeof formData.value, string>>>({})
const isSubmitting = ref(false)
const isScheduled = ref(false)

const isEditing = computed(() => props.mode === 'edit')

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

watch(() => props.activity, (newActivity) => {
  if (newActivity) {
    formData.value = {
      type: newActivity.type,
      subject: newActivity.subject || '',
      description: newActivity.description || '',
      scheduled_at: newActivity.scheduled_at ?
        new Date(newActivity.scheduled_at).toISOString().slice(0, 16) : ''
    }
    isScheduled.value = !!newActivity.scheduled_at
  } else {
    resetForm()
  }
}, { immediate: true })

watch(isScheduled, (newValue) => {
  if (!newValue) {
    formData.value.scheduled_at = ''
  } else if (!formData.value.scheduled_at) {
    const defaultTime = new Date()
    defaultTime.setHours(defaultTime.getHours() + 1)
    defaultTime.setMinutes(0, 0, 0)
    formData.value.scheduled_at = defaultTime.toISOString().slice(0, 16)
  }
})

const validateForm = () => {
  const newErrors: Partial<Record<keyof typeof formData.value, string>> = {}

  if (!formData.value.type) {
    newErrors.type = 'Activity type is required'
  }

  if (formData.value.subject && formData.value.subject.length > 200) {
    newErrors.subject = 'Subject must be less than 200 characters'
  }

  if (formData.value.description && formData.value.description.length > 1000) {
    newErrors.description = 'Description must be less than 1000 characters'
  }

  if (isScheduled.value && !formData.value.scheduled_at) {
    newErrors.scheduled_at = 'Scheduled date/time is required when scheduling'
  }

  if (formData.value.scheduled_at) {
    const scheduledDate = new Date(formData.value.scheduled_at)
    const now = new Date()
    if (scheduledDate <= now) {
      newErrors.scheduled_at = 'Scheduled date/time must be in the future'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const activityData: ActivityInput = {
      contact_id: props.contactId || undefined,
      deal_id: props.dealId || undefined,
      type: formData.value.type,
      subject: formData.value.subject.trim() || undefined,
      description: formData.value.description.trim() || undefined,
      scheduled_at: isScheduled.value && formData.value.scheduled_at ?
        new Date(formData.value.scheduled_at).toISOString() : undefined
    }

    emit('save', activityData)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    type: 'call',
    subject: '',
    description: '',
    scheduled_at: ''
  }
  errors.value = {}
  isScheduled.value = false
}

// Clear individual field errors on input
watch(() => formData.value.type, () => {
  if (errors.value.type) {
    delete errors.value.type
  }
})

watch(() => formData.value.subject, () => {
  if (errors.value.subject) {
    delete errors.value.subject
  }
})

watch(() => formData.value.description, () => {
  if (errors.value.description) {
    delete errors.value.description
  }
})

watch(() => formData.value.scheduled_at, () => {
  if (errors.value.scheduled_at) {
    delete errors.value.scheduled_at
  }
})

onMounted(() => {
  nextTick(() => {
    const typeSelect = document.getElementById('type') as HTMLSelectElement
    typeSelect?.focus()
  })
})
</script>