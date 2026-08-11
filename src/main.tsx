import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove legacy PWA workers/caches that can keep serving an old mobile bundle.
const CACHE_CLEANUP_VERSION = 'profile-mobile-save-v3';
const CACHE_CLEANUP_STORAGE_KEY = 'cityqr_cache_cleanup_version';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const hadActiveController = Boolean(navigator.serviceWorker.controller);

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
      }
    } catch (error) {
      console.warn('Legacy mobile cache cleanup warning:', error);
    }

    if (
      hadActiveController &&
      sessionStorage.getItem(CACHE_CLEANUP_STORAGE_KEY) !== CACHE_CLEANUP_VERSION
    ) {
      sessionStorage.setItem(CACHE_CLEANUP_STORAGE_KEY, CACHE_CLEANUP_VERSION);
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
