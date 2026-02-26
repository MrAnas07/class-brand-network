import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
};