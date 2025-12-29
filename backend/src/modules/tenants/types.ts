import { ClientType } from './model.js';

export enum Capability {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Appointments = 'appointments',
  Invoices = 'invoices',
  Optics = 'optics',
}

export enum FeatureFlag {
  OpticsPrescriptions = 'optics_prescriptions',
  OpticsMeasurements = 'optics_measurements',
  OpticsPrint = 'optics_print',
  OpticsAdvancedMeasurements = 'optics.advanced_measurements',
  OpticsAutoCalculation = 'optics.auto_calculation',
  OpticsPhotoUpload = 'optics.photo_upload',
  InvoicesAutoReminder = 'invoices.auto_reminder',
  AppointmentsSmsNotifications = 'appointments.sms_notifications',
  ClientsBulkImport = 'clients.bulk_import',
  DashboardAnalytics = 'dashboard.analytics',
  OpticsPrescriptionTemplates = 'optics.prescription_templates',
}

export interface TenantConfig {
  tenantId: string;
  clientType: ClientType; // e.g., 'generic', 'optician'
  capabilities: Capability[]; // e.g., ['optics_measurements']
  featureFlags?: Partial<Record<FeatureFlag, boolean>>;
  currency?: string;
}

export interface TenantInfoResponse {
  tenantId: string;
  clientType: ClientType;
  capabilities: Capability[];
  featureFlags: Partial<Record<FeatureFlag, boolean>>;
  currency?: string;
}
