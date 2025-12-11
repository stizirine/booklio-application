import Icon from '@assets/icons/Icon';
import React from 'react';

interface ProfileModalTabsProps {
  activeTab: 'profile' | 'password' | 'store';
  onTabChange: (tab: 'profile' | 'password' | 'store') => void;
  profileLabel: string;
  storeLabel: string;
  passwordLabel: string;
}

export const ProfileModalTabs: React.FC<ProfileModalTabsProps> = ({
  activeTab,
  onTabChange,
  profileLabel,
  storeLabel,
  passwordLabel,
}) => {
  return (
    <div className="mb-6 sticky top-[64px] sm:top-[72px] z-20 bg-[var(--color-bg)] pt-2 pb-2">
      <div className="flex bg-[var(--color-surface)] p-1 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm gap-1">
        {([
          { key: 'profile', label: profileLabel, icon: 'user' },
          { key: 'store', label: storeLabel, icon: 'building' },
          { key: 'password', label: passwordLabel, icon: 'lock-closed' },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-card'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Icon
                name={tab.icon as any}
                className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-muted)]'}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

