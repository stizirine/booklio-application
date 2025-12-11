import React from 'react';

interface FormFieldWrapperProps {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

/**
 * Composant wrapper intelligent pour les champs de formulaire
 * qui applique automatiquement les styles et propriétés de désactivation
 * 
 * Features:
 * - Désactive automatiquement tous les éléments de formulaire
 * - Applique les styles visuels appropriés
 * - Préserve les props existantes des enfants
 * - Gère les cas spéciaux (checkboxes, selects, etc.)
 */
const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ 
  disabled = false, 
  children, 
  className = '',
  wrapperClassName = ''
}) => {
  const processChild = (child: React.ReactElement): React.ReactElement => {
    const { type } = child;
    const elementType = typeof type === 'string' ? type : (type as any)?.displayName || '';

    // Styles de base pour les éléments désactivés
    const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : '';
    
    // Props communes pour tous les éléments
    const commonProps = {
      ...(child.props as any),
      disabled: disabled || (child.props as any).disabled,
      className: `${(child.props as any).className || ''} ${disabledStyles}`.trim()
    };

    // Gestion spéciale pour les checkboxes et radios
    if (elementType === 'input' && ((child.props as any).type === 'checkbox' || (child.props as any).type === 'radio')) {
      return React.cloneElement(child, {
        ...commonProps,
        // Pour les checkboxes, on garde la valeur mais on désactive l'interaction
        onChange: disabled ? undefined : (child.props as any).onChange,
      });
    }

    // Gestion spéciale pour les selects
    if (elementType === 'select') {
      return React.cloneElement(child, {
        ...commonProps,
        // Les selects gardent leur valeur mais sont visuellement désactivés
      });
    }

    // Gestion spéciale pour les textareas
    if (elementType === 'textarea') {
      return React.cloneElement(child, {
        ...commonProps,
        // Les textareas gardent leur contenu mais sont désactivées
      });
    }

    // Gestion spéciale pour les inputs
    if (elementType === 'input') {
      return React.cloneElement(child, {
        ...commonProps,
        // Les inputs gardent leur valeur mais sont désactivés
      });
    }

    // Pour les autres éléments, appliquer les props communes
    return React.cloneElement(child, commonProps);
  };

  return (
    <div className={`${wrapperClassName} ${disabled ? 'pointer-events-none' : ''} ${className}`.trim()}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return processChild(child);
        }
        return child;
      })}
    </div>
  );
};

export default FormFieldWrapper;
