import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/stembu/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'STellaris EMpire BUilder',
        short_name: 'stembu',
        description: 'A deeply customizable empire builder for Stellaris',
        theme_color: '#0d0f1a',
        background_color: '#0d0f1a',
        display: 'standalone',
        icons: [
          {
            src: 'stembu_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
