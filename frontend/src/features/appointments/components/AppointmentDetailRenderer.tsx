import { AppointmentDetailItem as AppointmentDetailItemType } from '@src/features/appointments/utils/appointmentDetailsConfig';
import React from 'react';
import AppointmentDetailItem from './AppointmentDetailItem';
import AppointmentDetailSection from './AppointmentDetailSection';

interface AppointmentDetailRendererProps {
  item: AppointmentDetailItemType;
}

const AppointmentDetailRenderer: React.FC<AppointmentDetailRendererProps> = ({ item }) => {
  // Si l'item a des styles personnalisés, utiliser AppointmentDetailSection
  if (item.useCustomSection) {
    return (
      <AppointmentDetailSection
        item={item}
        bgColor={item.sectionBgColor || 'bg-gray-50'}
        labelColor={item.labelColor || 'text-gray-700'}
        valueColor={item.valueColor || 'text-gray-600'}
      />
    );
  }

  // Sinon, utiliser le composant standard
  return <AppointmentDetailItem item={item} />;
};

export default AppointmentDetailRenderer;
