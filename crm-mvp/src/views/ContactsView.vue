<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
          <p class="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <button @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>
      </div>

      <!-- Contact List -->
      <ContactList @create-contact="showCreateModal = true" @edit-contact="handleEditContact"
        @delete-contact="handleDeleteContact" @view-contact="handleViewContact" />

      <!-- Create/Edit Modal Placeholder -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="showCreateModal = false">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
          <div class="mt-3 text-center">
            <h3 class="text-lg font-medium text-gray-900">Create Contact</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Contact form will be implemented in task 4.3
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button @click="showCreateModal = false"
                class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Close
              </button>
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
              <button @click="contactToDelete = null"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Cancel
              </button>
              <button @click="confirmDelete"
                class="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import ContactList from '@/components/contacts/ContactList.vue'
import { useContactsStore } from '@/stores/contacts'
import type { Contact } from '@/stores/contacts'

const contactsStore = useContactsStore()

const showCreateModal = ref(false)
const contactToDelete = ref<Contact | null>(null)

const handleEditContact = (contact: Contact) => {
  // TODO: Implement 
  console.log('Edit contact:', contact)
}

const handleDeleteContact = (contact: Contact) => {
  contactToDelete.value = contact
}

const handleViewContact = (contact: Contact) => {
  // TODO: Implement 
  console.log('View contact:', contact)
}

const confirmDelete = async () => {
  if (contactToDelete.value) {
    await contactsStore.deleteContact(contactToDelete.value.id)
    contactToDelete.value = null
  }
}
</script>