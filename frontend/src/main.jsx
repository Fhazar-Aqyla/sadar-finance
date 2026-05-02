import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

// Velzon template styles
import './assets/scss/themes.scss'

import App from './App.jsx'
import fakeBackend from './helpers/AuthType/fakeBackend'
import store from './store'

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis
}

if (process.env.REACT_APP_DEFAULTAUTH === 'fake') {
  fakeBackend()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
