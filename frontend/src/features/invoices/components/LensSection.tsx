import FormFieldWrapper from '@components/FormFieldWrapper';
import React from 'react';
import { Field, Input, Select } from '@components/ui';
import { useTranslation } from 'react-i18next';
import { LensData } from '../hooks/useOpticsInvoiceEditor';

interface LensSectionProps {
  lensData: LensData;
  onLensChange: (field: keyof LensData, value: string | number | object) => void;
  onEyeChange: (eye: 'rightEye' | 'leftEye', field: string, value: string) => void;
  isReadOnly: boolean;
}

const LensSection: React.FC<LensSectionProps> = ({
  lensData,
  onLensChange,
  onEyeChange,
  isReadOnly
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
        {t('invoices.correctionLenses', { defaultValue: 'Correction / Verres' })}
      </h3>
      
      <FormFieldWrapper disabled={isReadOnly}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Field label={t('invoices.material', { defaultValue: 'Matériau' })} htmlFor="lens-material">
            <Select id="lens-material" value={lensData.material} onChange={(e) => onLensChange('material', (e.target as HTMLSelectElement).value)}>
              <option value="organique">{t('invoices.organic', { defaultValue: 'Organique' })}</option>
              <option value="minéral">{t('invoices.mineral', { defaultValue: 'Minéral' })}</option>
              <option value="polycarbonate">{t('invoices.polycarbonate', { defaultValue: 'Polycarbonate' })}</option>
            </Select>
          </Field>
          <Field label={t('invoices.index', { defaultValue: 'Indice' })} htmlFor="lens-index">
            <Select id="lens-index" value={lensData.index} onChange={(e) => onLensChange('index', (e.target as HTMLSelectElement).value)}>
              <option value="1.5">1.5</option>
              <option value="1.6">1.6</option>
              <option value="1.67">1.67</option>
              <option value="1.74">1.74</option>
            </Select>
          </Field>
          <Field label={t('invoices.treatment', { defaultValue: 'Traitement' })} htmlFor="lens-treatment">
            <Select id="lens-treatment" value={lensData.treatment} onChange={(e) => onLensChange('treatment', (e.target as HTMLSelectElement).value)}>
              <option value="antireflet">{t('invoices.antireflection', { defaultValue: 'Antireflet' })}</option>
              <option value="durci">{t('invoices.hardened', { defaultValue: 'Durci' })}</option>
              <option value="antireflet+durci">{t('invoices.antireflectionHardened', { defaultValue: 'Antireflet + Durci' })}</option>
              <option value="photochromatique">{t('invoices.photochromic', { defaultValue: 'Photochromatique' })}</option>
            </Select>
          </Field>
          <Field label={t('invoices.price', { defaultValue: 'Prix (DH)' })} htmlFor="lens-price">
            <Input id="lens-price" type="number" value={lensData.price === 0 ? '' : (lensData.price as any)} onChange={(e) => onLensChange('price', parseFloat(e.target.value) || 0)} placeholder={t('invoices.lensPricePlaceholder', { defaultValue: '1350' }) as string} />
          </Field>
        </div>

        {/* Correction détaillée */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">{t('invoices.detailedCorrection', { defaultValue: 'Correction détaillée' })}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Œil droit */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">{t('invoices.rightEye', { defaultValue: 'Œil droit (OD)' })}</h5>
              <div className="grid grid-cols-2 gap-3">
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.sphere', { defaultValue: 'Sphère' })}</span>}>
                  <Input type="text" value={lensData.rightEye.sphere} onChange={(e) => onEyeChange('rightEye', 'sphere', e.target.value)} className="text-sm" placeholder={t('invoices.spherePlaceholder', { defaultValue: '-0.75' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.cylinder', { defaultValue: 'Cylindre' })}</span>}>
                  <Input type="text" value={lensData.rightEye.cylinder} onChange={(e) => onEyeChange('rightEye', 'cylinder', e.target.value)} className="text-sm" placeholder={t('invoices.cylinderPlaceholder', { defaultValue: '0.00' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.axis', { defaultValue: 'Axe' })}</span>}>
                  <Input type="text" value={lensData.rightEye.axis} onChange={(e) => onEyeChange('rightEye', 'axis', e.target.value)} className="text-sm" placeholder={t('invoices.axisPlaceholder', { defaultValue: '82' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.add', { defaultValue: 'Add' })}</span>}>
                  <Input type="text" value={lensData.rightEye.add} onChange={(e) => onEyeChange('rightEye', 'add', e.target.value)} className="text-sm" placeholder={t('invoices.addPlaceholder', { defaultValue: '0.00' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.price', { defaultValue: 'Prix (DH)' })}</span>}>
                  <Input
                    type="number"
                    value={(lensData.rightEyePrice || 0) === 0 ? '' : (lensData.rightEyePrice as any)}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      onLensChange('rightEyePrice', price);
                      onLensChange('price', price + (lensData.leftEyePrice || 0));
                    }}
                    className="text-sm"
                    placeholder="525"
                  />
                </Field>
              </div>
            </div>

            {/* Œil gauche */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">{t('invoices.leftEye', { defaultValue: 'Œil gauche (OG)' })}</h5>
              <div className="grid grid-cols-2 gap-3">
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.sphere', { defaultValue: 'Sphère' })}</span>}>
                  <Input type="text" value={lensData.leftEye.sphere} onChange={(e) => onEyeChange('leftEye', 'sphere', e.target.value)} className="text-sm" placeholder={t('invoices.spherePlaceholder', { defaultValue: '-0.75' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.cylinder', { defaultValue: 'Cylindre' })}</span>}>
                  <Input type="text" value={lensData.leftEye.cylinder} onChange={(e) => onEyeChange('leftEye', 'cylinder', e.target.value)} className="text-sm" placeholder={t('invoices.cylinderPlaceholder', { defaultValue: '0.00' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.axis', { defaultValue: 'Axe' })}</span>}>
                  <Input type="text" value={lensData.leftEye.axis} onChange={(e) => onEyeChange('leftEye', 'axis', e.target.value)} className="text-sm" placeholder={t('invoices.axisPlaceholderLeft', { defaultValue: '95' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.add', { defaultValue: 'Add' })}</span>}>
                  <Input type="text" value={lensData.leftEye.add} onChange={(e) => onEyeChange('leftEye', 'add', e.target.value)} className="text-sm" placeholder={t('invoices.addPlaceholder', { defaultValue: '0.00' }) as string} />
                </Field>
                <Field label={<span className="block text-xs text-gray-600 mb-1">{t('invoices.price', { defaultValue: 'Prix (DH)' })}</span>}>
                  <Input
                    type="number"
                    value={(lensData.leftEyePrice || 0) === 0 ? '' : (lensData.leftEyePrice as any)}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      onLensChange('leftEyePrice', price);
                      onLensChange('price', price + (lensData.rightEyePrice || 0));
                    }}
                    className="text-sm"
                    placeholder="525"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* PD */}
          <div className="mt-4">
            <Field label={t('invoices.pupillaryDistance', { defaultValue: 'Distance pupillaire (PD)' })} htmlFor="lens-pd">
              <Input
                id="lens-pd"
                type="text"
                value={typeof lensData.pd === 'string' ? lensData.pd : 
                     typeof lensData.pd === 'number' ? lensData.pd.toString() :
                     typeof lensData.pd === 'object' && lensData.pd !== null && 'mono' in lensData.pd 
                       ? `${lensData.pd.mono.od}/${lensData.pd.mono.og}${lensData.pd.near ? ` + ${lensData.pd.near}` : ''}`
                       : ''}
                onChange={(e) => {
                const value = e.target.value;
                // Essayer de parser la valeur pour déterminer le format
                // Format numérique simple : "62"
                if (!isNaN(Number(value)) && value.trim() !== '') {
                  onLensChange('pd', Number(value));
                } 
                // Format objet : "32/30" ou "32/30 +2"
                else if (value.includes('/')) {
                  const parts = value.split('+');
                  const mono = parts[0].trim();
                  const [od, og] = mono.split('/').map(Number);
                  const near = parts[1] ? Number(parts[1].trim()) : undefined;
                  if (!isNaN(od) && !isNaN(og)) {
                    onLensChange('pd', { mono: { od, og }, near });
                  }
                }
                // Sinon, traiter comme chaîne
                else {
                  onLensChange('pd', value);
                }
              }}
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
