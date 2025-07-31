import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers)

// Log all intercepted requests for debugging
worker.events.on('request:start', ({ request }) => {
  if (request.url.includes('/api/')) {
    console.log('🔄 MSW intercepting:', request.method, request.url)
  }
})

worker.events.on('response:mocked', ({ request, response }) => {
  if (request.url.includes('/api/')) {
    console.log('✅ MSW mocked response:', request.method, request.url, response.status)
  }
})

worker.events.on('request:unhandled', ({ request }) => {
  if (request.url.includes('/api/')) {
    console.warn('⚠️ MSW unhandled request:', request.method, request.url)
  }
})