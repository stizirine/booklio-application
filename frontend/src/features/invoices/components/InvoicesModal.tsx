import { Icon } from '@assets/icons';
import ConfirmationModal from '@components/ConfirmationModal';
import VirtualizedList from '@components/VirtualizedList';
import { Button } from '@components/ui';
import { Invoice, InvoiceActionsModal, InvoiceCard, PaymentModal } from '@features/invoices';
import { deletePayment } from '@invoices/api/invoices.api';
import { InvoiceActionHandlers } from '@invoices/components/types';
import { useInvoiceStore } from '@stores/invoiceStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InvoicesModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  /**
   * Callback optionnel pour ouvrir la modal d'édition de facture
   * Si non fourni, aucun événement n'est déclenché
   */
  onEditInvoice?: (invoice: Invoice, clientId: string) => void;
  /**
   * Handlers d'actions optionnels. Si non fournis, le store sera utilisé comme fallback.
   */
  actions?: Partial<InvoiceActionHandlers>;
}

const InvoicesModal: React.FC<InvoicesModalProps> = ({
  open,
  onClose,
  clientId,
  clientName,
  onEditInvoice,
  actions: propActions
}) => {
  const { t } = useTranslation();
  // Sélecteurs optimisés du store
  const invoices = useInvoiceStore((s) => s.invoices);
  const loading = useInvoiceStore((s) => s.loading);
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices);
  const deleteInvoiceAction = useInvoiceStore((s) => s.deleteInvoiceAction);
  const sendInvoiceAction = useInvoiceStore((s) => s.sendInvoiceAction);
  const addPaymentAction = useInvoiceStore((s) => s.addPaymentAction);
  const deletePaymentAction = useInvoiceStore((s) => s.deletePaymentAction);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceActions, setShowInvoiceActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const hasLoadedRef = useRef(false);

  // Synchroniser paymentInvoice avec le store quand l'invoice est mise à jour
  useEffect(() => {
    if (!paymentInvoice || !showPaymentModal) return;
    
    const updatedInvoice = invoices.find(inv => inv.id === paymentInvoice.id);
    if (updatedInvoice) {
      // Comparer les IDs des paiements pour détecter un changement de manière fiable
      const currentPaymentIds = (paymentInvoice.payments || []).map(p => p.id).sort().join(',');
      const updatedPaymentIds = (updatedInvoice.payments || []).map(p => p.id).sort().join(',');
      
      // Comparer aussi le nombre pour détecter les suppressions
      const currentCount = paymentInvoice.payments?.length || 0;
      const updatedCount = updatedInvoice.payments?.length || 0;
      
      if (currentPaymentIds !== updatedPaymentIds || currentCount !== updatedCount) {
        setPaymentInvoice(updatedInvoice);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, showPaymentModal]);

  // Construire les actions avec fallback sur le store
  const actions = useMemo<Partial<InvoiceActionHandlers>>(() => ({
    edit: propActions?.edit,
    send: propActions?.send ?? (async (invoice: Invoice) => {
      await sendInvoiceAction(invoice.id);
      await fetchInvoices({ clientId });
    }),
    delete: propActions?.delete ?? (async (invoice: Invoice) => {
      await deleteInvoiceAction(invoice.id);
      await fetchInvoices({ clientId });
    }),
    addPayment: propActions?.addPayment,
    downloadPDF: propActions?.downloadPDF,
    deletePayment: propActions?.deletePayment ?? (async (invoiceId: string, paymentId: string) => {
      await deletePaymentAction(invoiceId, paymentId);
      await fetchInvoices({ clientId });
    }),
  }), [propActions, sendInvoiceAction, deleteInvoiceAction, deletePaymentAction, fetchInvoices, clientId]);

  // Charger les factures au montage de la modal (une seule fois)
  useEffect(() => {
    if (open && clientId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchInvoices({ clientId });
    }
    
    // Reset quand la modal se ferme
    if (!open) {
      hasLoadedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientId]);

  // Gestionnaires pour les actions de facture
  const handleInvoiceClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceActions(true);
  }, []);

  const handleCloseInvoiceActions = useCallback(() => {
    setShowInvoiceActions(false);
    setSelectedInvoice(null);
  }, []);

  const handleEditInvoice = useCallback(() => {
    if (!selectedInvoice) return;
    
    // Fermer la modal d'actions
    handleCloseInvoiceActions();
    
    // Appeler le callback si fourni
    if (onEditInvoice) {
      onEditInvoice(selectedInvoice, clientId);
    }
  }, [selectedInvoice, onEditInvoice, clientId, handleCloseInvoiceActions]);

  const handleSendInvoice = useCallback(async () => {
    if (!selectedInvoice || !actions.send) return;
    try {
      setActionLoading(true);
      await actions.send(selectedInvoice);
      handleCloseInvoiceActions();
    } catch (error) {
      console.error('Error sending invoice:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedInvoice, actions, handleCloseInvoiceActions]);

  const handleDeleteInvoice = useCallback(() => {
    if (!selectedInvoice) return;
    // Ouvrir la modal de confirmation
    setShowDeleteConfirmation(true);
  }, [selectedInvoice]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInvoice || !actions.delete) return;
    
    try {
      setActionLoading(true);
      setShowDeleteConfirmation(false);
      await actions.delete(selectedInvoice);
      handleCloseInvoiceActions();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedInvoice, actions, handleCloseInvoiceActions]);

  const handleAddPayment = useCallback(() => {
    if (!selectedInvoice || !actions.addPayment) return;
    
    // Fermer la modal d'actions
    handleCloseInvoiceActions();
    
    // Ouvrir la modal de paiement directement via l'état local
    setPaymentInvoice(selectedInvoice);
    setShowPaymentModal(true);
  }, [selectedInvoice, actions, handleCloseInvoiceActions]);

  const handleDownloadPDF = useCallback(async () => {
    if (!selectedInvoice || !actions.downloadPDF) return;
    try {
      setActionLoading(true);
      await actions.downloadPDF(selectedInvoice);
      handleCloseInvoiceActions();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedInvoice, actions, handleCloseInvoiceActions]);

  // Gestionnaires pour la modal de paiement
  const handlePaymentSubmit = useCallback(async (paymentData: any) => {
    if (!paymentInvoice) return;
    try {
      // Utiliser l'action du store
      if (addPaymentAction) {
        await addPaymentAction(paymentInvoice.id, paymentData);
      }
      
      // Rafraîchir la liste des factures
      await fetchInvoices({ clientId });
      
      // Fermer la modal de paiement
      setShowPaymentModal(false);
      setPaymentInvoice(null);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  }, [paymentInvoice, addPaymentAction, fetchInvoices, clientId]);

  const handleDeletePayment = useCallback(async (invoiceId: string, paymentId: string) => {
    if (!actions.deletePayment) return;
    try {
      // Appeler directement l'API pour obtenir la facture mise à jour immédiatement
      const result = await deletePayment(invoiceId, paymentId);
      
      // Mettre à jour paymentInvoice directement avec la réponse de l'API (nouvel objet)
      // Cela forcera le re-render de PaymentModal grâce à la fonction de comparaison personnalisée
      if (paymentInvoice?.id === invoiceId) {
        // Créer un nouvel objet pour forcer React à détecter le changement
        setPaymentInvoice({ ...result.invoice });
      }
      
      // Mettre à jour le store via l'action (pour synchroniser avec le reste de l'application)
      await actions.deletePayment(invoiceId, paymentId);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  }, [actions, paymentInvoice]);

  const handleClosePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
    setPaymentInvoice(null);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="bg-white rounded-t-2xl sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="tag" className="w-5 h-5 text-white" size="sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('invoices.title')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('invoices.for')} {clientName}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
              className="!p-2"
              leftIcon={<Icon name="x" className="w-5 h-5" size="sm" />}
              aria-label={t('common.close') as string}
            />
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-hidden p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-sm text-gray-600">{t('common.loading')}</span>
              </div>
            ) : invoices.length > 0 ? (
              <VirtualizedList
                items={invoices}
                rowHeight={120}
                density="compact"
                className="h-full"
                renderRow={(invoice) => (
                  <div className="pb-4">
                    <InvoiceCard
                      invoice={invoice}
                      onClick={() => handleInvoiceClick(invoice)}
                    />
                  </div>
                )}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Icon name="tag" className="w-16 h-16 mx-auto mb-4 text-gray-400" size="lg" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('invoices.noInvoices')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('invoices.noInvoicesDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end">
              <Button
                onClick={onClose}
                variant="secondary"
                size="md"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'actions de facture */}
      <InvoiceActionsModal
        open={showInvoiceActions}
        invoice={selectedInvoice}
        onClose={handleCloseInvoiceActions}
        onEdit={handleEditInvoice}
        onSend={handleSendInvoice}
        onDelete={handleDeleteInvoice}
        onAddPayment={handleAddPayment}
        onDownloadPDF={handleDownloadPDF}
        loading={actionLoading}
      />

      {/* Modal de paiement */}
      {paymentInvoice && (
        <PaymentModal
          key={`payment-modal-${paymentInvoice.id}-${(paymentInvoice.payments || []).map(p => p.id).sort().join('-')}`}
          open={showPaymentModal}
          invoice={paymentInvoice}
          onClose={handleClosePaymentModal}
          onSubmit={handlePaymentSubmit}
          onDeletePayment={actions.deletePayment ? 
            (paymentId: string) => handleDeletePayment(paymentInvoice.id, paymentId) : 
            undefined
          }
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title={t('invoices.confirmDelete')}
        message={t('invoices.confirmDeleteDetails', { 
          number: selectedInvoice?.number || selectedInvoice?.id || ''
        })}
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default React.memo(InvoicesModal);
