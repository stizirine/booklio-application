import { useClientServices } from '@features/clients/services';
import { useOpticsStore } from '@features/optics/store/opticsStore';
import { useFormMode } from '@hooks/useFormMode';
import React, { useCallback, useEffect, useState } from 'react';
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
  
  // État local pour stocker les résultats de recherche uniquement
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');

  // Fonction pour initialiser automatiquement un client unique
  const initializeSingleClient = useCallback((singleClient: { id: string; name: string }) => {
    setClientName(singleClient.name);
    setSelectedClientId(singleClient.id);
    // Préremplir depuis dernière prescription
    opticsStore.fetchByClient(singleClient.id)
      .then(recs => {
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
      })
      .catch(() => {
        // silencieux
      });
  }, [setClientName, setSelectedClientId, setFrameData, setLensData, opticsStore]);

  // Déclencher la recherche sur saisie du champ Client (création uniquement)
  useEffect(() => {
    if (isReadOnly) return;
    
    // Réinitialiser les résultats si le champ est vide ou si un client est déjà sélectionné
    if (!clientName || clientName.trim().length === 0 || selectedClientId) {
      setSearchResults([]);
      setLastSearchQuery('');
      return;
    }
    
    const searchQuery = clientName.trim();
    
    // Ne pas rechercher si moins de 2 caractères
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setLastSearchQuery('');
      return;
    }
    
    const id = setTimeout(async () => {
      // Éviter les recherches inutiles si la requête n'a pas changé
      if (searchQuery === lastSearchQuery) {
        return;
      }
      
      setLastSearchQuery(searchQuery);
      const queryLower = searchQuery.toLowerCase();
      
      // 1. PRIORITÉ : Chercher d'abord dans le store (clients déjà chargés)
      const storeResults = clients.filter(c => {
        const name = (c.name || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        return name.includes(queryLower) || phone.includes(queryLower);
      });
      
      // Si on a des résultats dans le store, les utiliser directement
      if (storeResults.length > 0) {
        const formattedResults = storeResults.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone
        }));
        setSearchResults(formattedResults);
        
        // Si un seul résultat dans le store, l'initialiser automatiquement
        if (formattedResults.length === 1 && !selectedClientId) {
          initializeSingleClient(formattedResults[0]);
        }
        // Pas besoin d'appel API si on a déjà des résultats dans le store
      } else {
        // 2. Si pas de résultats dans le store, faire un appel à l'endpoint
        try {
          await searchClients(searchQuery);
          
          // Attendre que le store soit mis à jour
          setTimeout(() => {
            // Filtrer les résultats pour correspondre exactement à la recherche
            const filtered = clients.filter(c => {
              const name = (c.name || '').toLowerCase();
              const phone = (c.phone || '').toLowerCase();
              return name.includes(queryLower) || phone.includes(queryLower);
            });
            
            const formattedResults = filtered.map(c => ({
              id: c.id,
              name: c.name,
              phone: c.phone
            }));
            
            setSearchResults(formattedResults);
            
            // Si un seul résultat après l'appel API, l'initialiser automatiquement
            if (formattedResults.length === 1 && !selectedClientId) {
              initializeSingleClient(formattedResults[0]);
            }
          }, 50);
        } catch {
          setSearchResults([]);
        }
      }
    }, 300);
    return () => clearTimeout(id);
  }, [clientName, selectedClientId, isReadOnly, searchClients, clients, lastSearchQuery, initializeSingleClient]);

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
          clientSuggestions={!isReadOnly && !selectedClientId && searchResults.length > 1 ? searchResults : []}
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