import { Field, Input } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientPersonalInfoFormProps {
  state: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  onUpdate: (updates: Partial<ClientPersonalInfoFormProps['state']>) => void;
}

const ClientPersonalInfoForm: React.FC<ClientPersonalInfoFormProps> = ({
  state,
  onUpdate
}) => {
  const { t } = useTranslation();

  const formFields = [
    {
      key: 'firstName' as keyof ClientPersonalInfoFormProps['state'],
      label: t('clients.firstName'),
      placeholder: t('clients.firstNamePlaceholder'),
      type: 'text' as const,
      span: 'sm:col-span-1'
    },
    {
      key: 'lastName' as keyof ClientPersonalInfoFormProps['state'],
      label: t('clients.lastName'),
      placeholder: t('clients.lastNamePlaceholder'),
      type: 'text' as const,
      span: 'sm:col-span-1'
    },
    {
      key: 'email' as keyof ClientPersonalInfoFormProps['state'],
      label: t('clients.email'),
      placeholder: t('clients.emailPlaceholder'),
      type: 'email' as const,
      span: 'sm:col-span-1'
    },
    {
      key: 'phone' as keyof ClientPersonalInfoFormProps['state'],
      label: t('clients.phone'),
      placeholder: t('clients.phonePlaceholder'),
      type: 'tel' as const,
      span: 'sm:col-span-1'
    },
    {
      key: 'address' as keyof ClientPersonalInfoFormProps['state'],
      label: t('clients.address'),
      placeholder: t('clients.addressPlaceholder'),
      type: 'text' as const,
      span: 'sm:col-span-2'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {formFields.map((field) => (
        <Field key={String(field.key)} label={field.label} className={field.span}>
          <Input
            type={field.type}
            value={state[field.key] ?? ''}
            onChange={(e) => onUpdate({ [field.key]: (e.target as HTMLInputElement).value })}
            placeholder={field.placeholder as string}
          />
        </Field>
      ))}
    </div>
  );
};

export default ClientPersonalInfoForm;
