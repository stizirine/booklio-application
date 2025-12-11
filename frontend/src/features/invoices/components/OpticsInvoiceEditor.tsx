import { useClientServices } from '@features/clients/services';
import { useOpticsStore } from '@features/optics/store/opticsStore';
import { useFormMode } from '@hooks/useFormMode';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpticsInvoiceEditor } from '../hooks/useOpticsInvoiceEditor';
import { Invoice } from '../types';
import FrameSection from './FrameSection';
import InvoiceGeneralInfo from './InvoiceGeneralInfo';
import LensSection from './LensSection';

interface OpticsInvoiceEditorProps {
  invoice?: Invoice | null;
  onSave: (invoiceData: Partial<Invoice>) => void;
  onCancel: () => void;
  readOnly?: boolean;
  clientName?: string;
  // Préremplissage optionnel
  initialFrameData?: {
    brand?: string;
    model?: string;
    material?: string;
    color?: string;
    price?: number;
  };
  initialLensData?: {
    material?: string;
    index?: string;
    treatment?: string;
    brand?: string;
    rightEye?: { sphere?: string; cylinder?: string; axis?: string; add?: string };
    leftEye?: { sphere?: string; cylinder?: string; axis?: string; add?: string };
    pd?: number | { mono: { od: number; og: number }; near?: number } | string;
    price?: number;
    rightEyePrice?: number;
    leftEyePrice?: number;
  };
  initialInvoiceNumber?: string;
}

const OpticsInvoiceEditor: React.FC<OpticsInvoiceEditorProps> = ({
  invoice,
  onSave,
  onCancel,
  readOnly = false,
  clientName: propClientName,
  initialFrameData,
  initialLensData,
  initialInvoiceNumber
}) => {
  const { t } = useTranslation();
  // Gestion des modes de formulaire
  const { isReadOnly } = useFormMode({
    editingId: invoice?.id || null,
    showForm: true,
    isViewing: readOnly,
    defaultMode: 'create'
  });

  // Hook personnalisé pour la logique métier
  const {
    frameData,
    lensData,
    invoiceNumber,
    invoiceDate,
    clientName,
    selectedClientId,
    handleFrameChange,
    handleLensChange,
    handleEyeChange,
    setInvoiceNumber,
    setInvoiceDate,
    setClientName,
    setSelectedClientId,
    setFrameData,
    setLensData,
    calculateTotal,
    generateInvoiceData
  } = useOpticsInvoiceEditor({ invoice, clientName: propClientName, initialFrameData, initialLensData });
  
  // Si un numéro initial est fourni et que l'état est vide, l'appliquer
  useEffect(() => {
    if (!invoice && initialInvoiceNumber && !invoiceNumber) {
      setInvoiceNumber(initialInvoiceNumber);
    }
  }, [invoice, initialInvoiceNumber, invoiceNumber, setInvoiceNumber]);

  // Services clients et prescriptions
  const { clients, searchClients } = useClientServices();
  const opticsStore = useOpticsStore();

  // Déclencher la recherche sur saisie du champ Client (création uniquement)
  useEffect(() => {
    if (isReadOnly) return;
    const id = setTimeout(() => {
      if (clientName && clientName.trim().length >= 2 && !selectedClientId) {
        searchClients(clientName).catch(() => {});
      }
    }, 300);
    return () => clearTimeout(id);
  }, [clientName, selectedClientId, isReadOnly, searchClients]);

  // Lorsque l’utilisateur sélectionne un client dans la liste
  const handleClientSelect = async (client: { id: string; name: string }) => {
    setClientName(client.name);
    setSelectedClientId(client.id);
    // Préremplir depuis dernière prescription
    try {
      const recs = await opticsStore.fetchByClient(client.id);
      const latest = recs.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))[0];
      if (latest) {
        setFrameData(prev => ({
          ...prev,
          material: latest.frameMaterial || prev.material,
        }));
        setLensData(prev => ({
          ...prev,
          index: latest.index || prev.index,
          treatment: Array.isArray(latest.treatments) ? (latest.treatments[0] || prev.treatment) : prev.treatment,
          rightEye: {
            sphere: latest.sphereRight || '',
            cylinder: latest.cylinderRight || '',
            axis: latest.axisRight || '',
            add: prev.rightEye.add
          },
          leftEye: {
            sphere: latest.sphereLeft || '',
            cylinder: latest.cylinderLeft || '',
            axis: latest.axisLeft || '',
            add: prev.leftEye.add
          },
          pd: (latest.pd as any) ?? prev.pd,
        }));
      }
    } catch {
      // silencieux
    }
  };

  const handleSave = () => {
    const invoiceData = generateInvoiceData();
    onSave(invoiceData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isReadOnly 
            ? t('invoices.viewInvoice', { defaultValue: 'Consulter la facture' })
            : invoice 
              ? t('invoices.editInvoice', { defaultValue: 'Modifier la facture' })
              : t('invoices.newOpticsInvoice', { defaultValue: 'Nouvelle facture optique' })
          }
        </h2>
        
        {/* Informations générales */}
        <InvoiceGeneralInfo
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          clientName={clientName}
          onInvoiceNumberChange={setInvoiceNumber}
          onInvoiceDateChange={setInvoiceDate}
          onClientNameChange={setClientName}
          isReadOnly={isReadOnly}
          clientSuggestions={!isReadOnly && !selectedClientId ? clients : []}
          onClientSelect={handleClientSelect}
        />

        {/* Section Monture */}
        <FrameSection
          frameData={frameData}
          onFrameChange={handleFrameChange}
          isReadOnly={isReadOnly}
        />

        {/* Section Correction/Verres */}
        <LensSection
          lensData={lensData}
          onLensChange={handleLensChange}
          onEyeChange={handleEyeChange}
          isReadOnly={isReadOnly}
        />

        {/* Total */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">{t('invoices.total', { defaultValue: 'Total' })}</span>
            <span className="text-2xl font-bold text-blue-600">{calculateTotal()} DH</span>
          </div>
        </div>

        {/* Boutons d'action */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel', { defaultValue: 'Annuler' })}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {invoice 
                ? t('invoices.updateInvoice', { defaultValue: 'Mettre à jour' })
                : t('invoices.createInvoice', { defaultValue: 'Créer la facture' })
              }
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {t('common.close', { defaultValue: 'Fermer' })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpticsInvoiceEditor;