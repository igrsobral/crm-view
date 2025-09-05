<template>
  <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200" data-testid="contact-card">
    <div class="p-6">
      <!-- Header with name and status -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate" data-testid="contact-name">
            {{ contact.name }}
          </h3>
          <div class="flex items-center mt-1">
            <Tag 
              :value="statusLabels[contact.status]"
              :severity="statusSeverity[contact.status]"
              class="text-xs"
            />
          </div>
        </div>
        
        <!-- Actions dropdown -->
        <div class="relative ml-4">
          <Button
            @click="toggleMenu"
            icon="pi pi-ellipsis-v"
            text
            rounded
            severity="secondary"
            size="small"
            class="p-1"
          />
          
          <Menu
            ref="menu"
            :model="menuItems"
            :popup="true"
          />
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
          <Tag
            v-for="tag in contact.tags.slice(0, 3)"
            :key="tag"
            :value="tag"
            severity="info"
            class="text-xs"
          />
          <Tag
            v-if="contact.tags.length > 3"
            :value="`+${contact.tags.length - 3} more`"
            severity="secondary"
            class="text-xs"
          />
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
import { ref } from 'vue'
import type { Contact } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

// PrimeVue component imports
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import Tag from 'primevue/tag'

defineProps<{
  contact: Contact
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  view: []
}>()

const menu = ref()

const menuItems: MenuItem[] = [
  {
    label: 'View Details',
    icon: 'pi pi-eye',
    command: () => handleView()
  },
  {
    label: 'Edit Contact',
    icon: 'pi pi-pencil',
    command: () => handleEdit()
  },
  {
    separator: true
  },
  {
    label: 'Delete Contact',
    icon: 'pi pi-trash',
    class: 'text-red-600',
    command: () => handleDelete()
  }
]

const statusSeverity: Record<ContactStatus, 'success' | 'info' | 'warning' | 'secondary'> = {
  lead: 'warning',
  prospect: 'info', 
  customer: 'success',
  inactive: 'secondary'
}



const statusLabels: Record<ContactStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  customer: 'Customer',
  inactive: 'Inactive'
}

const handleView = () => {
  emit('view')
}

const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  emit('delete')
}

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
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