import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Atelier } from './pages/Atelier';
import { Reviews } from './pages/Reviews';
import { Season } from './pages/Season';

// New luxury pages
import { Shop } from './pages/Shop';
import { Wishlist } from './pages/Wishlist';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { ThankYou } from './pages/ThankYou';
import { NotFound } from './pages/NotFound';
import { ContactUs } from './pages/ContactUs';
import { AboutUs } from './pages/AboutUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndCondition } from './pages/TermsAndCondition';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { ProductDetail } from './pages/ProductDetail';
import { FAQ } from './pages/FAQ';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="atelier" element={<Atelier />} />
            <Route path="reviews" element={<Reviews />} />

            {/* Newly added routes */}
            <Route path="season" element={<Season />} />
            <Route path="shop" element={<Shop />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="product" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="thank-you" element={<ThankYou />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-and-condition" element={<TermsAndCondition />} />
            <Route path="return-policy" element={<ReturnPolicy />} />
            <Route path="faq" element={<FAQ />} />

            {/* Olfactory Void (404 Fallback) */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
