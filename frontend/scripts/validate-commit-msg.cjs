#!/usr/bin/env node
const fs = require('fs');

// Read commit message
const msgFile = process.env.HUSKY_GIT_PARAMS || process.argv[2] || '.git/COMMIT_EDITMSG';
const message = fs.readFileSync(msgFile, 'utf8').trim();

// Simple English heuristic: allow conventional commits + common English words characters
const conventional = /^(feat|fix|docs|style|refactor|test|chore|ci|perf)(\(.+\))?:\s.+/;

// Detect accented letters (basic heuristic to avoid obvious non-English)
const hasAccents = /[àâäéèêëîïôöùûüç]/i.test(message);

if (!conventional.test(message) || hasAccents) {
  console.error('\nInvalid commit message.');
  console.error('Use English and follow Conventional Commits, e.g.:');
  console.error('  feat: add appointment status transitions');
  console.error('  fix: prevent cancel on in progress status');
  console.error('\nYour message:');
  console.error(`  ${message}\n`);
  process.exit(1);
}

process.exit(0);


