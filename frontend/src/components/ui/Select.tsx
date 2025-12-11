import React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', invalid = false, children, ...props }, ref) => (
    <select
      ref={ref}
      className={
        `w-full border rounded-[var(--radius-md)] px-3 py-2 text-sm bg-white transition-colors duration-150 ` +
        `${invalid ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'} ` +
        `${className}`
      }
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = 'Select';

export default Select;


