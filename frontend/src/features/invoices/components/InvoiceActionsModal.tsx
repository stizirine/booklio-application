import { Icon } from '@assets/icons';
import { Badge, Button } from '@components/ui';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { INVOICE_ACTIONS_CONFIG, INVOICE_STATUS_CONFIG, InvoiceStatusEnum } from '../constants';
import { useInvoicePermissions } from '../hooks/useInvoicePermissions';
import { Invoice } from '../types';

interface InvoiceActionsModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onEdit: () => void;
  onSend: () => void;
  onDelete: () => void;
  onAddPayment?: () => void;
  onDownloadPDF?: () => void;
  loading?: boolean;
}

const InvoiceActionsModal: React.FC<InvoiceActionsModalProps> = ({
  open,
  invoice,
  onClose,
  onEdit,
  onSend,
  onDelete,
  onAddPayment,
  onDownloadPDF,
  loading = false,
}) => {
  const { t } = useTranslation();
  const permissions = useInvoicePermissions(invoice);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (open) containerRef.current?.focus(); }, [open]);

  // Mapper les actions aux handlers
  const actionHandlers = useMemo(() => ({
    edit: onEdit,
    send: onSend,
    addPayment: onAddPayment,
    downloadPDF: onDownloadPDF,
    delete: onDelete,
  }), [onEdit, onSend, onAddPayment, onDownloadPDF, onDelete]);

  // Ne pas retourner avant les hooks; on gère l'absence d'open/invoice plus bas

  // Préparer le formateur monétaire (doit être avant tout early return)
  const currency = (invoice?.currency as string) || 'EUR';
  const money = useMemo(() => {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }); }
    catch { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }); }
  }, [currency]);

  // Filtrer les actions affichables selon les permissions et handlers disponibles
  const availableActions = INVOICE_ACTIONS_CONFIG.filter((action) => {
    const hasPermission = permissions[action.permissionKey];
    const hasHandler = actionHandlers[action.key as keyof typeof actionHandlers] !== undefined;
    return hasPermission && hasHandler;
  });

  if (!open || !invoice) return null;

  // Obtenir la configuration du statut et les montants (invoice garanti non null ici)
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as InvoiceStatusEnum];
  const _statusColorClass = `${statusConfig.bgClass} ${statusConfig.textClass}`;
  const total = Number(invoice.total ?? 0);
  const balanceDue = invoice.balanceDue !== undefined ? Number(invoice.balanceDue) : Math.max(total - Number(invoice.advanceAmount || 0) - Number(invoice.creditAmount || 0), 0);
  const paidAmount = Math.max(total - balanceDue, 0);
  const paidPct = total > 0 ? Math.min(100, Math.max(0, Math.round((paidAmount / total) * 100))) : 0;

  

  // Tronquer l'ID de facture sur mobile
  const invoiceId = invoice.number || invoice.id || '';
  const displayId = invoiceId.length > 20 ? `${invoiceId.substring(0, 12)}...${invoiceId.substring(invoiceId.length - 6)}` : invoiceId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-2 sm:p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="invoice-actions-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={containerRef} tabIndex={-1} className="bg-white w-full max-w-md rounded-lg sm:rounded-xl shadow-2xl p-3 sm:p-4 lg:p-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Icon name="tag" className="text-white w-4 h-4 sm:w-5 sm:h-5" size="xs" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="invoice-actions-title" className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate" title={invoiceId}>
                {displayId}
              </h2>
              <p className="mt-0.5 sm:mt-1">
                <Badge variant="info" size="xs" className="sm:hidden">
                  {t(`invoices.status.${invoice.status}`).substring(0, 3)}
                </Badge>
                <Badge variant="info" size="sm" className="hidden sm:inline-flex">
                  {t(`invoices.status.${invoice.status}`)}
                </Badge>
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="x" className="w-4 h-4 sm:w-5 sm:h-5" size="xs" />}
            aria-label={t('common.close')}
            className="flex-shrink-0"
          />
        </div>

        {/* Détails de la facture */}
        <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 mb-3 sm:mb-4 border border-gray-200 shadow-sm">
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{t('invoices.client', { defaultValue: 'Client' })}</span>
              <span className="font-semibold text-gray-900 truncate ml-2 text-right">{invoice.client?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{t('invoices.total', { defaultValue: 'Total' })}</span>
              <span className="font-bold text-gray-900">{money.format(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{t('invoices.paid', { defaultValue: 'Payé' })}</span>
              <span className="font-semibold text-green-600">{money.format(paidAmount)} <span className="text-gray-500">({paidPct}%)</span></span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">{t('invoices.due', { defaultValue: 'Dû' })}</span>
                <span className="font-semibold text-amber-600">{money.format(balanceDue)}</span>
              </div>
            )}
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="h-1 sm:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${paidPct === 100 ? 'bg-green-500' : paidPct > 0 ? 'bg-amber-500' : 'bg-gray-400'} transition-all duration-300`} 
                style={{ width: `${paidPct}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 sm:space-y-2.5">
          {/* Actions dynamiques basées sur les permissions */}
          {availableActions.map((action) => {
            const handler = actionHandlers[action.key as keyof typeof actionHandlers];
            if (!handler) return null;

            // Variant différent selon l'action
            const buttonVariant = action.key === 'delete' ? 'danger' : action.key === 'addPayment' ? 'gradient' : 'gradient';

            return (
              <Button
                key={action.key}
                onClick={handler}
                disabled={loading}
                variant={buttonVariant as any}
                size="md"
                className="w-full text-xs sm:text-sm"
                leftIcon={<Icon name={action.icon as any} className="w-3.5 h-3.5 sm:w-4 sm:h-4" size="xs" />}
              >
                {loading && action.key === 'send' ? t('common.loading') : t(action.translationKey)}
              </Button>
            );
          })}

          {/* Annuler - Toujours visible */}
          <Button
            onClick={onClose}
            disabled={loading}
            variant="secondary"
            size="md"
            className="w-full text-xs sm:text-sm"
          >
            {t('common.cancel')}
          </Button>
        </div>

        {/* Info - Actions limitées */}
        {availableActions.length < 3 && (
          <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <Icon name="info" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" size="xs" />
              <p className="text-xs sm:text-sm text-blue-700">
                {t('invoices.actionsLimited', { defaultValue: 'Actions limitées pour cette facture' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(InvoiceActionsModal);
