import React from 'react';
import { Button } from '@components/ui';

interface ClientInfoSectionProps {
  t: (key: string, opts?: any) => string;
  clientManagement: {
    state: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address?: string;
    };
    loading: boolean;
    dispatch: (payload: Partial<ClientInfoSectionProps['clientManagement']['state']>) => void;
    updateClient: () => void;
  };
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({ t, clientManagement }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 border border-gray-200 mb-3 sm:mb-4 overflow-hidden shadow-sm">
      <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {t('clients.personalInfo')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.firstName')}</label>
          <input
            className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder={t('event.firstName') as string}
            value={clientManagement.state.firstName}
            onChange={(e) => clientManagement.dispatch({ firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.lastName')}</label>
          <input
            className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder={t('event.lastName') as string}
            value={clientManagement.state.lastName}
            onChange={(e) => clientManagement.dispatch({ lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{t('auth.email')}</label>
          <input
            type="email"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder={t('auth.email') as string}
            value={clientManagement.state.email}
            onChange={(e) => clientManagement.dispatch({ email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.phone')}</label>
          <input
            className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder={t('event.phone') as string}
            value={clientManagement.state.phone}
            onChange={(e) => clientManagement.dispatch({ phone: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.address')}</label>
          <input
            className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder={t('event.address') as string}
            value={clientManagement.state.address || ''}
            onChange={(e) => clientManagement.dispatch({ address: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          size="md"
          variant="gradient"
          disabled={clientManagement.loading}
          onClick={clientManagement.updateClient}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoSection;

