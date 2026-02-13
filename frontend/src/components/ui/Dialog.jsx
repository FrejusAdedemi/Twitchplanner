import { cn } from '../../utils/utils';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className, children, onClose }) => {
  return (
    <div className={cn('relative', className)}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-0 top-0 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
};

export const DialogHeader = ({ className, children }) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ className, children }) => {
  return (
    <h2 className={cn('text-xl font-semibold text-white', className)}>
      {children}
    </h2>
  );
};
