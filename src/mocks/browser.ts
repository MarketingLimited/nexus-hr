import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Enable logging in development
if (import.meta.env.DEV) {
  worker.events.on('request:start', ({ request }) => {
    console.log('MSW intercepted:', request.method, request.url);
  });
}