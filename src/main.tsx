import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { enableMocking } = await import('./mocks');
    return enableMocking();
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
