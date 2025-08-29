<template>
    <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">
                    {{ isEditing ? 'Edit Deal' : 'Create New Deal' }}
                </h2>
                <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-6">
            <!-- Deal Name -->
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Deal Name *
                </label>
                <input id="name" v-model="form.name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.name }" placeholder="Enter deal name">
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Contact Selection -->
            <div>
                <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">
                    Contact *
                </label>
                <div class="relative">
                    <input id="contact" v-model="contactSearchQuery" type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :class="{ 'border-red-300': errors.contact_id }" placeholder="Search for a contact..."
                        @input="searchContacts" @focus="showContactDropdown = true">

                    <!-- Contact Dropdown -->
                    <div v-if="showContactDropdown && (filteredContacts.length > 0 || contactSearchQuery.length > 0)"
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div v-for="contact in filteredContacts" :key="contact.id"
                            class="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            @click="selectContact(contact)">
                            <div class="font-medium text-gray-900">{{ contact.name }}</div>
                            <div class="text-sm text-gray-600">
                                {{ contact.email }}
                                <span v-if="contact.company"> • {{ contact.company }}</span>
                            </div>
                        </div>
                        <div v-if="filteredContacts.length === 0 && contactSearchQuery.length > 0"
                            class="px-4 py-2 text-gray-500 text-sm">
                            No contacts found
                        </div>
                    </div>
                </div>
                <p v-if="errors.contact_id" class="mt-1 text-sm text-red-600">{{ errors.contact_id }}</p>
            </div>

            <!-- Deal Value -->
            <div>
                <label for="value" class="block text-sm font-medium text-gray-700 mb-2">
                    Deal Value
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input id="value" v-model.number="form.value" type="number" min="0" step="0.01"
                        class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00">
                </div>
            </div>

            <!-- Pipeline Stage -->
            <div>
                <label for="stage" class="block text-sm font-medium text-gray-700 mb-2">
                    Pipeline Stage
                </label>
                <select id="stage" v-model="form.stage"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option v-for="stage in stageOptions" :key="stage.value" :value="stage.value">
                        {{ stage.label }}
                    </option>
                </select>
            </div>

            <!-- Expected Close Date -->
            <div>
                <label for="expected_close_date" class="block text-sm font-medium text-gray-700 mb-2">
                    Expected Close Date
                </label>
                <input id="expected_close_date" v-model="form.expected_close_date" type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Notes -->
            <div>
                <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                </label>
                <textarea id="notes" v-model="form.notes" rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add any notes about this deal..."></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" @click="$emit('cancel')"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Cancel
                </button>
                <button type="submit" :disabled="loading || !isFormValid"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="loading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ isEditing ? 'Updating...' : 'Creating...' }}
                    </span>
                    <span v-else>
                        {{ isEditing ? 'Update Deal' : 'Create Deal' }}
                    </span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { DEAL_STAGES, type DealStage } from '@/utils/constants'
import type { Deal, DealInput } from '@/stores/deals'
import type { Contact } from '@/stores/contacts'
import { useContactsStore } from '@/stores/contacts'

interface Props {
    deal?: Deal | null
    loading?: boolean
}

interface Emits {
    (e: 'save', dealData: DealInput): void
    (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const contactsStore = useContactsStore()

const form = ref<DealInput>({
    contact_id: '',
    name: '',
    value: undefined,
    stage: DEAL_STAGES.LEAD,
    expected_close_date: '',
    notes: ''
})

const errors = ref<Record<string, string>>({})
const contactSearchQuery = ref('')
const showContactDropdown = ref(false)
const filteredContacts = ref<Contact[]>([])

const isEditing = computed(() => !!props.deal)

const stageOptions = [
    { value: DEAL_STAGES.LEAD, label: 'Lead' },
    { value: DEAL_STAGES.QUALIFIED, label: 'Qualified' },
    { value: DEAL_STAGES.PROPOSAL, label: 'Proposal' },
    { value: DEAL_STAGES.NEGOTIATION, label: 'Negotiation' },
    { value: DEAL_STAGES.CLOSED_WON, label: 'Closed Won' },
    { value: DEAL_STAGES.CLOSED_LOST, label: 'Closed Lost' }
]

const isFormValid = computed(() => {
    return form.value.name.trim() && form.value.contact_id
})

const initializeForm = () => {
    if (props.deal) {
        form.value = {
            contact_id: props.deal.contact_id,
            name: props.deal.name,
            value: props.deal.value,
            stage: props.deal.stage,
            expected_close_date: props.deal.expected_close_date || '',
            notes: props.deal.notes || ''
        }

        if (props.deal.contact) {
            contactSearchQuery.value = props.deal.contact.name
        }
    } else {
        form.value = {
            contact_id: '',
            name: '',
            value: undefined,
            stage: DEAL_STAGES.LEAD,
            expected_close_date: '',
            notes: ''
        }
        contactSearchQuery.value = ''
    }
    errors.value = {}
}

const searchContacts = async () => {
    if (contactSearchQuery.value.length < 2) {
        filteredContacts.value = []
        return
    }

    try {
        const { data } = await contactsStore.searchContacts(contactSearchQuery.value, 10)
        filteredContacts.value = data || []
    } catch (error) {
        console.error('Error searching contacts:', error)
        filteredContacts.value = []
    }
}

const selectContact = (contact: Contact) => {
    form.value.contact_id = contact.id
    contactSearchQuery.value = contact.name
    showContactDropdown.value = false
    errors.value.contact_id = ''
}

const validateForm = (): boolean => {
    errors.value = {}

    if (!form.value.name.trim()) {
        errors.value.name = 'Deal name is required'
    }

    if (!form.value.contact_id) {
        errors.value.contact_id = 'Contact is required'
    }

    return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
    if (!validateForm()) {
        return
    }

    const dealData: DealInput = {
        contact_id: form.value.contact_id,
        name: form.value.name.trim(),
        value: form.value.value || undefined,
        stage: form.value.stage,
        expected_close_date: form.value.expected_close_date || undefined,
        notes: form.value.notes?.trim() || undefined
    }

    emit('save', dealData)
}

const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
        showContactDropdown.value = false
    }
}

watch(() => props.deal, initializeForm, { immediate: true })

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    contactsStore.fetchContacts()
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>