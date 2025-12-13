import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  pd: number | { mono: { od: number; og: number }; near?: number } | string;
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
    pd?: LensData['pd'];
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

export function useOpticsInvoiceEditor({ 
  invoice, 
  clientName: propClientName,
  initialFrameData,
  initialLensData,
  initialInvoiceNumber,
}: UseOpticsInvoiceEditorProps): UseOpticsInvoiceEditorReturn {
  const { t } = useTranslation();
  
  const [frameData, setFrameData] = useState<FrameData>({
    brand: initialFrameData?.brand || '',
    model: initialFrameData?.model || '',
    material: initialFrameData?.material || 'métal',
    color: initialFrameData?.color || '',
    price: typeof initialFrameData?.price === 'number' ? initialFrameData!.price! : 0
  });

  const [lensData, setLensData] = useState<LensData>({
    material: initialLensData?.material || 'organique',
    index: initialLensData?.index || '1.6',
    treatment: initialLensData?.treatment || 'antireflet',
    brand: initialLensData?.brand || 'Cabelans',
    rightEye: {
      sphere: initialLensData?.rightEye?.sphere || '',
      cylinder: initialLensData?.rightEye?.cylinder || '',
      axis: initialLensData?.rightEye?.axis || '',
      add: initialLensData?.rightEye?.add || ''
    },
    leftEye: {
      sphere: initialLensData?.leftEye?.sphere || '',
      cylinder: initialLensData?.leftEye?.cylinder || '',
      axis: initialLensData?.leftEye?.axis || '',
      add: initialLensData?.leftEye?.add || ''
    },
    pd: (initialLensData?.pd as any) ?? ('' as string | number | { mono: { od: number; og: number }; near?: number }),
    price: typeof initialLensData?.price === 'number' ? initialLensData!.price! : 0,
    rightEyePrice: typeof initialLensData?.rightEyePrice === 'number' ? initialLensData!.rightEyePrice! : 0,
    leftEyePrice: typeof initialLensData?.leftEyePrice === 'number' ? initialLensData!.leftEyePrice! : 0
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
        ...(initialLensData.pd !== undefined && initialLensData.pd !== null && initialLensData.pd !== '' && { pd: initialLensData.pd }),
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

    const formatPd = (pd: LensData['pd']): string => {
      if (typeof pd === 'string') return pd;
      if (typeof pd === 'number') return pd.toString();
      if (typeof pd === 'object' && pd !== null) {
        if ('mono' in pd) {
          return `mono: ${pd.mono.od}/${pd.mono.og}${pd.near ? ` + ${pd.near}` : ''}`;
        }
      }
      return '';
    };
    
    const correctionNote = `${correctionLabel}: OD ${lensData.rightEye.sphere} ${lensData.rightEye.cylinder} ${lensData.rightEye.axis} / OG ${lensData.leftEye.sphere} ${lensData.leftEye.cylinder} ${lensData.leftEye.axis} - PD: ${formatPd(lensData.pd)}`;

    return {
      number: invoiceNumber,
      issuedAt: invoiceDate,
      client: { id: selectedClientId || 'temp', name: clientName },
      items,
      total: calculateTotal(),
      subtotal: calculateTotal(),
      notes: correctionNote
    };
  }, [frameData, lensData, invoiceNumber, invoiceDate, clientName, calculateTotal, t, selectedClientId]);

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