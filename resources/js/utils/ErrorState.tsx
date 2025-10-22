import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onDismiss: () => void;
  duration?: number; // in milliseconds, default 5000 (5 seconds)
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onDismiss, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    </div>
  );
};

export default ErrorState;
