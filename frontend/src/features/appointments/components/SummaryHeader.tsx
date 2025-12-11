import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SummaryHeaderProps {
  titleKey: string;
  dateRange: string;
  icon: string;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  titleKey,
  dateRange,
  icon
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <Icon name={icon} className="text-white text-lg" size="lg" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          {t(titleKey)}
        </h3>
        <p className="text-sm text-gray-500">
          {dateRange}
        </p>
      </div>
    </div>
  );
};

export default SummaryHeader;
