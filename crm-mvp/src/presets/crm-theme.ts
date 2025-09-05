import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

export const CRMTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#3b82f6',
                    inverseColor: '#ffffff',
                    hoverColor: '#2563eb',
                    activeColor: '#1d4ed8'
                },
                highlight: {
                    background: '#3b82f6',
                    focusBackground: '#2563eb',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '#60a5fa',
                    inverseColor: '#1e3a8a',
                    hoverColor: '#93c5fd',
                    activeColor: '#bfdbfe'
                },
                highlight: {
                    background: '#60a5fa',
                    focusBackground: '#93c5fd',
                    color: '#1e3a8a',
                    focusColor: '#1e3a8a'
                }
            }
        }
    }
})