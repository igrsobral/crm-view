<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <!-- Top Header with Navigation -->

      <!-- Pipeline Title and View Toggle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Button
              outlined
              severity="secondary"
              icon="pi pi-download"
              label="Export"
              size="small"
              class="text-gray-600 border-gray-300"
            />

            <Button icon="pi pi-plus" label="Add Deal" size="small" @click="$emit('create-deal')" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <Button
              :severity="currentView === 'pipeline' ? 'primary' : 'secondary'"
              :outlined="currentView !== 'pipeline'"
              size="small"
              icon="pi pi-th-large"
              label="Pipeline"
              @click="currentView = 'pipeline'"
              class="rounded-md"
            />
            <Button
              :severity="currentView === 'list' ? 'primary' : 'secondary'"
              :outlined="currentView !== 'list'"
              size="small"
              icon="pi pi-list"
              label="List"
              @click="currentView = 'list'"
              class="rounded-md ml-1"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats and Controls -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Statistics -->
        <div class="flex items-center space-x-6">
          <div class="text-gray-700">
            <span class="font-medium">Projected Deals:</span>
            <span class="text-gray-900 font-semibold ml-1">{{ totalActiveDeals }}</span>
          </div>
          <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div class="text-gray-700">
            <span class="font-medium">Projected Revenue:</span>
            <span class="text-gray-900 font-semibold ml-1"
              >${{ formatCurrency(totalActiveValue) }}</span
            >
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="Search deals..."
                class="w-64"
                size="small"
              />
            </IconField>
          </div>

          <Button
            icon="pi pi-filter"
            label="Filter"
            outlined
            size="small"
            severity="secondary"
            @click="showFilters = !showFilters"
          />

          <Button
            icon="pi pi-sort-alt"
            label="Sort"
            outlined
            size="small"
            severity="secondary"
            @click="toggleSort"
          />
        </div>
      </div>

      <!-- Filter Panel -->
      <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Stage:</label>
            <Dropdown
              v-model="selectedStage"
              :options="stageFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Stages"
              class="w-48"
              size="small"
            />
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Value:</label>
            <Dropdown
              v-model="selectedValueRange"
              :options="valueRangeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Values"
              class="w-40"
              size="small"
            />
          </div>

          <Button
            text
            size="small"
            label="Clear Filters"
            @click="clearFilters"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>
      </div>
    </div>

    <!-- Pipeline View -->
    <div v-if="currentView === 'pipeline'" class="flex-1 overflow-hidden">
      <div class="flex space-x-6 h-full py-6 overflow-x-auto">
        <div v-for="stage in pipelineStages" :key="stage.value" class="flex-shrink-0 w-80">
          <!-- Stage Header -->
          <div class="bg-white rounded-t-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                  {{ stage.label }}
                </h3>
                <div class="flex items-center mt-2 space-x-4">
                  <span class="text-lg font-bold text-gray-900">
                    ${{ formatCurrency(getStageValue(stage.value)) }}
                  </span>
                  <Badge
                    :value="getStageDeals(stage.value).length"
                    severity="secondary"
                    class="text-xs"
                  >
                    {{ getStageDeals(stage.value).length }} deals
                  </Badge>
                </div>
              </div>
              <div class="w-4 h-4 rounded-full" :class="stage.colorClass"></div>
            </div>
          </div>

          <!-- Drop Zone -->
          <div
            class="bg-gray-50 rounded-b-lg border-l border-r border-b border-gray-200 min-h-96 p-4 space-y-3"
            :class="{ 'bg-blue-50 border-blue-300': dragOverStage === stage.value }"
            @dragover.prevent="onDragOver(stage.value)"
            @dragleave="onDragLeave"
            @drop="onDrop(stage.value)"
          >
            <!-- Deal Cards -->
            <DealCard
              v-for="deal in getFilteredStageDeals(stage.value)"
              :key="deal.id"
              :deal="deal"
              @click="$emit('select-deal', deal)"
              @edit="$emit('edit-deal', deal)"
              @dragStart="onDealDragStart"
              @dragEnd="onDealDragEnd"
            />

            <!-- Empty State -->
            <div
              v-if="getFilteredStageDeals(stage.value).length === 0"
              class="text-center py-12 text-gray-400"
            >
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <i class="pi pi-inbox text-2xl text-gray-300"></i>
              </div>
              <p class="text-sm font-medium">No deals</p>
              <p class="text-xs text-gray-400 mt-1">Drag deals here or create new ones</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="flex-1 overflow-hidden p-6">
      <DealListView
        :deals="filteredDeals"
        :loading="loading"
        @select-deal="$emit('select-deal', $event)"
        @edit-deal="$emit('edit-deal', $event)"
        @move-deal="$emit('move-deal', $event.dealId, $event.newStage)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { DEAL_STAGES, type DealStage } from "@/utils/constants";
import type { Deal } from "@/stores/deals";
import DealCard from "./DealCard.vue";
import DealListView from "./DealListView.vue";

// PrimeVue Components
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dropdown from "primevue/dropdown";
import Badge from "primevue/badge";

