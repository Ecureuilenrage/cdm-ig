// Client football-data.org partagé (free tier) — extrait de fetch.mjs pour être
// réutilisé par le moteur du jour (calendar.mjs), l'état du tournoi (standings.mjs)
// et l'usine à evergreens. Garantit scores + calendrier + classements.
//
// Free tier : fixtures, résultats, classements, top buteurs UNIQUEMENT — pas de
// buteurs/minutes/cartons par match (ESPN s'en charge, fail-soft). Quota 10 appels/min :
// le client lit les headers de quota pour s'auto-throttler (reco officielle de l'API).
//
// Clé : FOOTBALL_DATA_KEY (env ou .env à la racine). Jamais commitée. apiGet jette si
// la clé manque — les appelants fail-soft enveloppent dans try/catch.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const API = 'https://api.football-data.org/v4';
export const COMPETITION = 'WC';
const CACHE_TTL_MIN = 10; // réutilise une réponse de moins de 10 min (quota : 10 appels/min)

// ---- clé API : variable d'environnement, sinon .env à la racine (parse minimal). Mémoïsée.
let keyPromise = null;
export function loadKey() {
  if (!keyPromise) {
    keyPromise = (async () => {
      if (process.env.FOOTBALL_DATA_KEY) return process.env.FOOTBALL_DATA_KEY;
      try {
        const raw = await readFile(join(ROOT, '.env'), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
          const m = line.match(/^\s*FOOTBALL_DATA_KEY\s*=\s*"?([^"#]+?)"?\s*$/);
          if (m) return m[1].trim();
        }
      } catch {}
      return null;
    })();
  }
  return keyPromise;
}

// ---- helpers de dates. Jour de match ÉDITORIAL : un match du soir aux US/Canada/Mexique
// tombe le lendemain en UTC ; on rattache un coup d'envoi au jour J si (utcDate - 8h)
// tombe le J (8h UTC = 4h ET / 1h PT, aucun match à cette heure).
export const dayMs = 24 * 60 * 60 * 1000;
export const iso = (d) => d.toISOString().slice(0, 10);
export const addDays = (isoDate, n) => iso(new Date(new Date(`${isoDate}T12:00:00Z`).getTime() + n * dayMs));
export const editorialDay = (utcDate) => iso(new Date(new Date(utcDate).getTime() - 8 * 60 * 60 * 1000));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
export function prettyDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

// ---- GET throttlé + archivé. On lit les headers de réponse pour s'auto-throttler
// (X-Requests-Available-Minute / X-RequestCounter-Reset) — reco officielle de l'API.
let remaining = null;
let resetSec = null;
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

export async function apiGet(path, cacheName, retried = false) {
  const cacheFile = join(ROOT, 'data', 'raw', cacheName);
  try {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8'));
    if (cached.__fetchedAt && Date.now() - cached.__fetchedAt < CACHE_TTL_MIN * 60 * 1000) {
      console.log(`· ${path} — cache (<${CACHE_TTL_MIN} min) : data/raw/${cacheName}`);
      return cached;
    }
  } catch {}

  const key = await loadKey();
  if (!key) throw new Error('FOOTBALL_DATA_KEY introuvable (.env à la racine ou variable d\'environnement).');

  if (remaining === 0) {
    const wait = (resetSec ?? 60) + 1;
    console.log(`· quota minute épuisé — pause ${wait}s (header de reset)…`);
    await sleep(wait);
  }

  const res = await fetch(API + path, { headers: { 'X-Auth-Token': key } });
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

// ---- fetchers haut niveau (renvoient le payload déballé) ------------------------

// Matchs sur une plage de dates (une requête couvre J, J+1 teaser et le débord UTC).
export async function fetchMatchesRange(dateFrom, dateTo) {
  const res = await apiGet(
    `/competitions/${COMPETITION}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    `matches-${dateFrom}_${dateTo}.json`
  );
  return res.matches || [];
}

// Top buteurs agrégés du tournoi.
export async function fetchScorers(limit = 10) {
  const res = await apiGet(`/competitions/${COMPETITION}/scorers?limit=${limit}`, 'scorers.json');
  return res.scorers || [];
}

// Classements (phase de groupes). Renvoie le tableau `standings` brut.
export async function fetchStandings() {
  const res = await apiGet(`/competitions/${COMPETITION}/standings`, 'standings.json');
  return res.standings || [];
}

// Équipes participantes.
export async function fetchTeams() {
  const res = await apiGet(`/competitions/${COMPETITION}/teams`, 'teams.json');
  return res.teams || [];
}

// ---- petits helpers de présentation partagés -----------------------------------
export const teamName = (t) => t?.shortName || t?.name || t?.tla || '?';
export const totalGoals = (m) => (m.score?.fullTime?.home ?? 0) + (m.score?.fullTime?.away ?? 0);
