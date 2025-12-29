import Icon from '@assets/icons/Icon';
import { Invoice, InvoiceCard, InvoiceStatistics } from '@features/invoices';
import React from 'react';
import { ClientInvoiceConfig } from '../types';

interface ClientInvoicesSectionProps {
  config: ClientInvoiceConfig;
  invoices: Invoice[];
  loading: boolean;
  onInvoiceClick: (invoice: Invoice) => void;
  t: (key: string, opts?: any) => string;
}

const ClientInvoicesSection: React.FC<ClientInvoicesSectionProps> = ({
  config,
  invoices,
  loading,
  onInvoiceClick,
  t,
}) => {
  return (
    <div className="space-y-2 sm:space-y-4">
      {config.showStatistics && !loading && invoices.length > 0 && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 mb-2 sm:mb-4 border-b border-gray-200">
          <InvoiceStatistics
            invoices={invoices}
            currency={config.currency || 'EUR'}
            className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon name="refresh" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 animate-spin" size="lg" />
          </div>
          <p className="text-sm sm:text-base font-medium text-gray-600">{t('invoices.loadingSummary')}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon name="tag" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" size="lg" />
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{t('invoices.noInvoices')}</h4>
          <p className="text-xs sm:text-sm text-gray-500">{t('invoices.createFirst', { defaultValue: 'Créez votre première facture' })}</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onClick={onInvoiceClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientInvoicesSection;
