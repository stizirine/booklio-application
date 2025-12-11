import assert from 'node:assert';

import { SimpleClassifier } from '@src/modules/agent/nlp/classifier.js';
import { Intents } from '@src/modules/agent/nlp/intents.js';

async function main() {
  const c = new SimpleClassifier();
  assert.strictEqual(c.classify('STOP'), Intents.Stop);
  assert.strictEqual(c.classify('arrete'), Intents.Stop);
  assert.strictEqual(c.classify('reprendre un rendez-vous'), Intents.Rebook);
  assert.strictEqual(c.classify('rebook please'), Intents.Rebook);
  assert.strictEqual(c.classify('ça commence à quelle heure ?'), Intents.Question);
  assert.strictEqual(c.classify('hello'), Intents.Unknown);
  console.log('SimpleClassifier tests: OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
