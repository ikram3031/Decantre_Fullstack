import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Scroll to top immediately on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Trigger route loader animation
    setIsLoading(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Top Luxury Progress Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[100] h-1 bg-black/50 overflow-hidden pointer-events-none"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-gold to-amber-300 shadow-[0_0_12px_rgba(197,160,89,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Luxury Transition Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: [0.9, 1.05, 1], opacity: [0.5, 1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 text-center px-4"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                {/* Rotating Gold Accent Ring */}
                <div className="absolute inset-0 rounded-full border border-gold/20 border-t-gold animate-spin" style={{ animationDuration: '1.2s' }} />
                <div className="absolute inset-2 rounded-full border border-gold/10 border-b-amber-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <span className="text-xl font-serif text-gold font-light tracking-widest">D</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-serif tracking-[0.4em] text-gold uppercase block">
                  DECANTRE
                </span>
                <span className="text-[10px] font-sans tracking-[0.25em] text-zinc-400 uppercase font-light block">
                  Loading...
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
};
