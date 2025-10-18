import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-simple.tsx';

console.log('main.jsx loading...');

const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  console.log('Creating React root...');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">ERROR: Root element not found</h1>';
}
