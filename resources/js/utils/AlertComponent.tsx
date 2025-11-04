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
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800',
          Icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          Icon: Info
        };
      case 'success':
        return {
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800',
          Icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          Icon: XCircle
        };
      default:
        return {
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          Icon: Info
        };
    }
  };

  const { bgColor, borderColor, iconColor, textColor, Icon } = getStyles();

  return (
    <div className={`flex items-start gap-3 p-4 my-4 ${bgColor} border ${borderColor} ${className}`}>
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