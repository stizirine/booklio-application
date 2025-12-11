import Icon from '@assets/icons/Icon';
import React from 'react';

interface ProfileModalHeaderProps {
  onClose?: () => void;
  title: string;
}

export const ProfileModalHeader: React.FC<ProfileModalHeaderProps> = ({ onClose, title }) => {
  return (
    <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0">
      <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white grid place-items-center shadow-sm">
          <Icon name="user" className="w-5 h-5" />
        </span>
        {title}
      </h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors bg-[var(--color-surface)] h-10 w-10 rounded-full grid place-items-center border border-[var(--color-border)]"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>
      )}
    </header>
  );
};

