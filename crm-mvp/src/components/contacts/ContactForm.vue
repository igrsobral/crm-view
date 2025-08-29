<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
        </h2>
        <button
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="Enter contact name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter email address"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Phone Field -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          placeholder="Enter phone number"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.phone }"
        />
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <!-- Company Field -->
      <div>
        <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          id="company"
          v-model="formData.company"
          type="text"
          placeholder="Enter company name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.company }"
        />
        <p v-if="errors.company" class="mt-1 text-sm text-red-600">{{ errors.company }}</p>
      </div>

      <!-- Status Field -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
          Status <span class="text-red-500">*</span>
        </label>
        <select
          id="status"
          v-model="formData.status"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.status }"
        >
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="customer">Customer</option>
          <option value="inactive">Inactive</option>
        </select>
        <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
      </div>

      <!-- Tags Field with Autocomplete -->
      <div>
        <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div class="relative">
          <!-- Tag Input -->
          <div class="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex flex-wrap gap-1 items-center"
               :class="{ 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500': errors.tags }">
            <!-- Selected Tags -->
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(index)"
                class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
            
            <!-- Tag Input -->
            <input
              ref="tagInput"
              v-model="tagInputValue"
              @keydown="handleTagKeydown"
              @focus="showTagSuggestions = true"
              @blur="handleTagBlur"
              type="text"
              placeholder="Add tags..."
              class="flex-1 min-w-[120px] border-none outline-none focus:ring-0 p-0"
            />
          </div>
          
          <!-- Tag Suggestions Dropdown -->
          <div
            v-if="showTagSuggestions && filteredTagSuggestions.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            <button
              v-for="(suggestion, index) in filteredTagSuggestions"
              :key="suggestion"
              type="button"
              @mousedown="addTagFromSuggestion(suggestion)"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              :class="{ 'bg-gray-100': index === selectedSuggestionIndex }"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
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
        <textarea
          id="notes"
          v-model="formData.notes"
          rows="4"
          placeholder="Add any additional notes about this contact..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.notes }"
        ></textarea>
        <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes }}</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ (formData.notes?.length || 0) }}/1000 characters
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Update Contact' : 'Create Contact' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import { contactSchema, type ContactFormData } from '@/utils/validation'
import type { Contact, ContactInput } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

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

const contactsStore = useContactsStore()

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

const tagInput = ref<HTMLInputElement>()
const tagInputValue = ref('')
const showTagSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

const isEditing = computed(() => props.mode === 'edit')

const filteredTagSuggestions = computed(() => {
  if (!tagInputValue.value.trim()) {
    return contactsStore.allTags.filter(tag => !formData.value.tags.includes(tag)).slice(0, 10)
  }
  
  const query = tagInputValue.value.toLowerCase().trim()
  return contactsStore.allTags
    .filter(tag => 
      tag.toLowerCase().includes(query) && 
      !formData.value.tags.includes(tag)
    )
    .slice(0, 10)
})

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

const addTag = (tag: string) => {
  const trimmedTag = tag.trim()
  if (trimmedTag && !formData.value.tags.includes(trimmedTag)) {
    formData.value.tags.push(trimmedTag)
    clearTagInput()
  }
}

const addTagFromSuggestion = (tag: string) => {
  addTag(tag)
  showTagSuggestions.value = false
  nextTick(() => {
    tagInput.value?.focus()
  })
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const clearTagInput = () => {
  tagInputValue.value = ''
  selectedSuggestionIndex.value = -1
}

const handleTagKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    if (tagInputValue.value.trim()) {
      addTag(tagInputValue.value)
    }
  } else if (event.key === 'Backspace' && !tagInputValue.value && formData.value.tags.length > 0) {
    formData.value.tags.pop()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (filteredTagSuggestions.value.length > 0) {
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        filteredTagSuggestions.value.length - 1
      )
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
  } else if (event.key === 'Tab' && selectedSuggestionIndex.value >= 0) {
    event.preventDefault()
    addTagFromSuggestion(filteredTagSuggestions.value[selectedSuggestionIndex.value])
  }
}

const handleTagBlur = () => {
  setTimeout(() => {
    showTagSuggestions.value = false
    if (tagInputValue.value.trim()) {
      addTag(tagInputValue.value)
    }
  }, 150)
}

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
  clearTagInput()
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