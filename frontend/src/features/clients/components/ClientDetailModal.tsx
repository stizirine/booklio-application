import AppointmentDisplay from '@appointments/components/AppointmentDisplay';
import RescheduleModal from '@appointments/components/RescheduleModal';
import { compareAppointments } from '@appointments/utils/appointments';
import Icon from '@assets/icons/Icon';
import ConfirmationModal from '@components/ConfirmationModal';
import { Button } from '@components/ui';
import { useNotification } from '@contexts/NotificationContext';
import { useCapabilities } from '@contexts/TenantContext';
import { useUIConfig } from '@contexts/UIConfigContext';
import CreateEventModal from '@features/appointments/components/CreateEventModal';
import {
  Invoice,
  InvoiceActionsModal,
  InvoiceCard,
  InvoiceFormModal,
  InvoiceStatistics,
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
import OpticsSection from '@optics/components/OpticsSection';
import { useAppointmentStore } from '@stores/appointmentStore';
import { Client, useClientStore } from '@stores/clientStore';
import { useInvoiceStore } from '@stores/invoiceStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientDetailProvider, ClientDetailTabKey } from '../context/ClientDetailContext';
import { useClientManagement } from '../hooks/useClientManagement';
import ClientDetailActionBar from './ClientDetailActionBar';
import ClientDetailTabs from './ClientDetailTabs';

interface ClientDetailModalProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onUpdated: (client: Client) => void;
}


// Externalisé dans des fichiers dédiés

