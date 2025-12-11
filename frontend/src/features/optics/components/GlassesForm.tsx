import FormFieldWrapper from '@components/FormFieldWrapper';
import { Field, Input, Select } from '@components/ui';
import React, { useCallback, useMemo } from 'react';
import { useOpticsStore } from '../store/opticsStore';
import { FrameMaterial, FrameType, GLASSES_TREATMENTS } from '../types';

type _GlassesFormValues = {
  lensType?: string;
  index?: string;
  treatments?: string[];
  segmentHeight?: string;
  vertexDistance?: string;
  baseCurve?: string;
  frameType?: string;
  frameEye?: string;
  frameBridge?: string;
  frameTemple?: string;
  frameMaterial?: string;
};

interface GlassesFormProps {
  form: any;
  handleSelect: (name: any, value: any) => void;
  handleToggleTreatment: (t: string) => void;
  t: (k: string, o?: any) => string;
  readOnly?: boolean;
}

const GlassesForm: React.FC<GlassesFormProps> = ({ form, handleSelect, handleToggleTreatment, t, readOnly = false }) => {
  const { config } = useOpticsStore();

  const lensTypes: string[] = useMemo(() => {
    if (config?.lensTypes && config.lensTypes.length) return config.lensTypes as string[];
    return ['single_vision','progressive','bifocal'];
  }, [config?.lensTypes]);

  const treatments: string[] = useMemo(() => {
    if (config?.treatments && config.treatments.length) return config.treatments as string[];
    return GLASSES_TREATMENTS as unknown as string[];
  }, [config?.treatments]);

  const frameTypes: string[] = useMemo(() => {
    if (config?.frameTypes && config.frameTypes.length) return config.frameTypes as string[];
    return [FrameType.FullRim, FrameType.SemiRim, FrameType.Rimless] as string[];
  }, [config?.frameTypes]);

  const indices: string[] | undefined = useMemo(() => {
    return config?.indices && config.indices.length ? (config.indices as string[]) : undefined;
  }, [config?.indices]);

  const frameMaterials: string[] = useMemo(() => {
    if (config?.frameMaterials && config.frameMaterials.length) return config.frameMaterials as string[];
    return [
      FrameMaterial.Acetate,
      FrameMaterial.Metal,
      FrameMaterial.Titanium,
      FrameMaterial.TR90,
      FrameMaterial.Carbon,
      FrameMaterial.Wood,
    ] as string[];
  }, [config?.frameMaterials]);

  const onSelectChange = useCallback((name: any) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelect(name, e.target.value);
  }, [handleSelect]);
  return (
    <FormFieldWrapper disabled={readOnly}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs sm:text-sm">
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.lensType')}</span>}>
        <Select value={form.lensType || 'single_vision'} onChange={onSelectChange('lensType')} className="text-xs sm:text-sm">
          {lensTypes.map((lt) => (
            <option key={lt} value={lt}>{t(`optics.${lt === 'single_vision' ? 'singleVision' : lt}`, { defaultValue: lt })}</option>
          ))}
        </Select>
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.index')}</span>}>
        {indices ? (
          <Select value={form.index || indices[0] || ''} onChange={onSelectChange('index')} className="text-xs sm:text-sm">
            {indices.map(idx => (
              <option key={idx} value={idx}>{idx}</option>
            ))}
          </Select>
        ) : (
          <Input value={form.index || '1.50'} onChange={(e) => handleSelect('index', e.target.value)} className="text-xs sm:text-sm" />
        )}
      </Field>
      <div className="sm:col-span-2">
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.treatments')}</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(treatments).map(key => (
            <label key={key} className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer hover:bg-gray-200">
              <input type="checkbox" checked={(form.treatments || []).includes(key)} onChange={() => handleToggleTreatment(key)} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t(`optics.treatment.${key}`, { defaultValue: key })}</span>
            </label>
          ))}
        </div>
      </div>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.segmentHeight')}</span>}>
        <Input value={form.segmentHeight || ''} onChange={(e) => handleSelect('segmentHeight', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.vertexDistance')}</span>}>
        <Input value={form.vertexDistance || ''} onChange={(e) => handleSelect('vertexDistance', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.baseCurve')}</span>}>
        <Input value={form.baseCurve || ''} onChange={(e) => handleSelect('baseCurve', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.frameType')}</span>}>
        <Select value={form.frameType || FrameType.FullRim} onChange={onSelectChange('frameType')} className="text-xs sm:text-sm">
          {frameTypes.map((ft) => (
            <option key={ft} value={ft}>{t(`optics.${ft === 'full_rim' ? 'fullRim' : ft === 'semi_rim' ? 'halfRim' : ft}`, { defaultValue: ft })}</option>
          ))}
        </Select>
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.frameEye')}</span>}>
        <Input value={form.frameEye || ''} onChange={(e) => handleSelect('frameEye', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.frameBridge')}</span>}>
        <Input value={form.frameBridge || ''} onChange={(e) => handleSelect('frameBridge', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.frameTemple')}</span>}>
        <Input value={form.frameTemple || ''} onChange={(e) => handleSelect('frameTemple', e.target.value)} className="text-xs sm:text-sm" />
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.frameMaterial')}</span>}>
        <Select value={form.frameMaterial || ''} onChange={onSelectChange('frameMaterial')} className="text-xs sm:text-sm">
          <option value="">{t('common.optional')}</option>
          {frameMaterials.map(m => (
            <option key={m} value={m}>{t(`optics.frameMaterialList.${m}`, { defaultValue: m })}</option>
          ))}
        </Select>
      </Field>
    </div>
    </FormFieldWrapper>
  );
};

export default GlassesForm;


