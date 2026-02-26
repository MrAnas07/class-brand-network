import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: 'bg-red-50 border-red-400 text-red-700',
    success: 'bg-green-50 border-green-400 text-green-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700'
  };

  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️'
  };

  return (
    <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-xl backdrop-blur-md max-w-sm animate-slideInRight ${styles[type]}`}>
      <span className="text-xl">{icons[type]}</span>
      <p className="font-medium text-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-lg font-bold opacity-60 hover:opacity-100 transition-opacity ml-2"
        style={{background:'none', border:'none', cursor:'pointer'}}
      >
        ×
      </button>
    </div>
  );
};