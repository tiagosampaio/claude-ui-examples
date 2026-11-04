/**
 * Zero-dependency static server for the examples.
 *
 * The examples use ES modules, which browsers refuse to load from file://,
 * so they need to be served over HTTP. It serves the same files as GitHub Pages,
 * so the root URL shows the same index.html in both places.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT ?? 4173);
const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
};

/**
 * Maps a request path to a file inside the project.
 *
 * @param {string} pathname The decoded URL path.
 * @returns {Promise<string|null>} The file, or null if missing or outside the project.
 */
async function resolveFile(pathname) {
  const candidate = resolve(ROOT, `.${pathname}`);

  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) {
    return null;
  }

  const info = await stat(candidate).catch(() => null);

  if (!info) {
    return null;
  }

  return info.isDirectory() ? join(candidate, 'index.html') : candidate;
}

/**
 * Sends a complete response.
 *
 * @param {import('node:http').ServerResponse} response The response.
 * @param {number} status The HTTP status.
 * @param {string} contentType The content type.
 * @param {string|Buffer} body The body.
 * @returns {void}
 */
function send(response, status, contentType, body) {
  response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  response.end(body);
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, `http://${HOST}`);
    const file = await resolveFile(decodeURIComponent(pathname));

    if (!file) {
      send(response, 404, 'text/plain', 'Not found');
      return;
    }

    const contentType = MIME_TYPES[extname(file)] ?? 'application/octet-stream';

    send(response, 200, contentType, await readFile(file));
  } catch (error) {
    if (error.code === 'ENOENT') {
      send(response, 404, 'text/plain', 'Not found');
      return;
    }

    console.error(error);
    send(response, 500, 'text/plain', 'Server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Examples at http://${HOST}:${PORT}/`);
});
