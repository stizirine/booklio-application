import Icon from '@assets/icons/Icon';
import FormFieldWrapper from '@components/FormFieldWrapper';
import React from 'react';

interface ProfileTabProps {
  user: any;
  formData: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteAvatar: () => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string, options?: any) => string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  formData,
  fileInputRef,
  handleInputChange,
  handleAvatarUpload,
  handleDeleteAvatar,
  onSubmit,
  t,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-8">
      {/* Avatar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <Icon name="user" className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
          >
            <Icon name="camera" className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.avatar && (
            <button
              type="button"
              onClick={handleDeleteAvatar}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              {t('profile.deleteAvatar', { defaultValue: 'Supprimer l\'avatar' })}
            </button>
          )}
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormFieldWrapper>
      </div>
    </form>
  );
};

