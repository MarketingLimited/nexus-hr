import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import App from './App.tsx';
import './index.css';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryProvider>
    </StrictMode>
  );
});
