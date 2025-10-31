
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`border-b border-secondary-200 pb-4 mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-secondary-800 ${className}`}>{children}</h3>
);


export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);


export default Card;
