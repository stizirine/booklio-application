import React from 'react';

type FieldProps = {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export const Field: React.FC<FieldProps> = ({ label, help, error, htmlFor, className = '', children }) => {
  const hasError = Boolean(error);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
        </label>
      )}
      {children}
      {help && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{help}</p>
      )}
      {hasError && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Field;


