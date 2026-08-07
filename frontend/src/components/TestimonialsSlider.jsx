import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const testimonials = [
  {
    text: "Decantre feels incredibly personal. The fragrance is soft yet refined, settling beautifully on the skin without ever feeling overwhelming.",
    name: "NUSRAT JAHAN",
    title: "STUDENT",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    text: "Wearing Decantre feels effortless. The fragrance is balanced, long-lasting, and becomes part of you rather than standing out.",
    name: "ARIF HOSSAIN",
    title: "SOFTWARE ENGINEER",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    text: "The depth of notes is unmatched. It opens with exquisite freshness and matures into a rich, sovereign aura that gets compliments everywhere I go.",
    name: "SARA ALAM",
    title: "CREATIVE DIRECTOR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

export const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Variants for slide animation
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0
    })
  };

  return (
    <div className="relative py-14 px-4 sm:px-12 max-w-4xl mx-auto text-center overflow-hidden min-h-[360px] sm:min-h-[320px] flex items-center justify-center">
      {/* Decorative Quote Icon */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
        <Quote className="w-24 h-24 text-white" />
      </div>

      <div className="w-full relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex flex-col items-center space-y-7"
          >
            {/* Avatar image container matching ss */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-gold/35 p-1 overflow-hidden bg-[#0a0a0a]">
                <img 
                  src={testimonials[currentIndex].avatar} 
                  alt={testimonials[currentIndex].name} 
                  className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Testimonial centered text */}
            <p className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-zinc-100 leading-relaxed tracking-wide max-w-3xl px-6 md:px-12 select-none">
              {testimonials[currentIndex].text}
            </p>

            {/* Credentials */}
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-white">
                {testimonials[currentIndex].name}
              </h4>
              <p className="text-[10px] sm:text-xs font-sans font-medium uppercase tracking-[0.15em] text-zinc-500">
                {testimonials[currentIndex].title}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next navigation arrow controls */}
      <button 
        onClick={prev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-gold hover:scale-115 transition-all cursor-pointer z-20"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-8 h-8 stroke-[1.25]" />
      </button>
      <button 
        onClick={next}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-gold hover:scale-115 transition-all cursor-pointer z-20"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-8 h-8 stroke-[1.25]" />
      </button>

      {/* Small dot page indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-gold w-4' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSlider;
