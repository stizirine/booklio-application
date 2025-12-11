import { Icon } from '@assets/icons';
import { Button, Field, Input, Select, Textarea } from '@components/ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CURRENCIES, PAYMENT_METHODS } from '../constants';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { Invoice, InvoiceCreatePayload, InvoiceUpdatePayload } from '../types';

interface InvoiceFormModalProps {
  open: boolean;
  invoice?: Invoice | null;
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSubmit: (data: InvoiceCreatePayload | InvoiceUpdatePayload) => Promise<void>;
  loading?: boolean;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  open,
  invoice,
  clientId,
  clientName,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { formData, balanceDue, updateField, handleSubmit, validationError } = useInvoiceForm({
    invoice,
    clientId,
    open,
    onSubmit,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (open) containerRef.current?.focus(); }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2 sm:p-4 animate-in fade-in duration-200" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} role="dialog" aria-modal="true" aria-labelledby="invoice-form-title">
      <div ref={containerRef} tabIndex={-1} className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-3 sm:p-4 pb-2 sm:pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Icon name="tag" className="w-4 h-4 sm:w-5 sm:h-5 text-white" size="xs" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="invoice-form-title" className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                {invoice ? t('invoices.edit') : t('invoices.create')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {t('invoices.for')} {clientName}
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

        {/* Zone scrollable - Formulaire */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Affichage des erreurs de validation */}
          {validationError && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Montant total */}
          <Field label={<>{t('invoices.totalAmount')} *</>} htmlFor="invoice-total">
            <div className="relative">
              <Input
                id="invoice-total"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount as any}
                onChange={(e) => updateField('totalAmount', e.target.value)}
                placeholder="0.00"
                required
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                {formData.currency}
              </span>
            </div>
          </Field>

          {/* Avance */}
          <Field label={t('invoices.advanceAmount')} htmlFor="invoice-advance" help={t('invoices.advanceHint')}>
            <div className="relative">
              <Input
                id="invoice-advance"
                type="number"
                step="0.01"
                min="0"
                max={formData.totalAmount as any}
                value={formData.advanceAmount as any}
                onChange={(e) => updateField('advanceAmount', e.target.value)}
                placeholder="0.00"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                {formData.currency}
              </span>
            </div>
          </Field>

          {/* Méthode de paiement pour l'avance - Toujours visible */}
          <Field label={t('invoices.advanceMethod')} htmlFor="invoice-advance-method" help={
            <span className="flex items-center gap-1"><Icon name="info" className="w-3 h-3" size="xs" />{t('invoices.advanceMethodHint')}</span>
          }>
            <Select
              id="invoice-advance-method"
              value={formData.advanceMethod as any}
              onChange={(e) => updateField('advanceMethod', e.target.value as any)}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {t(`invoices.payment.methods.${method}`)}
                </option>
              ))}
            </Select>
          </Field>

          {/* Solde restant */}
          {formData.totalAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  {t('invoices.balanceDue')}
                </span>
                <span className="text-base sm:text-lg font-bold text-indigo-600">
                  {balanceDue.toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          )}

          {/* Devise */}
          <Field label={t('invoices.currency')} htmlFor="invoice-currency">
            <Select
              id="invoice-currency"
              value={formData.currency}
              onChange={(e) => updateField('currency', e.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* Notes */}
          <Field label={t('invoices.notes')} htmlFor="invoice-notes">
            <Textarea
              id="invoice-notes"
              value={formData.notes as any}
              onChange={(e) => updateField('notes', (e.target as HTMLTextAreaElement).value)}
              rows={4}
              placeholder={t('invoices.notesPlaceholder') as string}
            />
          </Field>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <Icon name="info" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" size="xs" />
              <div className="text-xs sm:text-sm text-blue-700">
                <p className="font-semibold mb-0.5 sm:mb-1">{t('invoices.howItWorks')}</p>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                  <li>{t('invoices.step1')}</li>
                  <li>{t('invoices.step2')}</li>
                  <li>{t('invoices.step3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
        </div>

        {/* Actions - Fixed en bas */}
        <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="secondary"
              size="md"
              className="flex-1 text-xs sm:text-sm"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              variant="gradient"
              size="md"
              className="flex-1 text-xs sm:text-sm"
              leftIcon={<Icon name="check-circle" className="w-3.5 h-3.5 sm:w-4 sm:h-4" size="xs" />}
            >
              {loading ? t('common.loading') : (invoice ? t('common.save') : t('invoices.create'))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InvoiceFormModal);
