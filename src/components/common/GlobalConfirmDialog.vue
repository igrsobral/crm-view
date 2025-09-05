<template>
  <ConfirmDialog
    :show="state.show"
    :title="state.title"
    :message="state.message"
    :details="state.details"
    :variant="state.variant"
    :confirm-text="state.confirmText"
    :cancel-text="state.cancelText"
    :loading-text="state.loadingText"
    :loading="state.loading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="close"
  />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { useConfirmation } from '@/composables/useConfirmation'

const confirmation = useConfirmation()
const { state, handleConfirm, handleCancel, close } = confirmation

provide('confirmation', confirmation)
</script>