import React from 'react';
import { Sparkles, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onClose }) => {
  return (
    <div id="toast-manager" className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 max-w-[90vw] sm:max-w-md w-auto">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          id={`toast-${toast.id}`}
          className={`px-5 py-3 rounded-none shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-between border-2 backdrop-blur-md animate-fade-in transition-all duration-300 ${
            toast.type === 'success' 
              ? 'border-gold bg-[#050505] text-gold' 
              : toast.type === 'error'
              ? 'border-rose-500 bg-[#050505] text-rose-300'
              : 'border-zinc-700 bg-[#050505] text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />}
            {toast.type === 'error' && <Info className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-400 shrink-0" />}
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-sans font-medium line-clamp-1">{toast.text}</span>
          </div>
          <button 
            onClick={() => onClose(toast.id)}
            className="text-zinc-500 hover:text-white p-1 ml-4 border border-zinc-800 hover:border-zinc-500 rounded-sm transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

