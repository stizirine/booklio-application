export const Intents = {
  Stop: 'stop',
  Rebook: 'rebook',
  Question: 'question',
  Unknown: 'unknown',
} as const;

export type Intent = (typeof Intents)[keyof typeof Intents];
