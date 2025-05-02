import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // listen on 0.0.0.0 (your LAN IP & tunnels)
    port: 5173,           // whatever port you’re using
    strictPort: true,     // fail if that port’s busy
    allowedHosts:  ['*'], 
    cors: true, // accept any Host header (tunnel domains, LAN IP, etc)
  }
})
