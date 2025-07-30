import { http } from 'msw'

// Define handlers for each API endpoint
export const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
  }),
]