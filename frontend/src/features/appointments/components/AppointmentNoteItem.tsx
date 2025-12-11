import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentNoteItemProps {
  labelKey: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const AppointmentNoteItem: React.FC<AppointmentNoteItemProps> = ({
  labelKey,
  value,
  icon,
  iconColor,
  bgColor,
  borderColor
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${bgColor} rounded-lg p-3 border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-2">
        <Icon name={icon} className={`text-sm mt-0.5 ${iconColor}`} size="sm" />
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">{t(labelKey)}</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentNoteItem;
