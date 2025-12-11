import { Icon } from '@assets/icons';
import { AppointmentDetailItem as AppointmentDetailItemType } from '@src/features/appointments/utils/appointmentDetailsConfig';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentDetailSectionProps {
  item: AppointmentDetailItemType;
  bgColor?: string;
  textColor?: string;
  labelColor?: string;
  valueColor?: string;
}

const AppointmentDetailSection: React.FC<AppointmentDetailSectionProps> = ({ 
  item, 
  bgColor = 'bg-gray-50',
  // textColor not used; keep signature minimal
  labelColor = 'text-gray-700',
  valueColor = 'text-gray-600'
}) => {
  const { t } = useTranslation();

  if (!item.show) return null;

  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center`}>
          <Icon name={item.icon} className={`text-sm ${item.iconColor}`} size="sm" />
        </div>
        <div>
          <p className={`text-sm font-medium ${labelColor}`}>{t(item.labelKey)}</p>
          <p className={`text-sm ${valueColor}`}>{item.value}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailSection;
