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
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          Icon: Info
        };
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-200',
          Icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-200',
          Icon: XCircle
        };
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          Icon: Info
        };
    }
  };

  const { bgColor, borderColor, iconColor, textColor, Icon } = getStyles();

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg ${bgColor} border ${borderColor} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`${textColor} text-sm`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default AlertComponent;