import FormFieldWrapper from '@components/FormFieldWrapper';
import React from 'react';
import { OpticsRecord } from '../types';

function formatEpValue(ep: unknown): string {
  if (!ep) return '';
  if (typeof ep === 'object' && ep !== null && 'mono' in (ep as any)) {
    const v = ep as any;
    const base = `${v.mono.od}/${v.mono.og}`;
    return v.near ? `${base} + ${v.near}` : base;
  }
  return String(ep);
}

interface CorrectionFieldsProps {
  form: Partial<OpticsRecord>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  canTakeMeasurements: boolean;
  isReadOnly: boolean;
  t: (key: string) => string;
}

export const CorrectionFields: React.FC<CorrectionFieldsProps> = ({
  form,
  onChange,
  canTakeMeasurements,
  isReadOnly,
  t,
}) => {
  return (
    <FormFieldWrapper disabled={isReadOnly}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs sm:text-sm">
        {/* Sphere */}
        <div>
          <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.sphere')}</label>
          <div className="space-y-1.5 sm:space-y-2">
            <input 
              name="sphereRight" 
              value={form.sphereRight || ''} 
              onChange={onChange} 
              placeholder={t('optics.sphereRight')} 
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
            />
            <input 
              name="sphereLeft" 
              value={form.sphereLeft || ''} 
              onChange={onChange} 
              placeholder={t('optics.sphereLeft')} 
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
            />
          </div>
        </div>

        {/* Cylinder */}
        {canTakeMeasurements && (
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.cylinder')}</label>
            <div className="space-y-1.5 sm:space-y-2">
              <input 
                name="cylinderRight" 
                value={form.cylinderRight || ''} 
                onChange={onChange} 
                placeholder={t('optics.cylinderRight')} 
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
              <input 
                name="cylinderLeft" 
                value={form.cylinderLeft || ''} 
                onChange={onChange} 
                placeholder={t('optics.cylinderLeft')} 
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
            </div>
          </div>
        )}

        {/* Axis */}
        {canTakeMeasurements && (
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.axis')}</label>
            <div className="space-y-1.5 sm:space-y-2">
              <input 
                name="axisRight" 
                value={form.axisRight || ''} 
                onChange={onChange} 
                placeholder={t('optics.axisRight')} 
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
              <input 
                name="axisLeft" 
                value={form.axisLeft || ''} 
                onChange={onChange} 
                placeholder={t('optics.axisLeft')} 
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
            </div>
          </div>
        )}

        {/* Other */}
        <div>
          <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.other')}</label>
          <div className="space-y-1.5 sm:space-y-2">
            <input
              name="ep"
              value={formatEpValue(form.ep)}
              onChange={onChange}
              placeholder={t('optics.ep')}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <textarea 
              name="add" 
              value={form.add || ''} 
              onChange={onChange} 
              placeholder={t('optics.add')} 
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 min-h-[60px] sm:min-h-[72px] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none" 
            />
          </div>
        </div>
      </div>
    </FormFieldWrapper>
  );
};
