import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.env.REACT_APP_DEFAULTAUTH': JSON.stringify('sadar'),
    'process.env.REACT_APP_API_URL': JSON.stringify('https://sadar-finance.up.railway.app/api/v1'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-countup': path.resolve(__dirname, 'src/Components/Common/CountUp.jsx'),
      'react-flatpickr': path.resolve(__dirname, 'src/Components/Common/Flatpickr.jsx'),
      'react-flatpickr-original': path.resolve(__dirname, 'node_modules/react-flatpickr/build/index.js'),
    },
  },
})
