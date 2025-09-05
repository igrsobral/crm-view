<template>
    <div class="theme-switcher">
        <Select 
            v-model="currentTheme" 
            :options="themeOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Select Theme"
            class="w-32"
        >
            <template #value="{ value }">
                <div class="flex items-center gap-2">
                    <i :class="getThemeIcon(value)"></i>
                    <span>{{ getThemeLabel(value) }}</span>
                </div>
            </template>
            <template #option="{ option }">
                <div class="flex items-center gap-2">
                    <i :class="getThemeIcon(option.value)"></i>
                    <span>{{ option.label }}</span>
                </div>
            </template>
        </Select>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import Select from 'primevue/select'

const { themeMode, setTheme } = useTheme()

const currentTheme = computed({
    get: () => themeMode.value,
    set: (value: ThemeMode) => setTheme(value)
})

const themeOptions = [
    { label: 'Light', value: 'light' as ThemeMode },
    { label: 'Dark', value: 'dark' as ThemeMode },
    { label: 'System', value: 'system' as ThemeMode }
]

const getThemeIcon = (theme: ThemeMode) => {
    switch (theme) {
        case 'light':
            return 'pi pi-sun'
        case 'dark':
            return 'pi pi-moon'
        case 'system':
            return 'pi pi-desktop'
        default:
            return 'pi pi-desktop'
    }
}

const getThemeLabel = (theme: ThemeMode) => {
    const option = themeOptions.find(opt => opt.value === theme)
    return option?.label || 'System'
}
</script>

<style scoped>
.theme-switcher {
    display: flex;
    align-items: center;
}
</style>