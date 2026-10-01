import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ProductApp.jsx';
import './products.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
