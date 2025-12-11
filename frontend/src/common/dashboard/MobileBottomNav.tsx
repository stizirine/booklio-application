import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { defaultMenuConfig, MenuConfig, MenuItem, menuItems } from './config/menuConfig';

interface MobileBottomNavProps {
  menuConfig?: MenuConfig;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ menuConfig = {} }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname || '/';
  const config = { ...defaultMenuConfig, ...menuConfig };
  
  // Filtrer les éléments visibles selon la configuration
  const visibleMenuItems = menuItems.filter(item => config[item.id as keyof MenuConfig] === true);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden safe-area-bottom">
      <nav className="flex items-center justify-around h-16 px-1 sm:px-2">
        {visibleMenuItems.map((item: MenuItem) => {
          const isActive = item.isActive(path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full space-y-0.5 sm:space-y-1
                transition-all duration-300 min-w-0
                ${isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-lg grid place-items-center 
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-blue-100 shadow-sm scale-110' 
                  : 'bg-transparent scale-100'
                }
              `}>
                <Icon 
                  name={item.icon as any} 
                  className={`${isActive ? 'w-5 h-5 sm:w-6 sm:h-6 text-blue-600' : 'w-4 h-4 sm:w-5 sm:h-5'} transition-all duration-300 ${item.className || ''}`}
                  size="sm" 
                />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold truncate max-w-[70px] sm:max-w-[80px] transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
