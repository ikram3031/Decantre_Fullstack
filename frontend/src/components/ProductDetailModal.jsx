import React, { useEffect } from 'react';
import { ShoppingCart, X as XIcon } from 'lucide-react';
import { formatBDT } from '../utils/formatCurrency';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

export const ProductDetailModal = ({
  selectedProduct,
  onClose,
  modalSize,
  setModalSize,
  modalConcentration,
  setModalConcentration,
  calculateItemPrice,
  handleAddToCart
}) => {
  if (!selectedProduct) return null;

  // Setup default size selection when product opens
  useEffect(() => {
    if (selectedProduct && selectedProduct.variations && selectedProduct.variations.length > 0) {
      const firstVar = selectedProduct.variations[0];
      if (firstVar && firstVar.size && modalSize !== firstVar.size) {
        setModalSize(firstVar.size);
      }
    }
  }, [selectedProduct, setModalSize]);

  // Determine main category gender display
  const getGenderCategory = (category = '') => {
    const catLower = category.toLowerCase();
    if (catLower.includes('her') || catLower.includes('women') || catLower.includes('female') || catLower.includes('মেয়েদের')) {
      return 'FOR HER';
    }
    if (catLower.includes('him') || catLower.includes('men') || catLower.includes('male') || catLower.includes('ছেলেদের')) {
      return 'FOR HIM';
    }
    return 'UNISEX';
  };

  const genderCategory = getGenderCategory(selectedProduct.category || '');

  // Sanitize short description and remove "NPS" or "NPS text"
  const sanitizeDescription = (text = '') => {
    if (!text) return '';
    return text
      .replace(/NPS\s*(text)?/gi, '')
      .replace(/<[^>]+>/g, '') // remove HTML tags if any
      .trim();
  };

  const shortDescription = sanitizeDescription(selectedProduct.tagline || selectedProduct.description);

  // Dynamic variations list
  const variationsToDisplay = selectedProduct.variations && selectedProduct.variations.length > 0
    ? selectedProduct.variations
    : [
        { id: 'v1', size: '50ml', price: selectedProduct.basePrice * 0.75 },
        { id: 'v2', size: '100ml', price: selectedProduct.basePrice },
        { id: 'v3', size: '200ml', price: selectedProduct.basePrice * 1.6 }
      ];

  // Selected variation price
  const selectedVariation = variationsToDisplay.find(v => v.size === modalSize) || variationsToDisplay[0];
  const activePrice = selectedVariation ? selectedVariation.price : selectedProduct.basePrice;

  return (
    <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent 
        showCloseButton={false} 
        className="!fixed !top-[5vh] !left-1/2 !-translate-x-1/2 !translate-y-0 bg-luxury-black border border-gold/25 text-luxury-white p-0 w-[92%] sm:w-[85%] md:w-[70%] md:max-w-none h-[90vh] max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.15)] rounded-none flex flex-col font-sans z-50"
      >
        <div className="sr-only">
          <DialogTitle>{selectedProduct.name} - Quick View</DialogTitle>
          <DialogDescription>{selectedProduct.tagline}</DialogDescription>
        </div>

        {/* Fixed Top-Left Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2.5 bg-luxury-black/90 hover:bg-black border border-gold/50 hover:border-gold rounded-full text-zinc-300 hover:text-gold transition-all duration-300 shadow-xl cursor-pointer"
        >
          <XIcon className="w-4 h-4" />
        </button>

        {/* Scrollable container with styled vertical scroll bar and bottom padding */}
        <div className="w-full h-full overflow-y-auto px-6 py-8 md:p-12 custom-scrollbar text-left">
          
          {/* Header area with Name Displayed prominently at the top */}
          <div className="pt-10 md:pt-4 border-b border-white/5 pb-5 mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold bg-gold/10 border border-gold/25 px-3 py-1 rounded-none font-sans inline-block mb-3">
              {genderCategory}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-light tracking-wide text-luxury-white uppercase">
              {selectedProduct.name}
            </h2>
            <p className="text-zinc-400 text-xs mt-2 uppercase tracking-[0.2em] font-sans font-light">
              Main Category: {selectedProduct.category || 'Luxury'}
            </p>
          </div>

          {/* Two-Column Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left Column: Visual Scent Thumbnail & Specs */}
            <div className="md:col-span-5 space-y-6">
              <div className="aspect-[4/5] rounded-none bg-black border border-white/5 overflow-hidden relative group">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 left-3 bg-black/95 border border-white/5 text-gold text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-none font-sans font-medium">
                  {selectedProduct.scentFamily || 'Luxury Scent'}
                </span>
              </div>

              {/* Scent Statistics Section */}
              <div className="space-y-4 bg-luxury-dark/50 border border-white/5 p-4">
                <div>
                  <div className="flex justify-between text-[9px] uppercase tracking-widest mb-1 font-sans text-zinc-500">
                    <span>Longevity / persistence</span>
                    <span className="text-gold font-semibold">{selectedProduct.longevity || 4}/5</span>
                  </div>
                  <div className="w-full bg-[#0d0d0d] border border-white/5 h-1.5 rounded-none overflow-hidden">
                    <div 
                      className="bg-gold h-full" 
                      style={{ width: `${((selectedProduct.longevity || 4) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] uppercase tracking-widest mb-1 font-sans text-zinc-500">
                    <span>Sillage / Projection Trail</span>
                    <span className="text-gold font-semibold">{selectedProduct.sillage || 4}/5</span>
                  </div>
                  <div className="w-full bg-[#0d0d0d] border border-white/5 h-1.5 rounded-none overflow-hidden">
                    <div 
                      className="bg-gold h-full" 
                      style={{ width: `${((selectedProduct.sillage || 4) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Olfactory details & Variations */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Description Display */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-sans font-semibold">Fragrance Signature</span>
                <p className="text-zinc-300 text-sm font-sans font-light leading-relaxed">
                  {shortDescription || 'A masterfully curated sensory formulation representing refined luxury and absolute sophistication.'}
                </p>
              </div>

              {/* Olfactory Scent Pyramid Structure */}
              <div className="bg-black/40 border border-white/5 rounded-none p-5 space-y-3">
                <span className="text-[9px] uppercase text-gold font-sans font-bold tracking-widest block border-b border-white/5 pb-2">
                  Fragrance Pyramid Structure
                </span>
                
                <div className="grid grid-cols-1 gap-3 text-xs text-left font-sans">
                  <div>
                    <span className="text-zinc-500 font-medium uppercase tracking-widest text-[8px] block">Top Notes</span>
                    <p className="text-zinc-300 font-light">{(selectedProduct?.notes?.top || ['Bergamot', 'Pink Pepper', 'Citrus']).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium uppercase tracking-widest text-[8px] block">Heart Notes</span>
                    <p className="text-zinc-300 font-light">{(selectedProduct?.notes?.heart || ['Turkish Rose', 'Jasmine', 'Amberwood']).join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium uppercase tracking-widest text-[8px] block">Base Notes</span>
                    <p className="text-zinc-300 font-light">{(selectedProduct?.notes?.base || ['Madagascar Vanilla', 'White Musk', 'Patchouli']).join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Selection Panel & Variations */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                
                {/* Size options list */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gold font-sans font-bold uppercase tracking-widest block">
                    Available Variations
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {variationsToDisplay.map((v) => {
                      const size = v.size || '100ml';
                      const isSelected = modalSize === size;
                      const price = v.price || calculateItemPrice(selectedProduct.basePrice, size, 'Eau de Parfum');
                      return (
                        <button
                          key={v.id || size}
                          onClick={() => setModalSize(size)}
                          className={`p-3 rounded-none border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0d0d0d] border-gold text-gold shadow-[0_0_15px_rgba(197,160,89,0.12)]'
                              : 'bg-black border-white/5 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className="block text-[11px] font-sans font-bold uppercase tracking-widest">{size}</span>
                          <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">{formatBDT(price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simplified Purchase CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-6 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block tracking-widest font-sans">Total Price</span>
                    <span className="text-2xl font-serif font-light text-gold">
                      {formatBDT(activePrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, modalSize, 'Eau de Parfum', 1);
                      onClose();
                    }}
                    className="bg-transparent border border-gold hover:bg-gold hover:text-black text-gold font-sans font-bold uppercase tracking-[0.25em] text-[10px] px-8 py-3.5 rounded-none shadow-2xl flex items-center justify-center gap-2 transition-all cursor-pointer h-12"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to cart
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Generous bottom spacing as requested */}
          <div className="pb-12 md:pb-20"></div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
