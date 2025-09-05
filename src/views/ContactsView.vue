<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
          <p class="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <router-link
            to="/contacts/import"
            class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import
          </router-link>
          <router-link
            to="/export"
            class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5M7 14l5 5 5-5" />
            </svg>
            Export
          </router-link>
          <Button 
            @click="openCreateForm"
            icon="pi pi-plus"
            label="Add Contact"
            class="px-4 py-2"
          />
        </div>
      </div>

      <!-- Contact List -->
      <ContactList @create-contact="openCreateForm" @edit-contact="handleEditContact"
        @delete-contact="handleDeleteContact" @view-contact="handleViewContact" />

      <!-- Create/Edit Contact Modal -->
      <div v-if="showContactForm"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <ContactForm :contact="selectedContact" :mode="formMode" @save="handleSaveContact"
            @cancel="closeContactForm" />
        </div>
      </div>

      <!-- Contact Details Modal -->
      <div v-if="showContactDetails && selectedContact"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-6xl max-h-[90vh] overflow-y-auto" @click.stop>
          <ContactDetails 
            :contact="selectedContact" 
            @close="closeContactDetails"
            @edit="handleEditFromDetails"
          />
        </div>
      </div>

      <!-- Success/Error Notification -->
      <div v-if="notification" class="fixed top-4 right-4 z-50">
        <div class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto" :class="{
          'bg-green-50 border border-green-200': notification.type === 'success',
          'bg-red-50 border border-red-200': notification.type === 'error'
        }">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 w-0 flex-1">
                <p class="text-sm font-medium" :class="{
                  'text-green-800': notification.type === 'success',
                  'text-red-800': notification.type === 'error'
                }">
                  {{ notification.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button @click="notification = null"
                  class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2" :class="{
                    'text-green-400 hover:text-green-500 focus:ring-green-500': notification.type === 'success',
                    'text-red-400 hover:text-red-500 focus:ring-red-500': notification.type === 'error'
                  }">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="contactToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="contactToDelete = null">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Contact</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete <strong>{{ contactToDelete.name }}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div class="flex gap-3 px-4 py-3">
              <Button 
                @click="contactToDelete = null"
                outlined
                severity="secondary"
                label="Cancel"
                class="flex-1"
              />
              <Button 
                @click="confirmDelete"
                severity="danger"
                label="Delete"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import ContactList from '@/components/contacts/ContactList.vue'
import ContactForm from '@/components/contacts/ContactForm.vue'
import ContactDetails from '@/components/contacts/ContactDetails.vue'
import { useContactsStore } from '@/stores/contacts'
import type { Contact, ContactInput } from '@/stores/contacts'

// PrimeVue component imports
import Button from 'primevue/button'

const contactsStore = useContactsStore()

const showContactForm = ref(false)
const showContactDetails = ref(false)
const selectedContact = ref<Contact | null>(null)
const formMode = ref<'create' | 'edit'>('create')

const contactToDelete = ref<Contact | null>(null)

const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

const openCreateForm = () => {
  selectedContact.value = null
  formMode.value = 'create'
  showContactForm.value = true
}

const handleEditContact = (contact: Contact) => {
  selectedContact.value = contact
  formMode.value = 'edit'
  showContactForm.value = true
}

const closeContactForm = () => {
  showContactForm.value = false
  selectedContact.value = null
}

const closeContactDetails = () => {
  showContactDetails.value = false
  selectedContact.value = null
}

const handleEditFromDetails = () => {
  showContactDetails.value = false
  formMode.value = 'edit'
  showContactForm.value = true
}

const handleSaveContact = async (contactData: ContactInput) => {
  try {
    let result

    if (formMode.value === 'create') {
      result = await contactsStore.createContact(contactData)
    } else if (selectedContact.value) {
      result = await contactsStore.updateContact(selectedContact.value.id, contactData)
    }

    if (result?.error) {
      showNotification('error', result.error)
    } else {
      showNotification('success',
        formMode.value === 'create'
          ? 'Contact created successfully!'
          : 'Contact updated successfully!'
      )
      closeContactForm()
    }
  } catch (error) {
    if(error instanceof Error) {
      showNotification('error', 'An unexpected error occurred. Please try again.')
      return
    }
  }
}

const handleDeleteContact = (contact: Contact) => {
  contactToDelete.value = contact
}

const handleViewContact = (contact: Contact) => {
  selectedContact.value = contact
  showContactDetails.value = true
}

const confirmDelete = async () => {
  if (contactToDelete.value) {
    const result = await contactsStore.deleteContact(contactToDelete.value.id)

    if (result?.error) {
      showNotification('error', result.error)
    } else {
      showNotification('success', 'Contact deleted successfully!')
    }

    contactToDelete.value = null
  }
}

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

onMounted(async () => {
  await contactsStore.fetchContacts()
})
</script>