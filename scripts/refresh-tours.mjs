#!/usr/bin/env node
// Recomputes each CodeTour step's `selection` from its `pattern`, so highlights
// follow the code after edits. CodeTour ignores `pattern` once `selection` is set,
// so `pattern` is the source of truth and `selection` is derived from it.
//
// A pattern must match exactly once in its file. If it has a capture group, the
// group is highlighted; otherwise the whole match is.
//
// Usage: node scripts/refresh-tours.mjs [--check]

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const toursDir = join(root, '.tours');
const checkOnly = process.argv.includes('--check');
let problems = 0;

function position(text, offset) {
  const lines = text.slice(0, offset).split('\n');
  return { line: lines.length, character: lines[lines.length - 1].length + 1 };
}

for (const name of readdirSync(toursDir).filter((file) => file.endsWith('.tour'))) {
  const tourPath = join(toursDir, name);
  const original = readFileSync(tourPath, 'utf8');
  const tour = JSON.parse(original);

  tour.steps.forEach((step, index) => {
    if (!step.file || !step.pattern) return;

    const text = readFileSync(join(root, step.file), 'utf8');
    const matches = [...text.matchAll(new RegExp(step.pattern, 'gmd'))];
    if (matches.length !== 1) {
      console.error(`${name} step ${index + 1} (${step.file}): pattern matched ${matches.length} times, expected 1`);
      problems++;
      return;
    }

    const [start, end] = matches[0].indices[1] ?? matches[0].indices[0];
    step.selection = { start: position(text, start), end: position(text, end) };
    delete step.line;
  });

  const updated = JSON.stringify(tour, null, 2) + '\n';
  if (updated === original) continue;

  if (checkOnly) {
    console.error(`${name}: selections are out of date, run: npm run tours`);
    problems++;
  } else {
    writeFileSync(tourPath, updated);
    console.log(`updated ${name}`);
  }
}

process.exit(problems ? 1 : 0);
