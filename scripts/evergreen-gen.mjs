// Usine à evergreens — génère un post « Did you know? » thématique Mondial via Claude, à
// faire VÉRIFIER avant publication (chaque fait porte un [VERIFY]). Écrit dans le prochain
// dossier content/evergreen-0N libre (ne réécrit jamais un existant). Clé ANTHROPIC requise.
//
// Usage :
//   node scripts/evergreen-gen.mjs --team="Morocco"
//   node scripts/evergreen-gen.mjs --theme="fastest goals ever at the finals"
//   node scripts/evergreen-gen.mjs "Japan, the giant-killers"   (sujet libre en positionnel)

import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateEvergreen } from './lib/llm.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');

const raw = process.argv.slice(2);
const args = Object.fromEntries(
  raw.map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const positional = raw.filter((a) => !a.startsWith('--')).join(' ').trim();

const topic = args.team
  ? `the team ${args.team} at the tournament — their history, an all-time record, and a little-known fun fact`
  : (typeof args.theme === 'string' ? args.theme : positional);

if (!topic) {
  console.error('Usage: node scripts/evergreen-gen.mjs --team="X" | --theme="Y" | "sujet libre"');
  process.exit(1);
}

// prochain dossier evergreen-0N libre
const entries = await readdir(CONTENT, { withFileTypes: true });
const nums = entries
  .filter((e) => e.isDirectory() && /^evergreen-(\d+)$/.test(e.name))
  .map((e) => parseInt(e.name.match(/^evergreen-(\d+)$/)[1], 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const name = `evergreen-${String(next).padStart(2, '0')}`;
const dir = join(CONTENT, name);

console.log(`· Génération evergreen « ${topic} » → ${name}…`);
const res = await generateEvergreen(topic);
if (!res) {
  console.error('✗ Génération impossible (clé ANTHROPIC absente / SDK / erreur) — fail-soft, rien écrit.');
  process.exit(1);
}

await mkdir(dir, { recursive: true });
await writeFile(join(dir, 'content.json'), JSON.stringify(res.doc, null, 2) + '\n');
await writeFile(join(dir, 'caption.txt'), res.caption);

console.log(`\n✓ Brouillon evergreen : content/${name}/content.json (narrateur : ${res.doc.character})`);
console.log('  ⚠ Contient des [VERIFY] : NON prêt à poster. Étapes :');
console.log(`    1. Vérifier chaque fait sur le web (2 sources) et RETIRER les " [VERIFY]"`);
console.log(`    2. npm run render -- --date=${name}`);
console.log(`    3. npm run buffer -- --verify=${name}   (passe le post en « prêt »)`);
