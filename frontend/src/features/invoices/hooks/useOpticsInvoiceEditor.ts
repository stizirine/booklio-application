import { useTenant } from '@contexts/TenantContext';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CURRENCY } from '../constants';
import { Invoice, InvoiceItem } from '../types';

export interface FrameData {
  brand: string;
  model: string;
  material: string;
  color: string;
  price: number;
}

export interface LensData {
  material: string;
  index: string;
  treatment: string;
  brand: string;
  rightEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
  leftEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
  ep: number | { mono: { od: number; og: number }; near?: number } | string;
  price: number;
  rightEyePrice: number;
  leftEyePrice: number;
}

export interface UseOpticsInvoiceEditorProps {
  invoice?: Invoice | null;
  clientName?: string;
  initialFrameData?: Partial<FrameData>;
  initialLensData?: {
    material?: string;
    index?: string;
    treatment?: string;
    brand?: string;
    rightEye?: Partial<LensData['rightEye']>;
    leftEye?: Partial<LensData['leftEye']>;
    ep?: LensData['ep'];
    price?: number;
    rightEyePrice?: number;
    leftEyePrice?: number;
  };
  initialInvoiceNumber?: string;
}

export interface UseOpticsInvoiceEditorReturn {
  // États
  frameData: FrameData;
  lensData: LensData;
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  selectedClientId?: string | null;
  
  // Handlers
  handleFrameChange: (field: keyof FrameData, value: string | number) => void;
  handleLensChange: (field: keyof LensData, value: string | number | object) => void;
  handleEyeChange: (eye: 'rightEye' | 'leftEye', field: string, value: string) => void;
  setInvoiceNumber: (value: string) => void;
  setInvoiceDate: (value: string) => void;
  setClientName: (value: string) => void;
  setSelectedClientId: (value: string | null) => void;
  setFrameData: React.Dispatch<React.SetStateAction<FrameData>>;
  setLensData: React.Dispatch<React.SetStateAction<LensData>>;
  
  // Calculs
  calculateTotal: () => number;
  
  // Génération de données
  generateInvoiceData: () => Partial<Invoice>;
}

/**
 * Extrait les données de monture et de verres depuis les items d'une facture
 */
