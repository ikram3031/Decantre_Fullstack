import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onClose }) => {
  return (
    <div id="toast-manager" className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 max-w-[90vw] sm:max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        // Resolve dynamic styles based on toast type for luxury look
        const type = toast.type || 'info';
        let bgClass = 'bg-zinc-950/95 border-[#C5A059]/30 text-amber-50 shadow-xl';
        let iconColor = 'text-[#C5A059]';
        let closeBtnClass = 'text-[#C5A059]/60 hover:text-white hover:bg-[#C5A059]/10';
        let IconComponent = Info;

        if (type === 'success') {
          bgClass = 'bg-zinc-950/95 border-emerald-500/30 text-emerald-50 shadow-xl';
          iconColor = 'text-emerald-400';
          closeBtnClass = 'text-emerald-400/60 hover:text-emerald-200 hover:bg-emerald-500/10';
          IconComponent = CheckCircle2;
        } else if (type === 'error') {
          bgClass = 'bg-zinc-950/95 border-rose-500/30 text-rose-50 shadow-xl';
          iconColor = 'text-rose-400';
          closeBtnClass = 'text-rose-400/60 hover:text-rose-200 hover:bg-rose-500/10';
          IconComponent = AlertCircle;
        }

        return (
          <div 
            key={toast.id} 
            id={`toast-${toast.id}`}
            className={`px-4 py-3.5 rounded-sm shadow-2xl flex items-center justify-between gap-4 border backdrop-blur-sm animate-fade-in transition-all duration-300 ${bgClass}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <IconComponent className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <span className="text-xs sm:text-[13px] font-sans tracking-wide break-words font-medium">
                {toast.text}
              </span>
            </div>
            <button 
              onClick={() => onClose(toast.id)}
              className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${closeBtnClass}`}
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};


