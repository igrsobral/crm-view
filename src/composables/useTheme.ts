import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('system')

// Function to apply theme to document
const applyTheme = (mode: ThemeMode) => {
  const html = document.documentElement
  
  if (mode === 'system') {
    // Remove explicit theme classes and let system preference take over
    html.classList.remove('light', 'dark')
  } else {
    // Remove other theme classes and add the selected one
    html.classList.remove('light', 'dark')
    html.classList.add(mode)
  }
}

// Initialize theme from localStorage or default to system
const initializeTheme = () => {
  const stored = localStorage.getItem('theme-mode') as ThemeMode
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    themeMode.value = stored
  }
  applyTheme(themeMode.value)
}

// Watch for theme changes and persist them
watch(themeMode, (newMode) => {
  localStorage.setItem('theme-mode', newMode)
  applyTheme(newMode)
}, { immediate: true })

// Listen for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', () => {
  if (themeMode.value === 'system') {
    applyTheme('system')
  }
})

export const useTheme = () => {
  return {
    themeMode: themeMode,
    setTheme: (mode: ThemeMode) => {
      themeMode.value = mode
    },
    initializeTheme
  }
}