import { cn } from '../../utils/utils';

export const Label = ({ className, ...props }) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
};
