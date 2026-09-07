import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const sw = join(process.cwd(), 'public', 'mockServiceWorker.js');
if (existsSync(sw)) {
  console.log('[msw] mockServiceWorker.js present');
  process.exit(0);
}
console.log('[msw] generating public/mockServiceWorker.js …');
try {
  execSync('npx msw init public/ --save', { stdio: 'inherit' });
} catch (e) {
  console.warn('[msw] init failed — app still uses client-side mockHandlers. Install msw and re-run.');
}
