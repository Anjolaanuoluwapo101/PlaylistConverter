import React, { useState, useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  disabled?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
  showError?: boolean;
  errorMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  disabled = false,
  showSuccess = false,
  successMessage = "Operation completed successfully!",
  showError = false,
  errorMessage = "An error occurred. Please try again."
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'error' | null>(null);

  const onCancelRef = useRef(onCancel);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      setShowResult(false);
      setResultType(null);
      // Clear any existing timer when modal opens
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if ((showSuccess || showError) && !timerRef.current) {
      setShowResult(true);
      setResultType(showSuccess ? 'success' : 'error');
      timerRef.current = setTimeout(() => {
        setShowResult(false);
        setResultType(null);
        onCancelRef.current(); // Close modal after showing result
        timerRef.current = null;
      }, 2000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showSuccess, showError]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${showResult ? 'scale-105' : 'scale-100'}`}>
        {showResult ? (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${resultType === 'success' ? 'bg-green-100 dark:bg-green-900/20 animate-bounce' : 'bg-red-100 dark:bg-red-900/20 animate-pulse'}`}>
              {resultType === 'success' ? (
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${resultType === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              {resultType === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className={`text-sm ${resultType === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {resultType === 'success' ? successMessage : errorMessage}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">{title}</h3>
            <p className="text-purple-700 dark:text-purple-300 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={disabled || isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={disabled || isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;
