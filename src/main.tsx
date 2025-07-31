import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'

// Register service worker for PWA and offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NETWORK_STATUS') {
      // Dispatch custom event for network status changes
      window.dispatchEvent(new CustomEvent('networkStatusChange', {
        detail: { isOnline: event.data.isOnline }
      }));
    }
  });
}

// Initialize MSW - start in development and preview environments
const shouldStartMSW = import.meta.env.DEV || 
  import.meta.env.MODE === 'preview' || 
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.app') ||
  window.location.hostname.includes('localhost')

async function startMSW() {
  if (shouldStartMSW) {
    try {
      const { worker } = await import('./mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        }
      })
      console.log('MSW service worker started successfully in', import.meta.env.MODE)
    } catch (error) {
      console.error('Failed to start MSW:', error)
    }
  }
}

// Start MSW without blocking app rendering
startMSW()

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
