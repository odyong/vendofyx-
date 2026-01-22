import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('🚀 Vendofyx Core Labs: Initializing React Mount...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Failed to find root element');
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ Vendofyx Core Labs: Application Mounted Successfully');
} catch (error) {
  console.error('💥 Vendofyx Core Labs: Critical Mount Failure:', error);
}