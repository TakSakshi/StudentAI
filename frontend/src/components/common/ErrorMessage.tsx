import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-softred-light border border-softred rounded-2xl p-8 text-center max-w-lg mx-auto my-10 shadow-warm-sm">
      <div className="w-12 h-12 rounded-full bg-softred text-softred-text flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-editorial text-lg font-bold text-main">Unable to load information</h3>
      <p className="mt-2 text-xs text-secondary leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-white text-main border border-border rounded-xl text-xs font-semibold hover:bg-ivory shadow-warm-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-forest" />
          Retry Request
        </button>
      )}
    </div>
  );
};
