// Barrel file pour la feature invoices
// Objectif: Point d'entrée unique pour tous les exports de la feature

// ==================== API ====================
export * as InvoicesApi from './api/invoices.api';
export * as OpticsInvoicesApi from './api/opticsInvoices.api';

// ==================== Components ====================
// Modals
export { default as InvoiceActionsModal } from './components/InvoiceActionsModal';
export { default as InvoiceFormModal } from './components/InvoiceFormModal';
export { default as PaymentModal } from './components/PaymentModal';

// Cards & Display
export { default as ClientInvoicesInline } from './components/ClientInvoicesInline';
export { default as ClientInvoicesSummary } from './components/ClientInvoicesSummary';
export { default as InvoiceCard } from './components/InvoiceCard';
export { default as InvoiceStatistics } from './components/InvoiceStatistics';

// Optiques
export { default as OpticsInvoiceEditor } from './components/OpticsInvoiceEditor';
export { default as OpticsInvoicePrint } from './components/OpticsInvoicePrint';

// Composants réutilisables
export { default as FrameSection } from './components/FrameSection';
export { default as InvoiceFooter } from './components/InvoiceFooter';
export { default as InvoiceGeneralInfo } from './components/InvoiceGeneralInfo';
export { default as InvoiceHeader } from './components/InvoiceHeader';
export { default as InvoiceItemsTable } from './components/InvoiceItemsTable';
export { default as LensSection } from './components/LensSection';

// ==================== Hooks ====================
export { useInvoiceEditor } from './hooks/useInvoiceEditor';
export { useInvoiceForm } from './hooks/useInvoiceForm';
export { useInvoicePermissions } from './hooks/useInvoicePermissions';
export { useInvoices } from './hooks/useInvoices';
export { useInvoiceStatistics } from './hooks/useInvoiceStatistics';
export { useOpticsInvoiceEditor } from './hooks/useOpticsInvoiceEditor';
export { useOpticsInvoicePrint } from './hooks/useOpticsInvoicePrint';
export { useOpticsInvoices } from './hooks/useOpticsInvoices';

// ==================== Pages ====================
export { default as InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
export { default as InvoicesPage } from './pages/InvoicesPage';
export { default as OpticsInvoicesPage } from './pages/OpticsInvoicesPage';

// ==================== Types ====================
export * from './types';
export type { InvoiceActionHandlers } from './components/types';

// ==================== Utils ====================
export * from './utils/pdfGenerator';

// ==================== Constants ====================
export * from './constants';


