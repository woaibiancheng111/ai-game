import React from 'react'
import ReactDOM from 'react-dom/client'
import { initWebPolyfill } from './services/webPolyfill'
import ErrorBoundary from './renderer/components/ErrorBoundary'
import App from './renderer/App'
import './renderer/styles/global.css'

// Web 兼容层：在非 Electron 环境下注入 localStorage 替代实现
initWebPolyfill()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
