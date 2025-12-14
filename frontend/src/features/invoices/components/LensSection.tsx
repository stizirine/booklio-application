import FormFieldWrapper from '@components/FormFieldWrapper';
import { Field, Input, Select } from '@components/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LensData } from '../hooks/useOpticsInvoiceEditor';

interface LensSectionProps {
  lensData: LensData;
  onLensChange: (field: keyof LensData, value: string | number | object) => void;
  onEyeChange: (eye: 'rightEye' | 'leftEye', field: string, value: string) => void;
  isReadOnly: boolean;
}

// Constantes pour les options des selects
const MATERIAL_OPTIONS = [
  { value: 'organique', key: 'organic' },
  { value: 'minéral', key: 'mineral' },
  { value: 'polycarbonate', key: 'polycarbonate' },
] as const;

const INDEX_OPTIONS = ['1.5', '1.6', '1.67', '1.74'] as const;

const TREATMENT_OPTIONS = [
  { value: 'antireflet', key: 'antireflection' },
  { value: 'durci', key: 'hardened' },
  { value: 'antireflet+durci', key: 'antireflectionHardened' },
  { value: 'photochromatique', key: 'photochromic' },
] as const;

// Champs de correction pour un œil
const EYE_FIELDS = [
  { key: 'sphere', placeholderKey: 'spherePlaceholder' },
  { key: 'cylinder', placeholderKey: 'cylinderPlaceholder' },
  { key: 'axis', placeholderKey: 'axisPlaceholder' },
  { key: 'add', placeholderKey: 'addPlaceholder' },
] as const;

// Fonctions utilitaires pour le PD
const formatPDValue = (pd: LensData['pd']): string => {
  if (typeof pd === 'string') return pd;
  if (typeof pd === 'number') return pd.toString();
  if (typeof pd === 'object' && pd !== null && 'mono' in pd) {
    return `${pd.mono.od}/${pd.mono.og}${pd.near ? ` + ${pd.near}` : ''}`;
  }
  return '';
};

const parsePDValue = (value: string): string | number | { mono: { od: number; og: number }; near?: number } => {
  const trimmed = value.trim();
  
  // Format numérique simple : "62"
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }
  
  // Format objet : "32/30" ou "32/30 +2"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('+');
    const mono = parts[0].trim();
    const [od, og] = mono.split('/').map(Number);
    const near = parts[1] ? Number(parts[1].trim()) : undefined;
    
    if (!isNaN(od) && !isNaN(og)) {
      return { mono: { od, og }, near };
    }
  }
  
  // Sinon, traiter comme chaîne
  return trimmed;
};

// Composant pour les champs de correction d'un œil
interface EyeCorrectionFieldsProps {
  eye: 'rightEye' | 'leftEye';
  eyeData: LensData['rightEye'] | LensData['leftEye'];
  eyePrice: number;
  otherEyePrice: number;
  onEyeChange: (eye: 'rightEye' | 'leftEye', field: string, value: string) => void;
  onLensChange: (field: keyof LensData, value: string | number | object) => void;
  t: (key: string, opts?: any) => string;
}

