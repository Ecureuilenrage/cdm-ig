// Fetch football-data.org (free tier) → briefing du matin + draft content.json.
// Usage : npm run fetch -- [--date=YYYY-MM-DD] [--scorers]
//   --date     jour des matchs racontés (défaut : hier, heure locale)
//   --scorers  interroge aussi /scorers (top buteurs agrégés, libre tier) pour les stat-cards
//
// Free tier : fixtures, résultats, classements UNIQUEMENT — pas de buteurs/minutes/
// cartons par match. Le script garantit scores + calendrier ; la recherche web du
// matin (2 sources) reste obligatoire pour le récit.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const API = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';
const CACHE_TTL_MIN = 10; // réutilise une réponse de moins de 10 min (quota : 10 appels/min)
const MAX_STAT_CARDS = 4; // cover + 2 turning-points + stat-cards + cta ≤ 8 slides (schéma)

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

// ---- clé API : variable d'environnement, sinon .env à la racine (parse minimal)
async function loadKey() {
  if (process.env.FOOTBALL_DATA_KEY) return process.env.FOOTBALL_DATA_KEY;
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*FOOTBALL_DATA_KEY\s*=\s*"?([^"#]+?)"?\s*$/);
      if (m) return m[1].trim();
    }
  } catch {}
  return null;
}

// ---- dates. Jour de match ÉDITORIAL : un match du soir aux US/Canada/Mexique
// tombe le lendemain en UTC ; on rattache un coup d'envoi au jour J si
// (utcDate - 8h) tombe le J (8h UTC = 4h ET / 1h PT, aucun match à cette heure).
const dayMs = 24 * 60 * 60 * 1000;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (isoDate, n) => iso(new Date(new Date(`${isoDate}T12:00:00Z`).getTime() + n * dayMs));
const editorialDay = (utcDate) => iso(new Date(new Date(utcDate).getTime() - 8 * 60 * 60 * 1000));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
function prettyDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const matchDate = typeof args.date === 'string' ? args.date : iso(new Date(Date.now() - dayMs));
if (!/^\d{4}-\d{2}-\d{2}$/.test(matchDate)) {
  console.error(`✗ date invalide : ${matchDate} (attendu YYYY-MM-DD)`);
  process.exit(1);
}

const KEY = await loadKey();
if (!KEY) {
  console.error('✗ FOOTBALL_DATA_KEY introuvable (.env à la racine ou variable d\'environnement).');
  process.exit(1);
}

// ---- GET throttlé + archivé. On lit les headers de réponse pour s'auto-throttler
// (X-Requests-Available-Minute / X-RequestCounter-Reset) — reco officielle de l'API.
let remaining = null;
let resetSec = null;
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

