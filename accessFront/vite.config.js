import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env': {
      REACT_APP_ACCESS_GRANT_ADDRESS: JSON.stringify(process.env.REACT_APP_ACCESS_GRANT_ADDRESS || '0x0000000000000000000000000000000000000000'),
      REACT_APP_WALLET_CONNECT_PROJECT_ID: JSON.stringify(process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || 'mock-project-id'),
    },
  },
})
