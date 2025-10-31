
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-4 border-secondary-200 border-t-primary-600 ${sizeClasses[size]}`}
      ></div>
      {label && <p className="text-secondary-600 mt-2">{label}</p>}
    </div>
  );
};

export default Spinner;
