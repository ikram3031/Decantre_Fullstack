import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { clientConfig } from './clientConfig';

// Initialize dynamic page title & favicon immediately per client tenant
if (typeof document !== 'undefined') {
  const brandName = clientConfig?.brandName || 'Decantre';
  document.title = `Dashboard - ${brandName}`;

  const faviconUrl = clientConfig?.siteIconUrl || clientConfig?.logoUrl;
  if (faviconUrl) {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = faviconUrl;
    }
  }

  const gaMeasurementId = clientConfig?.googleAnalytics?.measurementId;
  if (gaMeasurementId && gaMeasurementId !== 'G-XXXXXXXXXX') {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(gtagScript);

    const gtagInitScript = document.createElement('script');
    gtagInitScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaMeasurementId}');
    `;
    document.head.appendChild(gtagInitScript);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
