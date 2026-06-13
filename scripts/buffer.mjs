// Buffer evergreen — le « 3e slot en secours » de la cadence 3 posts/jour (D13).
// Inventorie les posts evergreen prêts (content/evergreen-*), suit lesquels sont
// déjà postés, recommande le prochain, et alerte si la réserve passe sous le seuil.
//
// Usage :
//   npm run buffer                      — inventaire + prochain recommandé
//   npm run buffer -- --next            — juste le prochain à poster (+ commande de rendu)
//   npm run buffer -- --mark=evergreen-01   — marque comme posté (date du jour)
//   npm run buffer -- --unmark=evergreen-01 — annule le marquage
//
// Pour CRÉER un nouvel evergreen : dupliquer un dossier content/evergreen-0N existant,
// éditer content.json + caption.txt, puis `npm run render -- --date=evergreen-0M`.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');
const STATE_FILE = join(ROOT, 'data', 'buffer-state.json');
const LOW_WATERMARK = 1; // alerte si moins d'1 evergreen prêt non posté (ritual hebdo)

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const today = () => new Date().toISOString().slice(0, 10);

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}
async function saveState(state) {
  await mkdir(join(ROOT, 'data'), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// inventaire des dossiers evergreen-*
async function listEvergreens() {
  const entries = await readdir(CONTENT, { withFileTypes: true });
  const names = entries
    .filter((e) => e.isDirectory() && /^evergreen-/.test(e.name))
    .map((e) => e.name)
    .sort();
  const out = [];
  for (const name of names) {
    const dir = join(CONTENT, name);
    let title = '(content.json manquant)';
    try {
      title = JSON.parse(await readFile(join(dir, 'content.json'), 'utf8')).title || '(sans titre)';
    } catch {}
    const rendered = existsSync(join(dir, 'out', 'slide-01.png'));
    out.push({ name, title, rendered });
  }
  return out;
}

const state = await loadState();

// --- mutations
if (typeof args.mark === 'string') {
  state[args.mark] = { posted: today() };
  await saveState(state);
  console.log(`✓ ${args.mark} marqué posté le ${state[args.mark].posted}.`);
  process.exit(0);
}
if (typeof args.unmark === 'string') {
  delete state[args.unmark];
  await saveState(state);
  console.log(`✓ ${args.unmark} : marquage retiré.`);
  process.exit(0);
}

// --- lecture
const items = await listEvergreens();
if (!items.length) {
  console.log('Aucun evergreen dans content/evergreen-* — dupliquer un dossier pour en créer un.');
  process.exit(0);
}

const isPosted = (it) => !!state[it.name]?.posted;
const ready = items.filter((it) => it.rendered && !isPosted(it)); // prêts à poster
const next = ready[0] || null;

if (args.next) {
  if (next) {
    console.log(next.name);
    console.log(`  « ${next.title} »`);
    console.log(`  déjà rendu → poster les PNG de content/${next.name}/out/`);
  } else {
    console.log('Aucun evergreen prêt non posté. Rendre un nouveau buffer avant d’en avoir besoin.');
    process.exitCode = 1;
  }
  process.exit();
}

// inventaire complet
console.log('Buffer evergreen (3e slot de secours) :\n');
for (const it of items) {
  const posted = state[it.name]?.posted;
  const flag = posted ? `posté ${posted}` : it.rendered ? 'PRÊT' : 'non rendu';
  const mark = posted ? '·' : it.rendered ? '✓' : '○';
  console.log(`  ${mark} ${it.name.padEnd(13)} ${flag.padEnd(16)} « ${it.title} »`);
}

console.log(`\nPrêts non postés : ${ready.length}`);
if (next) {
  console.log(`Prochain à poster : ${next.name} — « ${next.title} »`);
}
if (ready.length < LOW_WATERMARK) {
  console.log(`\n⚠ Réserve basse (< ${LOW_WATERMARK}). Produire/rendre un nouvel evergreen :`);
  console.log('  1. dupliquer un dossier content/evergreen-0N  2. éditer content.json + caption.txt');
  console.log('  3. npm run render -- --date=evergreen-0M');
}
const unrendered = items.filter((it) => !it.rendered && !isPosted(it));
if (unrendered.length) {
  console.log(`\nÀ rendre avant de pouvoir poster : ${unrendered.map((i) => i.name).join(', ')}`);
}
