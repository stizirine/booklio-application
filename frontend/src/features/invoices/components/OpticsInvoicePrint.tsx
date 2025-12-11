import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOpticsInvoicePrint } from '../hooks/useOpticsInvoicePrint';
import { Invoice } from '../types';
import InvoiceFooter from './InvoiceFooter';
import InvoiceHeader from './InvoiceHeader';
import InvoiceItemsTable from './InvoiceItemsTable';

interface OpticsInvoicePrintProps {
  invoice: Invoice;
  client?: {
    name?: string;
    address?: string;
    ssn?: string;
    birthDate?: string;
  } | null;
  onClose: () => void;
}

const OpticsInvoicePrint: React.FC<OpticsInvoicePrintProps> = ({ invoice, client, onClose }) => {
  const { t } = useTranslation();
  
  // Logs pour déboguer les données client
  console.log('🖨️ OpticsInvoicePrint - Client Data:', {
    invoice: invoice,
    invoiceClient: invoice.client,
    clientProp: client,
    invoiceNumber: invoice.number,
    invoiceItems: invoice.items
  });
  
  const {
    formatDate,
    formatCurrency,
    invoiceHeader,
    handlePrint,
    prescriptionData
  } = useOpticsInvoicePrint({ invoice });

  // Extraire les infos de correction depuis notes si disponible
  const parseCorrectionFromNotes = (notes?: string) => {
    if (!notes) return null;
    // Format: "Correction: OD -2.5 -0.75 180 / OG -2.25 -0.5 10 - PD: 28.5/28.5"
    const pdMatch = notes.match(/PD:\s*(.+?)(?:\s|$)/i);
    const odMatch = notes.match(/OD\s+([-\d.]+(?:\s+[-\d.]+)?\s+\d+)/i);
    const ogMatch = notes.match(/OG\s+([-\d.]+(?:\s+[-\d.]+)?\s+\d+)/i);
    
    return {
      pd: pdMatch ? pdMatch[1].trim() : null,
      od: odMatch ? odMatch[1].trim() : null,
      og: ogMatch ? ogMatch[1].trim() : null,
    };
  };

  const correction = parseCorrectionFromNotes(invoice.notes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Boutons d'action en mode écran */}
        <div className="flex justify-end p-4 border-b no-print bg-gray-50">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            {t('invoices.print', { defaultValue: 'Imprimer' })}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t('common.close', { defaultValue: 'Fermer' })}
          </button>
        </div>

        {/* Facture à imprimer */}
        <div className="p-8 print:p-6 print:bg-white" id="invoice-to-print">
          {/* En-tête */}
          <InvoiceHeader
            {...invoiceHeader}
            clientName={client?.name || invoice.client?.name}
            clientAddress={client?.address}
            clientSSN={client?.ssn}
            clientBirthDate={client?.birthDate}
          />

          {/* Informations facture */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {t('invoices.invoice', { defaultValue: 'FACTURE' })} N° {invoice.number || '—'}
                </h2>
                <p className="text-sm text-gray-700">
                  {t('invoices.actDate', { defaultValue: 'Date Acte' })}: {formatDate(invoice.issuedAt)} - 
                  {t('invoices.clientCopy', { defaultValue: ' Exemplaire client' })}
                </p>
              </div>
              {/* Ecart pupillaire (droite) */}
              {correction?.pd && (
                <div className="text-right text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">
                      {t('invoices.pupillaryDistance', { defaultValue: 'Distance pupillaire (PD)' })}:
                    </span>{' '}
                    {correction.pd.includes('/') ? (
                      <>
                        {t('invoices.pd.mono', { defaultValue: 'mono' })}: {correction.pd.split('/')[0].trim()}/{correction.pd.split('/')[1].trim()}
                      </>
                    ) : (
                      correction.pd
                    )}
                  </p>
                </div>
              )}
            </div>
            
            {/* Ordonnance si disponible */}
            {invoice.notes && (
              <div className="text-xs text-gray-600">
                <p>
                  {t('invoices.prescription', { defaultValue: 'Ordonnance' })}: {formatDate(invoice.issuedAt)} - 
                  {t('invoices.newPrescription', { defaultValue: ' Nouvelle Ordonnance' })}
                </p>
                {prescriptionData.prescriber && (
                  <p>
                    {t('invoices.prescriber', { defaultValue: 'Prescripteur' })}: {prescriptionData.prescriber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tableau des articles */}
          <InvoiceItemsTable invoice={invoice} formatCurrency={formatCurrency} />

          {/* Section bas de page supprimée (disponibilité des pièces + paiement) */}

          {/* Timbre ACQUITTÉE si payée */}
          {invoice.status === 'paid' && (
            <div className="flex justify-end mb-6">
              <div className="border-4 border-red-600 rounded-full px-8 py-4 bg-red-50">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✓</span>
                          <span className="text-xl font-bold text-red-600 uppercase">
                            {t('invoices.paidStamp', { defaultValue: 'ACQUITTÉE' })}
                          </span>
                </div>
              </div>
            </div>
          )}

          {/* Pied de page */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600 text-center">
              {t('invoices.issuedIn', { defaultValue: 'Fait à' })} {invoiceHeader.storeAddress.split(',')[1]?.trim() || 'Louveciennes'}, 
              {' '}{t('invoices.on', { defaultValue: 'le' })} {formatDate(invoice.issuedAt)}
            </p>
            <InvoiceFooter
              storeName={invoiceHeader.storeName}
              ownerName={invoiceHeader.ownerName}
              npeNumber={invoiceHeader.npeNumber}
            />
          </div>
        </div>

        {/* Styles d'impression */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-to-print,
            #invoice-to-print * {
              visibility: visible;
            }
            #invoice-to-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0.5cm;
              background: white;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OpticsInvoicePrint;