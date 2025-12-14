import Icon from '@assets/icons/Icon';
import VirtualizedList from '@components/VirtualizedList';
import { Button, Card, Input } from '@components/ui';
import { useNotification } from '@contexts/NotificationContext';
import { useClientServices } from '@features/clients/services';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OpticsInvoiceEditor from '../components/OpticsInvoiceEditor';
import OpticsInvoicePrint from '../components/OpticsInvoicePrint';
import { useOpticsInvoiceClientResolution } from '../hooks/useOpticsInvoiceClientResolution';
import { useOpticsInvoicePrefill } from '../hooks/useOpticsInvoicePrefill';
import { useOpticsInvoices } from '../hooks/useOpticsInvoices';
import { Invoice } from '../types';
import { transformToCreatePayload, transformToUpdatePayload } from '../utils/invoicePayloadTransformers';

const OpticsInvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const [showEditor, setShowEditor] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [editingMode, setEditingMode] = useState<'create' | 'edit' | 'view'>('create');
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  // Hook pour l'API backend
  const {
    invoices,
    loading,
    error,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    canAccessOptics
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

  // Filtrer les factures par recherche (nom, prénom, téléphone, numéro)
  // L'API filtre déjà par type='InvoiceClient', donc toutes les factures reçues sont optiques
  useEffect(() => {
    if (!search.trim()) {
      // Si pas de recherche, afficher toutes les factures (déjà filtrées par l'API)
      setFilteredInvoices(invoices);
      return;
    }

    const searchLower = search.toLowerCase().trim();
    
    // Rechercher dans les factures par nom, prénom, téléphone ou numéro de facture
    const filtered = invoices.filter((invoice) => {
      // Rechercher dans le nom du client
      const clientName = invoice.client?.name || '';
      const nameMatch = clientName.toLowerCase().includes(searchLower);
      
      // Rechercher dans le téléphone
      const phoneMatch = invoice.client?.phone?.toLowerCase().includes(searchLower) || false;
      
      // Rechercher dans le numéro de facture
      const numberMatch = invoice.number?.toLowerCase().includes(searchLower) || false;
      
      return nameMatch || phoneMatch || numberMatch;
    });
    
    setFilteredInvoices(filtered);
  }, [search, invoices]);

  // Debounce simple de la recherche de clients (pour l'autocomplétion)
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

  const handleEditInvoice = async (invoice: Invoice) => {
    try {
      // Récupérer la facture complète depuis l'API pour avoir toutes les données
      const fullInvoice = await fetchInvoice(invoice.id);
      setCurrentInvoice(fullInvoice || invoice);
      setEditingMode('edit');
      setShowEditor(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture:', error);
      // En cas d'erreur, utiliser la facture telle quelle
      setCurrentInvoice(invoice);
      setEditingMode('edit');
      setShowEditor(true);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      // Récupérer la facture complète depuis l'API pour avoir toutes les données
      const fullInvoice = await fetchInvoice(invoice.id);
      setCurrentInvoice(fullInvoice || invoice);
      setEditingMode('view');
      setShowEditor(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture:', error);
      // En cas d'erreur, utiliser la facture telle quelle
      setCurrentInvoice(invoice);
      setEditingMode('view');
      setShowEditor(true);
    }
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      if (editingMode === 'create') {
        // Mode création: sauvegarder dans la DB via l'endpoint
        const clientId = selectedClientId || invoiceData.client?.id;
        if (!clientId || clientId === 'temp') {
          // Afficher une notification d'erreur à l'utilisateur
          showError(
            t('common.error', { defaultValue: 'Erreur' }),
            t('invoices.clientRequired', { defaultValue: 'Veuillez sélectionner un client avant de créer la facture' })
          );
          return;
        }
        
        const payload = transformToCreatePayload(invoiceData, clientId);
        const createdInvoice = await createInvoice(payload);
        
        // Enrichir la facture créée avec les données du formulaire (items, number, etc.)
        // car le backend ne retourne pas les items dans la réponse
        const enrichedInvoice: Invoice = {
          ...createdInvoice,
          // Conserver les items du formulaire
          items: invoiceData.items || createdInvoice.items || [],
          // Conserver le numéro de facture si fourni
          number: invoiceData.number || createdInvoice.number,
          // Conserver la date d'émission si fournie
          issuedAt: invoiceData.issuedAt || createdInvoice.issuedAt,
          // Conserver les notes complètes
          notes: invoiceData.notes || createdInvoice.notes,
          // Conserver le total calculé
          total: invoiceData.total || createdInvoice.total,
          subtotal: invoiceData.subtotal || createdInvoice.subtotal,
          // Conserver les infos client
          client: invoiceData.client || createdInvoice.client,
        };
        
        setCurrentInvoice(enrichedInvoice);
        setShowEditor(false);
        setShowPrint(true);
        
        // Rafraîchir la liste des factures
        await fetchInvoices();
      } else if (editingMode === 'edit' && currentInvoice) {
        const payload = transformToUpdatePayload(invoiceData, currentInvoice);
        const updatedInvoice = await updateInvoice(currentInvoice.id, payload);
        setCurrentInvoice(updatedInvoice);
        setShowEditor(false);
        
        // Rafraîchir la liste des factures
        await fetchInvoices();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Afficher l'erreur à l'utilisateur
      const errorMessage = error instanceof Error ? error.message : t('common.error', { defaultValue: 'Une erreur est survenue' });
      showError(
        t('common.error', { defaultValue: 'Erreur' }),
        errorMessage
      );
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    // Récupérer la facture complète depuis l'API pour avoir toutes les données
    try {
      const fullInvoice = await fetchInvoice(invoice.id);
      setCurrentInvoice(fullInvoice || invoice);
    } catch {
      // Si la récupération échoue, utiliser la facture telle quelle
      setCurrentInvoice(invoice);
    }
    setShowPrint(true);
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
      <div className="w-full">
        {/* Header sticky */}
        <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* En-tête avec titre et description */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('invoices.opticsInvoices', { defaultValue: 'Factures Optiques' })}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('invoices.opticsInvoicesDescription', { defaultValue: 'Gestion des factures pour montures et corrections optiques' })}
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('invoices.searchInvoice', { defaultValue: 'Rechercher par nom, prénom, téléphone ou numéro...' }) as string}
                  className="w-full bg-white rounded-lg border border-gray-200 text-sm sm:text-base h-11 sm:h-12 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {search.trim().length >= 2 && clients.length > 0 && (
                  <div className="absolute z-40 bg-white shadow-lg rounded-lg mt-1 w-full max-h-48 overflow-auto border border-gray-200">
                    {clients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedClientId(c.id);
                          setSelectedClient(c as any);
                          setSearch(c.name);
                        }}
                        className="block w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                        {c.phone && (
                          <div className="text-xs text-gray-500 mt-0.5">{c.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => fetchInvoices()} 
                variant="secondary" 
                size="md"
                className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2.5 rounded-lg"
              >
                {t('common.refresh', { defaultValue: 'Actualiser' })}
              </Button>
              <Button 
                onClick={handleCreateInvoice} 
                variant="gradient" 
                size="md"
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {t('invoices.newInvoice', { defaultValue: 'Nouvelle facture' })}
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">

          {/* Liste des factures (virtualisée, layout en divs) */}
          <Card 
            className="overflow-hidden w-full"
          >
          {loading ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">{t('common.loading', { defaultValue: 'Chargement...' })}</div>
          ) : error ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-red-500">{t('common.error', { defaultValue: 'Erreur' })}: {error}</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
              {search.trim() 
                ? t('invoices.noInvoicesFound', { defaultValue: 'Aucune facture trouvée' })
                : t('invoices.noOpticsInvoicesFound', { defaultValue: 'Aucune facture optique trouvée' })
              }
            </div>
          ) : (
            <div className="w-full py-2">
              <VirtualizedList
                items={filteredInvoices}
                rowHeight={140}
                density="default"
                overscan={5}
                className="h-[65vh]"
                renderRow={(invoice) => {
                  // Extraire les initiales du prénom et nom
                  const getInitials = (name?: string): string => {
                    if (!name) return '??';
                    const parts = name.trim().split(/\s+/);
                    if (parts.length >= 2) {
                      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                    }
                    return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase();
                  };

                  return (
                    <div 
                      key={invoice.id || invoice.number} 
                      className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-3 overflow-hidden w-full"
                    >
                      {/* Section principale avec informations */}
                      <div className="flex items-start gap-4 p-4 border-b border-gray-100">
                        {/* Avatar avec initiales Prénom Nom */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {getInitials(invoice.client?.name)}
                        </div>
                        
                        {/* Informations client */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <div className="text-base font-bold text-gray-900 mb-2">
                              {invoice.client?.name || t('common.na', { defaultValue: 'N/A' })}
                            </div>
                            {invoice.client?.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Icon name="phone" size="sm" className="text-gray-500" />
                                {invoice.client.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Montant et Date */}
                        <div className="flex-shrink-0 text-right">
                          <div className="mb-2">
                            <div className="text-lg font-bold text-gray-900">
                              {invoice.total?.toLocaleString('fr-FR')} {invoice.currency || 'MAD'}
                            </div>
                          </div>
                          {invoice.issuedAt && (
                            <div className="flex items-center justify-end gap-1.5 text-sm text-gray-500">
                              <Icon name="calendar" size="sm" className="text-gray-400" />
                              {new Date(invoice.issuedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Section actions en bas */}
                      <div className="flex items-center justify-end gap-2 p-3 bg-gray-50">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice);
                          }}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Icon name="eye" size="sm" />}
                        >
                          {t('invoices.view', { defaultValue: 'Voir' })}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditInvoice(invoice);
                          }}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Icon name="edit" size="sm" />}
                        >
                          {t('invoices.edit', { defaultValue: 'Edit' })}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(invoice);
                          }}
                          variant="gradient"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Icon name="print" size="sm" />}
                        >
                          {t('invoices.print', { defaultValue: 'Print' })}
                        </Button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}
        </Card>

        {/* Éditeur de facture */}
        {showEditor && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default OpticsInvoicesPage;

