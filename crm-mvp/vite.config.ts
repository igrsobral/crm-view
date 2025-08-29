import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          comments: false
        }
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Enable source maps for debugging in production
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // Supabase chunk
          supabase: ['@supabase/supabase-js'],
          
          // Chart.js chunk (if used)
          charts: ['chart.js', 'vue-chartjs'],
          
          // UI components chunk
          ui: [
            // Add any large UI library imports here
          ]
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Create descriptive chunk names based on the module path
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js'
            }
            if (facadeModuleId.includes('views/')) {
              return 'views/[name]-[hash].js'
            }
            if (facadeModuleId.includes('stores/')) {
              return 'stores/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return 'css/[name]-[hash].[ext]'
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash].[ext]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'fonts/[name]-[hash].[ext]'
          }
          
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Enable tree shaking
    treeshake: true
  },
  
  // Optimize dev server
  server: {
    // Enable HTTP/2 for better performance
    https: false,
    
    // Optimize HMR
    hmr: {
      overlay: true
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclude any problematic dependencies
    ]
  },
  
  // Enable CSS preprocessing optimizations
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    }
  }
})
