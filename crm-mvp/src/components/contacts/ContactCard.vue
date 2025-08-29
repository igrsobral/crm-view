<template>
  <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200">
    <div class="p-6">
      <!-- Header with name and status -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ contact.name }}
          </h3>
          <div class="flex items-center mt-1">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusClasses[contact.status]"
            >
              {{ statusLabels[contact.status] }}
            </span>
          </div>
        </div>
        
        <!-- Actions dropdown -->
        <div class="relative ml-4">
          <button
            @click="showActions = !showActions"
            @blur="handleBlur"
            class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          <div
            v-if="showActions"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
          >
            <div class="py-1">
              <button
                @click="handleView"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
              <button
                @click="handleEdit"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Contact
              </button>
              <hr class="my-1">
              <button
                @click="handleDelete"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="space-y-2">
        <!-- Email -->
        <div v-if="contact.email" class="flex items-center text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a 
            :href="`mailto:${contact.email}`"
            class="hover:text-blue-600 truncate"
            @click.stop
          >
            {{ contact.email }}
          </a>
        </div>

        <!-- Phone -->
        <div v-if="contact.phone" class="flex items-center text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a 
            :href="`tel:${contact.phone}`"
            class="hover:text-blue-600"
            @click.stop
          >
            {{ contact.phone }}
          </a>
        </div>

        <!-- Company -->
        <div v-if="contact.company" class="flex items-center text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="truncate">{{ contact.company }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="contact.tags && contact.tags.length > 0" class="mt-4">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in contact.tags.slice(0, 3)"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ tag }}
          </span>
          <span
            v-if="contact.tags.length > 3"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
          >
            +{{ contact.tags.length - 3 }} more
          </span>
        </div>
      </div>

      <!-- Footer with dates -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center text-xs text-gray-500">
          <span>
            Created {{ formatDate(contact.created_at) }}
          </span>
          <span v-if="contact.last_contact_date">
            Last contact {{ formatDate(contact.last_contact_date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Contact } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

defineProps<{
  contact: Contact
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  view: []
}>()

const showActions = ref(false)

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

const handleView = () => {
  showActions.value = false
  emit('view')
}

const handleEdit = () => {
  showActions.value = false
  emit('edit')
}

const handleDelete = () => {
  showActions.value = false
  emit('delete')
}

const handleBlur = () => {
  nextTick(() => {
    showActions.value = false
  })
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
</script>