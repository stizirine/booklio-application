import { Icon } from '@assets/icons';
import { Badge, Button } from '@components/ui';
import { SimpleEvent } from '@src/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentDetailsHeaderProps {
  appointment: SimpleEvent;
  onClose: () => void;
}

const AppointmentDetailsHeader: React.FC<AppointmentDetailsHeaderProps> = ({
  appointment,
  onClose
}) => {
  const { t } = useTranslation();

  const statusStr = String(appointment.status).toLowerCase();

  return (
    <div className="bg-white px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icône de statut */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Icon name="clock" className="text-2xl sm:text-3xl text-red-600" size="xl" />
          </div>
          
          {/* Titre et statut */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {appointment.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="md">{t(`statuses.${statusStr}`)}</Badge>
            </div>
          </div>
        </div>
        
        {/* Bouton de fermeture */}
        <Button
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
          leftIcon={<Icon name="x" size="sm" />}
          aria-label={t('common.close')}
        />
      </div>
    </div>
  );
};

export default AppointmentDetailsHeader;
