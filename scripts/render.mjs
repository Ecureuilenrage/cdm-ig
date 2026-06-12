// Rend toutes les slides d'un jour en PNG 1080x1350.
// Usage : node scripts/render.mjs --date=2026-06-11 [--slide=3]

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4173;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const date = args.date;
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Usage: node scripts/render.mjs --date=YYYY-MM-DD [--slide=N]');
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

const doc = JSON.parse(await readFile(join(ROOT, 'content', date, 'content.json'), 'utf8'));
const outDir = join(ROOT, 'content', date, 'out');
await mkdir(outDir, { recursive: true });

const only = args.slide ? [parseInt(args.slide, 10)] : doc.slides.map((_, i) => i + 1);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

let warnings = [];
for (const i of only) {
  const url = `http://127.0.0.1:${PORT}/templates/render.html?date=${date}&slide=${i}`;
  await page.goto(url);
  await page.waitForFunction('window.__renderDone === true', null, { timeout: 15000 });

  const err = await page.evaluate('window.__renderError');
  if (err) {
    console.error(`✗ slide ${i} — erreur de rendu:\n${err}`);
    process.exitCode = 1;
    continue;
  }

  const w = await page.evaluate('window.__overflowWarnings');
  warnings = warnings.concat(w || []);

  const file = join(outDir, `slide-${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log(`✓ slide ${i}/${doc.slides.length} -> ${file}`);
}

await browser.close();
server.close();

if (warnings.length) {
  console.warn('\n⚠ Overflow:');
  for (const w of warnings) console.warn('  - ' + w);
} else {
  console.log('\nAucun overflow. Prêt à poster.');
}
