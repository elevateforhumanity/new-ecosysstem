import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to mount React app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif;">
      <h1 style="color: #ff6b35;">Elevate for Humanity</h1>
      <p style="color: red;">Error loading application: ${error.message}</p>
      <p>Please refresh the page or contact support.</p>
    </div>
  `;
}