const EyeCorrectionFields: React.FC<EyeCorrectionFieldsProps> = ({
  eye,
  eyeData,
  eyePrice,
  otherEyePrice,
  onEyeChange,
  onLensChange,
  t,
}) => {
  const eyeLabel = eye === 'rightEye' 
    ? t('invoices.rightEye', { defaultValue: 'Œil droit (OD)' })
    : t('invoices.leftEye', { defaultValue: 'Œil gauche (OG)' });
  
  const axisPlaceholderKey = eye === 'rightEye' 
    ? 'axisPlaceholder' 
    : 'axisPlaceholderLeft';

  const handlePriceChange = (price: number) => {
    const priceField = eye === 'rightEye' ? 'rightEyePrice' : 'leftEyePrice';
    onLensChange(priceField, price);
    onLensChange('price', price + otherEyePrice);
  };

  return (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-3">{eyeLabel}</h5>
      <div className="grid grid-cols-2 gap-3">
        {EYE_FIELDS.map((field) => (
          <Field 
            key={field.key}
            label={<span className="block text-xs text-gray-600 mb-1">{t(`invoices.${field.key}`, { defaultValue: field.key })}</span>}
          >
            <Input
              type="text"
              value={eyeData[field.key as keyof typeof eyeData] || ''}
              onChange={(e) => onEyeChange(eye, field.key, e.target.value)}
              className="text-sm"
              placeholder={t(`invoices.${field.key === 'axis' ? axisPlaceholderKey : field.placeholderKey}`, { 
                defaultValue: field.key === 'axis' && eye === 'leftEye' ? '95' : field.key === 'sphere' ? '-0.75' : '0.00' 
              }) as string}
            />
          </Field>
        ))}
        <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.price', { defaultValue: 'Prix (DH)' })}</span>}>
          <Input
            type="number"
            value={eyePrice === 0 ? '' : eyePrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            className="text-sm"
            placeholder={t('invoices.pricePlaceholder', { defaultValue: '525' })}
          />
        </Field>
      </div>
    </div>
  );
};

const LensSection: React.FC<LensSectionProps> = ({
  lensData,
  onLensChange,
  onEyeChange,
  isReadOnly
}) => {
  const { t } = useTranslation();
  
  const pdValue = useMemo(() => formatPDValue(lensData.pd), [lensData.pd]);
  
  const handlePDChange = (value: string) => {
    onLensChange('pd', parsePDValue(value));
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
        {t('invoices.correctionLenses', { defaultValue: 'Correction / Verres' })}
      </h3>
      
      <FormFieldWrapper disabled={isReadOnly}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Field label={t('invoices.material', { defaultValue: 'Matériau' })} htmlFor="lens-material">
            <Select 
              id="lens-material" 
              value={lensData.material} 
              onChange={(e) => onLensChange('material', (e.target as HTMLSelectElement).value)}
            >
              {MATERIAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`invoices.${option.key}`, { defaultValue: option.value })}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('invoices.index', { defaultValue: 'Indice' })} htmlFor="lens-index">
            <Select 
              id="lens-index" 
              value={lensData.index} 
              onChange={(e) => onLensChange('index', (e.target as HTMLSelectElement).value)}
            >
              {INDEX_OPTIONS.map((index) => (
                <option key={index} value={index}>{index}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('invoices.treatment', { defaultValue: 'Traitement' })} htmlFor="lens-treatment">
            <Select 
              id="lens-treatment" 
              value={lensData.treatment} 
              onChange={(e) => onLensChange('treatment', (e.target as HTMLSelectElement).value)}
            >
              {TREATMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`invoices.${option.key}`, { defaultValue: option.value })}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Correction détaillée */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {t('invoices.detailedCorrection', { defaultValue: 'Correction détaillée' })}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EyeCorrectionFields
              eye="rightEye"
              eyeData={lensData.rightEye}
              eyePrice={lensData.rightEyePrice || 0}
              otherEyePrice={lensData.leftEyePrice || 0}
              onEyeChange={onEyeChange}
              onLensChange={onLensChange}
              t={t}
            />
            <EyeCorrectionFields
              eye="leftEye"
              eyeData={lensData.leftEye}
              eyePrice={lensData.leftEyePrice || 0}
              otherEyePrice={lensData.rightEyePrice || 0}
              onEyeChange={onEyeChange}
              onLensChange={onLensChange}
              t={t}
            />
          </div>

          {/* PD */}
          <div className="mt-4">
            <Field label={t('invoices.pupillaryDistance', { defaultValue: 'Distance pupillaire (PD)' })} htmlFor="lens-pd">
              <Input
                id="lens-pd"
                type="text"
                value={pdValue}
                onChange={(e) => handlePDChange(e.target.value)}
                className="w-48"
                placeholder={t('invoices.pdPlaceholder', { defaultValue: '62 ou 32/30 +2' }) as string}
              />
            </Field>
            <span className="ml-2 text-sm text-gray-600">{t('invoices.mm', { defaultValue: 'mm' })}</span>
          </div>
        </div>
      </FormFieldWrapper>
    </div>
  );
};

export default LensSection;
