import FormFieldWrapper from '@components/FormFieldWrapper';
import { Field, Input, Select } from '@components/ui';
import React, { useCallback } from 'react';

type _ContactLensFormValues = {
  clType?: string;
  clDesign?: string;
  clAdd?: string;
  clToricCylinder?: string;
  clToricAxis?: string;
  clToricStabilisation?: string;
  clMaterialFamily?: string;
  clWaterContent?: string;
  clDkT?: string;
  clWear?: string;
  clReplacement?: string;
  clBc?: string;
  clDia?: string;
  clOptions?: string[];
  clSolutionBrand?: string;
};

interface ContactLensFormProps {
  form: any;
  handleSelect: (name: any, value: any) => void;
  t: (k: string, o?: any) => string;
  readOnly?: boolean;
}

const ContactLensForm: React.FC<ContactLensFormProps> = ({ form, handleSelect, t, readOnly = false }) => {
  const onSelect = useCallback((name: any) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelect(name, e.target.value);
  }, [handleSelect]);
  const onInput = useCallback((name: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSelect(name, e.target.value);
  }, [handleSelect]);
  const toggleOption = useCallback((key: string) => {
    const current = form.clOptions || [];
    const next = current.includes(key) ? current.filter((k: string) => k !== key) : [...current, key];
    handleSelect('clOptions', next);
  }, [form.clOptions, handleSelect]);
  return (
    <FormFieldWrapper disabled={readOnly}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs sm:text-sm">
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.clType')}</span>}>
        <Select value={form.clType || ''} onChange={onSelect('clType')} className="text-xs sm:text-sm">
          <option value="">{t('common.optional')}</option>
          <option value="soft">{t('optics.clSoft')}</option>
          <option value="rigid">{t('optics.clRigid')}</option>
        </Select>
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.clDesign')}</span>}>
        <Select value={form.clDesign || ''} onChange={onSelect('clDesign')} className="text-xs sm:text-sm">
          <option value="">{t('common.optional')}</option>
          <option value="spherical">{t('optics.clSpherical')}</option>
          <option value="toric">{t('optics.clToric')}</option>
          <option value="multifocal">{t('optics.clMultifocal')}</option>
        </Select>
      </Field>
      <Field label={<span className="text-[10px] sm:text-xs font-semibold text-gray-600">{t('optics.clAdd')}</span>}>
        <Input value={form.clAdd || ''} onChange={onInput('clAdd')} className="text-xs sm:text-sm" />
      </Field>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.clTorique')}</label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <Input value={form.clToricCylinder || ''} onChange={onInput('clToricCylinder')} placeholder={t('optics.cylinder') as string} className="text-xs sm:text-sm" />
          <Input value={form.clToricAxis || ''} onChange={onInput('clToricAxis')} placeholder={t('optics.axis') as string} className="text-xs sm:text-sm" />
          <Select value={form.clToricStabilisation || ''} onChange={onSelect('clToricStabilisation')} className="text-xs sm:text-sm">
            <option value="">{t('common.optional')}</option>
            <option value="prism">{t('optics.prism')}</option>
            <option value="dynamic">{t('optics.dynamic')}</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.clMaterial')}</label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <Select value={form.clMaterialFamily || ''} onChange={onSelect('clMaterialFamily')} className="text-xs sm:text-sm">
            <option value="">{t('common.optional')}</option>
            <option value="hydrogel">Hydrogel</option>
            <option value="silicone_hydrogel">Silicone Hydrogel</option>
          </Select>
          <Input value={form.clWaterContent || ''} onChange={onInput('clWaterContent')} placeholder={t('optics.water') as string} className="text-xs sm:text-sm" />
          <Input value={form.clDkT || ''} onChange={onInput('clDkT')} placeholder={t('optics.dkt') as string} className="text-xs sm:text-sm" />
        </div>
      </div>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.clSchedule')}</label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Select value={form.clWear || ''} onChange={onSelect('clWear')} className="text-xs sm:text-sm">
            <option value="">{t('common.optional')}</option>
            <option value="daily">{t('optics.dailyWear')}</option>
            <option value="extended">{t('optics.extendedWear')}</option>
          </Select>
          <Select value={form.clReplacement || ''} onChange={onSelect('clReplacement')} className="text-xs sm:text-sm">
            <option value="">{t('common.optional')}</option>
            <option value="daily">{t('optics.daily')}</option>
            <option value="weekly">{t('optics.weekly')}</option>
            <option value="monthly">{t('optics.monthly')}</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.geometry')}</label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Input value={form.clBc || ''} onChange={onInput('clBc')} placeholder={t('optics.bc') as string} className="text-xs sm:text-sm" />
          <Input value={form.clDia || ''} onChange={onInput('clDia')} placeholder={t('optics.dia') as string} className="text-xs sm:text-sm" />
        </div>
      </div>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.options')}</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['tint','uv_block','lubrication'].map(key => (
            <label key={key} className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer hover:bg-gray-200">
              <input type="checkbox" checked={(form.clOptions || []).includes(key)} onChange={() => toggleOption(key)} disabled={readOnly} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{key}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.care')}</label>
        <Input value={form.clSolutionBrand || ''} onChange={onInput('clSolutionBrand')} placeholder={t('optics.solutionBrand') as string} className="text-xs sm:text-sm" />
      </div>
    </div>
    </FormFieldWrapper>
  );
};

export default ContactLensForm;


