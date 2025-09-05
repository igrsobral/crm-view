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
        <Select 
          id="type" 
          v-model="formData.type"
          :options="activityTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select activity type"
          :invalid="!!errors.type"
          class="w-full"
        />
        <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
      </div>

      <!-- Subject -->
      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <InputText 
          id="subject" 
          v-model="formData.subject" 
          placeholder="Brief summary of the activity"
          :invalid="!!errors.subject"
          class="w-full"
        />
        <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea 
          id="description" 
          v-model="formData.description" 
          rows="4"
          placeholder="Detailed notes about this activity..."
          :invalid="!!errors.description"
          class="w-full resize-vertical"
        />
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
          <Checkbox 
            id="schedule-checkbox" 
            v-model="isScheduled" 
            :binary="true"
          />
          <label for="schedule-checkbox" class="text-sm text-gray-700">
            Schedule this activity for a future date/time
          </label>
        </div>

        <div v-if="isScheduled" class="mt-3">
          <Calendar 
            id="scheduled_at" 
            v-model="scheduledDate" 
            showTime 
            :showSeconds="false"
            :minDate="new Date()"
            placeholder="Select date and time"
            :invalid="!!errors.scheduled_at"
            class="w-full"
          />
          <p v-if="errors.scheduled_at" class="mt-1 text-sm text-red-600">{{ errors.scheduled_at }}</p>
          <p class="mt-1 text-sm text-gray-500">
            Leave empty to log as completed activity
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          @click="$emit('cancel')"
          outlined
          severity="secondary"
          label="Cancel"
          class="px-4 py-2"
        />
        <Button 
          type="submit" 
          :disabled="isSubmitting"
          :loading="isSubmitting"
          :label="isSubmitting ? (isEditing ? 'Updating...' : 'Logging Activity...') : (isEditing ? 'Update Activity' : 'Log Activity')"
          class="px-4 py-2"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Activity, ActivityInput } from '@/stores/activities'
import type { ActivityType } from '@/utils/constants'

// PrimeVue component imports
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'

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
const scheduledDate = ref<Date | null>(null)

const isEditing = computed(() => props.mode === 'edit')

const activityTypeOptions = [
  { label: 'Phone Call', value: 'call' },
  { label: 'Email', value: 'email' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Note', value: 'note' }
]

// Define resetForm function before using it in watchers
const resetForm = () => {
  formData.value = {
    type: 'call',
    subject: '',
    description: '',
    scheduled_at: ''
  }
  errors.value = {}
  isScheduled.value = false
  scheduledDate.value = null
}

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

  if (isScheduled.value && !scheduledDate.value) {
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
    scheduledDate.value = newActivity.scheduled_at ? new Date(newActivity.scheduled_at) : null
  } else {
    resetForm()
  }
}, { immediate: true })

watch(isScheduled, (newValue) => {
  if (!newValue) {
    formData.value.scheduled_at = ''
    scheduledDate.value = null
  } else if (!scheduledDate.value) {
    const defaultTime = new Date()
    defaultTime.setHours(defaultTime.getHours() + 1)
    defaultTime.setMinutes(0, 0, 0)
    scheduledDate.value = defaultTime
    formData.value.scheduled_at = defaultTime.toISOString().slice(0, 16)
  }
})

watch(scheduledDate, (newDate) => {
  if (newDate) {
    formData.value.scheduled_at = newDate.toISOString().slice(0, 16)
  } else {
    formData.value.scheduled_at = ''
  }
})

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
      scheduled_at: isScheduled.value && scheduledDate.value ?
        scheduledDate.value.toISOString() : undefined
    }

    emit('save', activityData)
  } finally {
    isSubmitting.value = false
  }
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