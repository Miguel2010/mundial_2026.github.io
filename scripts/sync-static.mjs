import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '..');
const sourceCsv = resolve(rootDir, 'data', 'ranking.csv');
const targetCsv = resolve(rootDir, 'public', 'data', 'ranking.csv');

await mkdir(dirname(targetCsv), { recursive: true });
await copyFile(sourceCsv, targetCsv);
