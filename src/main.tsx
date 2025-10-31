import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Start MSW worker
async function enableMocking() {
  // Vite provides import.meta.env.DEV for dev environment
  // Use a safe check to avoid TS issues in some environments
  // if (typeof import.meta === 'undefined' || !(import.meta as any).env?.DEV) {
  //   return;
  // }

  const { worker } = await import('./mocks/browser')
  try {
    const registration = await worker.start();
    // Dev log to confirm MSW started
    // eslint-disable-next-line no-console
    console.debug('[msw] worker started', registration);
    return registration;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[msw] failed to start worker', err);
    throw err;
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
