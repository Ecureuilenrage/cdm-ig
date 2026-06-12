// Rend toutes les stories d'un jour en PNG 1080x1920.
// Usage : node scripts/stories.mjs --date=2026-06-11 [--story=2]
// Source : le tableau `stories` de content/<date>/content.json (voir _schema.md).
// Les stickers interactifs (sondage, quiz…) sont posés À LA MAIN dans l'app
// Instagram — le template réserve l'emplacement en pointillés.

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4175;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

// --date : un jour YYYY-MM-DD ou un nom de dossier evergreen (ex. evergreen-01)
const date = args.date;
if (!date || !/^[a-z0-9][a-z0-9-]*$/i.test(date)) {
  console.error('Usage: node scripts/stories.mjs --date=YYYY-MM-DD|nom-dossier [--story=N]');
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
const stories = doc.stories || [];
if (!stories.length) {
  console.log('Aucune story dans content.json — rien à rendre.');
  server.close();
  process.exit(0);
}

const outDir = join(ROOT, 'content', date, 'out');
await mkdir(outDir, { recursive: true });

const only = args.story ? [parseInt(args.story, 10)] : stories.map((_, i) => i + 1);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

let warnings = [];
for (const i of only) {
  const url = `http://127.0.0.1:${PORT}/templates/story.html?date=${date}&story=${i}`;
  await page.goto(url);
  await page.waitForFunction('window.__renderDone === true', null, { timeout: 15000 });

  const err = await page.evaluate('window.__renderError');
  if (err) {
    console.error(`✗ story ${i} — erreur de rendu:\n${err}`);
    process.exitCode = 1;
    continue;
  }

  warnings = warnings.concat((await page.evaluate('window.__overflowWarnings')) || []);

  const file = join(outDir, `story-${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  console.log(`✓ story ${i}/${stories.length} -> ${file}`);
}

await browser.close();
server.close();

if (warnings.length) {
  console.warn('\n⚠ Hors zone utile :');
  for (const w of warnings) console.warn('  - ' + w);
} else {
  console.log('\nStories dans la zone utile. Stickers à poser dans l’app au moment de publier.');
}