async function apiGet(path, cacheName, retried = false) {
  const cacheFile = join(ROOT, 'data', 'raw', cacheName);
  try {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8'));
    if (cached.__fetchedAt && Date.now() - cached.__fetchedAt < CACHE_TTL_MIN * 60 * 1000) {
      console.log(`· ${path} — cache (<${CACHE_TTL_MIN} min) : data/raw/${cacheName}`);
      return cached;
    }
  } catch {}

  if (remaining === 0) {
    const wait = (resetSec ?? 60) + 1;
    console.log(`· quota minute épuisé — pause ${wait}s (header de reset)…`);
    await sleep(wait);
  }

  const res = await fetch(API + path, { headers: { 'X-Auth-Token': KEY } });
  remaining = parseInt(res.headers.get('X-Requests-Available-Minute') ?? '', 10);
  if (Number.isNaN(remaining)) remaining = null;
  resetSec = parseInt(res.headers.get('X-RequestCounter-Reset') ?? '', 10) || null;

  if (res.status === 429 && !retried) {
    const wait = (resetSec ?? 60) + 1;
    console.log(`· 429 reçu — pause ${wait}s puis nouvel essai…`);
    await sleep(wait);
    return apiGet(path, cacheName, true);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} sur ${path} : ${await res.text()}`);

  const data = await res.json();
  data.__fetchedAt = Date.now();
  await mkdir(join(ROOT, 'data', 'raw'), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(data, null, 2));
  console.log(`· ${path} — ok (${remaining ?? '?'} appels restants cette minute) → data/raw/${cacheName}`);
  return data;
}

// ---- matchs : une seule requête couvre J, J+1 (teaser) et le débord UTC
const dateTo = addDays(matchDate, 2);
const matchesRes = await apiGet(
  `/competitions/${COMPETITION}/matches?dateFrom=${matchDate}&dateTo=${dateTo}`,
  `matches-${matchDate}_${dateTo}.json`
);
const all = matchesRes.matches || [];
const byDay = (d) => all.filter((m) => editorialDay(m.utcDate) === d);
const played = byDay(matchDate);
const nextDay = byDay(addDays(matchDate, 1));

const name = (t) => t?.shortName || t?.name || t?.tla || '?';
const totalGoals = (m) => (m.score?.fullTime?.home ?? 0) + (m.score?.fullTime?.away ?? 0);
const scoreLabel = (m) =>
  m.status === 'FINISHED' ? `${m.score.fullTime.home}–${m.score.fullTime.away}`
  : m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 'EN COURS'
  : m.status === 'POSTPONED' ? 'REPORTÉ'
  : 'à venir';

// ---- briefing console
const matchday = played.find((m) => m.matchday)?.matchday;
console.log(`\n=== Briefing — matchs du ${matchDate}${matchday ? ` (matchday ${matchday})` : ''} ===`);
if (!played.length) console.log('  (aucun match ce jour-là)');
for (const m of played) {
  const ko = new Date(m.utcDate).toISOString().slice(11, 16);
  console.log(`  ${name(m.homeTeam)} ${scoreLabel(m)} ${name(m.awayTeam)}  · ${ko} UTC${m.venue ? ` · ${m.venue}` : ''}`);
}
const unfinished = played.filter((m) => m.status !== 'FINISHED');
if (unfinished.length) {
  console.log(`  ⚠ ${unfinished.length} match(s) non terminé(s) — relancer plus tard pour les scores définitifs.`);
}
console.log(`\nDemain (${addDays(matchDate, 1)}) :`);
if (!nextDay.length) console.log('  (aucun match)');
for (const m of nextDay) {
  const ko = new Date(m.utcDate).toISOString().slice(11, 16);
  console.log(`  ${name(m.homeTeam)} vs ${name(m.awayTeam)}  · ${ko} UTC${m.venue ? ` · ${m.venue}` : ''}`);
}

// ---- /scorers (top buteurs agrégés — utilisable pour des stat-cards)
if (args.scorers) {
  const sc = await apiGet(`/competitions/${COMPETITION}/scorers?limit=10`, 'scorers.json');
  console.log('\nTop buteurs (agrégé tournoi) :');
  for (const s of (sc.scorers || []).slice(0, 10)) {
    console.log(`  ${s.player?.name} (${s.team?.shortName || s.team?.name}) — ${s.goals} but(s)${s.assists ? `, ${s.assists} passe(s)` : ''}`);
  }
}

// ---- draft content.json
const finished = played.filter((m) => m.status === 'FINISHED').sort((a, b) => totalGoals(b) - totalGoals(a));
const featured = finished[0]; // heuristique : le plus de buts — l'humain re-choisit selon le récit
const others = finished.slice(1);
if (others.length > MAX_STAT_CARDS) {
  console.log(`\n⚠ ${others.length - MAX_STAT_CARDS} match(s) au-delà de ${MAX_STAT_CARDS} stat-cards — non inclus dans le draft (schéma : 8 slides max).`);
}

const teaser = nextDay.length
  ? `Tomorrow: ${nextDay.slice(0, 2).map((m) => `${name(m.homeTeam)} vs ${name(m.awayTeam)}`).join(', ')}${nextDay.length > 2 ? ` & ${nextDay.length - 2} more` : ''}.`
  : 'Tomorrow: TODO';

const mdLabel = matchday ?? 'N';
const draft = {
  matchDate,
  title: 'TODO — angle du match vedette',
  slides: [
    {
      type: 'cover',
      kicker: `Matchday ${mdLabel} · ${prettyDate(matchDate)}`,
      hook: 'TODO — tension en 8-12 mots, *accent* sur le mot clé',
      score: {
        home: featured ? name(featured.homeTeam) : '',
        away: featured ? name(featured.awayTeam) : '',
        homeGoals: featured ? featured.score.fullTime.home : 0,
        awayGoals: featured ? featured.score.fullTime.away : 0,
      },
      note: '',
      pose: 'shocked',
      accent: 'orange',
    },
    {
      type: 'turning-point',
      minute: 0,
      kicker: 'The setup',
      headline: 'TODO',
      body: 'TODO — recherche web, chaque fait vérifié sur 2 sources',
      annotations: [],
      accent: 'red',
    },
    {
      type: 'turning-point',
      minute: 0,
      kicker: 'The turnaround',
      headline: 'TODO',
      body: 'TODO — recherche web, chaque fait vérifié sur 2 sources',
      annotations: [],
      pose: 'celebrating',
      accent: 'orange',
    },
    ...others.slice(0, MAX_STAT_CARDS).map((m) => ({
      type: 'stat-card',
      kicker: `${name(m.homeTeam)} vs ${name(m.awayTeam)}`,
      value: `${m.score.fullTime.home}–${m.score.fullTime.away}`,
      unit: 'full time',
      context: 'TODO — l\'angle de ce match en 1-2 phrases (≈ 160 caractères)',
      accent: 'blue',
    })),
    {
      type: 'cta',
      text: 'One illustrated story. *Every matchday.*',
      note: teaser,
      pose: 'pointing',
      accent: 'orange',
    },
  ],
  stories: [
    {
      character: 'otto',
      kicker: `Today's story · matchday ${mdLabel}`,
      big: 'TODO — reprendre le hook de la cover',
      note: '',
      pose: 'pointing',
      sticker: "[ link sticker: today's post ]",
      cta: "Full story → today's post",
    },
    {
      character: 'numa',
      kicker: `Numa's number · matchday ${mdLabel}`,
      mega: 'TODO',
      unit: 'TODO — légende du chiffre',
      pose: 'celebrating',
      sticker: '[ emoji slider ]',
      cta: "All the numbers → today's post",
    },
    {
      character: 'vera',
      kicker: `Vera's file · matchday ${mdLabel}`,
      big: 'TODO — la note de discipline en lettre',
      note: '',
      pose: 'pointing',
      sticker: '[ poll ]',
      cta: "The whole file → today's post",
    },
  ],
};

const dir = join(ROOT, 'content', matchDate);
await mkdir(dir, { recursive: true });
const fileName = existsSync(join(dir, 'content.json')) ? 'content.draft.json' : 'content.json';
await writeFile(join(dir, fileName), JSON.stringify(draft, null, 2) + '\n');
if (fileName === 'content.draft.json') {
  console.log(`\n⚠ content/${matchDate}/content.json existe déjà — draft écrit dans content/${matchDate}/content.draft.json (rien d'écrasé).`);
} else {
  console.log(`\n✓ Draft écrit : content/${matchDate}/content.json`);
}

console.log(`
Prochaines étapes :
  1. Recherche web (2 sources) : buteurs + minutes, cartons, moment de bascule.
  2. Choisir le match vedette (le draft propose celui avec le plus de buts) et le
     personnage signature du jour (carton → Vera, record → Numa, tactique → Otto)
     → accent de la slide CTA + dernière story.
  3. Compléter les TODO, écrire caption.txt, puis :
     npm run render -- --date=${matchDate} ; npm run stories -- --date=${matchDate}`);
