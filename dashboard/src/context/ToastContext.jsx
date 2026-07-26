import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

const toastStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-slate-200 bg-white text-slate-700',
};

const toastIcons = {
  success: <CheckCircle2 className="h-4.5 w-4.5" />,
  error: <AlertCircle className="h-4.5 w-4.5" />,
  info: <Info className="h-4.5 w-4.5" />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = { id, type, title, message, duration };

    setToasts((current) => [...current, toast]);

    window.setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border shadow-lg shadow-slate-200/70 px-4 py-3 flex items-start gap-3 backdrop-blur-sm ${toastStyles[toast.type] || toastStyles.info}`}
          >
            <div className="mt-0.5 shrink-0">
              {toastIcons[toast.type] || toastIcons.info}
            </div>
            <div className="min-w-0 flex-1">
              {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
              {toast.message && <div className="text-sm/5 mt-0.5 opacity-90">{toast.message}</div>}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-1 rounded-full p-1 text-current/70 hover:bg-black/5 transition"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
