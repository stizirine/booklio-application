import { Intents, type Intent } from './intents.js';

export class SimpleClassifier {
  classify(text: string | undefined | null): Intent {
    if (!text) return Intents.Unknown;
    const t = text.trim().toLowerCase();
    if (t === 'stop' || t === 'arrete' || t === 'arrête') return Intents.Stop;
    if (t.includes('reprendre') || t.includes('rebook') || t.includes('rendez-vous'))
      return Intents.Rebook;
    if (t.endsWith('?') || t.startsWith('quoi') || t.startsWith('comment')) return Intents.Question;
    return Intents.Unknown;
  }
}
