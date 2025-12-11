// Canaux de message pris en charge
export const MessageChannels = {
  WhatsApp: 'whatsapp',
} as const;
export type MessageChannel = (typeof MessageChannels)[keyof typeof MessageChannels];

// Statuts d'un message côté provider
export const MessageStatuses = {
  Queued: 'queued',
  Sent: 'sent',
  Delivered: 'delivered',
  Read: 'read',
  Failed: 'failed',
} as const;
export type MessageStatus = (typeof MessageStatuses)[keyof typeof MessageStatuses];

// Finalités d'un template
export const TemplatePurposes = {
  Reminder48h: 'reminder_48h',
  Reengagement: 'reengagement',
  Generic: 'generic',
} as const;
export type TemplatePurpose = (typeof TemplatePurposes)[keyof typeof TemplatePurposes];

// Types de provider
export const ProviderTypes = {
  Mock: 'mock',
  Meta: 'meta',
  Twilio: 'twilio',
} as const;
export type ProviderType = (typeof ProviderTypes)[keyof typeof ProviderTypes];
