'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const config = {
    success: {
      bg: 'bg-semantic-success/90',
      border: 'border-semantic-success',
      icon: '✓',
    },
    error: {
      bg: 'bg-semantic-error/90',
      border: 'border-semantic-error',
      icon: '✕',
    },
    warning: {
      bg: 'bg-semantic-warning/90',
      border: 'border-semantic-warning',
      icon: '⚠',
    },
    info: {
      bg: 'bg-semantic-info/90',
      border: 'border-semantic-info',
      icon: 'ℹ',
    },
  };

  const style = config[toast.type];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
        ${style.bg} ${style.border} text-white shadow-lg
        animate-in slide-in-from-right duration-200
      `}
    >
      <span className="text-xl font-bold">{style.icon}</span>
      <p className="font-medium">{toast.message}</p>
    </div>
  );
}
