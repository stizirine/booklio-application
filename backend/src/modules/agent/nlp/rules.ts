import { Intents, type Intent } from './intents.js';

export type NextAction =
  | { type: 'disable_agent' }
  | { type: 'propose_rebook' }
  | { type: 'answer_question' }
  | { type: 'noop' };

export function decideNextAction(intent: Intent): NextAction {
  switch (intent) {
    case Intents.Stop:
      return { type: 'disable_agent' };
    case Intents.Rebook:
      return { type: 'propose_rebook' };
    case Intents.Question:
      return { type: 'answer_question' };
    default:
      return { type: 'noop' };
  }
}
