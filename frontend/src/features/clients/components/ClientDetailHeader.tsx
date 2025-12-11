import Icon from '@assets/icons/Icon';
import React from 'react';
import { useClientDetail } from '../context/ClientDetailContext';

const ClientDetailHeader: React.FC = () => {
  const { t, onClose } = useClientDetail();
  const title = t('clients.title');
  const subtitle = t('clients.manageInfo');
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Icon name="user-circle" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
      >
        <Icon name="x" className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default ClientDetailHeader;


