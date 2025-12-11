import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import React from 'react';
import { useClientDetail } from '../context/ClientDetailContext';

const ClientDetailActionBar: React.FC = () => {
  const { activeTab, onOpenCreateAppointment, onCreateInvoice, canCreateInvoice, t } = useClientDetail();
  return (
    <div className="px-3 sm:px-6 bg-white border-b border-gray-100 py-1.5 sm:py-2 shadow-sm z-10">
      <div className="flex sm:justify-end gap-2">
        {activeTab === 'appts' && (
          <Button className="w-full sm:w-auto" size="md" variant="gradient" onClick={onOpenCreateAppointment}>
            {t('event.createCta')}
          </Button>
        )}
        {activeTab === 'invoices' && canCreateInvoice && (
          <Button className="w-full sm:w-auto" size="md" variant="gradient" onClick={onCreateInvoice} leftIcon={<Icon name="plus" className="w-4 h-4" size="sm" />}>
            {t('invoices.create')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClientDetailActionBar;


