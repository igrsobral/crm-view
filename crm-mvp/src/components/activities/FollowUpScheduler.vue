<template>
    <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">Schedule Follow-up</h2>
                <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Contact Selection (if not pre-selected) -->
            <div v-if="!contactId">
                <label for="contact" class="block text-sm font-medium text-gray-700 mb-1">
                    Contact <span class="text-red-500">*</span>
                </label>
                <Select 
                    id="contact" 
                    v-model="formData.contactId"
                    :options="contactOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a contact..."
                    :invalid="!!errors.contactId"
                    class="w-full"
                />
                <p v-if="errors.contactId" class="mt-1 text-sm text-red-600">{{ errors.contactId }}</p>
            </div>

            <!-- Follow-up Type -->
            <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Type <span class="text-red-500">*</span>
                </label>
                <Select 
                    id="type" 
                    v-model="formData.type"
                    :options="followUpTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select follow-up type"
                    :invalid="!!errors.type"
                    class="w-full"
                />
                <p v-if="errors.type" class="mt-1 text-sm text-red-600">{{ errors.type }}</p>
            </div>

            <!-- Quick Schedule Options -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Quick Schedule</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button type="button" @click="setQuickSchedule(1, 'hours')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        In 1 hour
                    </button>
                    <button type="button" @click="setQuickSchedule(4, 'hours')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        In 4 hours
                    </button>
                    <button type="button" @click="setQuickSchedule(1, 'days')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Tomorrow
                    </button>
                    <button type="button" @click="setQuickSchedule(3, 'days')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        In 3 days
                    </button>
                    <button type="button" @click="setQuickSchedule(1, 'weeks')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Next week
                    </button>
                    <button type="button" @click="setQuickSchedule(2, 'weeks')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        In 2 weeks
                    </button>
                    <button type="button" @click="setQuickSchedule(1, 'months')"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Next month
                    </button>
                    <button type="button" @click="scheduledDate = undefined"
                        class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500">
                        Clear
                    </button>
                </div>
            </div>

            <!-- Custom Date/Time -->
            <div>
                <label for="scheduledAt" class="block text-sm font-medium text-gray-700 mb-1">
                    Custom Date & Time <span class="text-red-500">*</span>
                </label>
                <Calendar 
                    id="scheduledAt" 
                    v-model="scheduledDate"
                    showTime
                    hourFormat="24"
                    :minDate="new Date()"
                    placeholder="Select date and time"
                    :invalid="!!errors.scheduledAt"
                    class="w-full"
                />
                <p v-if="errors.scheduledAt" class="mt-1 text-sm text-red-600">{{ errors.scheduledAt }}</p>
                <p class="mt-1 text-sm text-gray-500">
                    {{ scheduledDate ? `Scheduled for ${formatScheduledTime(scheduledDate.toISOString().slice(0, 16))}` : 'Select date and time for follow-up' }}
                </p>
            </div>

            <!-- Subject -->
            <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                </label>
                <InputText 
                    id="subject" 
                    v-model="formData.subject"
                    :placeholder="`Follow-up ${formData.type} with ${selectedContactName}`"
                    :invalid="!!errors.subject"
                    class="w-full"
                />
                <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
            </div>

            <!-- Description/Notes -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                </label>
                <Textarea 
                    id="description" 
                    v-model="formData.description" 
                    rows="3"
                    placeholder="Add any notes or context for this follow-up..."
                    :invalid="!!errors.description"
                    class="w-full resize-vertical"
                />
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
            </div>

            <!-- Priority Level -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
                <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                        <RadioButton 
                            v-model="formData.priority" 
                            inputId="priority-low" 
                            value="low" 
                        />
                        <span class="ml-2 text-sm text-gray-700">Low</span>
                    </label>
                    <label class="flex items-center">
                        <RadioButton 
                            v-model="formData.priority" 
                            inputId="priority-medium" 
                            value="medium" 
                        />
                        <span class="ml-2 text-sm text-gray-700">Medium</span>
                    </label>
                    <label class="flex items-center">
                        <RadioButton 
                            v-model="formData.priority" 
                            inputId="priority-high" 
                            value="high" 
                        />
                        <span class="ml-2 text-sm text-gray-700">High</span>
                    </label>
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
                    :label="isSubmitting ? 'Scheduling...' : 'Schedule Follow-up'"
                    class="px-4 py-2"
                />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import type { ActivityType } from '@/utils/constants'

// PrimeVue component imports
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import RadioButton from 'primevue/radiobutton'


interface Props {
    contactId?: string
    dealId?: string
}

const props = withDefaults(defineProps<Props>(), {
    contactId: undefined,
    dealId: undefined
})

const emit = defineEmits<{
    save: [followUpData: {
        contactId: string
        dealId?: string
        type: ActivityType
        scheduledAt: string
        subject?: string
        description?: string
        priority: 'low' | 'medium' | 'high'
    }]
    cancel: []
}>()

