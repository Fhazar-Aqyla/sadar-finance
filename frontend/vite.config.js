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
        target: "https://api-node.themesbrand.website",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.env.REACT_APP_DEFAULTAUTH': JSON.stringify('fake'),
    'process.env.REACT_APP_API_URL': JSON.stringify('https://api-node.themesbrand.website'),
  },
  resolve: {
    alias: {
      'react-countup': path.resolve(__dirname, 'src/Components/Common/CountUp.jsx'),
      'react-flatpickr': path.resolve(__dirname, 'src/Components/Common/Flatpickr.jsx'),
      'react-flatpickr-original': path.resolve(__dirname, 'node_modules/react-flatpickr/build/index.js'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src[\\/].*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
