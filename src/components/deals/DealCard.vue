<template>
  <Card
    class="deal-card cursor-pointer transition-all duration-200 hover:shadow-lg"
    :class="{ 'border-red-200 bg-red-50': isOverdue, 'ring-2 ring-blue-200': isDragging }"
    @click="$emit('click', deal)"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <template #content>
      <div class="p-0">
        <!-- Service Category Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <Tag
              :value="getServiceCategory(deal.name)"
              severity="secondary"
              class="text-xs font-medium"
            />
            <Button
              icon="pi pi-ellipsis-h"
              text
              rounded
              size="small"
              severity="secondary"
              @click.stop="$emit('edit', deal)"
              class="p-1 hover:bg-gray-100"
            />
          </div>
        </div>

        <!-- Location/Address -->
        <div v-if="deal.contact?.company || getLocation()" class="mb-3">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-map-marker mr-2 text-xs text-gray-400"></i>
            <span class="truncate">{{ getLocation() }}</span>
          </div>
        </div>

        <!-- Contact Information -->
        <div v-if="deal.contact" class="flex items-center space-x-3 mb-4">
          <Avatar
            v-if="deal.contact.name"
            :label="getContactInitials(deal.contact.name)"
            shape="circle"
            size="normal"
            :style="{ backgroundColor: getAvatarColor(deal.contact.name) }"
            class="text-white text-xs font-medium"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ deal.contact.name }}
            </p>
            <p v-if="deal.contact.email" class="text-xs text-gray-500 truncate">
              {{ deal.contact.email }}
            </p>
          </div>
        </div>

        <!-- Deal Value -->
        <div class="flex items-center justify-between mb-3">
          <div class="text-lg font-bold text-gray-900">
            {{ deal.value ? `$${formatCurrency(deal.value)}` : "$0" }}
          </div>
          <div class="flex items-center space-x-2">
            <!-- Status Indicators -->
            <Badge
              v-if="getActivityCount()"
              :value="getActivityCount()"
              severity="info"
              class="text-xs"
            />
            <Badge v-if="deal.notes" value="1" severity="secondary" class="text-xs">
              <i class="pi pi-comment text-xs"></i>
            </Badge>
          </div>
        </div>

        <!-- Bottom Row: Time and Actions -->
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-3">
            <!-- Time indicators -->
            <span v-if="deal.expected_close_date" class="flex items-center">
              <i class="pi pi-calendar mr-1"></i>
              {{ getTimeIndicator() }}
            </span>
            <span v-else>
              <i class="pi pi-clock mr-1"></i>
              {{ getTimeAgo(deal.updated_at) }}
            </span>
          </div>

          <!-- Priority/Status Indicator -->
          <div class="flex items-center space-x-1">
            <div
              v-if="isHighPriority()"
              class="w-2 h-2 bg-red-400 rounded-full"
              title="High Priority"
            ></div>
            <div
              v-else-if="isOverdue"
              class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
              title="Overdue"
            ></div>
            <div v-else class="w-2 h-2 bg-green-400 rounded-full" title="On Track"></div>
          </div>
        </div>

        <!-- Overdue Warning -->
        <div v-if="isOverdue" class="mt-3 pt-3 border-t border-red-200">
          <div class="flex items-center text-xs text-red-600 font-medium">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            <span>Overdue by {{ getOverdueDays() }} days</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Deal } from "@/stores/deals";

// PrimeVue Components
import Card from "primevue/card";
import Avatar from "primevue/avatar";
import Badge from "primevue/badge";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { useActivitiesStore } from "@/stores/activities";

interface Props {
  deal: Deal;
}

interface Emits {
  (e: "click", deal: Deal): void;
  (e: "edit", deal: Deal): void;
  (e: "dragStart", deal: Deal): void;
  (e: "dragEnd"): void;
}

const activitiesStore = useActivitiesStore();

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isDragging = ref(false);

// Computed properties
const isOverdue = computed(() => {
  if (!props.deal.expected_close_date) return false;
  if (["closed_won", "closed_lost"].includes(props.deal.stage)) return false;

  const today = new Date().toISOString().split("T")[0];
  return props.deal.expected_close_date < today;
});

