import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Redirect the problematic package to the compatible 'sumo' version
      "libsodium-wrappers": "libsodium-wrappers-sumo",
    },
  },
  // Ensure the build handles the encryption library correctly
  optimizeDeps: {
    exclude: ['libsodium-wrappers']
  }
})
