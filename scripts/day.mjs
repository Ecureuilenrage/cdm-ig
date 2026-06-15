// Orchestrateur « 3 posts/jour » — la commande du matin. Pour un jour de PUBLICATION D :
// classe le jour (calendrier football-data), scaffolde le recap (J-1) + la preview (J) via
// fetch, génère le 3e post (quiz si jour de match, sinon état du tournoi), et imprime la
// planche du jour avec les commandes de build. NE REND PAS (les drafts se relisent/éditent
// avant build — discipline du projet). Fail-soft.
//
// Usage : npm run day -- [--date=YYYY-MM-DD] [--draft]
//   --date   jour de publication (défaut : aujourd'hui)
//   --draft  rédaction LLM (recap + quiz) — sinon bases déterministes

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyDay, stageLabel } from './lib/calendar.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const date = typeof args.date === 'string' ? args.date : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`✗ date invalide : ${date} (attendu YYYY-MM-DD)`);
  process.exit(1);
}

const flags = args.draft ? ['--draft'] : [];
const run = (script, extra) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...extra], { stdio: 'inherit' });
  if (r.status) process.exitCode = r.status;
};

const c = await classifyDay(date);

console.log(`\n╔══ Journée de publication : ${date} ══╗`);
if (c.dayType === 'unknown') {
  console.log(`✗ Calendrier indisponible (${c.error}). Vérifier la clé football-data, puis relancer.`);
  process.exit(1);
}
console.log(`  Type : ${c.dayType === 'match' ? 'JOUR DE MATCH' : 'JOUR CREUX'} · Round : ${stageLabel(c.stage)}`);
console.log(`  Recap (${c.recapDate}) : ${c.recap.length} match(s) terminé(s)`);
console.log(`  Preview (${date}) : ${c.preview.length} match(s) ce soir`);

// 1) recap (J-1) + preview (J) — une seule passe fetch (scaffolde aussi la preview de D)
console.log(`\n▶ fetch — recap ${c.recapDate} + preview ${date}`);
run('fetch.mjs', [`--date=${c.recapDate}`, '--preview', ...flags]);

// 2) 3e post — quiz si on a un recap à interroger, sinon état du tournoi (jour creux)
const quizDay = c.recap.length > 0;
const thirdDate = quizDay ? c.recapDate : date;
console.log(`\n▶ third — ${quizDay ? 'quiz' : 'état du tournoi'} (${thirdDate})`);
run('third.mjs', [`--date=${thirdDate}`, ...flags]);

// 3) la planche du jour
const builds = new Set();
if (c.recap.length) builds.add(c.recapDate); // recap + stories + quiz third
builds.add(date); // preview (+ third état tournoi si jour creux)

console.log(`\n╔══ Planche du jour — à poster le ${date} ══╗`);
let n = 0;
if (c.recap.length) console.log(`  ${++n}. RECAP    → content/${c.recapDate}/  (relire le draft, choisir l'angle)`);
if (c.preview.length) console.log(`  ${++n}. PREVIEW  → content/${date}/preview.json  (compléter hook + chaque carte : outcome 1/X/2 · pick · h2h)`);
console.log(`  ${++n}. 3e POST  → content/${thirdDate}/third.json  (${quizDay ? 'quiz' : 'état du tournoi'})`);
console.log(`\n  Puis rendre :`);
for (const d of builds) console.log(`    npm run build -- --date=${d}`);
console.log(`  Contrôle visuel des PNG (out/), puis publication manuelle.\n`);
