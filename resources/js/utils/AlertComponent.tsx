import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertComponentProps {
  message: string;
  type?: 'warning' | 'info' | 'success' | 'error';
  className?: string;
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  message,
  type = 'info',
  className = ''
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800/50',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          Icon: Info
        };
      case 'success':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          borderColor: 'border-green-200 dark:border-green-800/50',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-200',
          Icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          borderColor: 'border-red-200 dark:border-red-800/50',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-200',
          Icon: XCircle
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          Icon: Info
        };
    }
  };

  const { bgColor, borderColor, iconColor, textColor, Icon } = getStyles();

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

export default AlertComponent;