function extractDataFromInvoiceItems(invoice: Invoice | null | undefined): {
  frameData?: Partial<FrameData>;
  lensData?: Partial<LensData>;
} {
  if (!invoice?.items || invoice.items.length === 0) {
    return {};
  }

  const frameData: Partial<FrameData> = {};
  const lensData: Partial<LensData> = {
    rightEye: { sphere: '', cylinder: '', axis: '', add: '' },
    leftEye: { sphere: '', cylinder: '', axis: '', add: '' },
  };

  // Parcourir les items pour extraire les données
  for (const item of invoice.items) {
    const name = item.name || item.description || '';
    const description = item.description || '';
    const category = (item as any).category;

    // Item de monture
    if (category === 'frame' || name.toLowerCase().includes('monture') || description.toLowerCase().includes('monture')) {
      frameData.price = item.unitPrice || 0;
      
      // Extraire les informations depuis le nom/description
      // Format possible: "Monture métal ENRP" ou "Monture métal ENRP modèle"
      const frameMatch = name.match(/monture\s+(\w+)\s+([^\s]+)(?:\s+([^\s]+))?/i);
      if (frameMatch) {
        frameData.material = frameMatch[1] || 'métal';
        frameData.brand = frameMatch[2] || '';
        frameData.model = frameMatch[3] || '';
      }
      
      // Si frameData existe dans l'item (depuis le backend)
      if ((item as any).frameData) {
        const fd = (item as any).frameData;
        frameData.brand = fd.brand || frameData.brand;
        frameData.model = fd.model || frameData.model;
        frameData.material = fd.material || frameData.material;
        frameData.color = fd.color || frameData.color;
      }
    }

    // Item de verres
    if (category === 'lens' || name.toLowerCase().includes('verre') || description.toLowerCase().includes('verre')) {
      lensData.price = (lensData.price || 0) + (item.unitPrice || 0);
      
      // Extraire les informations depuis le nom/description
      // Format possible: "Verres organique 1.6 antireflet Cabelans"
      const lensMatch = name.match(/verre\w*\s+(\w+)\s+([\d.]+)\s+(\w+)\s+(\w+)/i);
      if (lensMatch) {
        lensData.material = lensMatch[1] || 'organique';
        lensData.index = lensMatch[2] || '1.6';
        lensData.treatment = lensMatch[3] || 'antireflet';
        lensData.brand = lensMatch[4] || 'Cabelans';
      }
      
      // Si lensData existe dans l'item (depuis le backend)
      if ((item as any).lensData) {
        const ld = (item as any).lensData;
        lensData.material = ld.material || lensData.material;
        lensData.index = ld.index || lensData.index;
        lensData.treatment = ld.treatment || lensData.treatment;
        lensData.brand = ld.brand || lensData.brand;
        if (ld.rightEye) {
          lensData.rightEye = {
            sphere: String(ld.rightEye.sphere || ''),
            cylinder: String(ld.rightEye.cylinder || ''),
            axis: String(ld.rightEye.axis || ''),
            add: String(ld.rightEye.add || ''),
          };
        }
        if (ld.leftEye) {
          lensData.leftEye = {
            sphere: String(ld.leftEye.sphere || ''),
            cylinder: String(ld.leftEye.cylinder || ''),
            axis: String(ld.leftEye.axis || ''),
            add: String(ld.leftEye.add || ''),
          };
        }
        if (ld.ep !== undefined) {
          lensData.ep = ld.ep;
        }
      }
    }

    // Item de correction (format: "V.OD3 Plan (sphere cylinder à axis)" ou "V.OG3 Plan (...)")
    const correctionMatch = name.match(/V\.(OD|OG)3\s+Plan\s+\(([-\d.]+)\s*([-\d.]+)?\s*à\s*(\d+)\)/i);
    if (correctionMatch) {
      const eye = correctionMatch[1].toLowerCase() === 'od' ? 'rightEye' : 'leftEye';
      const sphere = correctionMatch[2];
      const cylinder = correctionMatch[3] || '';
      const axis = correctionMatch[4];
      
      if (eye === 'rightEye') {
        lensData.rightEyePrice = item.unitPrice || 0;
        if (lensData.rightEye) {
          lensData.rightEye.sphere = sphere;
          lensData.rightEye.cylinder = cylinder;
          lensData.rightEye.axis = axis;
        }
      } else {
        lensData.leftEyePrice = item.unitPrice || 0;
        if (lensData.leftEye) {
          lensData.leftEye.sphere = sphere;
          lensData.leftEye.cylinder = cylinder;
          lensData.leftEye.axis = axis;
        }
      }
    }
  }

  // Extraire les données de correction depuis les notes
  if (invoice.notes) {
    const notesMatch = invoice.notes.match(/OD\s+([-\d.]+)\s+([-\d.]+)?\s+(\d+)(?:\s+([-\d.]+))?\s*\/\s*OG\s+([-\d.]+)\s+([-\d.]+)?\s+(\d+)(?:\s+([-\d.]+))?\s*-\s*EP:\s*(.+)/i);
    if (notesMatch) {
      lensData.rightEye = {
        sphere: notesMatch[1] || '',
        cylinder: notesMatch[2] || '',
        axis: notesMatch[3] || '',
        add: notesMatch[4] || '',
      };
      lensData.leftEye = {
        sphere: notesMatch[5] || '',
        cylinder: notesMatch[6] || '',
        axis: notesMatch[7] || '',
        add: notesMatch[8] || '',
      };
      const epStr = notesMatch[9]?.trim();
      if (epStr) {
        // Parser EP (peut être un nombre ou "mono: od/og + near")
        const monoMatch = epStr.match(/mono:\s*([\d.]+)\/([\d.]+)(?:\s*\+\s*([\d.]+))?/i);
        if (monoMatch) {
          lensData.ep = {
            mono: {
              od: parseFloat(monoMatch[1]),
              og: parseFloat(monoMatch[2]),
            },
            near: monoMatch[3] ? parseFloat(monoMatch[3]) : undefined,
          };
        } else {
          const epNum = parseFloat(epStr);
          if (!isNaN(epNum)) {
            lensData.ep = epNum;
          }
        }
      }
    }
  }

  return { frameData, lensData };
}

