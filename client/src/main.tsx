import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create a simple mock for the PWA register if it's not available
const registerSW = () => {
  return () => {};
};

// Register service worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
