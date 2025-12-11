import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import ClientPersonalInfoActions from './ClientPersonalInfoActions';
import ClientPersonalInfoForm from './ClientPersonalInfoForm';

interface ClientPersonalInfoProps {
  state: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  loading: boolean;
  onUpdate: (updates: Partial<ClientPersonalInfoProps['state']>) => void;
  onSave: () => void;
  onCreateAppointment: () => void;
}

const ClientPersonalInfo = memo<ClientPersonalInfoProps>(({
  state,
  loading,
  onUpdate,
  onSave,
  onCreateAppointment
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Informations personnelles */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-gray-600">ℹ️</span>
          {t('clients.personalInfo')}
        </h3>
        <ClientPersonalInfoForm 
          state={state} 
          onUpdate={onUpdate} 
        />
      </div>

      {/* Boutons d'action */}
      <ClientPersonalInfoActions
        loading={loading}
        onSave={onSave}
        onCreateAppointment={onCreateAppointment}
      />
    </>
  );
});

ClientPersonalInfo.displayName = 'ClientPersonalInfo';

export default ClientPersonalInfo;
