import assert from 'node:assert';

import { Intents } from '@src/modules/agent/nlp/intents.js';
import { decideNextAction } from '@src/modules/agent/nlp/rules.js';

async function main() {
  assert.deepStrictEqual(decideNextAction(Intents.Stop), { type: 'disable_agent' });
  assert.deepStrictEqual(decideNextAction(Intents.Rebook), { type: 'propose_rebook' });
  assert.deepStrictEqual(decideNextAction(Intents.Question), { type: 'answer_question' });
  assert.deepStrictEqual(decideNextAction(Intents.Unknown), { type: 'noop' });
  console.log('Rules tests: OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
