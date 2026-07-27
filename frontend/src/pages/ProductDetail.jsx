import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/formatCurrency';
import { mapRemoteProduct, resolveBrandName, resolveCategoryName } from '../store/productHelpers';
import { fetchProductDetails, fetchProducts } from '../lib/api';
import { MoreProducts } from '../components/sections/MoreProducts';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Loader2, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  Info,
  Search,
  Share2,
  Check,
  Plus,
  Minus,
  Star,
  Tag,
  ShoppingBag,
  X,
  Maximize2,
  MessageSquare
} from 'lucide-react';

export const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    products, 
    wishlist, 
    toggleWishlist, 
    handleAddToCart, 
    cart,
    setIsCartOpen,
    addToast,
    user,
    setAuthModal,
    currentTheme
  } = useApp();

  const isLight = currentTheme === 'light';
  const did = searchParams.get('did') || searchParams.get('id');

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration states
  const [selectedSize, setSelectedSize] = useState('15ML');
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [userReviews, setUserReviews] = useState([
    {
      id: 1,
      author: 'Shahriar R.',
      rating: 5,
      date: '2 days ago',
      comment: 'An incredible formulation! The sillage and longevity easily exceed 10 hours. Decant spray bottle is super sleek.'
    },
    {
      id: 2,
      author: 'Nusrat Jahan',
      rating: 5,
      date: '1 week ago',
      comment: 'Authentic 100%. Hand-packed in a velvet presentation case. Extremely fast 24h delivery inside Dhaka!'
    }
  ]);

  useEffect(() => {
    if (!did) {
      setError('No product identifier provided.');
      setIsLoading(false);
      return;
    }

    const loadProductDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await fetchProductDetails(did);
        if (fetched) {
          setProduct(fetched);
          setIsLoading(false);
          return;
        }

        if (products && products.length > 0) {
          const found = products.find(p => p.id === did || String(p.raw?.id) === String(did));
          if (found) {
            setProduct(found);
            setIsLoading(false);
            return;
          }
        }

        const allProds = await fetchProducts({ limit: 100 });
        const found = allProds.find(p => p.id === did || String(p.raw?.id) === String(did));
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetail();
  }, [did, products]);

  // Dynamic variations directly from API
  const decantSwatches = React.useMemo(() => {
    if (product && Array.isArray(product.variations) && product.variations.length > 0) {
      return product.variations.map((v) => ({
        size: v.size || 'Standard',
        label: String(v.size || '').replace(/-/g, ' '),
        price: v.price,
        originalPrice: v.originalPrice,
        sprays: v.size ? `~${parseInt(v.size) * 15 || 50} Sprays` : '',
        raw: v
      }));
    }
    return [];
  }, [product]);

  // Sync initial selected size with available variations
  useEffect(() => {
    if (decantSwatches.length > 0 && (!selectedSize || !decantSwatches.some(s => s.size === selectedSize))) {
      setSelectedSize(decantSwatches[0].size);
    }
  }, [decantSwatches, selectedSize]);

  if (isLoading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center space-y-4 ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-luxury-black text-luxury-white'}`}>
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-zinc-400 font-sans text-xs uppercase tracking-widest">Loading Product Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-[75vh] flex flex-col items-center justify-center p-4 text-center ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-luxury-black text-luxury-white'}`}>
        <div className="bg-gold/10 border border-gold/30 p-4 rounded-full mb-6">
          <Info className="w-8 h-8 text-gold" />
        </div>
        <h2 className="text-2xl font-serif uppercase tracking-wider mb-2">Product Not Found</h2>
        <p className="text-zinc-500 max-w-md text-sm mb-8 font-sans leading-relaxed">
          {error || 'We could not locate the selected fragrance in our catalog.'}
        </p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-black transition-all px-8 py-3.5 uppercase tracking-widest text-xs font-sans font-bold rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const activeSwatch = decantSwatches.find(s => s.size === selectedSize) || decantSwatches[0] || {};
  const unitPrice = activeSwatch.price ?? product.basePrice ?? 980;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Decantre`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'success');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(product, activeSwatch.size, 'Eau de Parfum', quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const newRev = {
      id: Date.now(),
      author: user?.name || 'Verified Client',
      rating: reviewRating,
      date: 'Just now',
      comment: reviewText
    };
    setUserReviews([newRev, ...userReviews]);
    setReviewText('');
    addToast('Thank you for sharing your olfactory review!', 'success');
  };

  return (
    <div className={`min-h-screen font-sans ${isLight ? 'bg-white text-zinc-900' : 'bg-luxury-black text-luxury-white'} text-left`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">

        {/* Requirements 9 & 10: PCBWay-style Single Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT CONTAINER: Sticky Media & Size Thumbnails */}
          <div className="lg:col-span-5 space-y-4">
            <div className="lg:sticky lg:top-28 space-y-4">
              
              {/* Main Image View */}
              <div className={`relative w-full aspect-square border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-gold/20'} rounded-xl overflow-hidden p-6 flex items-center justify-center group shadow-md`}>
                <button 
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-4 left-4 z-10 p-2.5 rounded-full bg-black/60 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-all cursor-pointer"
                  aria-label="Zoom image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <img 
                  src={product.image} 
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER: Scrollable Info, Swatches, Quantities, Actions, Reviews */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Category Link, Title & Brand */}
            <div className="space-y-2.5 border-b border-gold/15 pb-6">
              <Link
                to={`/shop?${new URLSearchParams({ category: resolveCategoryName(product.category) || 'All' }).toString()}`}
                className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em] text-gold hover:underline"
              >
                {resolveCategoryName(product.category)}
              </Link>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium leading-tight tracking-tight">
                {product.name}
              </h1>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-sans font-medium block">
                Brand: <strong className="text-gold font-semibold">{resolveBrandName(product.brand)}</strong>
              </span>

              {/* Star Rating */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-zinc-400 font-mono font-semibold">4.9 ({userReviews.length} Verified Reviews)</span>
              </div>

              {/* Price Display */}
              <div className="pt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-serif text-gold font-bold">
                  {formatBDT(unitPrice * quantity)}
                </span>
                <span className="text-xs text-zinc-500 font-sans">
                  ({formatBDT(unitPrice)} per bottle)
                </span>
              </div>
            </div>

            {/* Linked Shipping Notice */}
            <div className={`p-4 border rounded-sm flex items-start gap-3 shadow-md ${
              isLight ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-zinc-900/90 border-zinc-700/60 text-zinc-200'
            }`}>
              <Truck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div className="text-xs font-sans leading-relaxed">
                <strong className="text-gold font-bold uppercase tracking-wider block mb-0.5">Delivery Notice</strong>
                Courier delivery: <span className="font-semibold text-white">৳80 Inside Dhaka (24–48h)</span>, <span className="font-semibold text-white">৳120 Outside Dhaka (24–72h)</span>. Cash on Delivery & In-Store Pickup available.
              </div>
            </div>

            {/* 3-Column Variation Swatches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-widest text-zinc-400 font-bold">
                  Select Decant Size:
                </span>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[10px] uppercase tracking-wider text-gold hover:underline cursor-pointer"
                >
                  Size & Spray Guide
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {decantSwatches.map((swatch) => {
                  const isSelected = selectedSize === swatch.size;
                  return (
                    <button
                      key={swatch.size}
                      onClick={() => setSelectedSize(swatch.size)}
                      className={`p-3.5 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-gold bg-gold/15 text-gold font-bold shadow-md ring-1 ring-gold/50'
                          : isLight
                            ? 'border-zinc-200 bg-white text-zinc-800 hover:border-black'
                            : 'border-white/10 bg-black/40 text-zinc-300 hover:border-gold/40'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold block">{swatch.label}</span>
                      <span className="text-[11px] text-gold font-mono font-semibold block mt-1">{formatBDT(swatch.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Picker */}
            <div className="space-y-2">
              <span className="text-xs font-sans uppercase tracking-widest text-zinc-400 font-bold block">
                Quantity
              </span>
              <div className="inline-flex items-center border border-gold/40 rounded-sm bg-black/60 overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gold text-black hover:bg-gold/90 transition-colors font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono font-bold text-white">
                  {quantity}
                </span>
                <button 
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gold text-black hover:bg-gold/90 transition-colors font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAddToCart(product, activeSwatch.size, 'Eau de Parfum', quantity)}
                className="w-full bg-gold hover:bg-gold/90 text-black py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-lg shadow-gold/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                ADD TO CART
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-black text-gold border border-gold hover:bg-gold hover:text-black py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                BUY NOW
              </button>
            </div>

            {/* Share and Wishlist Row */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleShare}
                className="w-full bg-black/40 text-zinc-300 border border-white/10 hover:border-gold hover:text-gold py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-gold" />
                SHARE
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`w-full py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  wishlist.includes(product.id)
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                    : 'bg-black/40 text-zinc-300 border-white/10 hover:border-gold hover:text-gold'
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gold'}`} />
                WISHLIST
              </button>
            </div>

            {/* Description & Olfactory Notes breakdown */}
            <div className={`p-6 border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/80 border-gold/15'} rounded-sm space-y-4`}>
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold border-b border-gold/15 pb-2">
                Description
              </h3>
              <div 
                className="text-xs text-zinc-300 font-sans font-light leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_strong]:font-semibold [&_b]:font-semibold [&_p]:my-1"
                dangerouslySetInnerHTML={{ 
                  __html: product.description || product.tagline || 'Exquisitely blended royal fragrance with top notes of bergamot and pink pepper, transitioning into a heart of white cedar, and anchored by a rich amber-musk sillage.' 
                }}
              />

              {/* Hardcoded notes commented out
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-black/40 border border-white/5 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-bold block mb-1">Top Notes</span>
                  <span className="text-zinc-300">Bergamot, Citruses, Pink Pepper</span>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-bold block mb-1">Heart Notes</span>
                  <span className="text-zinc-300">White Cedar, Lavender, Mint</span>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-bold block mb-1">Base Notes</span>
                  <span className="text-zinc-300">Amber, Oakmoss, Vetiver</span>
                </div>
              </div>
              */}
            </div>

            {/* Customer Reviews Section */}
            <div className={`p-6 border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/80 border-gold/15'} rounded-sm space-y-6`}>
              <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gold" /> Customer Reviews
                </h3>
                <span className="text-xs font-mono text-zinc-400">{userReviews.length} Reviews</span>
              </div>

              {/* Dynamic Review Form / Auth Trigger */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3 bg-black/40 p-4 border border-gold/20 rounded-sm">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider block">Write a Review ({user.name})</span>
                  
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder=""
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-gold text-xs text-zinc-200 p-3 rounded-sm outline-none font-sans"
                  />

                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold hover:bg-gold/90 text-black text-xs font-bold uppercase tracking-widest rounded-sm cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 bg-black/40 border border-white/5 rounded-sm space-y-3">
                  <p className="text-xs text-zinc-400 font-sans">
                    Log in with your client account to submit a fragrance review.
                  </p>
                  <button
                    onClick={() => setAuthModal(true, 'login')}
                    className="px-6 py-2.5 border border-gold text-gold hover:bg-gold hover:text-black text-xs font-sans font-bold uppercase tracking-widest rounded-sm transition-all cursor-pointer"
                  >
                    Log In to Write a Review
                  </button>
                </div>
              )}

              {/* Existing Reviews List */}
              <div className="space-y-4 divide-y divide-white/5">
                {userReviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{rev.author}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Requirement 11: Reusable "More Products" Section Component */}
        <div className="pt-8">
          <MoreProducts 
            title="More Fragrances You May Like" 
            category={product.category} 
            currentProductId={product.id}
            limit={8}
          />
        </div>

      </div>

      {/* ZOOM IMAGE MODAL */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button 
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}

      {/* DECANT SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-gold/30 rounded-sm p-6 max-w-md w-full space-y-4 shadow-2xl text-left relative text-white"
          >
            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-gold rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-serif font-light text-gold tracking-widest uppercase border-b border-gold/20 pb-2">
              Decant Volume & Spray Guide
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
              All decants are hand-filled into sterile, glass atomizers with high-fidelity fine sprayers.
            </p>

            <div className="space-y-2.5 pt-1 font-mono text-xs">
              <div className="flex justify-between items-center p-3 rounded-sm bg-black border border-white/10">
                <span className="font-bold text-gold">3ML Decant</span>
                <span className="text-zinc-300">~45+ Sprays</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-sm bg-black border border-white/10">
                <span className="font-bold text-gold">5ML Decant</span>
                <span className="text-zinc-300">~75+ Sprays</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-sm bg-black border border-white/10">
                <span className="font-bold text-gold">10ML Decant</span>
                <span className="text-zinc-300">~150+ Sprays</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-sm bg-gold/15 border border-gold/40">
                <span className="font-bold text-gold">15ML Decant (Best Value)</span>
                <span className="text-gold font-bold">~225+ Sprays</span>
              </div>
            </div>

            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full bg-gold text-black font-bold py-3 rounded-sm text-xs uppercase tracking-widest cursor-pointer hover:bg-gold/90 transition-all"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
