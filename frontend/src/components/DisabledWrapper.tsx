import React from 'react';

interface DisabledWrapperProps {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Composant wrapper qui désactive automatiquement tous ses enfants
 * quand la prop `disabled` est true.
 * 
 * Usage:
 * <DisabledWrapper disabled={isReadOnly}>
 *   <input ... />
 *   <select ... />
 *   <textarea ... />
 * </DisabledWrapper>
 */
const DisabledWrapper: React.FC<DisabledWrapperProps> = ({ 
  disabled = false, 
  children, 
  className = '' 
}) => {
  const disabledClassName = disabled ? 'opacity-50 pointer-events-none' : '';
  
  return (
    <div className={`${disabledClassName} ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Cloner l'élément enfant et ajouter la prop disabled
          return React.cloneElement(child, {
            ...(child.props as any),
            disabled: disabled || (child.props as any).disabled,
            className: `${(child.props as any).className || ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`.trim()
          });
        }
        return child;
      })}
    </div>
  );
};

export default DisabledWrapper;
