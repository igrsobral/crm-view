import { inject } from 'vue'
import type { useConfirmation } from './useConfirmation'

export function useGlobalConfirmation() {
  const confirmation = inject<ReturnType<typeof useConfirmation>>('confirmation')
  
  if (!confirmation) {
    throw new Error('useGlobalConfirmation must be used within a component that has access to the global confirmation provider')
  }
  
  return confirmation
}