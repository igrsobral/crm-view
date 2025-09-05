<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <!-- List Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Deals List</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ deals.length }} deals</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading deals...</span>
      </div>
    </div>

    <!-- List Content -->
    <div v-else class="divide-y divide-gray-200">
      <!-- Deal Row -->
      <div
        v-for="deal in deals"
        :key="deal.id"
        class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
        @click="$emit('select-deal', deal)"
      >
        <div class="flex items-center justify-between">
          <!-- Deal Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-4">
              <!-- Contact Avatar -->
              <div class="flex-shrink-0">
                <Avatar
                  v-if="deal.contact?.name"
                  :label="getInitials(deal.contact.name)"
                  shape="circle"
                  size="large"
                  class="bg-blue-100 text-blue-700"
                />
                <div
                  v-else
                  class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i class="pi pi-user text-gray-400"></i>
                </div>
              </div>

              <!-- Deal Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3">
                  <h4 class="text-sm font-semibold text-gray-900 truncate">
                    {{ deal.name }}
                  </h4>
                  <Badge
                    :value="getStageLabel(deal.stage)"
                    :severity="getStageSeverity(deal.stage)"
                    class="text-xs"
                  />
                  <Badge v-if="isOverdue(deal)" value="Overdue" severity="danger" class="text-xs" />
                </div>

                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                  <div v-if="deal.contact?.name" class="flex items-center">
                    <i class="pi pi-user mr-1 text-xs"></i>
                    {{ deal.contact.name }}
                  </div>
                  <div v-if="deal.contact?.company" class="flex items-center">
                    <i class="pi pi-building mr-1 text-xs"></i>
                    {{ deal.contact.company }}
                  </div>
                  <div v-if="deal.expected_close_date" class="flex items-center">
                    <i class="pi pi-calendar mr-1 text-xs"></i>
                    {{ formatDate(deal.expected_close_date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Deal Value and Actions -->
          <div class="flex items-center space-x-4">
            <!-- Deal Value -->
            <div class="text-right">
              <div class="text-lg font-semibold text-gray-900">
                {{ deal.value ? `$${formatCurrency(deal.value)}` : "-" }}
              </div>
              <div class="text-xs text-gray-500">
                {{ getTimeAgo(deal.updated_at) }}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center space-x-1">
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                rounded
                severity="secondary"
                @click.stop="$emit('edit-deal', deal)"
                class="p-2"
              />

              <!-- Stage Quick Change -->
              <Dropdown
                :modelValue="deal.stage"
                :options="stageOptions"
                optionLabel="label"
                optionValue="value"
                @update:modelValue="(newStage) => handleStageChange(deal.id, newStage)"
                @click.stop
                class="w-32"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="deals.length === 0 && !loading" class="text-center py-12">
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <i class="pi pi-inbox text-2xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
        <p class="text-gray-500 mb-6">
          Get started by creating your first deal or adjust your search filters.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEAL_STAGES, type DealStage } from "@/utils/constants";
import type { Deal } from "@/stores/deals";

// PrimeVue Components
import Avatar from "primevue/avatar";
import Badge from "primevue/badge";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";

interface Props {
  deals: Deal[];
  loading?: boolean;
}

interface Emits {
  (e: "select-deal", deal: Deal): void;
  (e: "edit-deal", deal: Deal): void;
  (e: "move-deal", payload: { dealId: string; newStage: DealStage }): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// Stage options for dropdown
const stageOptions = [
  { value: DEAL_STAGES.LEAD, label: "Prospection" },
  { value: DEAL_STAGES.QUALIFIED, label: "Request Received" },
  { value: DEAL_STAGES.PROPOSAL, label: "Proposal Sent" },
  { value: DEAL_STAGES.NEGOTIATION, label: "Proposal Accepted" },
  { value: DEAL_STAGES.CLOSED_WON, label: "Closed Won" },
  { value: DEAL_STAGES.CLOSED_LOST, label: "Closed Lost" },
];

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getStageLabel = (stage: DealStage): string => {
  const stageOption = stageOptions.find((option) => option.value === stage);
  return stageOption?.label || stage;
};

const getStageSeverity = (stage: DealStage): string => {
  switch (stage) {
    case DEAL_STAGES.LEAD:
      return "secondary";
    case DEAL_STAGES.QUALIFIED:
      return "info";
    case DEAL_STAGES.PROPOSAL:
      return "warning";
    case DEAL_STAGES.NEGOTIATION:
      return "success";
    case DEAL_STAGES.CLOSED_WON:
      return "success";
    case DEAL_STAGES.CLOSED_LOST:
      return "danger";
    default:
      return "secondary";
  }
};

const isOverdue = (deal: Deal): boolean => {
  if (!deal.expected_close_date) return false;
  if (["closed_won", "closed_lost"].includes(deal.stage)) return false;

  const today = new Date().toISOString().split("T")[0];
  return deal.expected_close_date < today;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateString);
};

const handleStageChange = (dealId: string, newStage: DealStage) => {
  emit("move-deal", { dealId, newStage });
};
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease;
}
</style>
