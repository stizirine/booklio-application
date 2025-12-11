import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { STATISTICS_CONFIG } from '../constants';
import { useInvoiceStatistics } from '../hooks/useInvoiceStatistics';
import { Invoice } from '../types';

interface InvoiceStatisticsProps {
  invoices: Invoice[];
  currency?: string;
  className?: string;
}

const InvoiceStatistics: React.FC<InvoiceStatisticsProps> = ({
  invoices,
  currency = 'EUR',
  className = '',
}) => {
  const { t } = useTranslation();
  const stats = useInvoiceStatistics(invoices);

  // Obtenir la valeur d'une stat (gère le cas spécial de draft qui affiche draftAmount)
  const getStatValue = (key: string): number => {
    if (key === 'draft') {
      return stats.draftAmount;
    }
    return stats[key as keyof typeof stats] as number;
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-1.5 ${className}`}>
      {STATISTICS_CONFIG.map((config) => (
        <div
          key={config.key}
          className="bg-white rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1 min-w-0">
            <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={config.icon as any} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" size="xs" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-xs sm:text-base font-bold ${config.textColor} leading-tight`}>
                {getStatValue(config.key).toFixed(2)}
              </div>
              <div className="text-[8px] sm:text-[9px] font-medium text-gray-500 truncate leading-tight">
                {t(config.translationKey)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500 pt-0.5 sm:pt-1 border-t border-gray-100">
            <span>{currency}</span>
            {config.showCount && (
              <span className="font-semibold text-gray-700">
                {config.key === 'total' ? stats.count : stats.draft}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceStatistics;
