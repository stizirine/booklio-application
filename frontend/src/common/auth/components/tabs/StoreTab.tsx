import FormFieldWrapper from '@components/FormFieldWrapper';
import React from 'react';

interface StoreTabProps {
  storeData: any;
  handleStoreChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string, options?: any) => string;
}

export const StoreTab: React.FC<StoreTabProps> = ({
  storeData,
  handleStoreChange,
  onSubmit,
  t,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.storeName')}
            </label>
            <input
              type="text"
              name="storeName"
              value={storeData.storeName}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.storeNamePlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.storePhone')}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={storeData.phoneNumber}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.storePhonePlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper className="md:col-span-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.storeAddress')}
            </label>
            <textarea
              name="storeAddress"
              value={storeData.storeAddress}
              onChange={handleStoreChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.storeAddressPlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.patenteNumber')}
            </label>
            <input
              type="text"
              name="patenteNumber"
              value={storeData.patenteNumber}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.patenteNumberPlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.rcNumber')}
            </label>
            <input
              type="text"
              name="rcNumber"
              value={storeData.rcNumber}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.rcNumberPlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.npeNumber')}
            </label>
            <input
              type="text"
              name="npeNumber"
              value={storeData.npeNumber}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.npeNumberPlaceholder')}
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.iceNumber')}
            </label>
            <input
              type="text"
              name="iceNumber"
              value={storeData.iceNumber}
              onChange={handleStoreChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('profile.iceNumberPlaceholder')}
            />
          </div>
        </FormFieldWrapper>
      </div>
    </form>
  );
};

