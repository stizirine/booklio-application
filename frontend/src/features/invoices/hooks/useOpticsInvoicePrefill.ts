import { useClientServices } from '@features/clients/services';
import { useOpticsStore } from '@features/optics/store/opticsStore';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    ep?: string | number | { mono: { od: number; og: number }; near?: number };
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
  const { selectedClient } = useClientServices();
  const opticsStore = useOpticsStore();
  const [prefill, setPrefill] = useState<OpticsInvoicePrefill | null>(null);
  
  // Stabiliser selectedClient et opticsStore avec useRef pour éviter les boucles
  const selectedClientRef = useRef(selectedClient);
  const opticsStoreRef = useRef(opticsStore);
  
  useEffect(() => {
    selectedClientRef.current = selectedClient;
    opticsStoreRef.current = opticsStore;
    // Seulement dépendre des valeurs primitives pour éviter les boucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id, selectedClient?.name]);

  // Utiliser une ref pour éviter les appels multiples simultanés
  const isLoadingRef = useRef(false);

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
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    
    const loadPrefill = async () => {
      try {
        // Charger les prescriptions optiques pour ce client
        const recs = await opticsStoreRef.current.fetchByClient(selectedClientId);
        
        if (cancelled) return;
        
        // Trier par date de création (plus récent en premier)
        const sorted = recs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latest = sorted[0];
        
        // Utiliser uniquement selectedClient du store (pas clients array)
        // Utiliser la ref pour éviter les boucles
        const currentSelectedClient = selectedClientRef.current;
        const client = currentSelectedClient?.id === selectedClientId ? currentSelectedClient : null;

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
              ep: latest.ep as any,
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
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadPrefill();
    
    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
    // Ne dépendre que de selectedClientId et autoLoad pour éviter les boucles
    // selectedClient?.id change trop souvent et cause des boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, autoLoad]);

  const loadPrefill = useCallback(async () => {
    if (!selectedClientId) {
      setPrefill(null);
      return;
    }

    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;

    try {
      const recs = await opticsStoreRef.current.fetchByClient(selectedClientId);
      const sorted = recs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latest = sorted[0];
      // Utiliser selectedClient de manière stable pour éviter les boucles
      const currentSelectedClient = selectedClientRef.current;
      const client = currentSelectedClient?.id === selectedClientId ? currentSelectedClient : null;

      if (latest) {
        setPrefill({
          clientName: client?.name,
          frame: {
            brand: '',
            model: '',
            material: latest.frameMaterial || '',
            color: '',
            price: 0,
          },
          lens: {
            material: latest.index ? 'organique' : 'organique',
            index: latest.index || '1.6',
            treatment: Array.isArray(latest.treatments) && latest.treatments.length > 0 
              ? latest.treatments[0] 
              : 'antireflet',
            brand: 'Cabelans',
            rightEye: {
              sphere: latest.sphereRight?.toString() || '',
              cylinder: latest.cylinderRight?.toString() || '',
              axis: latest.axisRight?.toString() || '',
              add: '',
            },
            leftEye: {
              sphere: latest.sphereLeft?.toString() || '',
              cylinder: latest.cylinderLeft?.toString() || '',
              axis: latest.axisLeft?.toString() || '',
              add: '',
            },
            ep: latest.ep as any,
            price: 0,
            rightEyePrice: 0,
            leftEyePrice: 0,
          },
        });
      } else if (client) {
        setPrefill({ clientName: client.name });
      } else {
        setPrefill(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du préremplissage:', error);
      setPrefill(null);
    } finally {
      isLoadingRef.current = false;
    }
    // Ne dépendre que de selectedClientId pour éviter les boucles
    // opticsStore et selectedClient changent trop souvent et causent des boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  const resetPrefill = useCallback(() => {
    setPrefill(null);
  }, []);

  return {
    prefill,
    resetPrefill,
    loadPrefill,
  };
}

