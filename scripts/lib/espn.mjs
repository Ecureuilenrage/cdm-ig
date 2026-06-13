// Client ESPN JSON non officiel — events WC 2026 que le free tier football-data
// ne donne PAS (buteurs+minute, passeurs, cartons J/R horodatés, VAR, subs, compos).
//
//   site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=YYYYMMDD
//   site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={id}
//
// Gratuit, sans clé. Source d'APPOINT, jamais socle : TOUT est FAIL-SOFT — la moindre
// erreur réseau/parse renvoie null et le pipeline retombe sur le comportement manuel.
// On extrait des FAITS (scores, buteurs — non protégeables), jamais la prose des articles.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';
const CACHE_TTL_MIN = 10; // matchs terminés = données stables ; le cache évite de re-cogner l'API

// ---- GET caché, fail-soft (jamais d'exception qui remonte)
async function cachedGet(url, cacheName) {
  const cacheFile = join(ROOT, 'data', 'raw', cacheName);
  try {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8'));
    if (cached.__fetchedAt && Date.now() - cached.__fetchedAt < CACHE_TTL_MIN * 60 * 1000) {
      return cached;
    }
  } catch {}
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'scribble-pitch/0.1 (editorial facts only)' } });
    if (!res.ok) {
      console.log(`· ESPN ${res.status} sur ${url} — ignoré (fail-soft)`);
      return null;
    }
    const data = await res.json();
    data.__fetchedAt = Date.now();
    await mkdir(join(ROOT, 'data', 'raw'), { recursive: true });
    await writeFile(cacheFile, JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log(`· ESPN injoignable (${e.message}) — ignoré (fail-soft)`);
    return null;
  }
}

// ---- normalisation de noms d'équipes pour le mapping football-data ↔ ESPN.
// On compare un ENSEMBLE d'identifiants (nom, nom court, code 3 lettres) de chaque
// côté : le code à 3 lettres (tla ↔ abbreviation) est la clé de jointure fiable.
function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// quelques alias où les deux sources divergent vraiment (au besoin, à étoffer)
const ALIASES = {
  unitedstates: ['usa'],
  southkorea: ['korearepublic', 'republicofkorea', 'kor'],
  ivorycoast: ['cotedivoire'],
};

function idSet(...names) {
  const out = new Set();
  for (const n of names) {
    const k = norm(n);
    if (!k) continue;
    out.add(k);
    if (ALIASES[k]) for (const a of ALIASES[k]) out.add(norm(a));
  }
  return out;
}

function intersects(a, b) {
  for (const x of a) if (b.has(x)) return true;
  return false;
}

