// Rend le Wall Chart en PNG (contrôle visuel) + PDF A2.
// Usage : node scripts/wallchart.mjs [--fill=blank|filled]

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4176;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const fill = args.fill || 'blank';

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

const outDir = join(ROOT, 'data', 'wallchart', 'out');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2245, height: 1587 }, deviceScaleFactor: 2 });

const url = `http://127.0.0.1:${PORT}/templates/wallchart.html?fill=${fill}`;
await page.goto(url);
await page.waitForFunction('window.__renderDone === true', null, { timeout: 20000 });

const err = await page.evaluate('window.__renderError');
if (err) {
  console.error(`✗ erreur de rendu:\n${err}`);
  process.exitCode = 1;
} else {
  const png = join(outDir, `wallchart-${fill}.png`);
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 2245, height: 1587 } });
  console.log(`✓ PNG  -> ${png}`);

  const pdf = join(outDir, `wallchart-${fill}.pdf`);
  await page.pdf({ path: pdf, width: '2245px', height: '1587px', printBackground: true, pageRanges: '1' });
  console.log(`✓ PDF  -> ${pdf}`);

  const warnings = await page.evaluate('window.__overflowWarnings');
  if (warnings && warnings.length) {
    console.warn('\n⚠ Overflow:');
    for (const w of warnings) console.warn('  - ' + w);
  } else {
    console.log('\nAucun overflow.');
  }
}

await browser.close();
server.close();
