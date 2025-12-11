import { useInvoiceStore } from '@stores/invoiceStore';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface InvoiceDetailsPageProps {
  id?: string;
}

const InvoiceDetailsPage: React.FC<InvoiceDetailsPageProps> = ({ id }) => {
  const { t } = useTranslation();
  // Sélecteurs optimisés du store
  const currentInvoice = useInvoiceStore((s) => s.currentInvoice);
  const loading = useInvoiceStore((s) => s.loading);
  const error = useInvoiceStore((s) => s.error);
  const fetchInvoice = useInvoiceStore((s) => s.fetchInvoice);

  useEffect(() => {
    if (id) fetchInvoice(id);
  }, [id, fetchInvoice]);

  if (!id) return <div className="p-3 sm:p-4 text-xs sm:text-sm">{t('invoices.invalidId')}</div>;

  return (
    <div className="p-3 sm:p-4">
      <h1 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4">{t('invoices.details')}</h1>
      {loading && <p className="text-xs sm:text-sm text-gray-500">{t('common.loading')}</p>}
      {error && <p className="text-xs sm:text-sm text-red-600">{t('common.error')}: {error}</p>}
      {currentInvoice && (
        <div className="space-y-1.5 sm:space-y-2">
          <div className="text-xs sm:text-sm">{t('invoices.numberLabel')}: <span className="font-medium">{currentInvoice.number || currentInvoice.id}</span></div>
          <div className="text-xs sm:text-sm">{t('invoices.statusLabel')}: <span className="font-medium">{t(`invoices.status.${currentInvoice.status}`, { defaultValue: currentInvoice.status })}</span></div>
          <div className="text-xs sm:text-sm">{t('invoices.currencyLabel')}: <span className="font-medium">{currentInvoice.currency}</span></div>
          <div className="text-xs sm:text-sm">{t('invoices.totalLabel')}: <span className="font-medium">{(currentInvoice.total ?? 0).toFixed(2)} {currentInvoice.currency}</span></div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;


