import { useInvoiceStore } from '@stores/invoiceStore';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InvoiceCard from '../components/InvoiceCard';

const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  // Sélecteurs optimisés du store (uniquement les valeurs nécessaires)
  const invoices = useInvoiceStore((s) => s.invoices);
  const loading = useInvoiceStore((s) => s.loading);
  const error = useInvoiceStore((s) => s.error);
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="p-0 h-full flex flex-col">
      <h1 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 px-3 sm:px-0">{t('invoices.title')}</h1>
      {loading && <p className="text-xs sm:text-sm text-gray-500 px-3 sm:px-0">{t('common.loading')}</p>}
      {error && <p className="text-xs sm:text-sm text-red-600 px-3 sm:px-0">{t('common.error')}: {error}</p>}
      {!loading && invoices.length === 0 && (
        <p className="text-xs sm:text-sm text-gray-500 px-3 sm:px-0">{t('invoices.noInvoicesYet')}</p>
      )}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 sm:pr-2 px-3 sm:px-0">
        <div className="space-y-2 sm:space-y-3">
          {invoices.map(inv => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;


