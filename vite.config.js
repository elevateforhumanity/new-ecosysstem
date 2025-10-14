import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gpURL = process.env.GITPOD_WORKSPACE_URL || ''
const gpHost = gpURL ? new URL(gpURL).host : undefined
const gpPortHost = gpHost ? `5173--${gpHost}` : undefined

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Force new build hash to bust cache
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: gpHost ? [/\.gitpod\.dev$/, gpHost, gpPortHost] : true,
    hmr: gpPortHost ? { host: gpPortHost, protocol: 'wss', clientPort: 443 } : undefined,
    origin: gpPortHost ? `https://${gpPortHost}` : undefined,
    fs: {
      deny: ['**/data/**', '**/docs/**', '**/dist/**']
    }
  },
  preview: {
    port: 4173,
    allowedHosts: [/\.gitpod\.dev$/],
  },
})
