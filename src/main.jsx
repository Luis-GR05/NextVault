import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProveedorSeguridad } from './contexto/ContextoSeguridad';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProveedorSeguridad>
      <App />
    </ProveedorSeguridad>
  </StrictMode>
);
