import { StatisticsConfig } from '@src/features/appointments/utils/statisticsConfig';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatisticsGridProps {
  statisticsConfig: StatisticsConfig[];
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({ statisticsConfig }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
      <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 min-w-max sm:min-w-0">
        {statisticsConfig.map((stat) => (
          <div 
            key={stat.key}
            className={`${stat.bgColor} rounded-[var(--radius-md)] p-2 sm:p-3 lg:p-4 text-center shadow-sm border ${stat.borderColor} transition-all hover:shadow-card min-w-[80px] sm:min-w-0 flex-shrink-0 sm:flex-shrink`}
          >
            <div className={`text-base sm:text-lg lg:text-xl font-bold ${stat.color} mb-0.5 sm:mb-1`}>
              {stat.value}
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-muted)] font-semibold leading-tight uppercase tracking-wide">
              {t(stat.label)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsGrid;
