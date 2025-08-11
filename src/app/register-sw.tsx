'use client';
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const url = '/sw.js';
      navigator.serviceWorker
        .register(url, { scope: '/' })
        .then((r) => console.log('SW registered:', r.scope))
        .catch((e) => console.error('SW register failed:', e));
    }
  }, []);
  return null;
}