interface Props {
  deals: Deal[];
  loading?: boolean;
}

interface Emits {
  (e: "create-deal"): void;
  (e: "select-deal", deal: Deal): void;
  (e: "edit-deal", deal: Deal): void;
  (e: "move-deal", dealId: string, newStage: DealStage): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State
const currentView = ref<"pipeline" | "list">("pipeline");
const searchQuery = ref("");
const selectedStage = ref<DealStage | "all">("all");
const selectedValueRange = ref<string>("all");
const showFilters = ref(false);
const sortOrder = ref<"asc" | "desc">("desc");
const dragOverStage = ref<DealStage | null>(null);
const draggedDeal = ref<Deal | null>(null);

// Pipeline stages with updated names and colors
const pipelineStages = [
  {
    value: DEAL_STAGES.LEAD,
    label: "Prospection",
    colorClass: "bg-gray-400",
  },
  {
    value: DEAL_STAGES.QUALIFIED,
    label: "Request Received",
    colorClass: "bg-blue-400",
  },
  {
    value: DEAL_STAGES.PROPOSAL,
    label: "Proposal Sent",
    colorClass: "bg-yellow-400",
  },
  {
    value: DEAL_STAGES.NEGOTIATION,
    label: "Proposal Accepted",
    colorClass: "bg-green-400",
  },
];

// Filter options
const stageFilterOptions = computed(() => [
  { label: "All Stages", value: "all" },
  ...pipelineStages.map((stage) => ({
    label: stage.label,
    value: stage.value,
  })),
]);

const valueRangeOptions = [
  { label: "All Values", value: "all" },
  { label: "Under $1,000", value: "0-1000" },
  { label: "$1,000 - $5,000", value: "1000-5000" },
  { label: "$5,000 - $10,000", value: "5000-10000" },
  { label: "Over $10,000", value: "10000+" },
];

// Computed properties
const activeDeals = computed(() => {
  return props.deals.filter((deal) => !["closed_won", "closed_lost"].includes(deal.stage));
});

const totalActiveDeals = computed(() => activeDeals.value.length);

const totalActiveValue = computed(() => {
  return activeDeals.value.reduce((sum, deal) => sum + (deal.value || 0), 0);
});

const dealsByStage = computed(() => {
  return props.deals.reduce(
    (acc, deal) => {
      const stage = deal.stage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(deal);
      return acc;
    },
    {} as Record<DealStage, Deal[]>,
  );
});

const filteredDeals = computed(() => {
  let filtered = props.deals;

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (deal) =>
        deal.name.toLowerCase().includes(query) ||
        deal.contact?.name.toLowerCase().includes(query) ||
        deal.contact?.company?.toLowerCase().includes(query) ||
        deal.notes?.toLowerCase().includes(query),
    );
  }

  // Stage filter
  if (selectedStage.value !== "all") {
    filtered = filtered.filter((deal) => deal.stage === selectedStage.value);
  }

  // Value range filter
  if (selectedValueRange.value !== "all") {
    filtered = filtered.filter((deal) => {
      const value = deal.value || 0;
      switch (selectedValueRange.value) {
        case "0-1000":
          return value < 1000;
        case "1000-5000":
          return value >= 1000 && value < 5000;
        case "5000-10000":
          return value >= 5000 && value < 10000;
        case "10000+":
          return value >= 10000;
        default:
          return true;
      }
    });
  }

  // Sort deals
  return filtered.sort((a, b) => {
    const aValue = a.value || 0;
    const bValue = b.value || 0;
    return sortOrder.value === "desc" ? bValue - aValue : aValue - bValue;
  });
});

// Methods
const getStageDeals = (stage: DealStage): Deal[] => {
  return dealsByStage.value[stage] || [];
};

const getFilteredStageDeals = (stage: DealStage): Deal[] => {
  return filteredDeals.value.filter((deal) => deal.stage === stage);
};

const getStageValue = (stage: DealStage): number => {
  return getStageDeals(stage).reduce((sum, deal) => sum + (deal.value || 0), 0);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const toggleSort = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
};

const clearFilters = () => {
  selectedStage.value = "all";
  selectedValueRange.value = "all";
  searchQuery.value = "";
};

// Drag and drop handlers
const onDealDragStart = (deal: Deal) => {
  draggedDeal.value = deal;
};

const onDealDragEnd = () => {
  draggedDeal.value = null;
  dragOverStage.value = null;
};

const onDragOver = (stage: DealStage) => {
  dragOverStage.value = stage;
};

const onDragLeave = () => {
  dragOverStage.value = null;
};

const onDrop = (newStage: DealStage) => {
  if (draggedDeal.value && draggedDeal.value.stage !== newStage) {
    emit("move-deal", draggedDeal.value.id, newStage);
  }
  dragOverStage.value = null;
  draggedDeal.value = null;
};

// Watchers
watch(searchQuery, () => {
  if (searchQuery.value.trim() && selectedStage.value !== "all") {
    selectedStage.value = "all";
  }
});
</script>

<style scoped>
/* Custom scrollbar for horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth transitions */
.transition-colors {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}
</style>
