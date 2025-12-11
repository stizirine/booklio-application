import Icon from '@assets/icons/Icon';
import { Field, Input } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClientInfoFormProps {
  state: any;
  dispatch: (partial: any) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ state, dispatch }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6 shadow-sm">
      <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
        <Icon name="info" className="w-4 h-4 text-gray-600" size="sm" />
        {t('clients.personalInfo')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Field label={t('event.firstName')} htmlFor="ci-first">
          <Input id="ci-first" placeholder={t('event.firstName') as string} value={state.firstName} onChange={(e) => dispatch({ firstName: e.target.value })} />
        </Field>
        <Field label={t('event.lastName')} htmlFor="ci-last">
          <Input id="ci-last" placeholder={t('event.lastName') as string} value={state.lastName} onChange={(e) => dispatch({ lastName: e.target.value })} />
        </Field>
        <Field label={t('auth.email')} htmlFor="ci-email">
          <Input id="ci-email" type="email" placeholder={t('auth.email') as string} value={state.email} onChange={(e) => dispatch({ email: e.target.value })} />
        </Field>
        <Field label={t('event.phone')} htmlFor="ci-phone">
          <Input id="ci-phone" placeholder={t('event.phone') as string} value={state.phone} onChange={(e) => dispatch({ phone: e.target.value })} />
        </Field>
        <Field className="md:col-span-2" label={t('event.address')} htmlFor="ci-address">
          <Input id="ci-address" placeholder={t('event.address') as string} value={state.address} onChange={(e) => dispatch({ address: e.target.value })} />
        </Field>
      </div>
    </div>
  );
};

export default ClientInfoForm;