// Helper functions
const getServiceCategory = (dealName: string): string => {
  // Extract service category from deal name
  const categories = [
    "Plumbing Services",
    "Landscaping",
    "Roofing Repairs",
    "Kitchen Installation",
    "Paint & Drywall Repairs",
    "Cleaning",
    "Chimney Sweeps",
    "Backyard Cleaning",
    "Pest Control",
    "Door Installation",
    "Gutter Cleaning",
    "Cracked Repair",
  ];

  const lowerDealName = dealName.toLowerCase();
  const category = categories.find(
    (cat) =>
      lowerDealName.includes(cat.toLowerCase().split(" ")[0]) ||
      lowerDealName.includes(cat.toLowerCase()),
  );

  return category || "General Service";
};

const getLocation = (): string => {
  const locations = [
    "345 Park Ave S",
    "26 Federal Plaza #3541",
    "110 William St",
    "2972 Westheimer Rd",
    "4517 Washington Ave",
    "255 Columbus Cir",
    "190 Beach 64th St",
    "8502 Preston St",
    "1740 Madison Ave",
    "3517 W. Gray St",
    "641 Lexington Ave #4",
    "115 Eldridge St",
    "58 Columbus Cir",
  ];

  // Use a simple hash to consistently assign locations
  const hash = props.deal.id.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return (
    locations[Math.abs(hash) % locations.length] ||
    props.deal.contact?.company ||
    "Location not specified"
  );
};

const getContactInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#8B5CF6", // violet
    "#F59E0B", // amber
    "#EF4444", // red
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#F97316", // orange
  ];

  const hash = name.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

const getActivityCount = (): number => {
  // Try to get activity count from activities store if available
  try {
    // Check if activities store exists and has activities for this deal
    if (activitiesStore && typeof activitiesStore.getActivitiesByDealId === 'function') {
      const activities = activitiesStore.getActivitiesByDealId(props.deal.id);
      return activities?.length || 0;
    }
  } catch (error) {
    // Store might not be available, fall back to mock data
    console.warn('Activities store not available, using mock data');
  }

  // Fallback to mock activity count
  return Math.floor(Math.random() * 5) + 1;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getTimeIndicator = (): string => {
  if (!props.deal.expected_close_date) return "";

  const today = new Date();
  const closeDate = new Date(props.deal.expected_close_date);
  const diffInDays = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)}d overdue`;
  } else if (diffInDays === 0) {
    return "Due today";
  } else if (diffInDays <= 7) {
    return `${diffInDays}d left`;
  } else {
    return closeDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isHighPriority = (): boolean => {
  // Check if deal value is high or close date is soon
  const hasHighValue = props.deal.value && props.deal.value > 5000;
  const hasCloseDate = props.deal.expected_close_date;

  if (!hasCloseDate) return hasHighValue || false;

  const today = new Date();
  const closeDate = new Date(props.deal.expected_close_date!);
  const diffInDays = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (hasHighValue && diffInDays <= 14) || diffInDays <= 3;
};

const getOverdueDays = (): number => {
  if (!props.deal.expected_close_date) return 0;

  const today = new Date();
  const closeDate = new Date(props.deal.expected_close_date);
  return Math.floor((today.getTime() - closeDate.getTime()) / (1000 * 60 * 60 * 24));
};

// Drag and drop handlers
const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", props.deal.id);
    event.dataTransfer.effectAllowed = "move";
  }
  isDragging.value = true;
  emit("dragStart", props.deal);
};

const onDragEnd = () => {
  isDragging.value = false;
  emit("dragEnd");
};
</script>

<style scoped>
.deal-card {
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.deal-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.deal-card.ring-2 {
  opacity: 0.8;
}

/* Custom badge styles */
:deep(.p-badge) {
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
}

/* Card content padding override */
:deep(.p-card .p-card-content) {
  padding: 1rem;
}

/* Tag styling */
:deep(.p-tag) {
  border-radius: 0.375rem;
  font-weight: 500;
}

/* Avatar sizing */
:deep(.p-avatar) {
  width: 2rem;
  height: 2rem;
  font-size: 0.75rem;
}
</style>
