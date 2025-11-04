import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '' }) => {
    return (
        <div className={`text-center mb-8 ${className}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                {title}
            </h2>
            <p className="text-lg text-gray-600">
                {description}
            </p>
        </div>
    );
};

export default PageHeader;