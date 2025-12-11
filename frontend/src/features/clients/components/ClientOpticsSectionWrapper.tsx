import React from 'react';
import Icon from '@assets/icons/Icon';
import { Button } from '@components/ui';
import OpticsSection from '@optics/components/OpticsSection';
import { Client } from '@stores/clientStore';

interface ClientOpticsSectionWrapperProps {
  isOptician: boolean;
  client: Client | null;
  onCreateOpticsInvoice: () => Promise<void> | void;
  t: (key: string, opts?: any) => string;
}

const ClientOpticsSectionWrapper: React.FC<ClientOpticsSectionWrapperProps> = ({
  isOptician,
  client,
  onCreateOpticsInvoice,
  t,
}) => {
  if (!isOptician) return null;

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          <Icon name="eye" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          <span className="truncate">{t('clients.opticsFile', { defaultValue: 'Dossier Optique' })} - {client?.name}</span>
        </h4>
        
        <Button
          onClick={onCreateOpticsInvoice}
          size="md"
          variant="gradient"
          className="w-full sm:w-auto text-xs sm:text-sm font-semibold"
          leftIcon={<Icon name="plus" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        >
          <span className="hidden sm:inline">{t('invoices.newOpticsInvoice', { defaultValue: 'Nouvelle facture optique' })}</span>
          <span className="sm:hidden">+ Nouvelle facture</span>
        </Button>
      </div>
      
      <OpticsSection client={client} />
    </div>
  );
};

export default ClientOpticsSectionWrapper;

