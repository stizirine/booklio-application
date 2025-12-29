// Constantes pour la feature invoices

// ==================== Devises ====================
export const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'MAD', label: 'MAD (DH)', symbol: 'DH' },
  { value: 'CAD', label: 'CAD ($)', symbol: '$' },
  { value: 'CHF', label: 'CHF', symbol: 'CHF' },
] as const;

export const DEFAULT_CURRENCY = 'EUR';

// ==================== Méthodes de paiement ====================
export const PAYMENT_METHODS = [
  'cash',
  'card',
  'transfer',
  'check',
  'other',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const DEFAULT_PAYMENT_METHOD = 'cash';

// ==================== Statuts des factures ====================
export enum InvoiceStatusEnum {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
}

export const INVOICE_STATUSES = Object.values(InvoiceStatusEnum);

// Configuration des statuts pour l'UI
export const INVOICE_STATUS_CONFIG = {
  [InvoiceStatusEnum.DRAFT]: {
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
    icon: 'document-text',
  },
  [InvoiceStatusEnum.SENT]: {
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    icon: 'arrow-right',
  },
  [InvoiceStatusEnum.PAID]: {
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
    icon: 'check-circle',
  },
  [InvoiceStatusEnum.PARTIAL]: {
    color: 'amber',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    icon: 'clock',
  },
  [InvoiceStatusEnum.OVERDUE]: {
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    icon: 'exclamation',
  },
  [InvoiceStatusEnum.CANCELED]: {
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
    icon: 'x',
  },
} as const;

// ==================== Configuration des statistiques ====================
export const STATISTICS_CONFIG = [
  {
    key: 'total',
    translationKey: 'invoices.stats.total',
    icon: 'document-text',
    gradient: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-700',
    textColor: 'text-gray-900',
    showCount: true,
  },
  {
    key: 'paid',
    translationKey: 'invoices.stats.paid',
    icon: 'check-circle',
    gradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-500',
    textColor: 'text-green-600',
    showCount: false,
  },
  {
    key: 'pending',
    translationKey: 'invoices.stats.pending',
    icon: 'clock',
    gradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-600',
    showCount: false,
  },
  {
    key: 'overdue',
    translationKey: 'invoices.stats.overdue',
    icon: 'exclamation',
    gradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-500',
    textColor: 'text-red-600',
    showCount: false,
  },
  {
    key: 'draft',
    translationKey: 'invoices.stats.drafts',
    icon: 'document-text',
    gradient: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200',
    iconBg: 'bg-gray-500',
    textColor: 'text-gray-700',
    showCount: true,
  },
] as const;

// ==================== Configuration des actions ====================
export const INVOICE_ACTIONS_CONFIG = [
  {
    key: 'edit',
    translationKey: 'common.edit',
    icon: 'edit',
    gradient: 'from-indigo-600 to-purple-600',
    hoverGradient: 'hover:from-indigo-700 hover:to-purple-700',
    permissionKey: 'canEdit' as const,
    priority: 1,
  },
  {
    key: 'send',
    translationKey: 'invoices.send',
    icon: 'mail',
    gradient: 'from-blue-600 to-cyan-600',
    hoverGradient: 'hover:from-blue-700 hover:to-cyan-700',
    permissionKey: 'canSend' as const,
    priority: 2,
  },
  {
    key: 'addPayment',
    translationKey: 'invoices.payment.addPayment',
    icon: 'tag',
    gradient: 'from-green-600 to-emerald-600',
    hoverGradient: 'hover:from-green-700 hover:to-emerald-700',
    permissionKey: 'canAddPayment' as const,
    priority: 3,
  },
  {
    key: 'downloadPDF',
    translationKey: 'invoices.downloadPDF',
    icon: 'arrow-down',
    gradient: 'from-purple-600 to-pink-600',
    hoverGradient: 'hover:from-purple-700 hover:to-pink-700',
    permissionKey: 'canDownloadPDF' as const,
    priority: 4,
  },
  {
    key: 'delete',
    translationKey: 'common.delete',
    icon: 'trash',
    gradient: 'from-red-600 to-rose-600',
    hoverGradient: 'hover:from-red-700 hover:to-rose-700',
    permissionKey: 'canDelete' as const,
    priority: 5,
  },
] as const;
