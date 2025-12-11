import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import React from 'react';
import { Invoice } from '../types';

interface InvoiceCardActionsProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onShare?: (invoice: Invoice) => void;
}

const InvoiceCardActions: React.FC<InvoiceCardActionsProps> = ({
  invoice,
  onView,
  onShare,
}) => {
  return (
    <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onView?.(invoice);
        }}
        leftIcon={<Icon name="eye" className="w-3.5 h-3.5 sm:w-4 sm:h-4" size="xs" />}
        disabled={!onView}
        className="min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm"
      >
        Détails
      </Button>
      <Button
        variant="gradient"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onShare?.(invoice);
        }}
        leftIcon={<Icon name="share" className="w-3.5 h-3.5 sm:w-4 sm:h-4" size="xs" />}
        disabled={!onShare}
        className="min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm"
      >
        Partager
      </Button>
    </div>
  );
};

export default InvoiceCardActions;

