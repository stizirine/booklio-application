import { z } from 'zod';

export const InvoiceStatuses = {
  Draft: 'draft',
  Partial: 'partial',
  Paid: 'paid',
} as const;

export type InvoiceStatus = (typeof InvoiceStatuses)[keyof typeof InvoiceStatuses];

export const InvoiceStatusValues = Object.values(InvoiceStatuses);

export const InvoiceStatusSchema = z.enum(InvoiceStatusValues);
