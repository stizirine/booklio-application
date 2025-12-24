import VirtualizedList from '@components/VirtualizedList';
import { Button } from '@components/ui';
import React from 'react';
import { OpticsRecord } from '../types';
import { formatEp } from '../utils';

interface OpticsHistoryProps {
  records: OpticsRecord[];
  onView: (record: OpticsRecord) => void;
  onEdit?: (record: OpticsRecord) => void;
  canManage?: boolean;
  t: (key: string, params?: any) => string;
  noRecordsLabel: string;
  historyLabel: string;
  viewLabel: string;
  editLabel: string;
  historyLineTemplate: string;
}

export const OpticsHistory: React.FC<OpticsHistoryProps> = ({
  records,
  onView,
  onEdit,
  canManage = false,
  t,
  noRecordsLabel,
  historyLabel,
  viewLabel,
  editLabel,
  historyLineTemplate,
}) => {
  return (
    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg border border-gray-200">
      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">{historyLabel}</h3>
      {records.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-500">{noRecordsLabel}</div>
      ) : (
        <VirtualizedList
          items={records}
          rowHeight={56}
          density="compact"
          overscan={6}
          className="max-h-64 sm:max-h-80"
          renderRow={(r) => (
            <div key={r.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {new Date(r.updatedAt || r.createdAt).toLocaleString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-gray-600 truncate">
                  {t(historyLineTemplate, { 
                    od: r.sphereRight || '—', 
                    og: r.sphereLeft || '—', 
                    ep: r.ep ? `· EP ${formatEp(r.ep as any)}` : '' 
                  })}
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                <Button onClick={() => onView(r)} variant="secondary" size="sm" className="text-[10px] sm:text-xs px-2 sm:px-2.5">
                  {viewLabel}
                </Button>
                {canManage && onEdit && (
                  <Button onClick={() => onEdit(r)} variant="secondary" size="sm" className="text-[10px] sm:text-xs px-2 sm:px-2.5">
                    {editLabel}
                  </Button>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};
