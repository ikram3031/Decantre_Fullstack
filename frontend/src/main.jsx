import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { config } from './utils/config';

// Apply client-specific branding theme properties to root DOM
if (config.primaryColor) {
  document.documentElement.style.setProperty('--color-gold', config.primaryColor);
}
if (config.luxuryBlack) {
  document.documentElement.style.setProperty('--color-luxury-black', config.luxuryBlack);
}
if (config.luxuryGray) {
  document.documentElement.style.setProperty('--color-luxury-gray', config.luxuryGray);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
