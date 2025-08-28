import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useClickAway(callback: () => void) {
  const target = ref<HTMLElement>()

  const handleClickAway = (event: Event) => {
    if (target.value && !target.value.contains(event.target as Node)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickAway)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickAway)
  })

  return target
}