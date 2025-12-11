import { Icon } from '@assets/icons';
import { useUIConfig } from '@contexts/UIConfigContext';
import { ClientInvoicesInline } from '@features/invoices';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentCardInfoProps {
  appointment: {
    customerName?: string;
    start: Date;
    end: Date;
    clientEmail?: string;
    clientPhone?: string;
    invoiceSummary?: {
      totalAmount: number;
      dueAmount: number;
      invoiceCount: number;
      lastInvoiceAt?: string;
    };
  };
}

const AppointmentCardInfo: React.FC<AppointmentCardInfoProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { config } = useUIConfig();

  const formatTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h${diffMinutes > 0 ? diffMinutes.toString().padStart(2, '0') : ''}`;
    }
    return `${diffMinutes}min`;
  };

  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* Client */}
      {appointment.customerName && (
        <div className="flex items-center gap-2.5 min-w-0 p-3 rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center flex-shrink-0">
            <Icon name="user" className="w-4 h-4 text-[var(--color-primary)]" size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-[var(--color-muted)] block">{t('appointment.with')}</span>
            <span className="text-sm font-semibold text-[var(--color-fg)] truncate block">{appointment.customerName}</span>
          </div>
        </div>
      )}
      
      {/* Informations détaillées */}
      <div className="space-y-3">
        {/* Date et Durée sur la même ligne sur mobile */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
            <Icon name="calendar" className="w-4 h-4 text-[var(--color-primary)]" size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-[var(--color-muted)] block">Date & Heure</span>
            <span className="text-sm font-semibold text-[var(--color-fg)]">{formatTime(appointment.start)}</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-[var(--color-border)] flex-shrink-0">
            <Icon name="clock" className="w-4 h-4 text-[var(--color-secondary)]" size="sm" />
            <div>
              <span className="text-xs text-[var(--color-muted)] block sm:hidden">Durée</span>
              <span className="text-sm font-semibold text-[var(--color-fg)]">{formatDuration(appointment.start, appointment.end)}</span>
            </div>
          </div>
        </div>

        {appointment.clientEmail && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
              <Icon name="mail" className="w-4 h-4 text-[var(--color-primary)]" size="sm" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-[var(--color-muted)] block">Email</span>
              <span className="text-sm font-semibold text-[var(--color-fg)] truncate">{appointment.clientEmail}</span>
            </div>
          </div>
        )}

        {appointment.clientPhone && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
              <Icon name="phone" className="w-4 h-4 text-[var(--color-secondary)]" size="sm" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-[var(--color-muted)] block">Téléphone</span>
              <span className="text-sm font-semibold text-[var(--color-fg)]">{appointment.clientPhone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Résumé des factures (paramétrable) */}
      {config.invoice.showList && appointment.invoiceSummary && (
        <ClientInvoicesInline invoiceSummary={appointment.invoiceSummary} />
      )}
    </div>
  );
};

export default AppointmentCardInfo;
