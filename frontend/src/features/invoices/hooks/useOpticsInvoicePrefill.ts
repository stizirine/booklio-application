import { useClientServices } from '@features/clients/services';
import { useOpticsStore } from '@features/optics/store/opticsStore';
import { useEffect, useState, useCallback } from 'react';

export interface OpticsInvoicePrefill {
  frame?: {
    brand?: string;
    model?: string;
    material?: string;
    color?: string;
    price?: number;
  };
  lens?: {
    material?: string;
    index?: string;
    treatment?: string;
    brand?: string;
    rightEye?: {
      sphere?: string;
      cylinder?: string;
      axis?: string;
      add?: string;
    };
    leftEye?: {
      sphere?: string;
      cylinder?: string;
      axis?: string;
      add?: string;
    };
    pd?: string | number | { mono: { od: number; og: number }; near?: number };
    price?: number;
    rightEyePrice?: number;
    leftEyePrice?: number;
  };
  clientName?: string;
}

interface UseOpticsInvoicePrefillProps {
  selectedClientId: string | null;
  autoLoad?: boolean;
}

export function useOpticsInvoicePrefill({
  selectedClientId,
  autoLoad = true,
}: UseOpticsInvoicePrefillProps) {
  const { clients, selectedClient } = useClientServices();
  const opticsStore = useOpticsStore();
  const [prefill, setPrefill] = useState<OpticsInvoicePrefill | null>(null);

  useEffect(() => {
    if (!autoLoad || !selectedClientId) {
      if (!autoLoad) {
        // Ne pas effacer les données si on désactive simplement autoLoad
        // Cela permet de garder les données déjà chargées
        return;
      }
      setPrefill(null);
      return;
    }

    let cancelled = false;
    
    const loadPrefill = async () => {
      try {
        // Charger les prescriptions optiques pour ce client
        const recs = await opticsStore.fetchByClient(selectedClientId);
        
        if (cancelled) return;
        
        // Trier par date de création (plus récent en premier)
        const sorted = recs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latest = sorted[0];
        
        // Trouver le client dans la liste
        const client = clients.find(c => c.id === selectedClientId) || selectedClient || null;

        if (cancelled) return;

        if (latest) {
          // Préremplir avec la dernière prescription
          setPrefill({
            clientName: client?.name,
            frame: {
              brand: '', // Non disponible dans la prescription
              model: '', // Non disponible dans la prescription
              material: latest.frameMaterial || '',
              color: '', // Non disponible dans la prescription
              price: 0, // À saisir manuellement
            },
            lens: {
              material: latest.index ? 'organique' : 'organique', // Par défaut organique
              index: latest.index || '1.6',
              treatment: Array.isArray(latest.treatments) && latest.treatments.length > 0 
                ? latest.treatments[0] 
                : 'antireflet',
              brand: 'Cabelans', // Par défaut
              rightEye: {
                sphere: latest.sphereRight?.toString() || '',
                cylinder: latest.cylinderRight?.toString() || '',
                axis: latest.axisRight?.toString() || '',
                add: '', // Non disponible directement dans la prescription
              },
              leftEye: {
                sphere: latest.sphereLeft?.toString() || '',
                cylinder: latest.cylinderLeft?.toString() || '',
                axis: latest.axisLeft?.toString() || '',
                add: '', // Non disponible directement dans la prescription
              },
              pd: latest.pd as any,
              price: 0, // À saisir manuellement
              rightEyePrice: 0, // À saisir manuellement
              leftEyePrice: 0, // À saisir manuellement
            },
          });
        } else if (client) {
          // Pas de prescription, mais on a le client
          setPrefill({ clientName: client.name });
        } else {
          setPrefill(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erreur lors du chargement du préremplissage:', error);
          setPrefill(null);
        }
      }
    };

    loadPrefill();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, autoLoad]);

  const resetPrefill = useCallback(() => {
    setPrefill(null);
  }, []);

  return {
    prefill,
    resetPrefill,
  };
}