const contactsStore = useContactsStore()

const formData = ref({
    contactId: props.contactId || '',
    type: 'call' as ActivityType,
    scheduledAt: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
})

const scheduledDate = ref<Date>()
const errors = ref<Partial<Record<keyof typeof formData.value, string>>>({})
const isSubmitting = ref(false)

const contacts = computed(() => contactsStore.contacts)

const contactOptions = computed(() => 
    contacts.value.map(contact => ({
        label: `${contact.name}${contact.company ? ` (${contact.company})` : ''}`,
        value: contact.id
    }))
)

const followUpTypeOptions = [
    { label: 'Phone Call', value: 'call' },
    { label: 'Email', value: 'email' },
    { label: 'Meeting', value: 'meeting' },
    { label: 'Note/Reminder', value: 'note' }
]

const selectedContactName = computed(() => {
    const contactId = formData.value.contactId || props.contactId
    if (!contactId) return ''
    const contact = contacts.value.find(c => c.id === contactId)
    return contact?.name || ''
})

// Load contacts if not already loaded
onMounted(async () => {
    if (contacts.value.length === 0) {
        await contactsStore.fetchContacts()
    }

    // Set default scheduled time to 1 hour from now
    if (!formData.value.scheduledAt) {
        setQuickSchedule(1, 'hours')
    }
})

// Watch scheduledDate changes and update formData.scheduledAt
watch(scheduledDate, (newDate) => {
    if (newDate) {
        formData.value.scheduledAt = newDate.toISOString().slice(0, 16)
    } else {
        formData.value.scheduledAt = ''
    }
})

// Watch formData.scheduledAt changes and update scheduledDate
watch(() => formData.value.scheduledAt, (newDateTime) => {
    if (newDateTime && newDateTime !== scheduledDate.value?.toISOString().slice(0, 16)) {
        scheduledDate.value = new Date(newDateTime)
    }
})

const setQuickSchedule = (amount: number, unit: 'hours' | 'days' | 'weeks' | 'months') => {
    const now = new Date()

    switch (unit) {
        case 'hours':
            now.setHours(now.getHours() + amount)
            break
        case 'days':
            now.setDate(now.getDate() + amount)
            break
        case 'weeks':
            now.setDate(now.getDate() + (amount * 7))
            break
        case 'months':
            now.setMonth(now.getMonth() + amount)
            break
    }

    // Round to next 15-minute interval
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil(minutes / 15) * 15
    now.setMinutes(roundedMinutes, 0, 0)

    scheduledDate.value = now
}

const formatScheduledTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (diffDays === 0) {
        return `today at ${timeString}`
    } else if (diffDays === 1) {
        return `tomorrow at ${timeString}`
    } else if (diffDays < 7) {
        return `in ${diffDays} days at ${timeString}`
    } else {
        return `${date.toLocaleDateString()} at ${timeString}`
    }
}

const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData.value, string>> = {}

    if (!props.contactId && !formData.value.contactId) {
        newErrors.contactId = 'Please select a contact'
    }

    if (!formData.value.type) {
        newErrors.type = 'Please select a follow-up type'
    }

    if (!formData.value.scheduledAt) {
        newErrors.scheduledAt = 'Please select a date and time'
    } else {
        const scheduledDate = new Date(formData.value.scheduledAt)
        const now = new Date()
        if (scheduledDate <= now) {
            newErrors.scheduledAt = 'Follow-up must be scheduled for a future date and time'
        }
    }

    if (formData.value.subject && formData.value.subject.length > 200) {
        newErrors.subject = 'Subject must be less than 200 characters'
    }

    if (formData.value.description && formData.value.description.length > 1000) {
        newErrors.description = 'Description must be less than 1000 characters'
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
        const followUpData = {
            contactId: formData.value.contactId || props.contactId!,
            dealId: props.dealId,
            type: formData.value.type,
            scheduledAt: new Date(formData.value.scheduledAt).toISOString(),
            subject: formData.value.subject.trim() || undefined,
            description: formData.value.description.trim() || undefined,
            priority: formData.value.priority
        }

        emit('save', followUpData)
    } finally {
        isSubmitting.value = false
    }
}

// Auto-generate subject when type or contact changes
watch([() => formData.value.type, () => formData.value.contactId, () => props.contactId], () => {
    if (!formData.value.subject) {
        const contactName = selectedContactName.value
        if (contactName) {
            formData.value.subject = `Follow-up ${formData.value.type} with ${contactName}`
        }
    }
})

// Clear individual field errors on input
watch(() => formData.value.contactId, () => {
    if (errors.value.contactId) {
        delete errors.value.contactId
    }
})

watch(() => formData.value.type, () => {
    if (errors.value.type) {
        delete errors.value.type
    }
})

watch(() => formData.value.scheduledAt, () => {
    if (errors.value.scheduledAt) {
        delete errors.value.scheduledAt
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
</script>