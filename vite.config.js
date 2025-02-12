import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@arcgis/core': '@arcgis/core', // Explicitly resolve the library
    },
  },

  plugins: [react()],

})
