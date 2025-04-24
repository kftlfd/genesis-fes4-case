import { FC, ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export const LoadingSpinner: FC<
  ComponentProps<'div'> & {
    size?: number | string;
    width?: number;
  }
> = ({ size = 32, width = 2, ...props }) => {
  const sizeVal = typeof size === 'string' ? size : `${size}px`;

  return (
    <div
      {...props}
      style={{ height: sizeVal, width: sizeVal, borderWidth: `${width}px`, ...props.style }}
      className={cn(
        'border-accent-foreground animate-spin rounded-full border-r-transparent',
        props.className,
      )}
    />
  );
};
