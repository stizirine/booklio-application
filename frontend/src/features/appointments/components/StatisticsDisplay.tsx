import React from 'react';
import { StatisticsConfig } from '../utils/statisticsConfig';
import StatisticsGrid from './StatisticsGrid';
import StatisticsToggleButton from './StatisticsToggleButton';

interface StatisticsDisplayProps {
  statisticsConfig: StatisticsConfig[];
  showDetails: boolean;
  onToggleDetails: () => void;
  appointmentsCount: number;
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  statisticsConfig,
  showDetails,
  onToggleDetails,
  appointmentsCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <StatisticsGrid statisticsConfig={statisticsConfig} />
      
      <StatisticsToggleButton
        showDetails={showDetails}
        appointmentsCount={appointmentsCount}
        onToggleDetails={onToggleDetails}
      />
    </div>
  );
};

export default StatisticsDisplay;
