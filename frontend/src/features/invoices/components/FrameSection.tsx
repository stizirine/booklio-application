import FormFieldWrapper from '@components/FormFieldWrapper';
import { Field, Input, Select } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FrameData } from '../hooks/useOpticsInvoiceEditor';

interface FrameSectionProps {
  frameData: FrameData;
  onFrameChange: (field: keyof FrameData, value: string | number) => void;
  isReadOnly: boolean;
}

const FrameSection: React.FC<FrameSectionProps> = ({
  frameData,
  onFrameChange,
  isReadOnly
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
        {t('invoices.frame', { defaultValue: 'Monture' })}
      </h3>
      
      <FormFieldWrapper disabled={isReadOnly}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label={t('invoices.brand', { defaultValue: 'Marque' })} htmlFor="frame-brand">
            <Input id="frame-brand" type="text" value={frameData.brand} onChange={(e) => onFrameChange('brand', e.target.value)} placeholder={t('invoices.brandPlaceholder', { defaultValue: 'ENZO' }) as string} />
          </Field>
          <Field label={t('invoices.model', { defaultValue: 'Modèle' })} htmlFor="frame-model">
            <Input id="frame-model" type="text" value={frameData.model} onChange={(e) => onFrameChange('model', e.target.value)} placeholder={t('invoices.modelPlaceholder', { defaultValue: 'Modèle' }) as string} />
          </Field>
          <Field label={t('invoices.material', { defaultValue: 'Matériau' })} htmlFor="frame-material">
            <Select id="frame-material" value={frameData.material} onChange={(e) => onFrameChange('material', (e.target as HTMLSelectElement).value)}>
              <option value="métal">{t('invoices.metal', { defaultValue: 'Métal' })}</option>
              <option value="acétate">{t('invoices.acetate', { defaultValue: 'Acétate' })}</option>
              <option value="titane">{t('invoices.titanium', { defaultValue: 'Titane' })}</option>
              <option value="TR90">{t('invoices.tr90', { defaultValue: 'TR90' })}</option>
            </Select>
          </Field>
          <Field label={t('invoices.price', { defaultValue: 'Prix (DH)' })} htmlFor="frame-price">
            <Input id="frame-price" type="number" value={frameData.price === 0 ? '' : (frameData.price as any)} onChange={(e) => onFrameChange('price', parseFloat(e.target.value) || 0)} placeholder={t('invoices.pricePlaceholder', { defaultValue: '450' }) as string} />
          </Field>
        </div>
      </FormFieldWrapper>
    </div>
  );
};

export default FrameSection;
