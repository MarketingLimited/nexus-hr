import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'

// Initialize MSW - start in development and preview environments
const shouldStartMSW = import.meta.env.DEV || 
  import.meta.env.MODE === 'preview' || 
  window.location.hostname.includes('lovable') ||
  window.location.hostname.includes('localhost')

if (shouldStartMSW) {
  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
    console.log('MSW service worker started successfully in', import.meta.env.MODE)
  } catch (error) {
    console.error('Failed to start MSW:', error)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
)
