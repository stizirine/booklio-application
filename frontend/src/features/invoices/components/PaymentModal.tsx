import { Icon } from '@assets/icons';
import ConfirmationModal from '@components/ConfirmationModal';
import { Button, Field, Input, Select, Textarea } from '@components/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, PaymentCreatePayload } from '../types';

// Sous-composant: boutons de montants rapides
type QuickAmountButtonsProps = {
  onSelect: (percentage: number) => void;
};

const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({ onSelect }) => {
  return (
    <div className="flex gap-2 mt-2">
      <Button type="button" onClick={() => onSelect(25)} variant="secondary" size="sm" className="flex-1">25%</Button>
      <Button type="button" onClick={() => onSelect(50)} variant="secondary" size="sm" className="flex-1">50%</Button>
      <Button type="button" onClick={() => onSelect(75)} variant="secondary" size="sm" className="flex-1">75%</Button>
      <Button type="button" onClick={() => onSelect(100)} variant="warning" size="sm" className="flex-1">100%</Button>
    </div>
  );
};

// Sous-composant: section d'historique des paiements
type PaymentHistorySectionProps = {
  invoice: Invoice;
  showHistory: boolean;
  onToggle: () => void;
  onDeletePayment?: (paymentId: string) => void;
};

const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({ invoice, showHistory, onToggle, onDeletePayment }) => {
  const { t } = useTranslation();
  const totalPaid = useMemo(() => (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0), [invoice.payments]);

  if (!invoice.payments || invoice.payments.length === 0) return null;

  return (
    <div className="mb-6">
      {/* En-tête: Titre et résumé à gauche, bouton toggle à droite */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Icon name="clock" className="w-4 h-4 text-white" size="sm" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">
              {t('invoices.payment.history')}
            </div>
            <div className="text-xs text-gray-500">
              {invoice.payments.length} paiement{invoice.payments.length > 1 ? 's' : ''} • {totalPaid.toFixed(2)} {invoice.currency}
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={onToggle}
          variant="secondary"
          size="sm"
          className="!px-2"
          aria-label={showHistory ? (t('common.hide') as string) : (t('common.show') as string)}
        >
          <Icon name={showHistory ? 'chevron-up' : 'chevron-down'} className="w-5 h-5" size="sm" />
        </Button>
      </div>

      {showHistory && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {invoice.payments.map((payment, index) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-gray-900">
                      {payment.amount.toFixed(2)} {invoice.currency}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                      <Icon name="tag" className="w-3 h-3" size="xs" />
                      {t(`invoices.payment.methods.${payment.method}`)}
                    </span>
                    {index === (invoice.payments?.length || 0) - 1 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                        DERNIER
                      </span>
                    )}
                  </div>
                  {payment.reference && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Icon name="document-text" className="w-3 h-3 text-gray-400" size="xs" />
                      <span className="text-xs text-gray-600 font-medium">
                        Réf: <span className="font-mono">{payment.reference}</span>
                      </span>
                    </div>
                  )}
                  {payment.note && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <Icon name="info" className="w-3 h-3 text-gray-400 mt-0.5" size="xs" />
                      <span className="text-xs text-gray-500 italic line-clamp-2">
                        {payment.note}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Icon name="clock" className="w-3 h-3 text-gray-400" size="xs" />
                    <span className="text-xs text-gray-400">
                      {new Date(payment.date).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                {onDeletePayment && (
                  <Button
                    type="button"
                    onClick={() => onDeletePayment(payment.id)}
                    variant="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    leftIcon={<Icon name="trash" className="w-4 h-4" size="sm" />}
                    aria-label={t('invoices.payment.deletePayment') as string}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface PaymentModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSubmit: (payload: PaymentCreatePayload) => Promise<void>;
  onDeletePayment?: (paymentId: string) => Promise<void>;
  loading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  invoice,
  onClose,
  onSubmit,
  onDeletePayment,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'check' | 'other'>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState<boolean>(!!(invoice?.payments && invoice.payments.length > 0));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour showHistory quand l'invoice change (après ajout/suppression de paiement)
  useEffect(() => {
    if (invoice?.payments && invoice.payments.length > 0) {
      setShowHistory(true);
    } else if (invoice?.payments && invoice.payments.length === 0) {
      setShowHistory(false);
    }
  }, [invoice?.payments, invoice?.payments?.length]);

  const balanceDue = invoice?.balanceDue ?? invoice?.total ?? 0;
  const maxAmount = Math.max(0, balanceDue);
  const paymentIdsKey = useMemo(() => (invoice?.payments || []).map(p => p.id).sort().join(','), [invoice?.payments]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('invoices.payment.invalidAmount'));
      return;
    }

    if (amountNum > maxAmount) {
      setError(t('invoices.payment.amountTooHigh', { max: maxAmount.toFixed(2) }));
      return;
    }

    try {
      const payload: PaymentCreatePayload = {
        amount: amountNum,
        method,
        reference: reference || undefined,
        notes: notes || undefined,
      };

      await onSubmit(payload);
      // Reset form
      setAmount('');
      setMethod('cash');
      setReference('');
      setNotes('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  }, [amount, method, reference, notes, maxAmount, onSubmit, t]);

  const handleDeletePaymentClick = useCallback((paymentId: string) => {
    if (!onDeletePayment) return;
    setPaymentToDelete(paymentId);
    setShowDeleteConfirmation(true);
  }, [onDeletePayment]);

  const handleConfirmDeletePayment = useCallback(async () => {
    if (!onDeletePayment || !paymentToDelete) return;
    
    try {
      await onDeletePayment(paymentToDelete);
      setShowDeleteConfirmation(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      setError(err?.message || t('invoices.payment.deleteError'));
      setShowDeleteConfirmation(false);
      setPaymentToDelete(null);
    }
  }, [onDeletePayment, paymentToDelete, t]);

  const handleQuickAmount = useCallback((percentage: number) => {
    const quickAmount = (maxAmount * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  }, [maxAmount]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (open) containerRef.current?.focus(); }, [open]);

  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={containerRef} tabIndex={-1} className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Icon name="tag" className="w-5 h-5 text-white" size="sm" />
            </div>
            <div>
              <h2 id="payment-modal-title" className="text-xl font-bold text-gray-900">
                {t('invoices.payment.addPayment')}
              </h2>
              <p className="text-sm text-gray-500">
                {invoice.number || invoice.id}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="x" className="w-5 h-5" size="sm" />}
            aria-label={t('common.close')}
          />
        </div>

        {/* Détails de la facture - Fixed */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('invoices.total')}</span>
              <span className="font-semibold text-gray-900">
                {invoice.total?.toFixed(2)} {invoice.currency}
              </span>
            </div>
            {invoice.advanceAmount && invoice.advanceAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t('invoices.payment.paidAmount')}</span>
                <span className="font-semibold">
                  -{invoice.advanceAmount.toFixed(2)} {invoice.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-semibold text-gray-900">{t('invoices.balanceDue')}</span>
              <span className="font-bold text-indigo-600 text-lg">
                {balanceDue.toFixed(2)} {invoice.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Zone scrollable - Historique + Formulaire */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Historique des paiements - Collapsible */}
          <PaymentHistorySection
            key={paymentIdsKey}
            invoice={invoice}
            showHistory={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
            onDeletePayment={onDeletePayment ? (pid) => handleDeletePaymentClick(pid) : undefined}
          />

          {/* Affichage des erreurs */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Montant */}
          <Field label={<>{t('invoices.payment.amount')} *</>} htmlFor="payment-amount">
            <div className="relative">
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('invoices.payment.enterAmount') as string}
                required
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                {invoice.currency}
              </span>
            </div>

            {/* Boutons de montant rapide */}
            <QuickAmountButtons onSelect={handleQuickAmount} />
          </Field>

          {/* Méthode de paiement */}
          <Field label={<>{t('invoices.payment.method')} *</>} htmlFor="payment-method">
            <Select
              id="payment-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              required
            >
              <option value="cash">{t('invoices.payment.methods.cash')}</option>
              <option value="card">{t('invoices.payment.methods.card')}</option>
              <option value="transfer">{t('invoices.payment.methods.transfer')}</option>
              <option value="check">{t('invoices.payment.methods.check')}</option>
              <option value="other">{t('invoices.payment.methods.other')}</option>
            </Select>
          </Field>

          {/* Référence */}
          <Field label={t('invoices.payment.reference')} htmlFor="payment-reference" help={t('invoices.payment.referenceHint')}>
            <Input
              id="payment-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('invoices.payment.referencePlaceholder') as string}
            />
          </Field>

          {/* Note */}
          <Field label={t('invoices.payment.note')} htmlFor="payment-note">
            <Textarea
              id="payment-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t('invoices.payment.notePlaceholder') as string}
            />
          </Field>

          </form>
        </div>

        {/* Actions - Fixed en bas */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              variant="gradient"
              size="md"
              className="flex-1"
              leftIcon={<Icon name="check-circle" className="w-4 h-4" size="sm" />}
            >
              {loading ? t('common.loading') : t('invoices.payment.addPayment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setPaymentToDelete(null);
        }}
        onConfirm={handleConfirmDeletePayment}
        title={t('invoices.payment.confirmDelete')}
        message={t('invoices.payment.confirmDelete')}
        type="danger"
      />
    </div>
  );
};

// Retirer React.memo pour permettre les re-renders quand invoice change
// La performance est moins importante que l'actualisation correcte de la liste
export default PaymentModal;
