// Sonde GO/NO-GO (Chantier A, étape 0) : le free tier API-Football couvre-t-il
// la Coupe du Monde 2026 (fixtures + events) ? Lit API_FOOTBALL_KEY dans .env.
// Usage : node scripts/apifootball-check.mjs
import { readFile } from 'node:fs/promises';

const env = await readFile(new URL('../.env', import.meta.url), 'utf8');
const vars = Object.fromEntries(
  env.split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const KEY = vars.API_FOOTBALL_KEY;
if (!KEY) { console.error('API_FOOTBALL_KEY absente de .env'); process.exit(1); }

const HOST = 'https://v3.football.api-sports.io';
async function call(path) {
  const res = await fetch(HOST + path, { headers: { 'x-apisports-key': KEY } });
  const json = await res.json().catch(() => ({}));
  const rl = {
    min: `${res.headers.get('x-ratelimit-remaining') ?? '?'}/${res.headers.get('x-ratelimit-limit') ?? '?'}`,
    day: `${res.headers.get('x-ratelimit-requests-remaining') ?? '?'}/${res.headers.get('x-ratelimit-requests-limit') ?? '?'}`,
  };
  return { status: res.status, json, rl };
}

// 1) statut du compte
const st = await call('/status');
console.log('=== /status', st.status, '| rate min:', st.rl.min, 'day:', st.rl.day, '===');
console.log(JSON.stringify(st.json.response ?? st.json, null, 2));

// 2) couverture des saisons pour la World Cup (league id 1)
const lg = await call('/leagues?id=1');
const league = lg.json.response?.[0];
console.log('\n=== /leagues?id=1', lg.status, 'errors:', JSON.stringify(lg.json.errors), '===');
if (league) {
  console.log('league:', league.league?.name);
  const seasons = (league.seasons || []).map((s) => s.year);
  console.log('saisons renvoyées:', seasons.join(', ') || '(aucune)');
  const s = (league.seasons || []).find((x) => x.year === 2026);
  console.log('2026 présent ?', !!s, s ? '| coverage.fixtures: ' + JSON.stringify(s.coverage?.fixtures) : '');
}

// 3) fixtures WC 2026, 11-12 juin
const fx = await call('/fixtures?league=1&season=2026&from=2026-06-11&to=2026-06-12');
console.log('\n=== /fixtures WC 2026 (11-12 juin)', fx.status, '| results:', fx.json.results, '| errors:', JSON.stringify(fx.json.errors), '===');
const fixtures = fx.json.response || [];
for (const f of fixtures.slice(0, 8)) {
  console.log(`  #${f.fixture.id} ${f.fixture.date} ${f.teams.home.name} ${f.goals.home}-${f.goals.away} ${f.teams.away.name} [${f.fixture.status.short}]`);
}

// 4) events (buts/cartons + minutes) pour un match terminé
const fin = fixtures.find((f) => f.fixture.status.short === 'FT') || fixtures[0];
if (fin) {
  const ev = await call(`/fixtures/events?fixture=${fin.fixture.id}`);
  console.log(`\n=== /fixtures/events fixture=${fin.fixture.id}`, ev.status, '| results:', ev.json.results, '| errors:', JSON.stringify(ev.json.errors), '===');
  for (const e of (ev.json.response || []).slice(0, 14)) {
    console.log(`  ${e.time?.elapsed ?? '?'}' ${e.type}/${e.detail} — ${e.player?.name ?? ''} (${e.team?.name ?? ''})`);
  }
}
console.log('\n— sonde terminée —');
