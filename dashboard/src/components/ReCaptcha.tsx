import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RefreshCw, HelpCircle, AlertCircle } from 'lucide-react';

interface ChallengeImage {
  id: number;
  image: string;
  isPerfume: boolean;
}

const CHALLENGE_IMAGES: ChallengeImage[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=180&q=80', isPerfume: true },
  { id: 2, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=180&q=80', isPerfume: false },
  { id: 3, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=180&q=80', isPerfume: true },
  { id: 4, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=180&q=80', isPerfume: false },
  { id: 5, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=180&q=80', isPerfume: true },
  { id: 6, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=180&q=80', isPerfume: false },
  { id: 7, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=180&q=80', isPerfume: true },
  { id: 8, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=180&q=80', isPerfume: false },
  { id: 9, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=180&q=80', isPerfume: true },
];

interface ReCaptchaProps {
  onVerify: (status: boolean) => void;
  verified: boolean;
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify, verified }) => {
  const [checking, setChecking] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const handleCheckboxClick = () => {
    if (verified || checking) return;

    setChecking(true);
    // Simulate a brief secure network check
    setTimeout(() => {
      setChecking(false);
      setShowChallenge(true);
    }, 850);
  };

  const handleImageClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setChallengeError(null);
  };

  const handleVerify = () => {
    // Collect correct perfume IDs
    const correctIds = CHALLENGE_IMAGES.filter((item) => item.isPerfume).map((item) => item.id);
    const incorrectIds = CHALLENGE_IMAGES.filter((item) => !item.isPerfume).map((item) => item.id);

    // Verify: all selected ones are indeed perfumes, and no non-perfumes are selected
    const hasSelectedAllCorrect = correctIds.every((id) => selectedIds.includes(id));
    const hasSelectedAnyIncorrect = selectedIds.some((id) => incorrectIds.includes(id));

    if (hasSelectedAllCorrect && !hasSelectedAnyIncorrect) {
      onVerify(true);
      setShowChallenge(false);
      setChallengeError(null);
    } else {
      setChallengeError('Verification failed. Please select all perfume bottles.');
      setSelectedIds([]);
    }
  };

  const handleRefresh = () => {
    setSelectedIds([]);
    setChallengeError(null);
  };

  return (
    <div className="relative">
      {/* reCAPTCHA Widget Container */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl select-none shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={verified || checking}
            className={`w-7 h-7 rounded border-2 flex items-center justify-center transition cursor-pointer shrink-0 outline-none ${
              verified
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                : checking
                ? 'border-slate-300 bg-white'
                : 'border-slate-300 bg-white hover:border-slate-400 focus:border-slate-950'
            }`}
          >
            {verified ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="h-4.5 w-4.5 stroke-[3.5]" />
              </motion.div>
            ) : checking ? (
              <div className="h-4.5 w-4.5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin" />
            ) : null}
          </button>
          
          <span className="text-xs font-semibold text-slate-800 font-sans">
            I'm not a robot
          </span>
        </div>

        {/* reCAPTCHA Logo Mark / Branding info */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 text-slate-400"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span className="text-[8px] font-bold text-slate-400 leading-none mt-1">reCAPTCHA</span>
          <span className="text-[7px] text-slate-400 leading-none mt-0.5 font-mono">Privacy - Terms</span>
        </div>
      </div>

      {/* Challenge Modal Overlay */}
      <AnimatePresence>
        {showChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-slate-200 shadow-2xl relative"
            >
              {/* Challenge Header Banner */}
              <div className="bg-slate-950 text-white p-6 relative">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-none">
                  Decantre Security Challenge
                </p>
                <h3 className="text-base font-black mt-2 leading-snug">
                  Select all images with a <span className="text-amber-400">perfume or fragrance bottle</span>.
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 font-sans">
                  If there are none, click verify.
                </p>
              </div>

              {/* Challenge Grid */}
              <div className="p-4 bg-slate-50">
                {challengeError && (
                  <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-medium text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{challengeError}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {CHALLENGE_IMAGES.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleImageClick(item.id)}
                        className={`aspect-square relative rounded-lg overflow-hidden border-2 transition outline-none cursor-pointer group bg-white ${
                          isSelected
                            ? 'border-slate-950 scale-[0.96] shadow-sm'
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt="Verification challenge"
                          className={`w-full h-full object-cover transition-all duration-200 ${
                            isSelected ? 'brightness-90 opacity-90' : 'group-hover:scale-105'
                          }`}
                        />
                        {/* Selected Checkmark overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                            <div className="bg-slate-950 text-white p-1 rounded-full shadow-md">
                              <Check className="h-3.5 w-3.5 stroke-[4.5]" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Panel */}
              <div className="px-4 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between">
                {/* Control Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    title="Refresh Challenge"
                    className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    title="Help Info"
                    className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <HelpCircle className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Verify Submit Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChallenge(false);
                      setSelectedIds([]);
                      setChallengeError(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
