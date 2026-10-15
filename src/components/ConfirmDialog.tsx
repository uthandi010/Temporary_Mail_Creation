import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, confirmLabel, busy, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
  >
    <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl">
      <h3 id="confirm-dialog-title" className="text-white font-medium text-lg mb-2">{title}</h3>
      <p className="text-gray-300 text-sm mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-70"
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
