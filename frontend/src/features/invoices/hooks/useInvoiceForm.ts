import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@contexts/TenantContext';
import { DEFAULT_CURRENCY, DEFAULT_PAYMENT_METHOD, PaymentMethod } from '../constants';
import { Invoice, InvoiceCreatePayload, InvoiceUpdatePayload } from '../types';

interface InvoiceFormData {
  currency: string;
  notes: string;
  totalAmount: string;
  advanceAmount: string;
  advanceMethod: PaymentMethod;
}

interface UseInvoiceFormProps {
  invoice?: Invoice | null;
  clientId: string;
  open: boolean;
  onSubmit: (data: InvoiceCreatePayload | InvoiceUpdatePayload) => Promise<void>;
}

export function useInvoiceForm({ invoice, clientId, open, onSubmit }: UseInvoiceFormProps) {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Déterminer la devise initiale : tenant > default
  const getInitialCurrency = (): string => {
    return tenant?.currency || DEFAULT_CURRENCY;
  };

  const [formData, setFormData] = useState<InvoiceFormData>({
    currency: getInitialCurrency(),
    notes: '',
    totalAmount: '',
    advanceAmount: '',
    advanceMethod: DEFAULT_PAYMENT_METHOD,
  });

  // Initialiser le formulaire avec les données de la facture ou réinitialiser
  useEffect(() => {
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        currency: invoice.currency || DEFAULT_CURRENCY,
        notes: invoice.notes || '',
        totalAmount: invoice.total?.toString() || '',
        advanceAmount: invoice.advanceAmount?.toString() || '',
        advanceMethod: DEFAULT_PAYMENT_METHOD,
      }));
    } else {
      // En création, utiliser la devise du tenant ou la devise par défaut
      const defaultCurrency = tenant?.currency || DEFAULT_CURRENCY;
      setFormData({
        currency: defaultCurrency,
        notes: '',
        totalAmount: '',
        advanceAmount: '',
        advanceMethod: DEFAULT_PAYMENT_METHOD,
      });
    }
    setValidationError(null);
  }, [invoice, open, tenant?.currency]);

  // Mettre à jour la devise si le tenant devient disponible en mode création
  // Ce useEffect s'assure que la devise est mise à jour même si le tenant se charge après l'ouverture du formulaire
  useEffect(() => {
    if (!invoice && open && tenant?.currency) {
      // Mettre à jour si la devise a changé
      setFormData(prev => {
        if (prev.currency !== tenant.currency) {
          return { ...prev, currency: tenant.currency || DEFAULT_CURRENCY };
        }
        return prev;
      });
    }
  }, [tenant?.currency, invoice, open]);

  // Calculer le solde restant
  const balanceDue = parseFloat(formData.totalAmount || '0') - parseFloat(formData.advanceAmount || '0');

  // Valider les données du formulaire
  const validateForm = useCallback((): boolean => {
    setValidationError(null);
    const totalAmount = parseFloat(formData.totalAmount);
    const advanceAmount = parseFloat(formData.advanceAmount || '0');

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setValidationError(t('invoices.invalidTotal'));
      return false;
    }

    if (advanceAmount > totalAmount) {
      setValidationError(t('invoices.advanceTooHigh'));
      return false;
    }

    return true;
  }, [formData, t]);

  // Construire le payload pour l'API
  const buildPayload = useCallback((): InvoiceCreatePayload | InvoiceUpdatePayload => {
    const totalAmount = parseFloat(formData.totalAmount);
    const advanceAmount = parseFloat(formData.advanceAmount || '0');
    const isUpdate = Boolean(invoice);

    // Préparer les notes au format attendu par le backend
    const notesPayload = formData.notes ? {
      comment: formData.notes
    } : undefined;

    // Construire le payload de base
    // Pour les factures générales créées via InvoiceFormModal, le type est toujours 'Invoice'
    const payload: any = {
      clientId,
      totalAmount,
      creditAmount: 0,
      currency: formData.currency,
      notes: notesPayload,
    };
    
    // Définir le type selon le contexte :
    // - En création : toujours 'Invoice' pour les factures générales
    // - En mise à jour : préserver le type existant de la facture (ou 'Invoice' par défaut)
    if (isUpdate) {
      // Préserver le type existant lors de la mise à jour
      payload.type = invoice?.type || 'Invoice';
    } else {
      // En création, toujours 'Invoice' pour les factures générales
      payload.type = 'Invoice' as const;
    }

    // Gestion de l'avance :
    // - En création: utiliser payments (accepté par le backend pour créer et recalculer advanceAmount)
    // - En mise à jour: le backend PATCH n'accepte pas payments; on envoie advanceAmount directement
    if (advanceAmount > 0) {
      if (isUpdate) {
        payload.advanceAmount = advanceAmount;
      } else {
        payload.payments = [
          {
            amount: advanceAmount,
            method: formData.advanceMethod,
            notes: t('invoices.initialPayment'),
          }
        ];
      }
    }

    return payload;
  }, [formData, clientId, t, invoice]);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    const payload = buildPayload();
    await onSubmit(payload);
  }, [validateForm, buildPayload, onSubmit]);

  // Mettre à jour un champ du formulaire
  const updateField = useCallback(<K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur de validation quand l'utilisateur modifie un champ
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  return {
    formData,
    balanceDue,
    updateField,
    handleSubmit,
    validationError,
  };
}
