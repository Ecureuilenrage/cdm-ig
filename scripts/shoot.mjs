// Capture générique d'une page du projet en PNG (planches de casting, mocks…).
// Usage : node scripts/shoot.mjs --path=/brand/character/casting/board.html --out=brand/character/casting/out/board.png
//         [--width=1500] [--height=900] [--selector=#strip] [--clip] (--clip => pas de fullPage)

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4174;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

if (!args.path || !args.out) {
  console.error('Usage: node scripts/shoot.mjs --path=/page.html --out=out.png [--width=N] [--height=N] [--selector=CSS] [--clip]');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(normalize(ROOT))) throw new Error('forbidden');
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const width = parseInt(args.width || '1500', 10);
const height = parseInt(args.height || '900', 10);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(`http://127.0.0.1:${PORT}${args.path}`);
try {
  await page.waitForFunction('window.__shotReady === true || window.__renderDone === true', null, { timeout: 15000 });
} catch {
  console.warn('⚠ __shotReady/__renderDone jamais posé — capture après networkidle');
  await page.waitForLoadState('networkidle');
}
const renderErr = await page.evaluate('window.__renderError || null');
if (renderErr) {
  console.error(`✗ erreur de rendu:\n${renderErr}`);
  process.exitCode = 1;
}
await page.evaluate('document.fonts ? document.fonts.ready : null');

const out = join(ROOT, args.out);
await mkdir(dirname(out), { recursive: true });

if (args.selector) {
  await page.locator(args.selector).screenshot({ path: out });
} else if (args.clip) {
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
} else {
  await page.screenshot({ path: out, fullPage: true });
}
console.log(`✓ ${args.path} -> ${out}`);

await browser.close();
server.close();
