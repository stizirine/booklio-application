import { ClientDetailTabKey } from '../context/ClientDetailContext';

export interface ClientDetailTabConfig {
  key: ClientDetailTabKey;
  icon: 'user-circle' | 'calendar' | 'tag' | 'eye';
  labelKey: string;
  count?: number;
}

export function getClientDetailTabConfigs(options: {
  isOptician: boolean;
  appointmentsCount: number;
  invoicesCount: number;
}): ClientDetailTabConfig[] {
  const { isOptician, appointmentsCount, invoicesCount } = options;

  const base: ClientDetailTabConfig[] = [
    { key: ClientDetailTabKey.Info, icon: 'user-circle', labelKey: 'clients.infoTab' },
    { key: ClientDetailTabKey.Appts, icon: 'calendar', labelKey: 'clients.appointmentsTab', count: appointmentsCount },
    { key: ClientDetailTabKey.Invoices, icon: 'tag', labelKey: 'clients.invoicesTab', count: invoicesCount },
  ];

  return isOptician
    ? [...base, { key: ClientDetailTabKey.Optics, icon: 'eye', labelKey: 'clients.opticsTab' }]
    : base;
}


