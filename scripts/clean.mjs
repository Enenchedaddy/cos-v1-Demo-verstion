import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
for (const relativePath of ['dist', 'server.js']) {
  await rm(resolve(repositoryRoot, relativePath), { recursive: true, force: true });
}
