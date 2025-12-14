import { useProfile } from '@common/auth/hooks/useProfile';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';

export interface UseOpticsInvoicePrintProps {
  invoice: Invoice | null;
}

export interface UseOpticsInvoicePrintReturn {
  // Données utilisateur
  user: any;
  
  // Fonctions utilitaires
  formatDate: (dateString?: string) => string;
  formatCurrency: (amount: number) => string;
  
  // Données de la facture formatées
  invoiceHeader: {
    storeName: string;
    ownerName: string;
    storeAddress: string;
    phoneNumber: string;
    patenteNumber: string;
    rcNumber: string;
    npeNumber: string;
    iceNumber: string;
  };
  
  // Données de prescription
  prescriptionData: {
    prescriber?: string;
    prescriptionDate?: string;
  };
  
  // Actions
  handlePrint: () => void;
}

export function useOpticsInvoicePrint({ invoice: _invoice }: UseOpticsInvoicePrintProps): UseOpticsInvoicePrintReturn {
  const { user } = useProfile();
  const { t } = useTranslation();

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return `${amount.toFixed(0)} ${t('invoices.currencySymbol', { defaultValue: 'DH' })}`;
  }, [t]);

  const invoiceHeader = {
    storeName: user?.storeName || 'ICHBILIA OPTIQUE',
    ownerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    storeAddress: user?.storeAddress || '45 bis bloc -D- Hay Sahra TanTan',
    phoneNumber: user?.phoneNumber || '06 61 37 48 07',
    patenteNumber: user?.patenteNumber || '2418056',
    rcNumber: user?.rcNumber || '5943',
    npeNumber: user?.npeNumber || '035031590',
    iceNumber: user?.iceNumber || '002933361000044'
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Extraire les données de prescription depuis invoice si disponible
  const prescriptionData = {
    prescriber: _invoice?.notes?.match(/Prescripteur:\s*(.+?)(?:\s|$)/i)?.[1] || undefined,
    prescriptionDate: _invoice?.notes?.match(/Ordonnance:\s*(.+?)(?:\s|$)/i)?.[1] || 
                      (_invoice?.issuedAt ? new Date(_invoice.issuedAt).toLocaleDateString('fr-FR') : undefined)
  };

  return {
    user,
    formatDate,
    formatCurrency,
    invoiceHeader,
    prescriptionData,
    handlePrint
  };
}
