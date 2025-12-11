import VirtualizedList from '@components/VirtualizedList';
import { Badge, Button, Card, Input } from '@components/ui';
import { useClientServices } from '@features/clients/services';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OpticsInvoiceEditor from '../components/OpticsInvoiceEditor';
import OpticsInvoicePrint from '../components/OpticsInvoicePrint';
import { useOpticsInvoiceClientResolution } from '../hooks/useOpticsInvoiceClientResolution';
import { useOpticsInvoicePrefill } from '../hooks/useOpticsInvoicePrefill';
import { useOpticsInvoices } from '../hooks/useOpticsInvoices';
import { Invoice } from '../types';
import { transformToUpdatePayload } from '../utils/invoicePayloadTransformers';

const OpticsInvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [editingMode, setEditingMode] = useState<'create' | 'edit' | 'view'>('create');
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Hook pour l'API backend
  const {
    invoices,
    loading,
    error,
    fetchInvoices,
    // createInvoice,
    updateInvoice,
    generatePDF,
    canAccessOptics,
    canPrintInvoices
  } = useOpticsInvoices();

  // Services clients
  const { clients, searchClients, selectedClient, setSelectedClient } = useClientServices();
  
  // Hook pour le préremplissage depuis les prescriptions optiques
  const { prefill } = useOpticsInvoicePrefill({
    selectedClientId,
    autoLoad: true,
  });

  // Hook pour résoudre le client pour l'impression
  const clientDataForPrint = useOpticsInvoiceClientResolution({
    invoice: currentInvoice,
    selectedClientId,
    prefill,
  });

  // Debounce simple de la recherche
  useEffect(() => {
    const id = setTimeout(() => {
      if (search.trim().length >= 2) {
        searchClients(search).catch(() => {});
      }
    }, 300);
    return () => clearTimeout(id);
  }, [search, searchClients]);


  const handleCreateInvoice = () => {
    // Si on arrive depuis le profil client, il est déjà dans le store → on pré-sélectionne
    if (selectedClient?.id) {
      setSelectedClientId(selectedClient.id);
    }
    setCurrentInvoice(null);
    setEditingMode('create');
    setShowEditor(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setEditingMode('edit');
    setShowEditor(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setEditingMode('view');
    setShowEditor(true);
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (editingMode === 'create') {
        // Mode création sans appel backend: construire une facture locale et afficher l'aperçu
        const localInvoice: Invoice = {
          id: `temp-${Date.now()}`,
          number: invoiceData.number || getNextInvoiceNumber(),
          client: invoiceData.client,
          status: 'draft',
          currency: invoiceData.currency || 'MAD',
          issuedAt: invoiceData.issuedAt || new Date().toISOString(),
          items: invoiceData.items || [],
          notes: invoiceData.notes,
          payments: [],
          subtotal: invoiceData.subtotal,
          total: invoiceData.total,
        } as Invoice;
        setCurrentInvoice(localInvoice);
        setShowEditor(false);
        setShowPrint(true);
      } else if (editingMode === 'edit' && currentInvoice) {
        const payload = transformToUpdatePayload(invoiceData, currentInvoice);
        const updatedInvoice = await updateInvoice(currentInvoice.id, payload);
        setCurrentInvoice(updatedInvoice);
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      if (canPrintInvoices()) {
        // Générer le PDF via l'API
        const pdfBlob = await generatePDF(invoice.id);
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      } else {
        // Fallback: affichage de la facture pour impression
        setCurrentInvoice(invoice);
        setShowPrint(true);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Fallback: affichage de la facture pour impression
      setCurrentInvoice(invoice);
      setShowPrint(true);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setCurrentInvoice(null);
    setSelectedClientId(null);
    setSearch('');
  };

  const handleClosePrint = () => {
    setShowPrint(false);
    setCurrentInvoice(null);
  };

  // Fonction utilitaire pour obtenir le variant Badge selon le statut
  const getStatusBadgeVariant = (status: string): 'warning' | 'info' | 'success' => {
    if (status === 'draft') return 'warning';
    if (status === 'sent') return 'info';
    return 'success';
  };

  // Générer le prochain numéro de facture auto-incrémenté
  const getNextInvoiceNumber = (): string => {
    // Extraire les parties numériques des numéros existants
    const nums = (invoices || [])
      .map(inv => inv.number)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      .map(n => {
        const m = n.match(/(\d+)(?!.*\d)/); // dernier bloc numérique
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter(n => !Number.isNaN(n));

    if (nums.length > 0) {
      const next = Math.max(...nums) + 1;
      return String(next);
    }

    // Fallback: numéro basé sur la date si aucune facture existante
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}-001`;
  };

  // Vérifier l'accès aux fonctionnalités optiques
  if (!canAccessOptics()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.unauthorizedAccess', { defaultValue: 'Accès non autorisé' })}</h1>
          <p className="text-gray-600">{t('errors.unauthorizedAccessMessage', { defaultValue: "Vous n'avez pas les permissions nécessaires pour accéder aux factures optiques." })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* En-tête sticky */}
        <div className="sticky top-0 z-20 bg-gray-50 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-gray-200">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {t('invoices.opticsInvoices', { defaultValue: 'Factures Optiques' })}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {t('invoices.opticsInvoicesDescription', { defaultValue: 'Gestion des factures pour montures et corrections optiques' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('invoices.searchClient', { defaultValue: 'Rechercher un client (nom, prénom)...' }) as string}
                className="w-full sm:w-80"
              />
              {search.trim().length >= 2 && clients.length > 0 && (
                <div className="absolute z-10 bg-white shadow rounded mt-1 w-full max-h-48 sm:max-h-60 overflow-auto">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setSelectedClient(c as any);
                        setSearch(c.name);
                      }}
                      className="block w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      {c.name} {c.phone ? `— ${c.phone}` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleCreateInvoice} variant="gradient" size="md" className="text-xs sm:text-sm">
              {t('invoices.newInvoice', { defaultValue: 'Nouvelle facture' })}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fetchInvoices()} variant="secondary" size="md" className="text-xs sm:text-sm">
              {t('common.refresh', { defaultValue: 'Actualiser' })}
            </Button>
          </div>
          </div>
        </div>

        {/* Liste des factures (virtualisée, layout en divs) */}
        <Card 
          className="overflow-hidden"
          header={<h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">{t('invoices.recentInvoices', { defaultValue: 'Factures récentes' })}</h3>}
        >
          {loading ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">{t('common.loading', { defaultValue: 'Chargement...' })}</div>
          ) : error ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-red-500">{t('common.error', { defaultValue: 'Erreur' })}: {error}</div>
          ) : invoices.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">{t('invoices.noInvoicesFound', { defaultValue: 'Aucune facture trouvée' })}</div>
          ) : (
            <div className="px-1.5 sm:px-2 py-1.5 sm:py-2">
              <div className="hidden sm:grid grid-cols-6 gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-md">
                <div>{t('invoices.number', { defaultValue: 'Numéro' })}</div>
                <div>{t('invoices.client', { defaultValue: 'Client' })}</div>
                <div>{t('invoices.date', { defaultValue: 'Date' })}</div>
                <div>{t('invoices.amount', { defaultValue: 'Montant' })}</div>
                <div>{t('invoices.statusLabel', { defaultValue: 'Statut' })}</div>
                <div>{t('invoices.actions', { defaultValue: 'Actions' })}</div>
              </div>
              <VirtualizedList
                items={invoices}
                rowHeight={64}
                density="compact"
                overscan={12}
                className="max-h-[60vh] mt-1.5 sm:mt-2"
                renderRow={(invoice) => (
                  <div key={invoice.id || invoice.number} className="grid grid-cols-1 sm:grid-cols-6 gap-1.5 sm:gap-2 items-center border-b px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 hover:bg-gray-50">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{invoice.number}</div>
                    <div className="text-xs sm:text-sm text-gray-700 truncate">{invoice.client?.name || t('common.na', { defaultValue: 'N/A' })}</div>
                    <div className="text-xs sm:text-sm text-gray-700">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('fr-FR') : t('common.na', { defaultValue: 'N/A' })}</div>
                    <div className="text-xs sm:text-sm text-gray-900 font-medium">{invoice.total} {invoice.currency}</div>
                    <div>
                      <Badge
                        variant={getStatusBadgeVariant(invoice.status)}
                        size="xs"
                        className="sm:hidden"
                      >
                        {invoice.status === 'draft' ? t('invoices.status.draft', { defaultValue: 'Brouillon' }).substring(0, 3) : 
                         invoice.status === 'sent' ? t('invoices.status.sent', { defaultValue: 'Envoyée' }).substring(0, 3) : t('invoices.status.paid', { defaultValue: 'Payée' }).substring(0, 3)}
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(invoice.status)}
                        size="sm"
                        className="hidden sm:inline-flex"
                      >
                        {invoice.status === 'draft' ? t('invoices.status.draft', { defaultValue: 'Brouillon' }) : 
                         invoice.status === 'sent' ? t('invoices.status.sent', { defaultValue: 'Envoyée' }) : t('invoices.status.paid', { defaultValue: 'Payée' })}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Button
                        onClick={() => handleViewInvoice(invoice)}
                        variant="secondary"
                        size="sm"
                        className="text-[10px] sm:text-xs"
                      >
                        {t('invoices.view', { defaultValue: 'Consulter' })}
                      </Button>
                      <Button
                        onClick={() => handleEditInvoice(invoice)}
                        variant="secondary"
                        size="sm"
                        className="text-[10px] sm:text-xs"
                      >
                        {t('invoices.edit', { defaultValue: 'Modifier' })}
                      </Button>
                      <Button
                        onClick={() => handlePrintInvoice(invoice)}
                        variant="gradient"
                        size="sm"
                        className="text-[10px] sm:text-xs"
                      >
                        {t('invoices.print', { defaultValue: 'Imprimer' })}
                      </Button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </Card>

        {/* Éditeur de facture */}
        {showEditor && (
          <OpticsInvoiceEditor
            invoice={currentInvoice}
            onSave={handleSaveInvoice}
            onCancel={handleCloseEditor}
            readOnly={editingMode === 'view'}
            clientName={currentInvoice?.client?.name || prefill?.clientName}
            initialFrameData={prefill?.frame}
            initialLensData={prefill?.lens}
            initialInvoiceNumber={editingMode === 'create' ? getNextInvoiceNumber() : undefined}
          />
        )}

        {/* Impression de facture */}
        {showPrint && currentInvoice ? (
          <OpticsInvoicePrint
            invoice={currentInvoice}
            client={clientDataForPrint}
            onClose={handleClosePrint}
          />
        ) : null}
      </div>
    </div>
  );
};

export default OpticsInvoicesPage;

