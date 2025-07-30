// Export for easy access to MSW setup
export { worker } from './browser';
export { handlers } from './handlers';

// Initialize MSW in development
export async function enableMocking() {
  if (typeof window === 'undefined') {
    // Server-side (Node.js)
    const { server } = await import('./server');
    server.listen();
  } else {
    // Client-side (Browser)
    const { worker } = await import('./browser');
    return worker.start({
      onUnhandledRequest: 'warn'
    });
  }
}