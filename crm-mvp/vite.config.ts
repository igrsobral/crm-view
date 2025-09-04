import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            comments: !isProduction 
          }
        }
      }),
      ...(isDevelopment ? [vueDevTools()] : []),
    ],
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    
    // Environment variables configuration
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: isProduction,
    },
    
    build: {
      sourcemap: isDevelopment ? true : 'hidden',
      
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for large dependencies
            vendor: ['vue', 'vue-router', 'pinia'],
            
            // Supabase chunk
            supabase: ['@supabase/supabase-js'],
            
            // Chart.js chunk (if used)
            charts: ['chart.js', 'vue-chartjs'],
            
            // Validation chunk
            validation: ['zod'],
          },
          
          // Optimize chunk file names for caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              // Create descriptive chunk names based on the module path
              if (facadeModuleId.includes('components/')) {
                return 'assets/components/[name]-[hash].js'
              }
              if (facadeModuleId.includes('views/')) {
                return 'assets/views/[name]-[hash].js'
              }
              if (facadeModuleId.includes('stores/')) {
                return 'assets/stores/[name]-[hash].js'
              }
            }
            return 'assets/chunks/[name]-[hash].js'
          },
          
          // Optimize asset file names for better caching
          assetFileNames: (assetInfo) => {
            if (/\.css$/.test(assetInfo.name || '')) {
              return 'assets/css/[name]-[hash].[ext]'
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash].[ext]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash].[ext]'
            }
            
            return 'assets/[name]-[hash].[ext]'
          }
        }
      },
      
      // Build optimizations
      target: 'esnext',
      minify: isProduction ? 'esbuild' : false,
      
      // Chunk size warnings
      chunkSizeWarningLimit: isProduction ? 500 : 1000,
      
      // CSS optimizations
      cssCodeSplit: true,
      
      // Tree shaking
      treeshake: isProduction,
      
      // Rollup options for production optimization
      ...(isProduction && {
        rollupOptions: {
          ...(!isDevelopment && {
            external: [],
            output: {
              ...{},
              // Additional production optimizations
              compact: true,
              minifyInternalExports: true,
            }
          })
        }
      })
    },
    
    // Development server configuration
    server: {
      port: 3000,
      host: true, // Allow external connections
      
      // CORS configuration
      cors: true,
      
      // Optimize HMR for development
      hmr: {
        overlay: true,
        port: 3001
      },
      
      // Proxy configuration (if needed)
      proxy: {
        // Example: proxy API calls to local backend
        // '/api': {
        //   target: 'http://localhost:3001',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, '')
        // }
      }
    },
    
    // Preview server configuration
    preview: {
      port: 3000,
      host: true,
      cors: true
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@supabase/supabase-js',
        'chart.js',
        'vue-chartjs',
        'zod'
      ],
      exclude: [
        // Exclude any problematic dependencies
      ],
      
      // Force optimization of specific dependencies
      force: isProduction
    },
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      
      // PostCSS configuration
      postcss: {
        plugins: [
          // Add any PostCSS plugins here
        ]
      },
      
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase'
      }
    },

    // Test configuration
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      
      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.test.{ts,js}',
          '**/*.spec.{ts,js}'
        ]
      }
    },
    
    // Worker configuration
    worker: {
      format: 'es'
    },
    
    // Esbuild configuration
    esbuild: {
      target: 'esnext'
    }
  }
})
