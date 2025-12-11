import { Button } from '@components/ui';
import React from 'react';

interface ProfileModalFooterProps {
  loading: boolean;
  onCancel?: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
}

export const ProfileModalFooter: React.FC<ProfileModalFooterProps> = ({
  loading,
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
}) => {
  return (
    <footer className="flex justify-end gap-3 p-5 sm:p-6 border-t border-[var(--color-border)] bg-[var(--color-card)]">
      {onCancel && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="min-w-[120px]"
        >
          {cancelLabel || 'Annuler'}
        </Button>
      )}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        variant="gradient"
        size="sm"
        className="min-w-[140px] shadow-card"
      >
        {loading ? 'Sauvegarde...' : submitLabel}
      </Button>
    </footer>
  );
};

