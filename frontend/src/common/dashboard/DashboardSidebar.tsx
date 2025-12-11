import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { defaultMenuConfig, MenuConfig, MenuItem, menuItems } from './config/menuConfig';

interface DashboardSidebarProps {
  onLogout?: () => void;
  variant?: 'desktop' | 'drawer';
  onLinkClick?: () => void;
  menuConfig?: MenuConfig;
}

const MenuItemComponent: React.FC<{ item: MenuItem; isActive: boolean; onClick?: () => void; }> = ({ item, isActive, onClick }) => {
  const { t } = useTranslation();
  return (
    <Link to={item.path} onClick={onClick} className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      <Icon name={item.icon} className={`w-5 h-5 ${item.className || ''}`} size="sm" />
      {t(item.labelKey)}
    </Link>
  );
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onLogout, variant = 'desktop', onLinkClick, menuConfig = {} }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname || '/';
  const config = { ...defaultMenuConfig, ...menuConfig };
  const handleLinkClick = () => { if (onLinkClick) onLinkClick(); };
  const visibleMenuItems = menuItems.filter(item => config[item.id as keyof MenuConfig] === true);

  if (variant === 'drawer') {
    return (
      <div className="h-full flex flex-col bg-white">
        <nav className="space-y-2 p-4">
          {visibleMenuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} isActive={item.isActive(path)} onClick={handleLinkClick} />
          ))}
        </nav>
        {onLogout && (
          <div className="mt-auto p-4 border-t border-gray-200">
            <button onClick={onLogout} className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 inline-flex items-center gap-3">
              <Icon name="logout" className="h-5 w-5" size="sm" />
              {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="hidden lg:block bg-white border-r border-gray-200 fixed top-0 left-0 z-30 w-72 h-full overflow-auto">
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.title')}</h2>
        </div>
        <nav className="space-y-2 flex-1 p-4">
          {visibleMenuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} isActive={item.isActive(path)} />
          ))}
        </nav>
        {onLogout && (
          <div className="mt-auto p-4 border-t border-gray-200">
            <button onClick={onLogout} className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 inline-flex items-center gap-3">
              <Icon name="logout" className="h-5 w-5" size="sm" />
              {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;


