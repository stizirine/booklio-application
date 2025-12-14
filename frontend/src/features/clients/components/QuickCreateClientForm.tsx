import { Icon } from '@assets/icons';
import { Button, Field, Input } from '@components/ui';
import { useNotification } from '@contexts/NotificationContext';
import { useCapabilities } from '@contexts/TenantContext';
import OpticsSection from '@optics/components/OpticsSection';
import type { NewClientPayload } from '@src/types/clients';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface QuickCreateClientFormProps {
  disabled?: boolean;
  onCreate?: (payload: NewClientPayload) => Promise<any> | void;
}

const QuickCreateClientForm: React.FC<QuickCreateClientFormProps> = ({ disabled, onCreate }) => {
  const { t } = useTranslation();
  const { isOptician } = useCapabilities();
  const { showSuccess, showError } = useNotification();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Required<NewClientPayload>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('event.firstName')} htmlFor="qc-first">
          <Input id="qc-first" placeholder={t('event.firstName') as string} value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
        </Field>
        <Field label={t('event.lastName')} htmlFor="qc-last">
          <Input id="qc-last" placeholder={t('event.lastName') as string} value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
        </Field>
        <Field label={t('auth.email')} htmlFor="qc-email">
          <Input id="qc-email" type="email" placeholder={t('auth.email') as string} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </Field>
        <Field label={t('event.phone')} htmlFor="qc-phone">
          <Input id="qc-phone" placeholder={t('event.phone') as string} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </Field>
        <Field className="sm:col-span-2" label={t('event.address')} htmlFor="qc-address">
          <Input id="qc-address" placeholder={t('event.address') as string} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        </Field>
      </div>
      
      {/* Section Optique - affichée conditionnellement pour les opticiens */}
      {isOptician() && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Icon name="eye" className="w-4 h-4 text-gray-600" />
            Informations Optiques (Optionnel)
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Vous pouvez ajouter des informations optiques spécifiques lors de la création du client.
          </p>
          <OpticsSection />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          className="w-full sm:w-auto"
          variant="gradient"
          size="md"
          disabled={creating || disabled}
          leftIcon={<Icon name="plus" className="w-4 h-4" size="sm" />}
          onClick={async () => {
            if (!onCreate) return;
            try {
              setCreating(true);
              await onCreate(form);
              setForm({ firstName: '', lastName: '', email: '', phone: '', address: '' });
              showSuccess(
                t('clients.createSuccess', { defaultValue: 'Client créé' }),
                t('clients.createSuccessMessage', { 
                  defaultValue: '{{firstName}} {{lastName}} a été ajouté avec succès',
                  firstName: form.firstName,
                  lastName: form.lastName
                })
              );
            } catch (error) {
              showError(
                t('common.error', { defaultValue: 'Erreur' }),
                t('clients.createErrorMessage', { 
                  defaultValue: 'Impossible de créer le client: {{error}}',
                  error: String(error)
                })
              );
            } finally {
              setCreating(false);
            }
          }}
        >
          {creating ? t('common.saving') : t('clients.create')}
        </Button>
      </div>
    </div>
  );
};

export default QuickCreateClientForm;


