<template>
  <div class="space-y-4">
    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search contacts by name, email, or company..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div class="sm:w-48">
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Tag Filter -->
        <div class="sm:w-48" v-if="allTags.length > 0">
          <select
            v-model="selectedTag"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Sort and View Options -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-700">
            {{ filteredContacts.length }} of {{ totalContacts }} contacts
          </span>
          
          <!-- Sort Options -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-700">Sort by:</label>
            <select
              v-model="sortBy"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="created_at">Date Created</option>
              <option value="name">Name</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
              <option value="last_contact_date">Last Contact</option>
            </select>
            
            <button
              @click="toggleSortOrder"
              class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              :title="sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  v-if="sortOrder === 'asc'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
                />
                <path 
                  v-else
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" 
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-2" v-if="totalPages > 1">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span class="text-sm text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading">
      <SkeletonLoader type="list" :count="6" class="space-y-4" />
    </div>

    <!-- Error State -->
    <ErrorDisplay
      v-else-if="hasError"
      :message="error?.message || 'Failed to load contacts'"
      title="Error Loading Contacts"
      :details="error?.details"
      :show-retry="true"
      :show-details="!!error?.details"
      :retrying="loading"
      @retry="retryLoad"
    />

    <!-- Empty State -->
    <div v-else-if="filteredContacts.length === 0 && !loading" class="bg-white rounded-lg shadow p-8">
      <div class="text-center">
        <div class="text-gray-400 mb-4">
          <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ hasActiveFilters ? 'No contacts match your filters' : 'No contacts yet' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ hasActiveFilters 
            ? 'Try adjusting your search or filter criteria.' 
            : 'Get started by adding your first contact.' 
          }}
        </p>
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
        <button
          v-else
          @click="$emit('create-contact')"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add First Contact
        </button>
      </div>
    </div>

    <!-- Contact Cards -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ContactCard
        v-for="contact in paginatedContacts"
        :key="contact.id"
        :contact="contact"
        @edit="$emit('edit-contact', contact)"
        @delete="$emit('delete-contact', contact)"
        @view="$emit('view-contact', contact)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import ContactCard from './ContactCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorDisplay from '@/components/common/ErrorDisplay.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import type { Contact } from '@/stores/contacts'
import type { ContactStatus } from '@/utils/constants'

defineEmits<{
  'create-contact': []
  'edit-contact': [contact: Contact]
  'delete-contact': [contact: Contact]
  'view-contact': [contact: Contact]
}>()

const contactsStore = useContactsStore()

const searchInput = ref('')
const selectedStatus = ref<ContactStatus | 'all'>('all')
const selectedTag = ref('')
const sortBy = ref<'created_at' | 'name' | 'company' | 'status' | 'last_contact_date'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const itemsPerPage = ref(12)

const searchDebounceTimeout = ref<NodeJS.Timeout>()
watch(searchInput, (newValue) => {
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value)
  }
  
  searchDebounceTimeout.value = setTimeout(() => {
    contactsStore.setSearchQuery(newValue)
    currentPage.value = 1 
  }, 300)
})

watch([selectedStatus, selectedTag], () => {
  currentPage.value = 1
})

const { contacts, loading, error, hasError, filteredContacts, allTags } = contactsStore

const totalContacts = computed(() => contacts.length)

const hasActiveFilters = computed(() => {
  return searchInput.value !== '' || selectedStatus.value !== 'all' || selectedTag.value !== ''
})

const sortedContacts = computed(() => {
  const sorted = [...filteredContacts]
  
  sorted.sort((a, b) => {
    let aValue: string | number | null | undefined = a[sortBy.value]
    let bValue: string | number | null | undefined = b[sortBy.value]
    
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1
    if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    
    let comparison = 0
    if (aValue < bValue) comparison = -1
    else if (aValue > bValue) comparison = 1
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
})

const totalPages = computed(() => {
  return Math.ceil(sortedContacts.value.length / itemsPerPage.value)
})

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedContacts.value.slice(start, end)
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const clearAllFilters = () => {
  searchInput.value = ''
  selectedStatus.value = 'all'
  selectedTag.value = ''
  contactsStore.clearFilters()
  currentPage.value = 1
}

const retryLoad = () => {
  contactsStore.fetchContacts()
}

watch(selectedStatus, (newStatus) => {
  contactsStore.setStatusFilter(newStatus)
})

watch(selectedTag, (newTag) => {
  contactsStore.setTagFilter(newTag ? [newTag] : [])
})

onMounted(() => {
  if (contacts.length === 0) {
    contactsStore.fetchContacts()
  }
})
</script>