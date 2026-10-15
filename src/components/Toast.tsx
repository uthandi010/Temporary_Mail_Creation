import React, { useEffect } from 'react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const DISMISS_AFTER_MS = 3000;

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const id = toast?.id;

  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(onDismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
        toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
      }`}
    >
      {toast.message}
    </div>
  );
};

export default Toast;
