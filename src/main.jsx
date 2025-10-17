import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function showFatal(e) {
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;z-index:99999;top:0;left:0;right:0;padding:12px;background:#ff0033;color:#fff;font:14px/1.4 system-ui';
  el.textContent = 'React failed to mount: ' + (e?.message || e);
  document.body.appendChild(el);
  console.error('[EFH] React mount error:', e);
}

try {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root not found in index.html');
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  showFatal(e);
}
