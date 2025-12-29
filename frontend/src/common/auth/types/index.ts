export interface User {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  // Informations du store directement dans l'utilisateur
  storeName?: string;
  storeAddress?: string;
  phoneNumber?: string;
  patenteNumber?: string;
  rcNumber?: string;
  npeNumber?: string;
  iceNumber?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Tenant {
  tenantId: string;
  clientType: ClientType;
  capabilities: Capability[];
  featureFlags: Record<FeatureFlag, boolean>;
  currency?: string;
}


export interface MeResponse {
  user: User;
  tenant: Tenant;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export interface CalendarItem {
  id: string;
  summary: string;
  [key: string]: any;
}

export interface EventItem {
  id: string;
  summary: string;
  status: string;
  start: any;
  end: any;
  [key: string]: any;
}

// Types pour les fonctionnalités optiques
export enum ClientType {
  Generic = 'generic',
  Optician = 'optician',
}

/**
 * CAPABILITIES - Autorisation d'accès
 * Contrôlent quels endpoints/modules le tenant peut utiliser
 * Définissent les permissions de base pour accéder aux fonctionnalités
 */
export enum Capability {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Appointments = 'appointments',
  Invoices = 'invoices',
  Optics = 'optics',
}

/**
 * FEATURE FLAGS - Configuration fine des fonctionnalités
 * Permettent d'activer/désactiver des options spécifiques dans les modules
 * Contrôlent l'affichage et le comportement des fonctionnalités
 */
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

// Utilitaires pour vérifier les capacités (autorisations)
export const hasCapability = (tenant: Tenant, capability: Capability): boolean => {
  return tenant.capabilities.includes(capability);
};

// Utilitaires pour vérifier les feature flags (configuration)
export const hasFeatureFlag = (tenant: Tenant, flag: FeatureFlag): boolean => {
  return tenant.featureFlags[flag] === true;
};

// Utilitaires pour vérifier le type de client
export const isOptician = (tenant: Tenant): boolean => {
  return tenant.clientType === ClientType.Optician;
};

export const isGeneric = (tenant: Tenant): boolean => {
  return tenant.clientType === ClientType.Generic;
};

// Utilitaires combinés pour les fonctionnalités optiques
export const canAccessOptics = (tenant: Tenant): boolean => {
  return isOptician(tenant) && hasCapability(tenant, Capability.Optics);
};

export const canManagePrescriptions = (tenant: Tenant): boolean => {
  return canAccessOptics(tenant) && hasFeatureFlag(tenant, FeatureFlag.OpticsPrescriptions);
};

export const canTakeMeasurements = (tenant: Tenant): boolean => {
  return canAccessOptics(tenant) && hasFeatureFlag(tenant, FeatureFlag.OpticsMeasurements);
};

export const canPrintOptics = (tenant: Tenant): boolean => {
  return canAccessOptics(tenant) && hasFeatureFlag(tenant, FeatureFlag.OpticsPrint);
};
