import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', invalid = false, ...props }, ref) => (
    <textarea
      ref={ref}
      className={
        `w-full border rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors duration-150 ` +
        `${invalid ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'} ` +
        `${className}`
      }
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export default Textarea;


