import { Capability } from '@common/auth/types';
import { useNotification } from '@contexts/NotificationContext';
import { useCapabilities } from '@contexts/TenantContext';
import { presentApiErrorI18n } from '@src/helpers/errors';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OpticsInvoiceCreatePayload, opticsInvoicesApi, OpticsInvoiceUpdatePayload } from '../api/opticsInvoices.api';
import { Invoice } from '../types';

interface UseOpticsInvoicesProps {
  clientId?: string;
  autoFetch?: boolean;
}

export const useOpticsInvoices = ({ clientId, autoFetch = true }: UseOpticsInvoicesProps = {}) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotification();
  const capabilities = useCapabilities();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions
  const canAccessOptics = useCallback(() => {
    return capabilities.canAccessOptics();
  }, [capabilities]);

  const canManageInvoices = useCallback(() => {
    return capabilities.hasCapability(Capability.Invoices);
  }, [capabilities]);

  const canPrintInvoices = useCallback(() => {
    return capabilities.canPrintOptics();
  }, [capabilities]);

  // Charger la liste des factures
  const fetchInvoices = useCallback(async (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => {
    if (!capabilities.canAccessOptics()) {
      setError(t('errors.unauthorizedAccessMessage', { defaultValue: "Vous n'avez pas les permissions nécessaires pour accéder aux factures optiques." }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await opticsInvoicesApi.listOpticsInvoices({
        clientId,
        ...params
      });
      // S'assurer que response est un tableau
      setInvoices(Array.isArray(response) ? response : []);
    } catch (err) {
      console.warn('Erreur lors du chargement des factures optiques:', err);
      // En cas d'erreur, initialiser avec un tableau vide au lieu d'afficher une erreur
      setInvoices([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [clientId, capabilities]);

  // Charger une facture spécifique
  const fetchInvoice = useCallback(async (id: string) => {
    if (!capabilities.canAccessOptics()) {
      setError(t('errors.unauthorizedAccessMessage', { defaultValue: "Vous n'avez pas les permissions nécessaires pour accéder aux factures optiques." }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoice = await opticsInvoicesApi.getOpticsInvoice(id);
      setCurrentInvoice(invoice);
      return invoice;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [capabilities, t, showError]);

  // Créer une nouvelle facture
  const createInvoice = useCallback(async (payload: OpticsInvoiceCreatePayload): Promise<Invoice> => {
    if (!capabilities.hasCapability(Capability.Invoices)) {
      // Soft-check: on continue pour les environnements sans capability explicite
      console.warn('Capability.Invoices manquante - tentative de création quand même');
    }

    setLoading(true);
    setError(null);

    try {
      const invoice = await opticsInvoicesApi.createOpticsInvoice(payload);
      setInvoices(prev => [invoice, ...prev]);
      showSuccess(
        t('common.success'),
        t('invoices.createSuccess', { defaultValue: 'Facture créée avec succès' })
      );
      return invoice;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [capabilities, t, showError, showSuccess]);

  // Mettre à jour une facture
  const updateInvoice = useCallback(async (id: string, payload: OpticsInvoiceUpdatePayload): Promise<Invoice> => {
    if (!capabilities.hasCapability(Capability.Invoices)) {
      throw new Error(t('errors.updatePermissionDenied', { defaultValue: 'Permission refusée pour modifier des factures' }));
    }

    setLoading(true);
    setError(null);

    try {
      const invoice = await opticsInvoicesApi.updateOpticsInvoice(id, payload);
      setInvoices(prev => prev.map(inv => inv.id === id ? invoice : inv));
      if (currentInvoice?.id === id) {
        setCurrentInvoice(invoice);
      }
      showSuccess(
        t('common.success'),
        t('invoices.updateSuccess', { defaultValue: 'Facture mise à jour avec succès' })
      );
      return invoice;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [capabilities, currentInvoice?.id, t, showError, showSuccess]);

  // Supprimer une facture
  const deleteInvoice = useCallback(async (id: string): Promise<void> => {
    if (!capabilities.hasCapability(Capability.Invoices)) {
      throw new Error(t('errors.deletePermissionDenied', { defaultValue: 'Permission refusée pour supprimer des factures' }));
    }

    setLoading(true);
    setError(null);

    try {
      await opticsInvoicesApi.deleteOpticsInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      if (currentInvoice?.id === id) {
        setCurrentInvoice(null);
      }
      showSuccess(
        t('common.success'),
        t('invoices.deleteSuccess', { defaultValue: 'Facture supprimée avec succès' })
      );
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [capabilities, currentInvoice?.id, t, showError, showSuccess]);

  // Générer un PDF
  const generatePDF = useCallback(async (id: string): Promise<Blob> => {
    if (!capabilities.canPrintOptics()) {
      throw new Error(t('errors.printPermissionDenied', { defaultValue: 'Permission refusée pour imprimer des factures' }));
    }

    try {
      return await opticsInvoicesApi.generateOpticsInvoicePDF(id);
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      showError(title, message);
      throw err;
    }
  }, [capabilities, t, showError]);

  // Envoyer par email
  const sendInvoice = useCallback(async (id: string, email: string): Promise<void> => {
    if (!capabilities.hasCapability(Capability.Invoices)) {
      throw new Error(t('errors.sendPermissionDenied', { defaultValue: 'Permission refusée pour envoyer des factures' }));
    }

    try {
      await opticsInvoicesApi.sendOpticsInvoice(id, email);
      showSuccess(
        t('common.success'),
        t('invoices.sendSuccess', { defaultValue: 'Facture envoyée avec succès' })
      );
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      showError(title, message);
      throw err;
    }
  }, [capabilities, t, showError, showSuccess]);

  // Marquer comme payée
  const markAsPaid = useCallback(async (id: string, paymentData: {
    amount: number;
    method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }): Promise<Invoice> => {
    if (!capabilities.hasCapability(Capability.Invoices)) {
      throw new Error(t('errors.paymentPermissionDenied', { defaultValue: 'Permission refusée pour gérer les paiements' }));
    }

    try {
      const invoice = await opticsInvoicesApi.markOpticsInvoiceAsPaid(id, paymentData);
      setInvoices(prev => prev.map(inv => inv.id === id ? invoice : inv));
      if (currentInvoice?.id === id) {
        setCurrentInvoice(invoice);
      }
      showSuccess(
        t('common.success'),
        t('invoices.paymentSuccess', { defaultValue: 'Paiement enregistré avec succès' })
      );
      return invoice;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      showError(title, message);
      throw err;
    }
  }, [capabilities, currentInvoice?.id, t, showError, showSuccess]);

  // Charger automatiquement au montage
  useEffect(() => {
    if (autoFetch && capabilities.canAccessOptics()) {
      // Appel direct sans dépendance sur fetchInvoices
      const loadInvoices = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await opticsInvoicesApi.listOpticsInvoices({
            clientId
          });
          setInvoices(Array.isArray(response) ? response : []);
        } catch (err) {
          console.warn('Erreur lors du chargement des factures optiques:', err);
          setInvoices([]);
          setError(null);
        } finally {
          setLoading(false);
        }
      };
      
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, clientId]);

  return {
    // State
    invoices,
    currentInvoice,
    loading,
    error,

    // Actions
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generatePDF,
    sendInvoice,
    markAsPaid,

    // Setters
    setCurrentInvoice,

    // Permissions
    canAccessOptics,
    canManageInvoices,
    canPrintInvoices,
  };
};
