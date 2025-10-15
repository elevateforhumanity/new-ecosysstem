import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gpURL = process.env.GITPOD_WORKSPACE_URL || ''
const gpHost = gpURL ? new URL(gpURL).host : undefined
const gpPortHost = gpHost ? `5173--${gpHost}` : undefined

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
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
}))