const ClientDetailModal: React.FC<ClientDetailModalProps> = React.memo(({ open, client, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const { isOptician } = useCapabilities();
  const { showSuccess, showError } = useNotification();
  
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
  
  // Hooks personnalisés
  const clientStore = useClientStore();
  const clientManagement = useClientManagement(client, onUpdated);
  const confirmationModal = useConfirmationModal();
  const invoicesHook = useInvoiceStore();
  const { config } = useUIConfig();
  const appointmentStore = useAppointmentStore();
  
  // Hook pour les factures optiques (filtré par client)
  const opticsInvoicesHook = useOpticsInvoices({ 
    clientId: client?.id || undefined,
    autoFetch: false 
  });
  
  // Hook pour le préremplissage depuis les prescriptions optiques
  // On recharge quand l'éditeur s'ouvre pour avoir les dernières prescriptions
  const { prefill: opticsInvoicePrefill, resetPrefill } = useOpticsInvoicePrefill({
    selectedClientId: client?.id || null,
    autoLoad: showOpticsInvoiceEditor, // Charger uniquement quand l'éditeur est ouvert
  });
  
  // Réinitialiser le préremplissage quand on ferme l'éditeur pour forcer le rechargement
  useEffect(() => {
    if (!showOpticsInvoiceEditor) {
      resetPrefill();
    }
  }, [showOpticsInvoiceEditor, resetPrefill]);
  
  // Hook pour résoudre le client pour l'impression
  const opticsInvoiceClientData = useOpticsInvoiceClientResolution({
    invoice: currentOpticsInvoice,
    selectedClientId: client?.id || null,
    prefill: opticsInvoicePrefill,
  });

  // Les appointments viennent directement du client (déjà chargés par le backend)
  const clientAppointments = useMemo(() => client?.appointments || [], [client?.appointments]);
  // État local pour refléter instantanément les modifications (report/suppression)
  const [appointments, setAppointments] = useState<any[]>(clientAppointments);
  useEffect(() => {
    const sorted = (clientAppointments || []).slice().sort(compareAppointments);
    setAppointments(sorted);
  }, [clientAppointments]);
  
  // Références pour la navigation sticky
  const infoRef = useRef<HTMLDivElement | null>(null);
  const apptsRef = useRef<HTMLDivElement | null>(null);
  const invoicesRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Onglets actifs (mobile)
  const [activeTab, setActiveTab] = useState<ClientDetailTabKey>(ClientDetailTabKey.Info);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Écouter les événements de changement d'onglet depuis l'extérieur
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

  // Persister l'onglet actif par client (sessionStorage)
  useEffect(() => {
    if (!client?.id || !open) return;
    const saved = sessionStorage.getItem(`clientDetail.activeTab:${client.id}`);
    const allowed = Object.values(ClientDetailTabKey) as string[];
    if (saved && allowed.includes(saved)) {
      setActiveTab(saved as ClientDetailTabKey);
    }
  }, [client?.id, open]);

  useEffect(() => {
    if (!client?.id || !open) return;
    try {
      sessionStorage.setItem(`clientDetail.activeTab:${client.id}`, activeTab);
    } catch {}
  }, [activeTab, client?.id, open]);

  // Scroll automatique vers le haut quand l'onglet change
  useEffect(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      });
    }
  }, [activeTab]);
  
  // Fonction pour rafraîchir les données du client depuis le backend
  const refreshClientData = useCallback(async () => {
    if (!client?.id) return;
    
    try {
      await clientStore.refreshClient(client.id);
    } catch (error) {
      // Erreur déjà loggée dans le store
    }
  }, [client?.id, clientStore]);

  // Charger les factures du client
  useEffect(() => {
    if (open && client?.id) {
      // Filtrer côté backend pour exclure les factures optiques (type InvoiceClient)
      invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id]);

  // Handlers pour les factures optiques
  const handleSaveOpticsInvoice = useCallback(async (invoiceData: Partial<Invoice>) => {
    if (!client?.id) return;
    
    try {
      if (opticsInvoiceEditingMode === 'create') {
        // Création locale sans appel backend: construire une facture temporaire et afficher l'aperçu
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
          currency: invoiceData.currency || config.invoice.currency || 'EUR',
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
        const updatedInvoice = await opticsInvoicesHook.updateInvoice(currentOpticsInvoice.id, payload);
        setCurrentOpticsInvoice(updatedInvoice);
        setShowOpticsInvoiceEditor(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la facture optique:', error);
    }
  }, [opticsInvoiceEditingMode, client, currentOpticsInvoice, opticsInvoicesHook, config.invoice.currency]);

  const handleCloseOpticsInvoiceEditor = useCallback(() => {
    setShowOpticsInvoiceEditor(false);
    setCurrentOpticsInvoice(null);
  }, []);

  const handleCloseOpticsInvoicePrint = useCallback(() => {
    setShowOpticsInvoicePrint(false);
    setCurrentOpticsInvoice(null);
  }, []);

  // Générer le prochain numéro de facture optique
  const getNextOpticsInvoiceNumber = useCallback((): string => {
    const invoices = opticsInvoicesHook.invoices || [];
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
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}-001`;
  }, [opticsInvoicesHook.invoices]);

  // Empêcher le scroll de la page sous-jacente lorsque la modale est ouverte
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Handlers pour les factures
  const _handleCreateInvoice = useCallback(() => {
    setSelectedInvoice(null);
    setInvoiceModalOpen(true);
  }, []);

  const handleInvoiceClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceActionsModalOpen(true);
  }, []);

  const handleEditInvoiceFromActions = useCallback(() => {
    setInvoiceActionsModalOpen(false);
    setInvoiceModalOpen(true);
  }, []);

  const handleInvoiceSubmit = useCallback(async (data: any) => {
    try {
      if (selectedInvoice) {
        await invoicesHook.updateInvoiceAction(selectedInvoice.id, data);
      } else {
        await invoicesHook.createInvoiceAction(data);
      }
      
      setInvoiceModalOpen(false);
      setSelectedInvoice(null);
      
      // Rafraîchir les factures
      if (client?.id) {
        await invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
      }
      
      // Rafraîchir les données du client depuis le backend
      await refreshClientData();
    } catch (error) {
      showError(t('errors.updateError'), selectedInvoice ? t('errors.updateErrorMessage') : t('errors.createErrorMessage'));
    }
  }, [selectedInvoice, invoicesHook, client?.id, refreshClientData, t, showError]);

  const handleSendInvoice = useCallback(async () => {
    if (!selectedInvoice) return;
    
    confirmationModal.showConfirmation(
      t('invoices.confirmSend'),
      t('invoices.confirmSendDetails', { 
        email: selectedInvoice.client?.email || client?.email || t('common.unknown')
      }),
      async () => {
        try {
          setLoading(true);
          await invoicesHook.sendInvoiceAction(selectedInvoice.id);
          confirmationModal.closeConfirmation();
          setInvoiceActionsModalOpen(false);
          setSelectedInvoice(null);
          // Rafraîchir les factures
          if (client?.id) {
            invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
          }
          showSuccess(t('invoices.sendSuccess'), t('invoices.sendSuccessMessage'));
        } catch (error) {
          showError(t('invoices.sendError'), t('invoices.sendErrorMessage'));
        } finally {
          setLoading(false);
        }
      },
      'info'
    );
  }, [selectedInvoice, invoicesHook, client?.id, client?.email, t, confirmationModal, showSuccess, showError]);

  const handleDeleteInvoice = useCallback(async () => {
    if (!selectedInvoice) return;
    
    confirmationModal.showConfirmation(
      t('invoices.confirmDelete'),
      t('invoices.confirmDeleteDetails', { 
        number: selectedInvoice.number || selectedInvoice.id
      }),
      async () => {
        try {
          setLoading(true);
          await invoicesHook.deleteInvoiceAction(selectedInvoice.id);
          
          confirmationModal.closeConfirmation();
          setInvoiceActionsModalOpen(false);
          setSelectedInvoice(null);
          
          // Rafraîchir les factures
          if (client?.id) {
            await invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
          }
          
          // Rafraîchir les données du client depuis le backend
          await refreshClientData();
          
          showSuccess(t('invoices.deleteSuccess'), t('invoices.deleteSuccessMessage'));
        } catch (error) {
          showError(t('invoices.deleteError'), t('invoices.deleteErrorMessage'));
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  }, [selectedInvoice, invoicesHook, client?.id, refreshClientData, t, confirmationModal, showSuccess, showError]);

  const handleAddPaymentClick = useCallback(() => {
    setInvoiceActionsModalOpen(false);
    setPaymentModalOpen(true);
  }, []);

  const handlePaymentSubmit = useCallback(async (payload: PaymentCreatePayload) => {
    if (!selectedInvoice) return;
    
    try {
      setLoading(true);
      await invoicesHook.addPaymentAction(selectedInvoice.id, payload);
      
      setPaymentModalOpen(false);
      setSelectedInvoice(null);
      
      // Rafraîchir les factures
      if (client?.id) {
        await invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
      }
      
      // Rafraîchir les données du client depuis le backend
      await refreshClientData();
    } catch (error) {
      showError(t('invoices.payment.paymentError'), t('invoices.payment.paymentErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice, invoicesHook, client?.id, refreshClientData, t, showError]);

  const handleDeletePayment = useCallback(async (paymentId: string) => {
    if (!selectedInvoice) return;
    
    try {
      setLoading(true);
      await invoicesHook.deletePaymentAction(selectedInvoice.id, paymentId);
      
      // Rafraîchir les factures
      if (client?.id) {
        await invoicesHook.fetchInvoices({ clientId: client.id, type: 'Invoice' });
      }
      
      // Rafraîchir les données du client depuis le backend
      await refreshClientData();
      
      showSuccess(t('invoices.payment.paymentDeleted'), t('invoices.payment.paymentDeletedMessage'));
    } catch (error) {
      showError(t('invoices.payment.deleteError'), t('invoices.payment.deleteErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [selectedInvoice, invoicesHook, client?.id, refreshClientData, t, showSuccess, showError]);

  const handleDownloadPDF = useCallback(async () => {
    if (!selectedInvoice) return;
    
    try {
      await generateInvoicePDF(selectedInvoice);
      showSuccess(t('invoices.downloadPDFSuccess'), t('invoices.downloadPDFSuccessMessage'));
    } catch (error) {
      showError(t('invoices.downloadPDFError'), t('invoices.downloadPDFErrorMessage'));
    }
  }, [selectedInvoice, t, showSuccess, showError]);

  // Handlers pour les rendez-vous
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
          // TODO: Implémenter la suppression via l'API
          confirmationModal.closeConfirmation();
          // Mise à jour locale immédiate (optimiste)
          setAppointments(prev => prev.filter(a => a._id !== appointment._id).slice().sort(compareAppointments));
          // Rafraîchir les données du client
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
    // Préparer l'objet pour RescheduleModal (attend des Date)
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
      
      // Calculer les nouvelles dates
      const newStartDate = new Date(`${newDate}T${newTime}`);
      // endAt = startAt + 30 minutes
      const newEndDate = new Date(newStartDate.getTime() + 30 * 60 * 1000);
      
      // Utiliser le store pour le reschedule (comme dans le module rendez-vous)
      await appointmentStore.rescheduleAppointment(
        appointmentToEdit.id,
        newStartDate.toISOString(),
        newEndDate.toISOString()
      );
      
      setShowReschedule(false);
      setAppointmentToEdit(null);
      
      // Rafraîchir les données du client depuis le backend pour mettre à jour la liste des rendez-vous
      if (client?.id) {
        await refreshClientData();
      }
      
      // Rafraîchir la liste globale des rendez-vous
      window.dispatchEvent(new Event('refreshAppointments'));
      
      showSuccess(t('appointment.rescheduleSuccess'), t('appointment.rescheduleSuccessMessage'));
    } catch (error) {
      console.error('Erreur lors du report:', error);
      showError(t('errors.rescheduleError'), t('errors.rescheduleErrorMessage'));
    } finally {
      setLoading(false);
    }
  }, [appointmentToEdit, appointmentStore, client?.id, refreshClientData, t, showSuccess, showError]);


  if (!open || !client) return null;

  return (
    <ClientDetailProvider value={{
      activeTab,
      setActiveTab,
      appointmentsCount: appointments.length,
      invoicesCount: invoicesHook.invoices.length,
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
          window.location.href = '/invoices';
        }
      },
      canCreateInvoice: config.invoice.allowCreate,
      onClose,
    }}>
    <div className="bg-white w-full flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Barre d'onglets (fixe au-dessus du contenu scrollable) */}
        <ClientDetailTabs />
        
        {/* Barre d'actions (alignée avec le contenu) */}
        <ClientDetailActionBar />

        {/* Contenu scrollable */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', maxHeight: '100%' }}>
          {/* Wrapper de panneau pour isoler le contenu */}
          <div className="p-3 sm:p-4">
        {/* Section informations client */}
          {activeTab === ClientDetailTabKey.Info && (
          <div ref={infoRef} className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 border border-gray-200 mb-3 sm:mb-4 overflow-hidden shadow-sm">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Icon name="info" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              {t('clients.personalInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.firstName')}</label>
                <input 
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder={t('event.firstName') as string} 
                  value={clientManagement.state.firstName} 
                  onChange={(e) => clientManagement.dispatch({ firstName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.lastName')}</label>
                <input 
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder={t('event.lastName') as string} 
                  value={clientManagement.state.lastName} 
                  onChange={(e) => clientManagement.dispatch({ lastName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('auth.email')}</label>
                <input 
                  type="email"
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder={t('auth.email') as string} 
                  value={clientManagement.state.email} 
                  onChange={(e) => clientManagement.dispatch({ email: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.phone')}</label>
                <input 
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder={t('event.phone') as string} 
                  value={clientManagement.state.phone} 
                  onChange={(e) => clientManagement.dispatch({ phone: e.target.value })} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('event.address')}</label>
                <input 
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                  placeholder={t('event.address') as string} 
                  value={clientManagement.state.address} 
                  onChange={(e) => clientManagement.dispatch({ address: e.target.value })} 
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="md"
                variant="gradient"
                disabled={clientManagement.loading}
                onClick={clientManagement.updateClient}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
          )}


          {/* Section rendez-vous */}
          {activeTab === ClientDetailTabKey.Appts && (
            <div ref={apptsRef} className="space-y-2 sm:space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon name="calendar" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500">{t('calendar.noAppointments')}</p>
                </div>
              ) : (
                appointments.map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <AppointmentDisplay
                      appointment={appointment}
                      onEdit={handleEditAppointment}
                      onDelete={handleDeleteAppointment}
                      onReschedule={handleEditAppointment}
                      loading={loading}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Section Optique */}
          {activeTab === ClientDetailTabKey.Optics && isOptician() && (
            <div className="space-y-2.5 sm:space-y-3">
              {/* Header avec titre */}
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
                  <Icon name="eye" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="truncate">{t('clients.opticsFile', { defaultValue: 'Dossier Optique' })} - {client?.name}</span>
                </h4>
                
                {/* Bouton Nouvelle facture - Full width sur mobile */}
                <Button
                  onClick={async () => {
                    await opticsInvoicesHook.fetchInvoices();
                    setCurrentOpticsInvoice(null);
                    setOpticsInvoiceEditingMode('create');
                    setShowOpticsInvoiceEditor(true);
                  }}
                  size="md"
                  variant="gradient"
                  className="w-full sm:w-auto text-xs sm:text-sm font-semibold"
                  leftIcon={<Icon name="plus" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                >
                  <span className="hidden sm:inline">{t('invoices.newOpticsInvoice', { defaultValue: 'Nouvelle facture optique' })}</span>
                  <span className="sm:hidden">Nouvelle facture</span>
                </Button>
              </div>
              
              {/* Section Optique */}
              <OpticsSection client={client} />
            </div>
          )}

          {/* Section factures */}
          {activeTab === ClientDetailTabKey.Invoices && (
            <div ref={invoicesRef} className="space-y-2 sm:space-y-4">
              {/* Statistiques des factures - Sticky */}
              {config.invoice.showStatistics && !invoicesHook.loading && invoicesHook.invoices.length > 0 && (
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 mb-2 sm:mb-4 border-b border-gray-200">
                  <InvoiceStatistics 
                    invoices={invoicesHook.invoices} 
                    currency={config.invoice.currency || 'EUR'}
                    className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2"
                  />
                </div>
              )}
              
              {invoicesHook.loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon name="refresh" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 animate-spin" size="lg" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-600">{t('invoices.loadingSummary')}</p>
                </div>
              ) : invoicesHook.invoices.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon name="tag" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" size="lg" />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{t('invoices.noInvoices')}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{t('invoices.createFirst', { defaultValue: 'Créez votre première facture' })}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {invoicesHook.invoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onClick={handleInvoiceClick}
                    />
                  ))}
                </div>
              )}
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

      {/* Modal de formulaire de facture */}
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
        loading={invoicesHook.loading}
      />

      {/* Modal d'actions de facture */}
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
        loading={loading || invoicesHook.loading}
      />

      {/* Modal d'ajout de paiement */}
      <PaymentModal
        open={paymentModalOpen}
        invoice={selectedInvoice}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handlePaymentSubmit}
        onDeletePayment={handleDeletePayment}
        loading={loading || invoicesHook.loading}
      />

      {/* Modal de création de rendez-vous (principe facture) */}
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
              
              // Rafraîchir les données du client depuis le backend pour mettre à jour la liste des rendez-vous
              if (client?.id) {
                await refreshClientData();
              }
              
              // Dispatch l'événement pour rafraîchir les autres composants
              window.dispatchEvent(new Event('refreshAppointments'));
            } catch (error) {
              console.error('Erreur lors de la création du rendez-vous:', error);
            }
          }}
          clients={[]}
        />
      )}

      {/* Modal de report de rendez-vous */}
      <RescheduleModal
        isOpen={showReschedule && !!appointmentToEdit}
        onClose={() => { setShowReschedule(false); setAppointmentToEdit(null); }}
        onConfirm={handleRescheduleConfirm}
        appointment={appointmentToEdit || { id: '', title: '', start: new Date(), end: new Date() }}
        loading={loading}
      />

      {/* Éditeur de facture optique - Modal overlay */}
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

      {/* Impression de facture optique */}
      {showOpticsInvoicePrint && currentOpticsInvoice && (
        <OpticsInvoicePrint
          invoice={currentOpticsInvoice}
          client={opticsInvoiceClientData}
          onClose={handleCloseOpticsInvoicePrint}
        />
      )}
    </ClientDetailProvider>
  );
});

ClientDetailModal.displayName = 'ClientDetailModal';

export default ClientDetailModal;