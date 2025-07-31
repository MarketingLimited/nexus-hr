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
    // Only register PWA service worker in production or when explicitly needed
    const shouldRegisterPWA = import.meta.env.PROD || 
      window.location.hostname.includes('lovableproject.com') ||
      window.location.hostname.includes('lovable.app');
    
    if (shouldRegisterPWA) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA SW registered: ', registration);
          
          // Only check for updates in production to avoid conflicts with MSW
          if (import.meta.env.PROD) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Create a subtle notification instead of intrusive dialog
                    const updateNotification = document.createElement('div');
                    updateNotification.style.cssText = `
                      position: fixed;
                      top: 20px;
                      right: 20px;
                      background: hsl(var(--primary));
                      color: hsl(var(--primary-foreground));
                      padding: 12px 16px;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                      z-index: 10000;
                      font-family: system-ui, sans-serif;
                      font-size: 14px;
                      cursor: pointer;
                      transition: opacity 0.3s ease;
                    `;
                    updateNotification.innerHTML = `
                      <div>New version available!</div>
                      <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">Click to update</div>
                    `;
                    
                    updateNotification.onclick = () => {
                      window.location.reload();
                    };
                    
                    document.body.appendChild(updateNotification);
                    
                    // Auto-dismiss after 10 seconds
                    setTimeout(() => {
                      if (updateNotification.parentNode) {
                        updateNotification.style.opacity = '0';
                        setTimeout(() => {
                          updateNotification.remove();
                        }, 300);
                      }
                    }, 10000);
                  }
                });
              }
            });
          }
        })
        .catch((registrationError) => {
          console.log('PWA SW registration failed: ', registrationError);
        });
    }
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

// Initialize MSW for API mocking in development
async function enableMocking() {
  if (import.meta.env.DEV || 
      window.location.hostname.includes('lovableproject.com') ||
      window.location.hostname.includes('lovable.app')) {
    
    try {
      const { worker } = await import('./mocks/browser')
      
      await worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      })
      
      console.log('🔧 MSW enabled for API mocking')
      
      // Log when intercepting auth requests
      worker.events.on('request:start', ({ request }) => {
        if (request.url.includes('/api/auth/')) {
          console.log('🔐 MSW intercepting auth request:', request.url)
        }
      })
      
    } catch (error) {
      console.error('❌ Failed to start MSW:', error)
      console.warn('⚠️ Running without API mocking')
    }
  }
}

// Start MSW and then render the app
enableMocking().then(() => {
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
}).catch((error) => {
  console.error('Failed to initialize app:', error)
  // Fallback: render without MSW
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
})

// This will be replaced by the MSW initialization above
