import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientTabsProps {
  active: 'info' | 'appts' | 'invoices';
  counts: { appts: number; invoices: number };
  onChange: (tab: 'info' | 'appts' | 'invoices') => void;
}

const ClientTabs: React.FC<ClientTabsProps> = ({ active, counts, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="sticky top-0 z-10 -mt-4 -mx-4 sm:mx-0 sm:-mt-6 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 px-4 sm:px-0 py-2">
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onChange('info')} className={`px-3 py-2 text-xs font-semibold rounded-lg border ${active==='info' ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-gray-200'}`}>{t('clients.infoTab')}</button>
        <button onClick={() => onChange('appts')} className={`px-3 py-2 text-xs font-semibold rounded-lg border ${active==='appts' ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-gray-200'}`}>{t('clients.appointmentsTab')} ({counts.appts})</button>
        <button onClick={() => onChange('invoices')} className={`px-3 py-2 text-xs font-semibold rounded-lg border ${active==='invoices' ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-gray-200'}`}>{t('clients.invoicesTab')} ({counts.invoices})</button>
      </div>
    </div>
  );
};

export default ClientTabs;
