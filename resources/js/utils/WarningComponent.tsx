import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface WarningComponentProps {
  message: string;
  type?: 'warning' | 'info';
  className?: string;
}

const WarningComponent: React.FC<WarningComponentProps> = ({
  message,
  type = 'warning',
  className = ''
}) => {
  const isWarning = type === 'warning';

  const bgColor = isWarning
    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';

  const borderColor = isWarning
    ? 'border-yellow-200 dark:border-yellow-800/50'
    : 'border-blue-200 dark:border-blue-800/50';

  const iconColor = isWarning
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-blue-600 dark:text-blue-400';

  const textColor = isWarning
    ? 'text-yellow-800 dark:text-yellow-200'
    : 'text-blue-800 dark:text-blue-200';

  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div className={`flex items-start gap-3 p-4 my-4 ${bgColor} border ${borderColor} rounded-xl shadow-lg backdrop-blur-sm ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`${textColor} font-medium text-sm leading-relaxed`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default WarningComponent;
