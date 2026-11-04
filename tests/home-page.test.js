import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';

const ROOT = new URL('../', import.meta.url);

test('home page links to every example with a path that works in a subfolder', async () => {
  const html = await readFile(new URL('index.html', ROOT), 'utf8');
  const entries = await readdir(new URL('examples/', ROOT), { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  assert.deepEqual(
    [...links].sort(),
    folders.map((folder) => `examples/${folder}/`).sort(),
  );
});
