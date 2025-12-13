import Icon from '@assets/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileModalHeaderProps {
  onClose?: () => void;
  title: string;
  onLogout?: () => void;
}

export const ProfileModalHeader: React.FC<ProfileModalHeaderProps> = ({ onClose, title, onLogout }) => {
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0">
      <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white grid place-items-center shadow-sm">
          <Icon name="user" className="w-5 h-5" />
        </span>
        {title}
      </h2>
      <div className=" border-t border-gray-200">
            <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 inline-flex items-center gap-3">
              <Icon name="logout" className="h-5 w-5" size="sm" />
              {t('auth.logout')}
            </button>
          </div>
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

