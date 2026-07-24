import React from 'react';
import { TestimonialsSlider } from '../TestimonialsSlider';

export const Testimonials = () => {
  return (
    <section id="testimonials-section" className="py-24 bg-luxury-dark/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium">Sovereign Echoes</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white tracking-wide">
            MEMBER REVIEWS & VERDICTS
          </h2>
          <div className="w-20 h-[1px] bg-gold/30 mx-auto"></div>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-sm mx-auto font-sans font-light leading-relaxed">
            Read the unfiltered olfactory journeys from our distinguished global connoisseurs.
          </p>
        </div>

        <div className="mt-8">
          <TestimonialsSlider />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
