import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

import type { MessageTemplate } from './templates.js';

export type ComposeParams = {
  template: MessageTemplate;
  variables: Record<string, unknown>;
};

export class MessageComposer {
  compose({ template, variables }: ComposeParams): { text: string } {
    // Simple moteur de remplacement de placeholders. L'IA pourra affiner ensuite.
    let text = template.previewText || '';

    // Helpers basiques pour formats date/heure FR si fournis
    const v = variables || {};
    const locale = (v.locale as string) || template.locale || 'fr';
    const localeObj = locale.startsWith('fr') ? fr : enUS;
    const timeZone = (v.timezone as string) || (v.timeZone as string) || undefined;

    // Normaliser dates/heures
    const date = v.date instanceof Date ? v.date : undefined;
    const time = v.time instanceof Date ? v.time : undefined;

    // Fallback basé sur Intl si timezone fourni
    const formattedDate = date
      ? timeZone
        ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone }).format(date)
        : format(date, 'PPP', { locale: localeObj })
      : (v.date as string) || '';
    const formattedTime = time
      ? timeZone
        ? new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone }).format(time)
        : format(time, 'p', { locale: localeObj })
      : (v.time as string) || '';

    const map: Record<string, string> = {
      firstName: String(v.firstName ?? ''),
      lastName: String(v.lastName ?? ''),
      date: formattedDate,
      time: formattedTime,
      bookingLink: String(v.bookingLink ?? ''),
      location: String(v.location ?? ''),
    };

    for (const [key, value] of Object.entries(map)) {
      text = text.replaceAll(`{{${key}}}`, value);
    }

    return { text };
  }

  preview({ template, variables }: ComposeParams): { text: string; missingPlaceholders: string[] } {
    const { text } = this.compose({ template, variables });
    const declared = Array.isArray(template.placeholders) ? template.placeholders : [];
    const providedKeys = new Set(Object.keys(variables || {}));
    // Clés mappées implicitement (date/time formatées, firstName, etc.)
    ['firstName', 'lastName', 'date', 'time', 'bookingLink', 'location'].forEach((k) =>
      providedKeys.add(k)
    );
    const missingPlaceholders = declared.filter((p) => !providedKeys.has(p));
    return { text, missingPlaceholders };
  }
}
