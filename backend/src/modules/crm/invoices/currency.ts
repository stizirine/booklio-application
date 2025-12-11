import { z } from 'zod';

export const SupportedCurrencies = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
  CAD: 'CAD',
  CHF: 'CHF',
  DH: 'DH',
  MAD: 'MAD',
} as const;

export type SupportedCurrency = (typeof SupportedCurrencies)[keyof typeof SupportedCurrencies];

export const SupportedCurrencyValues = Object.values(SupportedCurrencies);

export const SupportedCurrencySchema = z.enum(SupportedCurrencyValues);

export const DEFAULT_CURRENCY = SupportedCurrencies.EUR;
