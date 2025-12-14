import { Icon } from '@assets/icons';
import { Badge } from '@components/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';

interface InvoiceCardProps {
  invoice: Invoice;
  onClick?: (invoice: Invoice) => void;
  className?: string;
}

const getStatusVariant = (status: Invoice['status']): 'neutral' | 'info' | 'success' | 'warning' | 'danger' => {
  switch (status) {
    case 'draft': return 'neutral';
    case 'sent': return 'info';
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'overdue': return 'danger';
    case 'canceled': return 'neutral';
    default: return 'neutral';
  }
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onClick, className = '' }) => {
  const { t } = useTranslation();
  const number = invoice.number || invoice.id || 'N/A';

  const total = useMemo(() => Number(invoice.total ?? 0), [invoice.total]);
  const currency = invoice.currency || 'EUR';
  const balanceDue = invoice.balanceDue !== undefined ? Number(invoice.balanceDue) : undefined;
  const computedDue = balanceDue ?? Math.max(total - Number(invoice.advanceAmount || 0) - Number(invoice.creditAmount || 0), 0);
  const paidAmount = Math.max(total - computedDue, 0);
  const paidPct = total > 0 ? Math.min(100, Math.max(0, Math.round((paidAmount / total) * 100))) : 0;

  const money = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency });
    } catch {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' });
    }
  }, [currency]);

  const progressColor = invoice.status === 'paid'
    ? 'bg-green-500'
    : invoice.status === 'partial'
      ? 'bg-amber-500'
      : invoice.status === 'overdue'
        ? 'bg-red-500'
        : 'bg-gray-500';

  return (
    <button
      onClick={() => onClick?.(invoice)}
      aria-label={`Facture ${number}`}
      className={`group w-full text-left bg-white border border-gray-200 rounded-lg p-2 sm:p-3.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 ${className}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Left: identity */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-gray-700 text-white grid place-items-center flex-shrink-0">
            <Icon name="tag" className="text-white w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" size="xs" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <span className="text-xs sm:text-sm font-bold text-gray-900 truncate" title={number}>{number}</span>
              <Badge variant={getStatusVariant(invoice.status)} size="xs" className="hidden sm:inline-flex">
                {t(`invoices.status.${invoice.status}`, { defaultValue: invoice.status })}
              </Badge>
              <Badge variant={getStatusVariant(invoice.status)} size="xs" className="sm:hidden inline-flex">
                {t(`invoices.status.${invoice.status}`, { defaultValue: invoice.status }).substring(0, 3)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 truncate">
              {invoice.client?.name && (
                <span className="truncate">{invoice.client.name}</span>
              )}
              <span className="text-gray-400">• {currency}</span>
            </div>
            {invoice.createdAt && (
              <div className="text-[10px] text-gray-400 mt-0.5">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</div>
            )}
          </div>
        </div>

        {/* Right: amounts */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-sm sm:text-base font-bold text-gray-900">
              {money.format(total)}
            </div>
            {(invoice.advanceAmount || invoice.creditAmount) && (
              <div className="flex flex-col items-end gap-1 mt-0.5 sm:mt-1 text-[10px]">
                {invoice.advanceAmount ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">
                    <Icon name="check-circle" className="text-green-600 w-2.5 h-2.5" size="xs" /> {money.format(Number(invoice.advanceAmount))}
                  </span>
                ) : null}
                {invoice.creditAmount ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    <Icon name="tag" className="text-amber-600 w-2.5 h-2.5" size="xs" /> {money.format(Number(invoice.creditAmount))}
                  </span>
                ) : null}
              </div>
            )}
          </div>
          <Icon name="chevron-right" className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 w-4 h-4" size="xs" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-1.5 sm:mt-2.5 pt-1.5 sm:pt-2.5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
          <span className="text-[9px] sm:text-[10px] font-medium text-gray-600">
            {t('invoices.paid', { defaultValue: 'Payé' })} {paidPct}%
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-700">
            {t('invoices.remaining', { defaultValue: 'Reste' })} {money.format(computedDue)}
          </span>
        </div>
        <div className="h-1 sm:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${paidPct}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default React.memo(InvoiceCard);