export function useOpticsInvoiceEditor({ 
  invoice, 
  clientName: propClientName,
  initialFrameData,
  initialLensData,
  initialInvoiceNumber,
}: UseOpticsInvoiceEditorProps): UseOpticsInvoiceEditorReturn {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  
  // Extraire les données depuis les items de la facture si elle existe
  const extractedData = invoice ? extractDataFromInvoiceItems(invoice) : {};
  const invoiceFrameData = extractedData.frameData || {};
  const invoiceLensData = extractedData.lensData || {};
  
  const [frameData, setFrameData] = useState<FrameData>({
    brand: invoiceFrameData.brand || initialFrameData?.brand || '',
    model: invoiceFrameData.model || initialFrameData?.model || '',
    material: invoiceFrameData.material || initialFrameData?.material || 'métal',
    color: invoiceFrameData.color || initialFrameData?.color || '',
    price: typeof invoiceFrameData.price === 'number' ? invoiceFrameData.price : (typeof initialFrameData?.price === 'number' ? initialFrameData.price : 0)
  });

  const [lensData, setLensData] = useState<LensData>({
    material: invoiceLensData.material || initialLensData?.material || 'organique',
    index: invoiceLensData.index || initialLensData?.index || '1.6',
    treatment: invoiceLensData.treatment || initialLensData?.treatment || 'antireflet',
    brand: invoiceLensData.brand || initialLensData?.brand || 'Cabelans',
    rightEye: invoiceLensData.rightEye ? {
      sphere: invoiceLensData.rightEye.sphere || '',
      cylinder: invoiceLensData.rightEye.cylinder || '',
      axis: invoiceLensData.rightEye.axis || '',
      add: invoiceLensData.rightEye.add || ''
    } : (initialLensData?.rightEye ? {
      sphere: initialLensData.rightEye.sphere || '',
      cylinder: initialLensData.rightEye.cylinder || '',
      axis: initialLensData.rightEye.axis || '',
      add: initialLensData.rightEye.add || ''
    } : {
      sphere: '',
      cylinder: '',
      axis: '',
      add: ''
    }),
    leftEye: invoiceLensData.leftEye ? {
      sphere: invoiceLensData.leftEye.sphere || '',
      cylinder: invoiceLensData.leftEye.cylinder || '',
      axis: invoiceLensData.leftEye.axis || '',
      add: invoiceLensData.leftEye.add || ''
    } : (initialLensData?.leftEye ? {
      sphere: initialLensData.leftEye.sphere || '',
      cylinder: initialLensData.leftEye.cylinder || '',
      axis: initialLensData.leftEye.axis || '',
      add: initialLensData.leftEye.add || ''
    } : {
      sphere: '',
      cylinder: '',
      axis: '',
      add: ''
    }),
    ep: invoiceLensData.ep !== undefined ? invoiceLensData.ep : (initialLensData?.ep !== undefined ? initialLensData.ep : ('' as string | number | { mono: { od: number; og: number }; near?: number })),
    price: typeof invoiceLensData.price === 'number' ? invoiceLensData.price : (typeof initialLensData?.price === 'number' ? initialLensData.price : 0),
    rightEyePrice: typeof invoiceLensData.rightEyePrice === 'number' ? invoiceLensData.rightEyePrice : (typeof initialLensData?.rightEyePrice === 'number' ? initialLensData.rightEyePrice : 0),
    leftEyePrice: typeof invoiceLensData.leftEyePrice === 'number' ? invoiceLensData.leftEyePrice : (typeof initialLensData?.leftEyePrice === 'number' ? initialLensData.leftEyePrice : 0)
  });

  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.number || initialInvoiceNumber || '');
  const [invoiceDate, setInvoiceDate] = useState(
    invoice?.issuedAt ? new Date(invoice.issuedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [clientName, setClientName] = useState(propClientName || invoice?.client?.name || '');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(invoice?.client?.id || null);

  // Appliquer les données de préremplissage quand elles deviennent disponibles (uniquement en création)
  // Utiliser uniquement `invoice` comme dépendance pour éviter les boucles infinies
  useEffect(() => {
    if (!invoice && initialFrameData) {
      setFrameData(prev => ({
        ...prev,
        ...(initialFrameData.material && { material: initialFrameData.material }),
        ...(initialFrameData.brand && { brand: initialFrameData.brand }),
        ...(initialFrameData.model && { model: initialFrameData.model }),
        ...(initialFrameData.color && { color: initialFrameData.color }),
        ...(initialFrameData.price !== undefined && { price: initialFrameData.price }),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  useEffect(() => {
    if (!invoice && initialLensData) {
      setLensData(prev => ({
        ...prev,
        ...(initialLensData.material && { material: initialLensData.material }),
        ...(initialLensData.index && { index: initialLensData.index }),
        ...(initialLensData.treatment && { treatment: initialLensData.treatment }),
        ...(initialLensData.brand && { brand: initialLensData.brand }),
        ...(initialLensData.rightEye && {
          rightEye: {
            sphere: initialLensData.rightEye.sphere || prev.rightEye.sphere,
            cylinder: initialLensData.rightEye.cylinder || prev.rightEye.cylinder,
            axis: initialLensData.rightEye.axis || prev.rightEye.axis,
            add: initialLensData.rightEye.add || prev.rightEye.add,
          }
        }),
        ...(initialLensData.leftEye && {
          leftEye: {
            sphere: initialLensData.leftEye.sphere || prev.leftEye.sphere,
            cylinder: initialLensData.leftEye.cylinder || prev.leftEye.cylinder,
            axis: initialLensData.leftEye.axis || prev.leftEye.axis,
            add: initialLensData.leftEye.add || prev.leftEye.add,
          }
        }),
        ...(initialLensData.ep !== undefined && initialLensData.ep !== null && initialLensData.ep !== '' && { ep: initialLensData.ep }),
        ...(initialLensData.price !== undefined && { price: initialLensData.price }),
        ...(initialLensData.rightEyePrice !== undefined && { rightEyePrice: initialLensData.rightEyePrice }),
        ...(initialLensData.leftEyePrice !== undefined && { leftEyePrice: initialLensData.leftEyePrice }),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  const handleFrameChange = useCallback((field: keyof FrameData, value: string | number) => {
    setFrameData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLensChange = useCallback((field: keyof LensData, value: string | number | object) => {
    setLensData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEyeChange = useCallback((eye: 'rightEye' | 'leftEye', field: string, value: string) => {
    setLensData(prev => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value }
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    return frameData.price + lensData.rightEyePrice + lensData.leftEyePrice;
  }, [frameData.price, lensData.rightEyePrice, lensData.leftEyePrice]);

  const generateInvoiceData = useCallback((): Partial<Invoice> => {
    const frameLabel = t('invoices.frame', { defaultValue: 'Monture' });
    const lensLabel = t('invoices.lenses', { defaultValue: 'Verres' });
    const correctionLabel = t('invoices.correction', { defaultValue: 'Correction' });
    
    // Formater la correction pour un œil (format: "V.OD3 Plan (sphere à axis)" ou "V.OG3 Plan (sphere à axis)")
    const formatEyeCorrection = (eye: 'rightEye' | 'leftEye', sphere: string, cylinder: string, axis: string) => {
      const eyePrefix = eye === 'rightEye' ? 'V.OD3' : 'V.OG3';
      if (sphere && axis) {
        return `${eyePrefix} Plan (${sphere}${cylinder ? ` ${cylinder}` : ''} à ${axis})`;
      }
      return '';
    };

    const items: InvoiceItem[] = [
      {
        id: '1',
        name: `${frameLabel} ${frameData.material} ${frameData.brand} ${frameData.model}`,
        description: `${frameLabel} ${frameData.material} ${frameData.brand} ${frameData.model}`,
        quantity: 1,
        unitPrice: frameData.price
      },
      {
        id: '2',
        name: `${lensLabel} ${lensData.material} ${lensData.index} ${lensData.treatment} ${lensData.brand}`,
        description: `${lensLabel} ${lensData.material} ${lensData.index} ${lensData.treatment} ${lensData.brand}`,
        quantity: 1,
        unitPrice: 0 // Prix des verres sans correction, les corrections ont leur propre prix
      }
    ];

    // Ajouter les corrections pour chaque œil si elles existent
    const rightEyeCorrection = formatEyeCorrection(
      'rightEye',
      lensData.rightEye.sphere,
      lensData.rightEye.cylinder,
      lensData.rightEye.axis
    );
    if (rightEyeCorrection) {
      items.push({
        id: '3',
        name: rightEyeCorrection,
        description: rightEyeCorrection,
        quantity: 1,
        unitPrice: lensData.rightEyePrice
      });
    }

    const leftEyeCorrection = formatEyeCorrection(
      'leftEye',
      lensData.leftEye.sphere,
      lensData.leftEye.cylinder,
      lensData.leftEye.axis
    );
    if (leftEyeCorrection) {
      items.push({
        id: '4',
        name: leftEyeCorrection,
        description: leftEyeCorrection,
        quantity: 1,
        unitPrice: lensData.leftEyePrice
      });
    }

    const formatEp = (ep: LensData['ep']): string => {
      if (typeof ep === 'string') return ep;
      if (typeof ep === 'number') return ep.toString();
      if (typeof ep === 'object' && ep !== null) {
        if ('mono' in ep) {
          return `mono: ${ep.mono.od}/${ep.mono.og}${ep.near ? ` + ${ep.near}` : ''}`;
        }
      }
      return '';
    };
    
    const correctionNote = `${correctionLabel}: OD ${lensData.rightEye.sphere} ${lensData.rightEye.cylinder} ${lensData.rightEye.axis} / OG ${lensData.leftEye.sphere} ${lensData.leftEye.cylinder} ${lensData.leftEye.axis} - EP: ${formatEp(lensData.ep)}`;

    return {
      number: invoiceNumber,
      issuedAt: invoiceDate,
      client: { id: selectedClientId || 'temp', name: clientName },
      items,
      total: calculateTotal(),
      subtotal: calculateTotal(),
      currency: tenant?.currency || invoice?.currency || DEFAULT_CURRENCY,
      notes: correctionNote
    };
  }, [frameData, lensData, invoiceNumber, invoiceDate, clientName, calculateTotal, t, selectedClientId, tenant?.currency, invoice?.currency]);

  return {
    // États
    frameData,
    lensData,
    invoiceNumber,
    invoiceDate,
    clientName,
    selectedClientId,
    
    // Handlers
    handleFrameChange,
    handleLensChange,
    handleEyeChange,
    setInvoiceNumber,
    setInvoiceDate,
    setClientName,
    setSelectedClientId,
    setFrameData,
    setLensData,
    
    // Calculs
    calculateTotal,
    
    // Génération de données
    generateInvoiceData
  };
}