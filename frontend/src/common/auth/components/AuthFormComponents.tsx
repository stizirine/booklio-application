import { Icon } from '@assets/icons';
import { Button, Field, Input } from '@components/ui';
import React from 'react';

// Composant pour les champs de formulaire
interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: string;
  required?: boolean;
  autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  autoComplete
}) => (
  <Field label={label} htmlFor={id}>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon name={icon as any} className="h-5 w-5 text-[var(--color-muted)]" size="sm" />
      </div>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="pl-11 pr-4 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm focus:bg-white"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
      />
    </div>
  </Field>
);

// Composant pour le message d'erreur
interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => (
  <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-[var(--radius-md)] p-4">
    <div className="flex items-center gap-2">
      <Icon name="exclamation" className="w-5 h-5 text-[var(--color-danger)]" size="sm" />
      <p className="text-[var(--color-danger)] text-sm font-semibold">{error}</p>
    </div>
  </div>
);

// Composant pour le bouton de soumission
interface SubmitButtonProps {
  loading: boolean;
  loadingText: string;
  buttonText: string;
  icon: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  loading, 
  loadingText, 
  buttonText, 
  icon
}) => (
  <Button
    type="submit"
    disabled={loading}
    variant="gradient"
    size="md"
    leftIcon={loading ? <Icon name="refresh" className="w-4 h-4 animate-spin" size="sm" /> : <Icon name={icon as any} className="w-4 h-4" size="sm" />}
    className="w-full py-3 shadow-card"
  >
    {loading ? loadingText : buttonText}
  </Button>
);

// Composant pour le lien de basculement entre login/register
interface AuthToggleLinkProps {
  text: string;
  linkText: string;
  onClick: () => void;
}

export const AuthToggleLink: React.FC<AuthToggleLinkProps> = ({ 
  text, 
  linkText, 
  onClick
}) => (
  <div className="text-center pt-4 border-t border-[var(--color-border)]">
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
    >
      {text} {linkText}
    </button>
  </div>
);
