import { Icon } from '@assets/icons';
import { Card } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  subMessageKey: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  subMessageKey
}) => {
  const { t } = useTranslation();

  return (
    <Card className="text-center">
      <div className="py-8 sm:py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
          <Icon name="calendar" className="w-8 h-8 text-[var(--color-primary)]" size="xl" />
        </div>
        <h4 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2">
          {t('summary.noAppointments')}
        </h4>
        <p className="text-sm text-[var(--color-muted)]">
          {t(subMessageKey)}
        </p>
      </div>
    </Card>
  );
};

export default EmptyState;
