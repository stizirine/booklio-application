import FormFieldWrapper from '@components/FormFieldWrapper';
import React from 'react';

interface PasswordTabProps {
  passwordData: any;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string, options?: any) => string;
}

export const PasswordTab: React.FC<PasswordTabProps> = ({
  passwordData,
  handlePasswordChange,
  onSubmit,
  t,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-8">
      <div className="space-y-4">
        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.currentPassword')}
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.newPassword')}
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.confirmPassword')}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </FormFieldWrapper>
      </div>
    </form>
  );
};

