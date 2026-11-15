import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Retrieving academic indicators...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-secondary">
      <Loader2 className="w-8 h-8 animate-spin text-forest" />
      <span className="mt-3 text-xs font-medium tracking-wide text-secondary">{message}</span>
    </div>
  );
};
