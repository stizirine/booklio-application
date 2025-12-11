import { Icon } from '@assets/icons';
import React from 'react';

interface StatisticsToggleButtonProps {
  showDetails: boolean;
  appointmentsCount: number;
  onToggleDetails: () => void;
}

const StatisticsToggleButton: React.FC<StatisticsToggleButtonProps> = ({
  showDetails,
  appointmentsCount,
  onToggleDetails
}) => {
  // No translation used here; remove unused hook

  if (appointmentsCount === 0) return null;

  return (
    <button
      onClick={onToggleDetails}
      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <Icon 
        name="chevron-down" 
        className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} 
        size="sm" 
      />
    </button>
  );
};

export default StatisticsToggleButton;
