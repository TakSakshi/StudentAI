import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading academic records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-secondary">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="mt-3 text-sm font-medium">{message}</span>
    </div>
  );
};
