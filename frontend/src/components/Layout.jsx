import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';
import { ScentFinderQuiz } from './ScentFinderQuiz';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { Toast } from './Toast';
import { AuthModal } from './AuthModal';
import { BottomNav } from './BottomNav';
import { RouteTransition } from './RouteTransition';

export const Layout = () => {
  const {
    toasts,
    setToasts,
    isQuizOpen,
    setIsQuizOpen,
    quizStep,
    setQuizStep,
    quizRecommendation,
    handleQuizAnswer,
    handleAddToCart,
    handleOpenProductDetail,
    selectedProduct,
    setSelectedProduct,
    modalSize,
    setModalSize,
    modalConcentration,
    setModalConcentration,
    calculateItemPrice,
    isCartOpen,
    setIsCartOpen,
    isCheckoutMode,
    setIsCheckoutMode,
    cart,
    handleRemoveFromCart,
    handleUpdateQty,
    orderCompleted,
    handleResetCheckout,
    shippingInfo,
    setShippingInfo,
    isProcessingOrder,
    handleCheckoutSubmit,
    promoCode,
    setPromoCode,
    applyPromoCode,
    promoError,
    appliedDiscount,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    searchQuery,
    setSearchQuery,
    addToast,
    wishlist,
    startQuiz,
    currentTheme
  } = useApp();

  const themeConfig = currentTheme === 'light' ? 'bg-white text-black' : 'bg-[#050505] text-[#f5f5f5]';

  return (
    <RouteTransition>
      <div id="landing-container" className={`min-h-screen ${themeConfig} font-sans antialiased selection:bg-gold selection:text-luxury-black overflow-x-clip transition-colors duration-500 relative`}>
        {/* Dynamic Toast Feedback */}
        <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

        {/* Top Banner */}
        <AnnouncementBar />

        {/* Luxury Navigation Header */}
        <Header 
          startQuiz={startQuiz}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          addToast={addToast}
          wishlist={wishlist}
          cart={cart}
          setIsCartOpen={setIsCartOpen}
        />

        {/* Breadcrumb Navigation on all subpages */}
        <Breadcrumb />

        {/* Main Content Area in Fixed Container */}
        <main className="min-h-[70vh] max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Scent finder modal */}
        <ScentFinderQuiz 
          isQuizOpen={isQuizOpen}
          setIsQuizOpen={setIsQuizOpen}
          quizStep={quizStep}
          setQuizStep={setQuizStep}
          quizRecommendation={quizRecommendation}
          handleQuizAnswer={handleQuizAnswer}
          handleAddToCart={handleAddToCart}
        />

        {/* Shopping bag drawer sheet */}
        <CartDrawer 
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          isCheckoutMode={isCheckoutMode}
          setIsCheckoutMode={setIsCheckoutMode}
          cart={cart}
          handleRemoveFromCart={handleRemoveFromCart}
          handleUpdateQty={handleUpdateQty}
          orderCompleted={orderCompleted}
          handleResetCheckout={handleResetCheckout}
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
          isProcessingOrder={isProcessingOrder}
          handleCheckoutSubmit={handleCheckoutSubmit}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          applyPromoCode={applyPromoCode}
          promoError={promoError}
          appliedDiscount={appliedDiscount}
          cartSubtotal={cartSubtotal}
          discountAmount={discountAmount}
          shippingFee={shippingFee}
          cartTotal={cartTotal}
        />

        {/* User credentials & profile session overlay */}
        <AuthModal />

        {/* Persistent floating bottom menu - hidden/commented out per specification */}
        {/* <BottomNav /> */}

        {/* Footnote */}
        <Footer />
      </div>
    </RouteTransition>
  );
};
