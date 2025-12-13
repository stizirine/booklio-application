import RescheduleModal from '@appointments/components/RescheduleModal';
import { compareAppointments } from '@appointments/utils/appointments';
import Icon from '@assets/icons/Icon';
import ConfirmationModal from '@components/ConfirmationModal';
import { useNotification } from '@contexts/NotificationContext';
import { useCapabilities } from '@contexts/TenantContext';
import { useUIConfig } from '@contexts/UIConfigContext';
import CreateEventModal from '@features/appointments/components/CreateEventModal';
import {
  Invoice,
  InvoiceActionsModal,
  InvoiceFormModal,
  PaymentCreatePayload,
  PaymentModal,
  generateInvoicePDF
} from '@features/invoices';
import OpticsInvoiceEditor from '@features/invoices/components/OpticsInvoiceEditor';
import OpticsInvoicePrint from '@features/invoices/components/OpticsInvoicePrint';
import { useOpticsInvoiceClientResolution } from '@features/invoices/hooks/useOpticsInvoiceClientResolution';
import { useOpticsInvoicePrefill } from '@features/invoices/hooks/useOpticsInvoicePrefill';
import { useOpticsInvoices } from '@features/invoices/hooks/useOpticsInvoices';
import { transformToUpdatePayload } from '@features/invoices/utils/invoicePayloadTransformers';
import { useConfirmationModal } from '@hooks/useConfirmationModal';
import { useAppointmentStore } from '@stores/appointmentStore';
import { useClientStore } from '@stores/clientStore';
import { useInvoiceStore } from '@stores/invoiceStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ClientAppointmentsSection from '../components/ClientAppointmentsSection';
import ClientDetailActionBar from '../components/ClientDetailActionBar';
import ClientDetailTabs from '../components/ClientDetailTabs';
import ClientInfoSection from '../components/ClientInfoSection';
import ClientInvoicesSection from '../components/ClientInvoicesSection';
import ClientOpticsSectionWrapper from '../components/ClientOpticsSectionWrapper';
import { ClientDetailProvider, ClientDetailTabKey } from '../context/ClientDetailContext';
import { useClientManagement } from '../hooks/useClientManagement';

const ClientDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isOptician } = useCapabilities();
  const { showSuccess, showError } = useNotification();
  const clientStore = useClientStore();
  
  const [loading, setLoading] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceActionsModalOpen, setInvoiceActionsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any | null>(null);
  
  // États pour les factures optiques
  const [showOpticsInvoiceEditor, setShowOpticsInvoiceEditor] = useState(false);
  const [showOpticsInvoicePrint, setShowOpticsInvoicePrint] = useState(false);
  const [currentOpticsInvoice, setCurrentOpticsInvoice] = useState<Invoice | null>(null);
  const [opticsInvoiceEditingMode, setOpticsInvoiceEditingMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Charger le client depuis le store
  const client = useMemo(() => {
    if (!id) return null;
    return clientStore.clients.find(c => c.id === id) || null;
  }, [id, clientStore.clients]);

  // Charger le client si non trouvé
  useEffect(() => {
    if (id && !client) {
      clientStore.refreshClient(id);
    }
  }, [id, client, clientStore]);

  const clientManagement = useClientManagement(client, (_updatedClient) => {
    // Rafraîchir la liste des clients après mise à jour
    clientStore.fetchClients();
  });
  const confirmationModal = useConfirmationModal();
  const invoices = useInvoiceStore((s) => s.invoices);
  const invoicesLoading = useInvoiceStore((s) => s.loading);
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices);
  const createInvoiceAction = useInvoiceStore((s) => s.createInvoiceAction);
  const updateInvoiceAction = useInvoiceStore((s) => s.updateInvoiceAction);
  const sendInvoiceAction = useInvoiceStore((s) => s.sendInvoiceAction);
  const deleteInvoiceAction = useInvoiceStore((s) => s.deleteInvoiceAction);
  const addPaymentAction = useInvoiceStore((s) => s.addPaymentAction);
  const deletePaymentAction = useInvoiceStore((s) => s.deletePaymentAction);
  const { config } = useUIConfig();
  const appointmentStore = useAppointmentStore();
  
  // Hook pour les factures optiques (filtré par client)
  const opticsInvoicesHook = useOpticsInvoices({ 
    clientId: client?.id || undefined,
    autoFetch: false 
  });
  
  // Extraire les fonctions nécessaires pour éviter les dépendances qui changent
  const fetchOpticsInvoices = opticsInvoicesHook.fetchInvoices;
  const updateOpticsInvoice = opticsInvoicesHook.updateInvoice;
  const opticsInvoices = opticsInvoicesHook.invoices;
  
  // Utiliser une ref pour stabiliser la fonction fetchInvoices et éviter les boucles infinies
  const fetchOpticsInvoicesRef = useRef(fetchOpticsInvoices);
  useEffect(() => {
    fetchOpticsInvoicesRef.current = fetchOpticsInvoices;
  }, [fetchOpticsInvoices]);
  
  // Hook pour le préremplissage depuis les prescriptions optiques
  // autoLoad désactivé pour éviter la boucle infinie - on chargera manuellement
  const { prefill: opticsInvoicePrefill, resetPrefill, loadPrefill } = useOpticsInvoicePrefill({
    selectedClientId: client?.id || null,
    autoLoad: false,
  });
  
  // Stabiliser les fonctions avec useRef pour éviter les boucles infinies
  // Mettre à jour les refs directement dans le render (pas dans useEffect) pour éviter les boucles
  const loadPrefillRef = useRef(loadPrefill);
  const resetPrefillRef = useRef(resetPrefill);
  const isLoadingPrefillRef = useRef(false);
  
  // Mettre à jour les refs directement (synchronisé avec le render)
  loadPrefillRef.current = loadPrefill;
  resetPrefillRef.current = resetPrefill;
  
  // Charger le préremplissage uniquement quand la modal s'ouvre
  // Utiliser une ref pour suivre si on a déjà chargé pour cette ouverture
  const lastEditorOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = lastEditorOpenRef.current;
    const isOpen = showOpticsInvoiceEditor;
    lastEditorOpenRef.current = isOpen;
    
    // Ne charger que si l'éditeur vient de s'ouvrir (transition de false à true)
    if (isOpen && !wasOpen && client?.id && !isLoadingPrefillRef.current) {
      isLoadingPrefillRef.current = true;
      loadPrefillRef.current().finally(() => {
        isLoadingPrefillRef.current = false;
      });
    } else if (!isOpen && wasOpen) {
      // Ne réinitialiser que si l'éditeur vient de se fermer (transition de true à false)
      resetPrefillRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOpticsInvoiceEditor, client?.id]);
  
  const opticsInvoiceClientData = useOpticsInvoiceClientResolution({
    invoice: currentOpticsInvoice,
    selectedClientId: client?.id || null,
    prefill: opticsInvoicePrefill,
  });

  // Les appointments viennent directement du client
  const clientAppointments = useMemo(() => client?.appointments || [], [client?.appointments]);
  const [appointments, setAppointments] = useState<any[]>(clientAppointments);
  useEffect(() => {
    const sorted = (clientAppointments || []).slice().sort(compareAppointments);
    setAppointments(sorted);
  }, [clientAppointments]);
  
  const infoRef = useRef<HTMLDivElement | null>(null);
  const apptsRef = useRef<HTMLDivElement | null>(null);
  const invoicesRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<ClientDetailTabKey>(ClientDetailTabKey.Info);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Gérer le paramètre tab depuis l'URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const allowed = Object.values(ClientDetailTabKey) as string[];
    if (tabParam && allowed.includes(tabParam)) {
      setActiveTab(tabParam as ClientDetailTabKey);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = (e: any) => {
      const { tab } = e.detail || {};
      const allowed = Object.values(ClientDetailTabKey);
      if (tab && allowed.includes(tab)) {
        setActiveTab(tab as ClientDetailTabKey);
      }
    };
    window.addEventListener('switchClientTab', handler);
    return () => window.removeEventListener('switchClientTab', handler);
  }, []);

  useEffect(() => {
    if (!client?.id) return;
    const saved = sessionStorage.getItem(`clientDetail.activeTab:${client.id}`);
    const allowed = Object.values(ClientDetailTabKey) as string[];
    if (saved && allowed.includes(saved)) {
      setActiveTab(saved as ClientDetailTabKey);
    }
  }, [client?.id]);

  useEffect(() => {
    if (!client?.id) return;
    try {
      sessionStorage.setItem(`clientDetail.activeTab:${client.id}`, activeTab);
    } catch {}
  }, [activeTab, client?.id]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      });
    }
  }, [activeTab]);
  
  const refreshClientData = useCallback(async () => {
    if (!client?.id) return;
    try {
      await clientStore.refreshClient(client.id);
    } catch (error) {
      // Erreur déjà loggée dans le store
    }
  }, [client?.id, clientStore]);

  useEffect(() => {
    if (client?.id) {
      fetchInvoices({ clientId: client.id });
    }
    // Ne pas inclure fetchInvoices dans les dépendances car il change à chaque render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

  const handleSaveOpticsInvoice = useCallback(async (invoiceData: Partial<Invoice>) => {
    if (!client?.id) return;
    
    try {
      if (opticsInvoiceEditingMode === 'create') {
        const localInvoice: Invoice = {
          id: `temp-${Date.now()}`,
          number: invoiceData.number,
          client: {
            id: client.id,
            name: client.name,
            email: client.email || undefined,
            phone: client.phone || undefined,
          },
          status: 'draft',
          currency: invoiceData.currency || 'MAD',
          issuedAt: invoiceData.issuedAt || new Date().toISOString(),
          items: invoiceData.items || [],
          notes: invoiceData.notes,
          payments: [],
          subtotal: invoiceData.subtotal,
          total: invoiceData.total,
        } as Invoice;
        setCurrentOpticsInvoice(localInvoice);
        setShowOpticsInvoiceEditor(false);
        setShowOpticsInvoicePrint(true);
      } else if (opticsInvoiceEditingMode === 'edit' && currentOpticsInvoice) {
        const payload = transformToUpdatePayload(invoiceData, currentOpticsInvoice);
        const updatedInvoice = await updateOpticsInvoice(currentOpticsInvoice.id, payload);
        setCurrentOpticsInvoice(updatedInvoice);
        setShowOpticsInvoiceEditor(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la facture optique:', error);
    }
  }, [opticsInvoiceEditingMode, client, currentOpticsInvoice, updateOpticsInvoice]);

  const handleCloseOpticsInvoiceEditor = useCallback(() => {
    setShowOpticsInvoiceEditor(false);
    setCurrentOpticsInvoice(null);
  }, []);

  const handleCloseOpticsInvoicePrint = useCallback(() => {
    setShowOpticsInvoicePrint(false);
    setCurrentOpticsInvoice(null);
  }, []);

  const getNextOpticsInvoiceNumber = useCallback((): string => {
    const invoices = opticsInvoices || [];
    const nums = invoices
      .map(inv => inv.number)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      .map(n => {
        const m = n.match(/(\d+)(?!.*\d)/);
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter(n => !Number.isNaN(n));

    if (nums.length > 0) {
      const next = Math.max(...nums) + 1;
      return String(next);
    }

    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}001`;
  }, [opticsInvoices]);

  const handleCreateOpticsInvoice = useCallback(async () => {
    // Éviter les appels multiples si l'éditeur est déjà ouvert
    if (showOpticsInvoiceEditor) {
      return;
    }
    
    // Ouvrir l'éditeur immédiatement
    setCurrentOpticsInvoice(null);
    setOpticsInvoiceEditingMode('create');
    setShowOpticsInvoiceEditor(true);
    
    // Recharger les factures en arrière-plan (non-bloquant) pour avoir le bon numéro
    // Ne pas attendre pour éviter de bloquer l'ouverture de l'éditeur
    fetchOpticsInvoicesRef.current().catch(err => {
      console.warn('Erreur lors du rechargement des factures:', err);
    });
  }, [showOpticsInvoiceEditor]); // Dépendre uniquement de showOpticsInvoiceEditor pour éviter les appels multiples

  const _handleCreateInvoice = useCallback(() => {
    if (!client?.id) return;
    setSelectedInvoice(null);
    setInvoiceModalOpen(true);
  }, [client?.id]);

  const handleInvoiceClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceActionsModalOpen(true);
  }, []);

  const handleInvoiceSubmit = useCallback(async (invoiceData: any) => {
    if (!client?.id) return;
    
    try {
      setLoading(true);
      if (selectedInvoice) {
        await updateInvoiceAction(selectedInvoice.id, invoiceData);
        showSuccess(t('invoices.updateSuccess'), t('invoices.updateSuccessMessage'));
      } else {
        await createInvoiceAction({
          ...invoiceData,
          clientId: client.id,
        });
        showSuccess(t('invoices.createSuccess'), t('invoices.createSuccessMessage'));
      }
      
      setInvoiceModalOpen(false);
      setSelectedInvoice(null);
      
      if (client?.id) {
        await refreshClientData();
        await fetchInvoices({ clientId: client.id });
      }
    } catch (error) {
      showError(t('invoices.createError'), t('invoices.createErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [client?.id, selectedInvoice, updateInvoiceAction, createInvoiceAction, fetchInvoices, refreshClientData, t, showSuccess, showError]);

  const handleEditInvoiceFromActions = useCallback(() => {
    if (!selectedInvoice) return;
    setInvoiceActionsModalOpen(false);
    setInvoiceModalOpen(true);
  }, [selectedInvoice]);

  const handleSendInvoice = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      setLoading(true);
      await sendInvoiceAction(selectedInvoice.id);
      showSuccess(t('invoices.sendSuccess'), t('invoices.sendSuccessMessage'));
      setInvoiceActionsModalOpen(false);
      setSelectedInvoice(null);
      
      if (client?.id) {
        await refreshClientData();
        await fetchInvoices({ clientId: client.id });
      }
    } catch (error) {
      showError(t('invoices.sendError'), t('invoices.sendErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice, sendInvoiceAction, fetchInvoices, client?.id, refreshClientData, t, showSuccess, showError]);

  const handleDeleteInvoice = useCallback(async () => {
    if (!selectedInvoice) return;
    
    confirmationModal.showConfirmation(
      t('invoices.deleteTitle'),
      t('invoices.confirmDelete', { number: selectedInvoice.number || selectedInvoice.id }),
      async () => {
        try {
          setLoading(true);
          await deleteInvoiceAction(selectedInvoice.id);
          confirmationModal.closeConfirmation();
          showSuccess(t('invoices.deleteSuccess'), t('invoices.deleteSuccessMessage'));
          setInvoiceActionsModalOpen(false);
          setSelectedInvoice(null);
          
          if (client?.id) {
            await refreshClientData();
            await fetchInvoices({ clientId: client.id });
          }
        } catch (error) {
          showError(t('invoices.deleteError'), t('invoices.deleteErrorMessage'));
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  }, [selectedInvoice, deleteInvoiceAction, fetchInvoices, client?.id, refreshClientData, confirmationModal, t, showSuccess, showError]);

  const handleAddPaymentClick = useCallback(() => {
    if (!selectedInvoice) return;
    setInvoiceActionsModalOpen(false);
    setPaymentModalOpen(true);
  }, [selectedInvoice]);

  const handlePaymentSubmit = useCallback(async (paymentData: PaymentCreatePayload) => {
    if (!selectedInvoice) return;
    
    try {
      setLoading(true);
      await addPaymentAction(selectedInvoice.id, paymentData);
      showSuccess(t('invoices.payment.paymentAdded'), t('invoices.payment.paymentAddedMessage'));
      setPaymentModalOpen(false);
      
      if (client?.id) {
        await refreshClientData();
        await fetchInvoices({ clientId: client.id });
      }
    } catch (error) {
      showError(t('invoices.payment.addError'), t('invoices.payment.addErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice, addPaymentAction, fetchInvoices, client?.id, refreshClientData, t, showSuccess, showError]);

  const handleDeletePayment = useCallback(async (paymentId: string) => {
    if (!selectedInvoice) return;
    
    try {
      setLoading(true);
      await deletePaymentAction(selectedInvoice.id, paymentId);
      
      if (client?.id) {
        await fetchInvoices({ clientId: client.id });
        await refreshClientData();
      }
      
      showSuccess(t('invoices.payment.paymentDeleted'), t('invoices.payment.paymentDeletedMessage'));
    } catch (error) {
      showError(t('invoices.payment.deleteError'), t('invoices.payment.deleteErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice, deletePaymentAction, fetchInvoices, client?.id, refreshClientData, t, showSuccess, showError]);

  const handleDownloadPDF = useCallback(async () => {
    if (!selectedInvoice) return;
    
    try {
      await generateInvoicePDF(selectedInvoice);
      showSuccess(t('invoices.downloadPDFSuccess'), t('invoices.downloadPDFSuccessMessage'));
    } catch (error) {
      showError(t('invoices.downloadPDFError'), t('invoices.downloadPDFErrorMessage'));
    }
  }, [selectedInvoice, t, showSuccess, showError]);

  const handleDeleteAppointment = useCallback((appointment: any) => {
    const formatAppointmentDate = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    confirmationModal.showConfirmation(
      t('appointment.deleteTitle'),
      t('appointment.confirmDeleteWithDetails', { 
        date: formatAppointmentDate(appointment.startAt),
        client: client?.name || t('common.unknown')
      }),
      async () => {
        try {
          setLoading(true);
          confirmationModal.closeConfirmation();
          setAppointments(prev => prev.filter(a => a._id !== appointment._id).slice().sort(compareAppointments));
          window.dispatchEvent(new Event('refreshAppointments'));
          showSuccess(t('appointment.deleteSuccess'), t('appointment.deleteSuccessMessage'));
        } catch (error) {
          showError(t('errors.deleteAppointmentError'), t('errors.deleteAppointmentErrorMessage'));
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  }, [confirmationModal, t, client, showSuccess, showError]);

  const handleEditAppointment = useCallback((appointment: any) => {
    setAppointmentToEdit({
      id: appointment._id,
      title: appointment.title || '',
      start: new Date(appointment.startAt),
      end: new Date(appointment.endAt),
      customerName: client?.name || '',
    });
    setShowReschedule(true);
  }, [client?.name]);

  const handleRescheduleConfirm = useCallback(async (newDate: string, newTime: string, _reason?: string) => {
    if (!appointmentToEdit) return;
    try {
      setLoading(true);
      
      const newStartDate = new Date(`${newDate}T${newTime}`);
      const newEndDate = new Date(newStartDate.getTime() + 30 * 60 * 1000);
      
      await appointmentStore.rescheduleAppointment(
        appointmentToEdit.id,
        newStartDate.toISOString(),
        newEndDate.toISOString()
      );
      
      setShowReschedule(false);
      setAppointmentToEdit(null);
      
      if (client?.id) {
        await refreshClientData();
      }
      
      window.dispatchEvent(new Event('refreshAppointments'));
      
      showSuccess(t('appointment.rescheduleSuccess'), t('appointment.rescheduleSuccessMessage'));
    } catch (error) {
      console.error('Erreur lors du report:', error);
      showError(t('errors.rescheduleError'), t('errors.rescheduleErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [appointmentToEdit, appointmentStore, client?.id, refreshClientData, t, showSuccess, showError]);

  if (!id) {
    return (
      <div className="p-3 sm:p-4">
        <p className="text-sm text-gray-500">{t('clients.invalidId')}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-3 sm:p-4">
        <div className="text-center py-8">
          <Icon name="refresh" className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <ClientDetailProvider value={{
      activeTab,
      setActiveTab,
      appointmentsCount: appointments.length,
      invoicesCount: invoices.length,
      isOptician,
      t: t as any,
      onOpenCreateAppointment: () => {
        setCreateEventOpen(true);
        setTimeout(() => {
          const fullName = (client?.name || '').trim();
          const parts = fullName.split(' ');
          const firstName = parts.slice(0, -1).join(' ') || parts[0] || '';
          const lastName = parts.slice(-1).join(' ') || '';
          const detail = {
            clientId: client?.id,
            firstName,
            lastName,
            phone: client?.phone || '',
            email: client?.email || '',
            address: (client as any)?.address || '',
          };
          try {
            window.dispatchEvent(new CustomEvent('prefillCreateEvent', { detail }));
          } catch {}
        }, 0);
      },
      onCreateInvoice: () => {
        const allowed = config.invoice.allowCreate;
        if (!allowed) return;
        if (config.invoice.creationMode === 'modal') {
          _handleCreateInvoice();
        } else {
          navigate('/invoices');
        }
      },
      canCreateInvoice: config.invoice.allowCreate,
      onClose: () => navigate('/clients'),
    }}>
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate('/clients')}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
              aria-label={t('common.back')}
            >
              <Icon name="arrow-left" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {client?.name || t('clients.title')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {t('clients.manageInfo', { defaultValue: 'Gestion des informations du client' })}
              </p>
            </div>
          </div>
        </div>
        {/* Tabs et barre d'actions au-dessus du contenu scrollable */}
        <ClientDetailTabs />
        <ClientDetailActionBar />
      </div>

      <div className="bg-white w-full flex-1 flex flex-col overflow-hidden min-h-0">

        {/* Contenu scrollable */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', maxHeight: '100%' }}>
          {/* Wrapper de panneau pour isoler le contenu */}
          <div className="p-3 sm:p-4">
            {/* Section informations client */}
            {activeTab === ClientDetailTabKey.Info && (
              <div ref={infoRef}>
                <ClientInfoSection t={t} clientManagement={clientManagement} />
              </div>
            )}

            {/* Section rendez-vous */}
            {activeTab === ClientDetailTabKey.Appts && (
              <div ref={apptsRef}>
                <ClientAppointmentsSection
                  appointments={appointments}
                  loading={loading}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                  onReschedule={handleEditAppointment}
                  t={t}
                />
              </div>
            )}

            {/* Section Optique */}
            {activeTab === ClientDetailTabKey.Optics && (
              <ClientOpticsSectionWrapper
                isOptician={isOptician()}
                client={client as any}
                onCreateOpticsInvoice={handleCreateOpticsInvoice}
                t={t}
              />
            )}

            {/* Section factures */}
            {activeTab === ClientDetailTabKey.Invoices && (
              <div ref={invoicesRef}>
                <ClientInvoicesSection
                  config={config.invoice as any}
                  invoices={invoices}
                  loading={invoicesLoading}
                  onInvoiceClick={handleInvoiceClick}
                  t={t}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales annexes */}
      <ConfirmationModal
        isOpen={confirmationModal.confirmationModal.isOpen}
        onClose={confirmationModal.closeConfirmation}
        onConfirm={confirmationModal.confirmationModal.onConfirm}
        title={confirmationModal.confirmationModal.title}
        message={confirmationModal.confirmationModal.message}
        type={confirmationModal.confirmationModal.type}
        loading={loading}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <InvoiceFormModal
        open={invoiceModalOpen}
        invoice={selectedInvoice}
        clientId={client?.id || ''}
        clientName={client?.name || ''}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleInvoiceSubmit}
        loading={invoicesLoading}
      />

      <InvoiceActionsModal
        open={invoiceActionsModalOpen}
        invoice={selectedInvoice}
        onClose={() => {
          setInvoiceActionsModalOpen(false);
          setSelectedInvoice(null);
        }}
        onEdit={handleEditInvoiceFromActions}
        onSend={handleSendInvoice}
        onDelete={handleDeleteInvoice}
        onAddPayment={handleAddPaymentClick}
        onDownloadPDF={handleDownloadPDF}
        loading={loading || invoicesLoading}
      />

      <PaymentModal
        open={paymentModalOpen}
        invoice={selectedInvoice}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handlePaymentSubmit}
        onDeletePayment={handleDeletePayment}
        loading={loading || invoicesLoading}
      />

      {createEventOpen && (
        <CreateEventModal
          open={createEventOpen}
          onClose={() => setCreateEventOpen(false)}
          onCreate={async (payload) => {
            try {
              await appointmentStore.createAppointment({
                ...payload,
                start: new Date(payload.start),
                end: new Date(payload.end),
              });
              setCreateEventOpen(false);
              
              if (client?.id) {
                await refreshClientData();
              }
              
              window.dispatchEvent(new Event('refreshAppointments'));
            } catch (error) {
              console.error('Erreur lors de la création du rendez-vous:', error);
            }
          }}
          clients={[]}
        />
      )}

      <RescheduleModal
        isOpen={showReschedule && !!appointmentToEdit}
        onClose={() => { setShowReschedule(false); setAppointmentToEdit(null); }}
        onConfirm={handleRescheduleConfirm}
        appointment={appointmentToEdit || { id: '', title: '', start: new Date(), end: new Date() }}
        loading={loading}
      />

      {showOpticsInvoiceEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <OpticsInvoiceEditor
                invoice={currentOpticsInvoice}
                onSave={handleSaveOpticsInvoice}
                onCancel={handleCloseOpticsInvoiceEditor}
                readOnly={opticsInvoiceEditingMode === 'view'}
                clientName={client?.name}
                initialFrameData={opticsInvoicePrefill?.frame}
                initialLensData={opticsInvoicePrefill?.lens}
                initialInvoiceNumber={opticsInvoiceEditingMode === 'create' ? getNextOpticsInvoiceNumber() : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {showOpticsInvoicePrint && currentOpticsInvoice && (
        <OpticsInvoicePrint
          invoice={currentOpticsInvoice}
          client={opticsInvoiceClientData}
          onClose={handleCloseOpticsInvoicePrint}
        />
      )}
    </div>
    </ClientDetailProvider>
  );
};

export default ClientDetailPage;






