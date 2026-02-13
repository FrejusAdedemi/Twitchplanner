import { cn } from '../../utils/utils';
import { X } from 'lucide-react';

export const Toast = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-lg border p-4 shadow-lg animate-in slide-in-from-right',
            toast.variant === 'destructive'
              ? 'border-red-600 bg-red-900/90 text-white'
              : 'border-gray-700 bg-gray-900/90 text-white'
          )}
        >
          {toast.title && (
            <div className="mb-1 font-semibold">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};
