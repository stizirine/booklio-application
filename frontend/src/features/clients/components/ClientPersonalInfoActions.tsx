import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientPersonalInfoActionsProps {
  loading: boolean;
  onSave: () => void;
  onCreateAppointment: () => void;
}

const ClientPersonalInfoActions: React.FC<ClientPersonalInfoActionsProps> = ({
  loading,
  onSave,
  onCreateAppointment
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Button
        onClick={onSave}
        disabled={loading}
        variant="gradient"
        size="md"
        className="flex-1"
        leftIcon={<Icon name={loading ? "refresh" : "check"} className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} size="sm" />}
      >
        {t('common.save')}
      </Button>
      <Button
        onClick={onCreateAppointment}
        variant="gradient"
        size="md"
        className="flex-1"
        leftIcon={<Icon name="plus" className="w-4 h-4" size="sm" />}
      >
        {t('appointments.create')}
      </Button>
    </div>
  );
};

export default ClientPersonalInfoActions;
