<template>
    <div class="theme-switcher">
        <Button
            variant="text"
            @click="toggleTheme"
            :aria-label="`Switch to ${nextThemeLabel}`"
            class="p-2"
        >
            <template #icon>
                <i :class="currentThemeIcon" class="text-gray-600 dark:text-gray-300"></i>
            </template>
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import Button from 'primevue/button'

const { themeMode, setTheme } = useTheme()

const currentThemeIcon = computed(() => {
    switch (themeMode.value) {
        case 'light':
            return 'pi pi-sun'
        case 'dark':
            return 'pi pi-moon'
        case 'system':
            return 'pi pi-desktop'
        default:
            return 'pi pi-desktop'
    }
})

const nextThemeLabel = computed(() => {
    switch (themeMode.value) {
        case 'light':
            return 'dark mode'
        case 'dark':
            return 'system mode'
        case 'system':
            return 'light mode'
        default:
            return 'light mode'
    }
})

const toggleTheme = () => {
    switch (themeMode.value) {
        case 'light':
            setTheme('dark')
            break
        case 'dark':
            setTheme('system')
            break
        case 'system':
            setTheme('light')
            break
        default:
            setTheme('light')
    }
}
</script>

<style scoped>
.theme-switcher {
    display: flex;
    align-items: center;
}
</style>
