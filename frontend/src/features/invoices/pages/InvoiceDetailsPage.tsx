import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui';
import { useOpticsInvoices } from '../hooks/useOpticsInvoices';
import { useOpticsInvoicePrefill } from '../hooks/useOpticsInvoicePrefill';
import { useOpticsInvoiceClientResolution } from '../hooks/useOpticsInvoiceClientResolution';
import { useClientServices } from '@features/clients/services';
import OpticsInvoiceEditor from '../components/OpticsInvoiceEditor';
import OpticsInvoicePrint from '../components/OpticsInvoicePrint';
import { Invoice } from '../types';
import { transformToUpdatePayload } from '../utils/invoicePayloadTransformers';

interface InvoiceDetailsPageProps {
  id?: string;
}

const InvoiceDetailsPage: React.FC<InvoiceDetailsPageProps> = ({ id }) => {
  const { t } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [editingMode, setEditingMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Hook pour l'API backend - autoFetch désactivé pour éviter la boucle infinie
  const {
    loading,
    error,
    fetchInvoice,
    updateInvoice,
    generatePDF,
    canAccessOptics,
    canPrintInvoices
  } = useOpticsInvoices({ autoFetch: false });

  // Services clients
  const { selectedClient: _selectedClient } = useClientServices();
  
  // Hook pour le préremplissage depuis les prescriptions optiques - autoLoad désactivé
  const { prefill } = useOpticsInvoicePrefill({
    selectedClientId,
    autoLoad: false,
  });

  // Hook pour résoudre le client pour l'impression
  const clientDataForPrint = useOpticsInvoiceClientResolution({
    invoice: currentInvoice,
    selectedClientId,
    prefill,
  });

  // Charger la facture au montage
  useEffect(() => {
    if (id && canAccessOptics()) {
      const loadInvoice = async () => {
        try {
          const invoice = await fetchInvoice(id);
          if (invoice) {
            setCurrentInvoice(invoice);
            if (invoice.client?.id) {
              setSelectedClientId(invoice.client.id);
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement de la facture:', err);
        }
      };
      loadInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditInvoice = () => {
    setEditingMode('edit');
    setShowEditor(true);
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (editingMode === 'edit' && currentInvoice) {
        const payload = transformToUpdatePayload(invoiceData, currentInvoice);
        const updatedInvoice = await updateInvoice(currentInvoice.id, payload);
        setCurrentInvoice(updatedInvoice);
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handlePrintInvoice = async () => {
    if (!currentInvoice) return;
    try {
      if (canPrintInvoices()) {
        const pdfBlob = await generatePDF(currentInvoice.id);
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      } else {
        setShowPrint(true);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setShowPrint(true);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  const handleClosePrint = () => {
    setShowPrint(false);
  };

  if (!id) return <div className="p-3 sm:p-4 text-xs sm:text-sm">{t('invoices.invalidId')}</div>;

  if (!canAccessOptics()) {
    return (
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-red-600">{t('errors.unauthorizedAccess', { defaultValue: 'Accès non autorisé' })}</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <h1 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4">{t('invoices.details')}</h1>
      {loading && <p className="text-xs sm:text-sm text-gray-500">{t('common.loading')}</p>}
      {error && <p className="text-xs sm:text-sm text-red-600">{t('common.error')}: {error}</p>}
      {currentInvoice && (
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-xs sm:text-sm">{t('invoices.numberLabel')}: <span className="font-medium">{currentInvoice.number || currentInvoice.id}</span></div>
            <div className="text-xs sm:text-sm">{t('invoices.statusLabel')}: <span className="font-medium">{t(`invoices.status.${currentInvoice.status}`, { defaultValue: currentInvoice.status })}</span></div>
            <div className="text-xs sm:text-sm">{t('invoices.client', { defaultValue: 'Client' })}: <span className="font-medium">{currentInvoice.client?.name || t('common.na', { defaultValue: 'N/A' })}</span></div>
            <div className="text-xs sm:text-sm">{t('invoices.currencyLabel')}: <span className="font-medium">{currentInvoice.currency}</span></div>
            <div className="text-xs sm:text-sm">{t('invoices.totalLabel')}: <span className="font-medium">{(currentInvoice.total ?? 0).toFixed(2)} {currentInvoice.currency}</span></div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEditInvoice} variant="secondary" size="sm" className="text-xs sm:text-sm">
              {t('invoices.edit', { defaultValue: 'Modifier' })}
            </Button>
            <Button onClick={handlePrintInvoice} variant="gradient" size="sm" className="text-xs sm:text-sm">
              {t('invoices.print', { defaultValue: 'Imprimer' })}
            </Button>
          </div>
        </div>
      )}

      {/* Éditeur de facture */}
      {showEditor && currentInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <OpticsInvoiceEditor
                invoice={currentInvoice}
                onSave={handleSaveInvoice}
                onCancel={handleCloseEditor}
                readOnly={editingMode === 'view'}
                clientName={currentInvoice.client?.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Impression de facture */}
      {showPrint && currentInvoice && (
        <OpticsInvoicePrint
          invoice={currentInvoice}
          client={clientDataForPrint}
          onClose={handleClosePrint}
        />
      )}
    </div>
  );
};

export default InvoiceDetailsPage;