// ---- date ESPN : le scoreboard regroupe par date LOCALE (un coup d'envoi 01:02Z le
// 13/06 est listé sous dates=20260612, comme notre jour éditorial). On interroge donc
// le jour éditorial, avec une fenêtre J-1..J+1 par sécurité (matching par équipes ensuite).
const compact = (isoDate) => isoDate.replace(/-/g, '');
const addDaysIso = (isoDate, n) => {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Renvoie [{ id, completed, statusName, home:{names:Set, score}, away:{names:Set, score} }]
// pour tous les matchs de la fenêtre, ou [] si indisponible.
export async function fetchScoreboard(isoDate) {
  const from = compact(addDaysIso(isoDate, -1));
  const to = compact(addDaysIso(isoDate, 1));
  const data = await cachedGet(
    `${BASE}/scoreboard?dates=${from}-${to}`,
    `espn-scoreboard-${from}_${to}.json`
  );
  if (!data || !Array.isArray(data.events)) return [];
  const out = [];
  for (const ev of data.events) {
    const comp = ev.competitions?.[0];
    const competitors = comp?.competitors || [];
    const home = competitors.find((c) => c.homeAway === 'home') || competitors[0];
    const away = competitors.find((c) => c.homeAway === 'away') || competitors[1];
    if (!home || !away) continue;
    const teamIds = (c) =>
      idSet(c.team?.displayName, c.team?.shortDisplayName, c.team?.name, c.team?.location, c.team?.abbreviation);
    out.push({
      id: ev.id,
      completed: !!ev.status?.type?.completed,
      statusName: ev.status?.type?.name || '',
      home: { names: teamIds(home), score: home.score != null ? Number(home.score) : null },
      away: { names: teamIds(away), score: away.score != null ? Number(away.score) : null },
    });
  }
  return out;
}

// football-data team -> ensemble d'identifiants
function fdTeamIds(t) {
  return idSet(t?.shortName, t?.name, t?.tla);
}

// Trouve l'event ESPN correspondant à un match football-data. null si rien.
export function matchEvent(fdMatch, scoreboard) {
  const h = fdTeamIds(fdMatch.homeTeam);
  const a = fdTeamIds(fdMatch.awayTeam);
  for (const ev of scoreboard) {
    if (intersects(h, ev.home.names) && intersects(a, ev.away.names)) return ev;
    // tolère l'inversion domicile/extérieur entre les deux sources
    if (intersects(h, ev.away.names) && intersects(a, ev.home.names)) return ev;
  }
  return null;
}

// ---- minute : "31'" / "45'+5'" / "90'+8'" -> { display, sort } (sort triable)
function parseMinute(displayValue) {
  const display = String(displayValue || '').trim();
  const m = display.match(/(\d+)(?:\s*\+\s*(\d+))?/);
  if (!m) return { display, sort: 0 };
  const base = Number(m[1]);
  const added = m[2] ? Number(m[2]) : 0;
  return { display: display || `${base}'`, sort: base + added / 100 };
}

function classify(typeText) {
  const t = String(typeText || '').toLowerCase();
  if (t.includes('own goal')) return 'own-goal';
  if (t.includes('penalty') && t.includes('scored')) return 'penalty';
  if (t.includes('goal')) return 'goal';
  if (t.includes('red')) return 'red'; // inclut "VAR - (Red) Card Upgrade"
  if (t.includes('yellow')) return 'yellow';
  if (t.includes('substitution')) return 'sub';
  return 'other';
}

// Events normalisés d'un match. null si indisponible.
//  -> [{ kind, minute, minuteSort, period, team, rawType, players:[...], scorer, assist }]
export async function fetchEvents(eventId) {
  const data = await cachedGet(`${BASE}/summary?event=${eventId}`, `espn-summary-${eventId}.json`);
  const key = data && Array.isArray(data.keyEvents) ? data.keyEvents : null;
  if (!key) return null;
  const events = [];
  for (const e of key) {
    const kind = classify(e.type?.text);
    if (kind === 'other') continue;
    const { display, sort } = parseMinute(e.clock?.displayValue ?? e.clock?.value);
    const players = (e.participants || []).map((p) => p.athlete?.displayName).filter(Boolean);
    events.push({
      kind,
      minute: display,
      minuteSort: sort,
      period: e.period?.number ?? null,
      team: e.team?.displayName || '',
      rawType: e.type?.text || '',
      players,
      scorer: players[0] || null,
      assist: kind === 'goal' || kind === 'penalty' ? players[1] || null : null,
    });
  }
  events.sort((a, b) => a.minuteSort - b.minuteSort);
  return events;
}

// Synthèse exploitable par le pipeline (buts, cartons, comptes). Tolérant aux null.
export function digest(events) {
  if (!events) return null;
  const goals = events.filter((e) => e.kind === 'goal' || e.kind === 'own-goal' || e.kind === 'penalty');
  const cards = events.filter((e) => e.kind === 'yellow' || e.kind === 'red');
  const reds = cards.filter((e) => e.kind === 'red');
  const subs = events.filter((e) => e.kind === 'sub');
  return {
    goals,
    cards,
    yellowCount: cards.filter((e) => e.kind === 'yellow').length,
    redCount: reds.length,
    reds,
    subs,
    firstGoal: goals[0] || null,
    lastGoal: goals[goals.length - 1] || null,
  };
}

// Récupère et synthétise les events d'un match football-data en un appel.
// Renvoie { event, events, digest } ou null (fail-soft) à chaque maillon.
export async function eventsForMatch(fdMatch, scoreboard) {
  const ev = matchEvent(fdMatch, scoreboard);
  if (!ev) return null;
  const events = await fetchEvents(ev.id);
  if (!events) return null;
  return { event: ev, events, digest: digest(events) };
}
