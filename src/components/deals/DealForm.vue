<template>
  <div class="bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? "Edit Deal" : "Create New Deal" }}
        </h2>
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-600"
        />
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-6">
      <!-- Deal Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Deal Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="name"
          v-model="form.name"
          placeholder="Enter deal name"
          :invalid="!!errors.name"
          class="w-full"
          fluid
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Contact Selection -->
      <div>
        <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">
          Contact <span class="text-red-500">*</span>
        </label>
        <AutoComplete
          id="contact"
          v-model="selectedContact"
          :suggestions="filteredContacts"
          @complete="searchContacts"
          optionLabel="name"
          placeholder="Search for a contact..."
          :invalid="!!errors.contact_id"
          class="w-full"
          fluid
        >
          <template #option="{ option }">
            <div>
              <div class="font-medium text-gray-900">{{ option.name }}</div>
              <div class="text-sm text-gray-600">
                {{ option.email }}
                <span v-if="option.company"> • {{ option.company }}</span>
              </div>
            </div>
          </template>
        </AutoComplete>
        <p v-if="errors.contact_id" class="mt-1 text-sm text-red-600">{{ errors.contact_id }}</p>
      </div>

      <!-- Deal Value -->
      <div>
        <label for="value" class="block text-sm font-medium text-gray-700 mb-2"> Deal Value </label>
        <InputNumber
          id="value"
          v-model="form.value"
          mode="currency"
          currency="USD"
          :min="0"
          placeholder="0.00"
          class="w-full"
          fluid
        />
      </div>

      <!-- Pipeline Stage -->
      <div>
        <label for="stage" class="block text-sm font-medium text-gray-700 mb-2">
          Pipeline Stage
        </label>
        <Dropdown
          id="stage"
          v-model="form.stage"
          :options="stageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select pipeline stage"
          class="w-full"
          fluid
        />
      </div>

      <!-- Expected Close Date -->
      <div>
        <label for="expected_close_date" class="block text-sm font-medium text-gray-700 mb-2">
          Expected Close Date
        </label>
        <DatePicker
          id="expected_close_date"
          v-model="expectedCloseDate"
          placeholder="Select expected close date"
          :minDate="minDate"
          class="w-full"
          fluid
        />
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-2"> Notes </label>
        <Textarea
          id="notes"
          v-model="form.notes"
          rows="4"
          placeholder="Add any notes about this deal..."
          class="w-full"
        />
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          @click="$emit('cancel')"
          label="Cancel"
          severity="secondary"
          outlined
          class="px-4 py-2"
        />
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
          :loading="loading"
          :label="isEditing ? 'Update Deal' : 'Create Deal'"
          class="px-6 py-3"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { DEAL_STAGES } from "@/utils/constants";
import type { Deal, DealInput } from "@/stores/deals";
import type { Contact } from "@/stores/contacts";
import { useContactsStore } from "@/stores/contacts";

// PrimeVue component imports
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";

interface Props {
  deal?: Deal | null;
  loading?: boolean;
}

interface Emits {
  (e: "save", dealData: DealInput): void;
  (e: "cancel"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const contactsStore = useContactsStore();

const form = ref<DealInput>({
  contact_id: "",
  name: "",
  value: undefined,
  stage: DEAL_STAGES.LEAD,
  expected_close_date: "",
  notes: "",
});

const errors = ref<Record<string, string>>({});
const selectedContact = ref<Contact | null>(null);
const expectedCloseDate = ref<Date | null>(null);
const filteredContacts = ref<Contact[]>([]);

const isEditing = computed(() => !!props.deal);
const minDate = computed(() => new Date()); // Prevent selecting past dates

const stageOptions = [
  { value: DEAL_STAGES.LEAD, label: "Prospection" },
  { value: DEAL_STAGES.QUALIFIED, label: "Request Received" },
  { value: DEAL_STAGES.PROPOSAL, label: "Proposal Sent" },
  { value: DEAL_STAGES.NEGOTIATION, label: "Proposal Accepted" },
  { value: DEAL_STAGES.CLOSED_WON, label: "Closed Won" },
  { value: DEAL_STAGES.CLOSED_LOST, label: "Closed Lost" },
];

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.contact_id;
});

// Watch selectedContact changes
watch(selectedContact, (contact) => {
  if (contact) {
    form.value.contact_id = contact.id;
    delete errors.value.contact_id;
  } else {
    form.value.contact_id = "";
  }
});

// Watch expectedCloseDate changes
watch(expectedCloseDate, (date) => {
  if (date) {
    form.value.expected_close_date = date.toISOString().split("T")[0];
  } else {
    form.value.expected_close_date = "";
  }
});

const initializeForm = () => {
  if (props.deal) {
    form.value = {
      contact_id: props.deal.contact_id,
      name: props.deal.name,
      value: props.deal.value,
      stage: props.deal.stage,
      expected_close_date: props.deal.expected_close_date || "",
      notes: props.deal.notes || "",
    };

    if (props.deal.contact) {
      selectedContact.value = props.deal.contact;
    }

    if (props.deal.expected_close_date) {
      expectedCloseDate.value = new Date(props.deal.expected_close_date);
    }
  } else {
    form.value = {
      contact_id: "",
      name: "",
      value: undefined,
      stage: DEAL_STAGES.LEAD,
      expected_close_date: "",
      notes: "",
    };
    selectedContact.value = null;
    expectedCloseDate.value = null;
  }
  errors.value = {};
};

const searchContacts = async (event: { query: string }) => {
  const query = event.query;
  if (query.length < 2) {
    filteredContacts.value = [];
    return;
  }

  try {
    const { data } = await contactsStore.searchContacts(query, 10);
    filteredContacts.value = data || [];
  } catch (error) {
    console.error("Error searching contacts:", error);
    filteredContacts.value = [];
  }
};

const validateForm = (): boolean => {
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = "Deal name is required";
  }

  if (!form.value.contact_id) {
    errors.value.contact_id = "Contact is required";
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  const dealData: DealInput = {
    contact_id: form.value.contact_id,
    name: form.value.name.trim(),
    value: form.value.value || undefined,
    stage: form.value.stage,
    expected_close_date: form.value.expected_close_date || undefined,
    notes: form.value.notes?.trim() || undefined,
  };

  emit("save", dealData);
};

watch(() => props.deal, initializeForm, { immediate: true });

onMounted(() => {
  contactsStore.fetchContacts();
});
</script>
