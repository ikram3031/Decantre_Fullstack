import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { formatBDT } from '../utils/formatCurrency';

export const ScentFinderQuiz = ({
  isQuizOpen,
  setIsQuizOpen,
  quizStep,
  setQuizStep,
  quizRecommendation,
  handleQuizAnswer,
  handleAddToCart
}) => {
  const navigate = useNavigate();
  return (
    <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
      <DialogContent className="bg-luxury-black border border-gold/25 text-luxury-white p-6 sm:p-8 max-w-xl w-full shadow-[0_0_50px_rgba(197,160,89,0.05)] rounded-none text-center font-sans">
        <div className="sr-only">
          <DialogTitle>Sensory Assessment Scent Finder Quiz</DialogTitle>
          <DialogDescription>Let our master perfumers curate your custom signature scents</DialogDescription>
        </div>

        {/* Step Indicators */}
        {quizStep <= 3 && (
          <div className="flex justify-center gap-1.5 mb-8">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-1 transition-all duration-300 ${
                  step === quizStep ? 'w-10 bg-gold' : step < quizStep ? 'w-3 bg-gold/50' : 'w-3 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        )}

        {/* Steps Content */}
        {quizStep === 1 && (
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block font-sans">Sensory Phase 1</span>
            <h3 className="text-xl font-serif font-light text-luxury-white uppercase tracking-wide">Which gender spectrum do you want to define?</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans font-light">We balance floral concentration indices differently based on gender archetypes.</p>
            
            <div className="grid grid-cols-1 gap-3 pt-4 font-sans">
              <button 
                onClick={() => handleQuizAnswer('gender', 'Him')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Masculine / Bold (For Him)
              </button>
              <button 
                onClick={() => handleQuizAnswer('gender', 'Her')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Feminine / Gracious (For Her)
              </button>
              <button 
                onClick={() => handleQuizAnswer('gender', 'Unisex')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Boundless / Shared (Unisex)
              </button>
            </div>
          </div>
        )}

        {/* Steps Content */}
        {quizStep === 2 && (
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block font-sans">Sensory Phase 2</span>
            <h3 className="text-xl font-serif font-light text-luxury-white uppercase tracking-wide">Which olfactory chord resonates with your soul?</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans font-light">Fragrances evoke memory chords. Choose the environmental setting that appeals to you.</p>

            <div className="grid grid-cols-2 gap-3 pt-4 font-sans">
              <button 
                onClick={() => handleQuizAnswer('family', 'Woody')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-semibold tracking-widest uppercase transition-all"
              >
                🪵 Smoked Woods & Incense
              </button>
              <button 
                onClick={() => handleQuizAnswer('family', 'Floral')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-semibold tracking-widest uppercase transition-all"
              >
                🌹 Sweet Blossoms & Honey
              </button>
              <button 
                onClick={() => handleQuizAnswer('family', 'Fresh')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-semibold tracking-widest uppercase transition-all"
              >
                🌊 Clean Air & Bergamot
              </button>
              <button 
                onClick={() => handleQuizAnswer('family', 'Warm')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-[10px] font-semibold tracking-widest uppercase transition-all"
              >
                ✨ Golden Saffron & Resins
              </button>
            </div>
          </div>
        )}

        {/* Steps Content */}
        {quizStep === 3 && (
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block font-sans">Sensory Phase 3</span>
            <h3 className="text-xl font-serif font-light text-luxury-white uppercase tracking-wide">What is the context of your signature trails?</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans font-light">Projection is optimized either for daylight freshness or dark evening heat.</p>

            <div className="grid grid-cols-1 gap-3 pt-4 font-sans">
              <button 
                onClick={() => handleQuizAnswer('vibe', 'Day')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Daylight Radiance / Crisp Offices
              </button>
              <button 
                onClick={() => handleQuizAnswer('vibe', 'Night')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Intimate Dinners / Midnight Heat
              </button>
              <button 
                onClick={() => handleQuizAnswer('vibe', 'Royal')}
                className="p-4 rounded-none bg-[#0a0a0a] hover:bg-gold hover:text-black border border-white/5 hover:border-gold text-xs font-semibold tracking-widest uppercase transition-all"
              >
                Sovereign / Formal Gala Red Carpet
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results & Custom recommendation */}
        {quizStep === 4 && quizRecommendation && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold block font-sans">Assessment Curated Recommendation</span>
            <h3 className="text-2xl font-serif font-light text-luxury-white uppercase tracking-wider">{quizRecommendation.name}</h3>
            
            <p className="text-gold/90 font-serif italic text-xs">
              "{quizRecommendation.tagline}"
            </p>

            {/* Curated result presentation card */}
            <div className="flex gap-4 p-4 bg-black border border-white/5 rounded-none text-left items-center max-w-md mx-auto">
              <img 
                src={quizRecommendation.image} 
                alt={quizRecommendation.name} 
                className="w-16 h-16 object-cover rounded-none shrink-0 bg-[#0d0d0d] border border-white/5"
                referrerPolicy="no-referrer"
              />
              <div className="font-sans">
                <span className="text-[8px] uppercase tracking-widest text-gold font-bold block">{quizRecommendation.category} • {quizRecommendation.scentFamily}</span>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed line-clamp-2 mt-0.5">{quizRecommendation.description}</p>
                <span className="text-[11px] font-sans font-medium text-gold mt-1 block">Base Value: {formatBDT(quizRecommendation.basePrice)}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3 max-w-sm mx-auto font-sans">
              <button 
                onClick={() => {
                  handleAddToCart(quizRecommendation, '100ml', 'Eau de Parfum', 1);
                  setIsQuizOpen(false);
                }}
                className="flex-1 bg-transparent border border-gold hover:bg-gold hover:text-black text-gold font-bold uppercase tracking-widest text-[9px] py-3 rounded-none shadow-xl transition-all"
              >
                Add Scent
              </button>
              <button 
                onClick={() => {
                  navigate(`/product?did=${quizRecommendation.id}`);
                  setIsQuizOpen(false);
                }}
                className="flex-1 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 text-[9px] font-bold uppercase tracking-widest py-3 rounded-none transition-all cursor-pointer"
              >
                View Details
              </button>
            </div>

            <button 
              onClick={() => setQuizStep(1)}
              className="text-[9px] font-bold uppercase text-zinc-500 hover:text-gold block mx-auto pt-2 underline tracking-wider font-sans"
            >
              Restart Assessment Quiz
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
