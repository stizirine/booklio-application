import AppointmentsPage from '@appointments/pages/AppointmentsPage';
import Icon from '@assets/icons/Icon';
import ClientDetailPage from '@clients/pages/ClientDetailPage';
import ClientsPage from '@clients/pages/ClientsPage';
import MobileResponsiveTest from '@components/MobileResponsiveTest';
import MobileTestPage from '@components/MobileTestPage';
import ModalManager from '@components/ModalManager';
import NotificationContainer from '@components/NotificationContainer';
// import UIConfigDebug from '@components/UIConfigDebug';
import { useDashboardState } from '@hooks/useDashboardState';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useClientStore } from '@stores/clientStore';
import React, { Suspense, lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProfilePage from '../auth/pages/ProfilePage';
import { User } from '../auth/types';
import { getMenuConfig } from './config/menuConfig';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import MobileBottomNav from './MobileBottomNav';
const InvoicesPage = lazy(() => import('@invoices/pages/InvoicesPage'));
const OpticsInvoicesPage = lazy(() => import('@invoices/pages/OpticsInvoicesPage'));

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { state, actions } = useDashboardState();
  const location = useLocation();
  const { t } = useTranslation();
  const _clientStore = useClientStore();
  const [lastSection, setLastSection] = useLocalStorage<'appointments' | 'clients'>('dashboard.lastSection', 'appointments');
  const [savedViewMode, setSavedViewMode] = useLocalStorage<'day' | 'week' | 'month'>('dashboard.viewMode', 'day');
  
  const menuConfig = getMenuConfig();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    onLogout();
  };

  const [mobileSidebarVisible, setMobileSidebarVisible] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/clients')) {
      actions.setActiveSection('clients');
    } else {
      actions.setActiveSection('appointments');
    }
  }, [location.pathname, actions]);

  useEffect(() => {
    if (lastSection && lastSection !== state.activeSection) {
      actions.setActiveSection(lastSection);
    }
    if (savedViewMode && savedViewMode !== state.viewMode) {
      actions.setViewMode(savedViewMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLastSection(state.activeSection as 'appointments' | 'clients');
  }, [state.activeSection, setLastSection]);

  useEffect(() => {
    setSavedViewMode(state.viewMode as 'day' | 'week' | 'month');
  }, [state.viewMode, setSavedViewMode]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header - caché sur mobile, visible sur desktop */}
      <div className="hidden lg:block">
        <DashboardHeader
          user={user}
          onMenuToggle={() => {
            setMobileSidebarVisible(true);
            setTimeout(() => setMobileSidebarOpen(true), 0);
          }}
        />
      </div>

      <main className="pt-0 lg:pt-[4.75rem] xl:pt-28 pb-20 lg:pb-6 lg:pl-72">
        <div className="px-0 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <div className="hidden lg:block fixed inset-y-0 left-0 w-72 z-10">
            <DashboardSidebar onLogout={handleLogout} />
          </div>

          {mobileSidebarVisible && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
              <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => { setMobileSidebarOpen(false); setTimeout(() => setMobileSidebarVisible(false), 300); }}
              />
              <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">{t('common.menu')}</h2>
                    <button 
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                      onClick={() => { setMobileSidebarOpen(false); setTimeout(() => setMobileSidebarVisible(false), 300); }} 
                      aria-label={t('common.close')}
                    >
                      <Icon name="x" className="w-5 h-5" size="md" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <DashboardSidebar
                      variant="drawer"
                      onLogout={() => { handleLogout(); setMobileSidebarOpen(false); setTimeout(() => setMobileSidebarVisible(false), 300); }}
                      onLinkClick={() => { setMobileSidebarOpen(false); setTimeout(() => setMobileSidebarVisible(false), 300); }}
                      menuConfig={menuConfig}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <section className="w-full max-w-7xl mx-auto">
            <Routes>
              <Route index element={<AppointmentsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="clients" element={<div className="space-y-6 mb-6"><ClientsPage /></div>} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="invoices" element={<div className="space-y-6 mb-6"><Suspense fallback={<div className="p-4 text-sm text-gray-500">{t('common.loading')}</div>}><InvoicesPage /></Suspense></div>} />
              <Route path="optics-invoices" element={<div className="space-y-6 mb-6"><Suspense fallback={<div className="p-4 text-sm text-gray-500">{t('common.loading')}</div>}><OpticsInvoicesPage /></Suspense></div>} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="mobile-test" element={<MobileTestPage />} />
              <Route path="mobile-responsive-test" element={<MobileResponsiveTest />} />
              <Route path="*" element={<Navigate to="/appointments" replace />} />
            </Routes>
          </section>
          </div>
      </main>
      
      {/* Debug component - désactivé */}
      {/* <UIConfigDebug /> */}
      
      {/* Container des notifications */}
      <NotificationContainer />
      
      {/* Gestionnaire des modales */}
      <ModalManager />
      
      {/* Navigation mobile en bas */}
      <MobileBottomNav menuConfig={menuConfig} />
    </div>
  );
};

export default Dashboard;


