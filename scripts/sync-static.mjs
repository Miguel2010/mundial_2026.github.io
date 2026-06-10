import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '..');
const sourceDataDir = resolve(rootDir, 'data');
const targetDataDir = resolve(rootDir, 'public', 'data');
const dataFiles = await readdir(sourceDataDir);
const csvFiles = dataFiles.filter((fileName) => fileName.endsWith('.csv'));

await mkdir(targetDataDir, { recursive: true });

await Promise.all(
  csvFiles.map((fileName) =>
    copyFile(resolve(sourceDataDir, fileName), resolve(targetDataDir, fileName)),
  ),
);
