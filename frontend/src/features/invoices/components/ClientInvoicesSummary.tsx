import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientInvoicesSummaryProps {
  total?: number;
  balanceDue?: number;
  currency?: string;
  invoiceCount?: number;
  lastInvoiceAt?: string;
}

const ClientInvoicesSummary: React.FC<ClientInvoicesSummaryProps> = ({ 
  total = 0, 
  balanceDue = 0, 
  currency = 'EUR',
  invoiceCount = 0,
  lastInvoiceAt
}) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      {invoiceCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
          <Icon name="clipboard" className="w-3 h-3" size="xs" />
          <span className="font-semibold">{invoiceCount}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="font-semibold">{total.toFixed(2)} {currency}</span>
        <span className="opacity-70">{t('invoices.total')}</span>
      </span>
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${balanceDue > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200' }`}>
        <span className="font-semibold">{balanceDue.toFixed(2)} {currency}</span>
        <span className="opacity-70">{t('invoices.due')}</span>
      </span>
      {lastInvoiceAt && (
        <span className="inline-flex items-center gap-1 text-gray-500">
          <Icon name="clock" className="w-3 h-3" size="xs" />
          <span className="opacity-70">{formatDate(lastInvoiceAt)}</span>
        </span>
      )}
    </div>
  );
};

export default ClientInvoicesSummary;



