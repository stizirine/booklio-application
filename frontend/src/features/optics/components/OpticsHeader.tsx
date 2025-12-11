import Icon from '@assets/icons/Icon';
import React from 'react';

interface OpticsHeaderProps {
  title: string;
  onCreate: () => void;
  onMeasure?: () => void;
  onPrint?: () => void;
  clientName?: string;
  onCreateLabel: string;
  onMeasureLabel: string;
  onPrintLabel: string;
}

export const OpticsHeader: React.FC<OpticsHeaderProps> = ({
  title,
  onCreate,
  onMeasure,
  onPrint,
  clientName,
  onCreateLabel,
  onMeasureLabel,
  onPrintLabel,
}) => {
  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-1.5 sm:py-2 -mt-1.5 sm:-mt-2 mb-2 sm:mb-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
          <Icon name="eye" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <span className="truncate">{title}</span>
        </h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
          <button 
            onClick={onCreate} 
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-800 transition-colors flex-1 sm:flex-initial"
          >
            <Icon name="document-text" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate">{clientName ? `${onCreateLabel} ${clientName}` : onCreateLabel}</span>
          </button>
          {onMeasure && (
            <button 
              onClick={onMeasure} 
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-800 transition-colors flex-1 sm:flex-initial"
            >
              <Icon name="adjustments" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">{clientName ? `${onMeasureLabel} ${clientName}` : onMeasureLabel}</span>
            </button>
          )}
          {onPrint && (
            <button 
              onClick={onPrint} 
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-800 transition-colors flex-1 sm:flex-initial"
            >
              <Icon name="printer" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">{onPrintLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
