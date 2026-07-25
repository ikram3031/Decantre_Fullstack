import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onClose }) => {
  return (
    <div id="toast-manager" className="fixed top-6 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-[90vw] sm:max-w-md w-auto">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          id={`toast-${toast.id}`}
          className="px-4 py-3 rounded-md shadow-2xl flex items-center justify-between gap-4 border bg-white text-zinc-900 animate-fade-in transition-all duration-300 border-zinc-200/80"
        >
          <div className="flex items-center gap-3 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
            <span className="text-xs sm:text-sm font-sans font-medium text-zinc-900 tracking-wide break-words">
              {toast.text}
            </span>
          </div>
          <button 
            onClick={() => onClose(toast.id)}
            className="text-zinc-400 hover:text-zinc-800 p-1.5 hover:bg-zinc-100 rounded-full transition-all cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};


