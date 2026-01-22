import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('🚀 Vendofyx Core Labs: Initializing React Mount...');

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Failed to find root element');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Vendofyx Core Labs: Application Mounted Successfully');
  } catch (error) {
    console.error('💥 Vendofyx Core Labs: Critical Mount Failure:', error);
  }
};

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
