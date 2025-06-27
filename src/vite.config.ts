import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['prop-types', 'swr', 'axios', '@emotion/react', '@emotion/styled']
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          clerk: ['@clerk/clerk-react'],
          mui: ['@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material']
        }
      },
      // Increase the maximum number of files
      maxParallelFileOps: 5,
      onwarn(warning, warn) {
        // Ignore common dependency warnings that don't affect functionality
        if (warning.message.includes('prop-types') || 
            warning.message.includes('swr') ||
            warning.message.includes('axios') ||
            warning.message.includes('use client') ||
            warning.message.includes('MODULE_LEVEL_DIRECTIVE')) {
          return
        }
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          console.error('🔄 Circular dependency detected:', warning.message)
        }
        if (warning.code === 'UNRESOLVED_IMPORT') {
          console.error('❌ Unresolved import:', warning.message)
        }
        warn(warning)
      }
    }
  },
  // Enable more detailed error reporting
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})