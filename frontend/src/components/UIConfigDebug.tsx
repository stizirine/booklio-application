import React from 'react';
import { FeatureFlag } from '../common/auth/types';
import { useUIConfig } from '../contexts';
import { useCapabilities } from '../contexts/TenantContext';

const UIConfigDebug: React.FC = () => {
  const { config, canCreateInvoice, canAccessOptics } = useUIConfig();
  const { isOptician, hasFeatureFlag } = useCapabilities();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm text-xs">
      <h3 className="font-semibold text-gray-900 mb-2">🔧 UIConfig Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Client Type:</strong> {isOptician() ? 'Opticien' : 'Générique'}
        </div>
        
        <div>
          <strong>Factures:</strong>
          <ul className="ml-2">
            <li>• showStatistics: {config.invoice.showStatistics ? '✅' : '❌'}</li>
            <li>• allowCreate: {config.invoice.allowCreate ? '✅' : '❌'}</li>
            <li>• creationMode: {config.invoice.creationMode}</li>
            <li>• currency: {config.invoice.currency}</li>
          </ul>
        </div>
        
        <div>
          <strong>Rendez-vous:</strong>
          <ul className="ml-2">
            <li>• showCalendar: {config.appointment.showCalendar ? '✅' : '❌'}</li>
            <li>• allowCreate: {config.appointment.allowCreate ? '✅' : '❌'}</li>
            <li>• allowEdit: {config.appointment.allowEdit ? '✅' : '❌'}</li>
            <li>• allowDelete: {config.appointment.allowDelete ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div>
          <strong>Clients:</strong>
          <ul className="ml-2">
            <li>• showOpticsSection: {config.client.showOpticsSection ? '✅' : '❌'}</li>
            <li>• allowBulkImport: {config.client.allowBulkImport ? '✅' : '❌'}</li>
            <li>• showAdvancedFields: {config.client.showAdvancedFields ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div>
          <strong>Helpers:</strong>
          <ul className="ml-2">
            <li>• canCreateInvoice: {canCreateInvoice('test-client') ? '✅' : '❌'}</li>
            <li>• canAccessOptics: {canAccessOptics() ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div>
          <strong>Feature Flags:</strong>
          <ul className="ml-2">
            <li>• optics.advanced_measurements: {hasFeatureFlag(FeatureFlag.OpticsAdvancedMeasurements) ? '✅' : '❌'}</li>
            <li>• optics.photo_upload: {hasFeatureFlag(FeatureFlag.OpticsPhotoUpload) ? '✅' : '❌'}</li>
            <li>• invoices.auto_reminder: {hasFeatureFlag(FeatureFlag.InvoicesAutoReminder) ? '✅' : '❌'}</li>
            <li>• appointments.sms_notifications: {hasFeatureFlag(FeatureFlag.AppointmentsSmsNotifications) ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UIConfigDebug;
