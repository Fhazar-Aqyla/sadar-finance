import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './tailwind.css'
// Velzon template styles
import './assets/scss/themes.scss'

import App from './App.jsx'
import fakeBackend from './helpers/AuthType/fakeBackend'
import store from './store'

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis
}

const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? 'fake'

if (defaultAuth === 'fake') {
  fakeBackend()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
