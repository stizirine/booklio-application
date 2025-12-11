import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid = false, ...props }, ref) => (
    <input
      ref={ref}
      className={
        `w-full border rounded-[var(--radius-md)] px-3.5 py-3 text-sm bg-[var(--color-card)] placeholder:text-slate-400 transition-colors duration-150 ` +
        `${invalid ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-4 focus:ring-[rgba(79,70,229,0.18)] focus:border-[var(--color-primary)]'} ` +
        `${className}`
      }
      {...props}
    />
  )
);

Input.displayName = 'Input';

export default Input;


