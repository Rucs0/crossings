import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allows the ngrok tunnel's random subdomain through Vite's dev-server
    // host check (a DNS-rebinding protection that otherwise 403s any
    // non-localhost Host header).
    allowedHosts: ['.ngrok-free.app'],
  },
})
