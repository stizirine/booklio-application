import { AppointmentStatus } from '@src/types';
import React from 'react';

interface AppointmentCardStatusBarProps {
  status?: AppointmentStatus | string;
}

const AppointmentCardStatusBar: React.FC<AppointmentCardStatusBarProps> = ({ status }) => {
  const getStatusBarColor = (status?: AppointmentStatus | string) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case AppointmentStatus.InProgress: return 'bg-[var(--color-primary)]';
      case AppointmentStatus.Scheduled: return 'bg-[var(--color-warning)]';
      case AppointmentStatus.Done: return 'bg-[var(--color-success)]';
      case AppointmentStatus.Canceled: return 'bg-[var(--color-danger)]';
      default: return 'bg-[var(--color-muted)]';
    }
  };

  return (
    <div className={`h-1.5 w-full ${getStatusBarColor(status)} rounded-t-[var(--radius-md)]`}></div>
  );
};

export default AppointmentCardStatusBar;
