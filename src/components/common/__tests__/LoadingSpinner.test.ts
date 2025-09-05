import { describe, it, expect } from 'vitest'
import { mountComponent } from '@/test/utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  describe('basic rendering', () => {
    it('should render spinner with default props', () => {
      const wrapper = mountComponent(LoadingSpinner)

      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('svg').classes()).toContain('animate-spin')
      expect(wrapper.find('svg').classes()).toContain('h-6')
      expect(wrapper.find('svg').classes()).toContain('w-6')
      expect(wrapper.find('svg').classes()).toContain('text-blue-600')
    })

    it('should render without message by default', () => {
      const wrapper = mountComponent(LoadingSpinner)

      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('should render with message when provided', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          message: 'Loading...'
        }
      })

      expect(wrapper.find('span').exists()).toBe(true)
      expect(wrapper.find('span').text()).toBe('Loading...')
    })
  })

  describe('size variants', () => {
    it('should render small size correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          size: 'sm'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('h-4')
      expect(svg.classes()).toContain('w-4')
    })

    it('should render medium size correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          size: 'md'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('h-6')
      expect(svg.classes()).toContain('w-6')
    })

    it('should render large size correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          size: 'lg'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('h-8')
      expect(svg.classes()).toContain('w-8')
    })
  })

  describe('color variants', () => {
    it('should render primary variant correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          variant: 'primary'
        }
      })

      expect(wrapper.find('svg').classes()).toContain('text-blue-600')
    })

    it('should render secondary variant correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          variant: 'secondary'
        }
      })

      expect(wrapper.find('svg').classes()).toContain('text-gray-600')
    })

    it('should render white variant correctly', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          variant: 'white'
        }
      })

      expect(wrapper.find('svg').classes()).toContain('text-white')
    })
  })

  describe('layout options', () => {
    it('should center spinner when center prop is true', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          center: true
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('justify-center')
      expect(container.classes()).toContain('items-center')
    })

    it('should show overlay when overlay prop is true', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          overlay: true
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('fixed')
      expect(container.classes()).toContain('inset-0')
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('bg-opacity-75')
      expect(container.classes()).toContain('z-50')
    })

    it('should combine center and overlay props', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          center: true,
          overlay: true
        }
      })

      const container = wrapper.find('div')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('justify-center')
      expect(container.classes()).toContain('items-center')
      expect(container.classes()).toContain('fixed')
      expect(container.classes()).toContain('inset-0')
    })
  })

  describe('message styling', () => {
    it('should style message with primary variant', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          message: 'Loading...',
          variant: 'primary'
        }
      })

      const message = wrapper.find('span')
      expect(message.classes()).toContain('text-blue-600')
      expect(message.classes()).toContain('ml-3')
      expect(message.classes()).toContain('text-sm')
      expect(message.classes()).toContain('font-medium')
    })

    it('should style message with secondary variant', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          message: 'Loading...',
          variant: 'secondary'
        }
      })

      const message = wrapper.find('span')
      expect(message.classes()).toContain('text-gray-600')
    })

    it('should style message with white variant', () => {
      const wrapper = mountComponent(LoadingSpinner, {
        props: {
          message: 'Loading...',
          variant: 'white'
        }
      })

      const message = wrapper.find('span')
      expect(message.classes()).toContain('text-white')
    })
  })

  describe('accessibility', () => {
    it('should have proper SVG structure for screen readers', () => {
      const wrapper = mountComponent(LoadingSpinner)

      const svg = wrapper.find('svg')
      expect(svg.attributes('fill')).toBe('none')
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')

      const circle = wrapper.find('circle')
      expect(circle.exists()).toBe(true)
      expect(circle.attributes('stroke')).toBe('currentColor')

      const path = wrapper.find('path')
      expect(path.exists()).toBe(true)
      expect(path.attributes('fill')).toBe('currentColor')
    })
  })

  describe('animation', () => {
    it('should have spin animation class', () => {
      const wrapper = mountComponent(LoadingSpinner)

      expect(wrapper.find('svg').classes()).toContain('animate-spin')
    })
  })
})