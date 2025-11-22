import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default PageHeader;

