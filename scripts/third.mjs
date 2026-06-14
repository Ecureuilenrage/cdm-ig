// 3e post du jour (cadence D13). Décide le contenu selon la présence de facts.json :
//   • jour de MATCH (content/<date>/facts.json présent) → QUIZ tiré des faits du jour.
//   • jour CREUX (pas de facts.json)                    → ÉTAT DU TOURNOI (classements).
// Écrit content/<date>/third.json (jamais d'écrasement → third.draft.json). Fail-soft.
//
// Usage : node scripts/third.mjs --date=YYYY-MM-DD [--draft]
//   --date   jour des matchs (quiz) OU jour de publication (jour creux)
//   --draft  affine la copie via Claude (clé requise) ; sinon base déterministe

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildQuizDoc } from './lib/quiz.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const date = args.date;
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Usage: node scripts/third.mjs --date=YYYY-MM-DD [--draft]');
  process.exit(1);
}

const dir = join(ROOT, 'content', date);
await mkdir(dir, { recursive: true });

// écrit third.json (ou third.draft.json si déjà présent), + caption optionnelle
async function writeThird(doc, caption, kind) {
  const file = existsSync(join(dir, 'third.json')) ? 'third.draft.json' : 'third.json';
  await writeFile(join(dir, file), JSON.stringify(doc, null, 2) + '\n');
  if (caption) await writeFile(join(dir, 'third.caption.txt'), caption);
  const noted = file === 'third.draft.json' ? ' (third.json existait déjà — rien écrasé)' : '';
  console.log(`\n✓ 3e post (${kind}) : content/${date}/${file}${noted}`);
  console.log(`  Rendre : npm run render -- --date=${date} --file=${file}`);
}

const factsPath = join(dir, 'facts.json');

if (existsSync(factsPath)) {
  // ---- jour de MATCH : quiz
  const facts = JSON.parse(await readFile(factsPath, 'utf8'));
  const base = buildQuizDoc(facts, { matchday: facts.matchday ?? 'N' });
  let doc = base;
  let caption = null;
  if (args.draft) {
    const { enrichQuiz } = await import('./lib/llm.mjs');
    const res = await enrichQuiz(facts, base);
    if (res) {
      doc = res.doc;
      caption = res.caption;
    }
  }
  await writeThird(doc, caption, 'quiz');
} else {
  // ---- jour CREUX : état du tournoi (Phase 4)
  try {
    const { buildStandingsThird } = await import('./lib/standings.mjs');
    const res = await buildStandingsThird(date, { draft: !!args.draft });
    if (res) await writeThird(res.doc, res.caption, 'état du tournoi');
    else console.log(`\n· Pas d'état du tournoi disponible pour ${date} (classements indisponibles) — piocher dans le buffer evergreen.`);
  } catch (e) {
    console.log(`\n· État du tournoi indisponible (${e.message}) — 3e post : piocher un evergreen (npm run buffer -- --next).`);
  }
}
