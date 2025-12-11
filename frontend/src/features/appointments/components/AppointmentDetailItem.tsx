import { Icon } from '@assets/icons';
import { AppointmentDetailItem as AppointmentDetailItemType } from '@src/features/appointments/utils/appointmentDetailsConfig';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentDetailItemProps {
  item: AppointmentDetailItemType;
}

const AppointmentDetailItem: React.FC<AppointmentDetailItemProps> = ({ item }) => {
  const { t } = useTranslation();

  if (!item.show) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon name={item.icon} className={`text-sm ${item.iconColor}`} size="sm" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-700 leading-5">{t(item.labelKey)}</p>
          <p
            className="text-sm text-gray-600"
            title={typeof item.value === 'string' ? item.value : undefined}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {item.value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailItem;
