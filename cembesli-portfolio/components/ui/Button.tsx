// Reusable button primitive with primary, ghost, and danger variants
// Forwards the ref so the component can host focus management when needed
'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary',
  ghost:
    'border bg-transparent hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-primary',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
  subtle:
    'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 focus-visible:ring-primary'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
