import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardHeaderProps {
  user: { email: string };
  onMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onMenuToggle }) => {
  const { t } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 shadow-lg fixed top-0 inset-x-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 shadow-sm hover:shadow-md xl:hidden"
              aria-label={t('common.openMenu')}
            >
              <Icon name="menu" className="h-5 w-5" size="md" />
            </button>
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm sm:text-lg font-bold">B</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{t('app.title')}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('dashboard.welcome', { email: user.email })}</p>
              </div>
            </div>
          </div>
          
          {/* <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a href="/appointments" className="hidden sm:inline-block px-3 py-1.5 text-sm text-gray-700 hover:text-indigo-600">{t('dashboard.menuAppointments')}</a>
            <a href="/clients" className="hidden sm:inline-block px-3 py-1.5 text-sm text-gray-700 hover:text-indigo-600">{t('dashboard.menuClients')}</a>
            <a href="/invoices" className="hidden sm:inline-block px-3 py-1.5 text-sm text-gray-700 hover:text-indigo-600">Invoices</a>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;


