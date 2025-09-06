<template>
    <!-- Header -->
    <!-- <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
        </h2>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div> -->

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class=" space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="name"
          v-model="formData.name"
          placeholder="Enter contact name"
          :invalid="!!errors.name"
          class="w-full"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <InputText
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter email address"
          :invalid="!!errors.email"
          class="w-full"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Phone Field -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <InputText
          id="phone"
          v-model="formData.phone"
          type="tel"
          placeholder="Enter phone number"
          :invalid="!!errors.phone"
          class="w-full"
        />
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <!-- Company Field -->
      <div>
        <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <InputText
          id="company"
          v-model="formData.company"
          placeholder="Enter company name"
          :invalid="!!errors.company"
          class="w-full"
        />
        <p v-if="errors.company" class="mt-1 text-sm text-red-600">{{ errors.company }}</p>
      </div>

      <!-- Status Field -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
          Status <span class="text-red-500">*</span>
        </label>
        <Select
          id="status"
          v-model="formData.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
          :invalid="!!errors.status"
          class="w-full"
        />
        <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
      </div>

      <!-- Tags Field with Chips -->
      <div>
        <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <Chips
          id="tags"
          v-model="formData.tags"
          :allowDuplicate="false"
          placeholder="Add tags..."
          :invalid="!!errors.tags"
          class="w-full"
        />
        <p v-if="errors.tags" class="mt-1 text-sm text-red-600">{{ errors.tags }}</p>
        <p class="mt-1 text-sm text-gray-500">
          Press Enter or comma to add a tag. Use existing tags for consistency.
        </p>
      </div>

      <!-- Notes Field -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          rows="4"
          placeholder="Add any additional notes about this contact..."
          :invalid="!!errors.notes"
          class="w-full resize-vertical"
        />
        <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes }}</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ (formData.notes?.length || 0) }}/1000 characters
        </p>
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
          :label="isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Contact' : 'Create Contact')"
          class="px-4 py-2"
        />
      </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { contactSchema, type ContactFormData } from '@/utils/validation'
import type { Contact, ContactInput } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

// PrimeVue component imports
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Chips from 'primevue/chips'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

interface Props {
  contact?: Contact | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  contact: null,
  mode: 'create'
})

const emit = defineEmits<{
  save: [contact: ContactInput]
  cancel: []
}>()

const formData = ref<ContactFormData>({
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'lead' as ContactStatus,
  tags: [],
  notes: ''
})

const errors = ref<Partial<Record<keyof ContactFormData, string>>>({})
const isSubmitting = ref(false)

const isEditing = computed(() => props.mode === 'edit')

const statusOptions = [
  { label: 'Lead', value: 'lead' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'Customer', value: 'customer' },
  { label: 'Inactive', value: 'inactive' }
]

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    tags: [],
    notes: ''
  }
  errors.value = {}
}

watch(() => props.contact, (newContact) => {
  if (newContact) {
    formData.value = {
      name: newContact.name,
      email: newContact.email || '',
      phone: newContact.phone || '',
      company: newContact.company || '',
      status: newContact.status,
      tags: [...newContact.tags],
      notes: newContact.notes || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const validateForm = () => {
  const result = contactSchema.safeParse(formData.value)

  if (!result.success) {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {}
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof ContactFormData
      newErrors[field] = issue.message
    })
    errors.value = newErrors
    return false
  }

  errors.value = {}
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const cleanedData: ContactInput = {
      name: formData.value.name.trim(),
      email: formData.value.email?.trim() || undefined,
      phone: formData.value.phone?.trim() || undefined,
      company: formData.value.company?.trim() || undefined,
      status: formData.value.status,
      tags: formData.value.tags.filter(tag => tag.trim()),
      notes: formData.value.notes?.trim() || undefined
    }

    emit('save', cleanedData)
  } finally {
    isSubmitting.value = false
  }
}

watch(() => formData.value.name, () => {
  if (errors.value.name) {
    const result = contactSchema.shape.name.safeParse(formData.value.name)
    if (result.success) {
      delete errors.value.name
    }
  }
})

watch(() => formData.value.email, () => {
  if (errors.value.email) {
    const result = contactSchema.shape.email.safeParse(formData.value.email)
    if (result.success) {
      delete errors.value.email
    }
  }
})

onMounted(() => {
  nextTick(() => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    nameInput?.focus()
  })
})
</script>
