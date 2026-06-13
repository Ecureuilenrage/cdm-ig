// Wikipedia (action API, gratuit, sans clé) — 2ᵉ SOURCE de cross-check des minutes de
// buts (la règle « vérifier sur 2 sources », surtout les minutes — CLAUDE.md). Best-effort,
// FAIL-SOFT : page introuvable / non parsable → null, jamais une fausse divergence bloquante.
// Bonus : remonte une ligne de contexte éditorial (records/h2h) pour l'angle — à VÉRIFIER.
//
// On lit des FAITS (minutes, records) dans une source ouverte ; on ne republie pas de prose.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const API = 'https://en.wikipedia.org/w/api.php';
const CACHE_TTL_MIN = 60;
const UA = 'scribble-pitch/0.1 (editorial cross-check; facts only)';

const norm = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// "45'+5'" / "45+5'" / "7'" → "45+5" / "7"
const normMinute = (s) => String(s).replace(/['’\s]/g, '');

async function cachedGet(url, cacheName) {
  const cacheFile = join(ROOT, 'data', 'raw', cacheName);
  try {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8'));
    if (cached.__fetchedAt && Date.now() - cached.__fetchedAt < CACHE_TTL_MIN * 60 * 1000) return cached;
  } catch {}
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    data.__fetchedAt = Date.now();
    await mkdir(join(ROOT, 'data', 'raw'), { recursive: true });
    await writeFile(cacheFile, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

// nettoie le wikitext en prose lisible (best-effort)
function clean(s) {
  let t = String(s);
  t = t.replace(/<ref[^>]*\/>/gi, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  for (let i = 0; i < 3; i++) t = t.replace(/\{\{[^{}]*\}\}/g, ''); // templates (qq niveaux)
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1'); // [[lien|texte]] → texte
  t = t.replace(/'''?/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return t;
}

// première phrase de contexte (record / série / h2h) dans le corps de la section du match
function extractNote(body) {
  const prose = clean(String(body).slice(0, 1800)); // la prose h2h ouvre la section
  const sentences = prose.split(/(?<=[.!?])\s+/);
  const kw = /(first|record|since|fastest|most|only|never|biggest|youngest|oldest|consecutive|World Cup)/i;
  for (const s of sentences) {
    if (s.length > 40 && s.length < 320 && kw.test(s)) return s;
  }
  return null;
}

// Cross-check les minutes de buts d'un match (objets équipe football-data + buts ESPN).
// Renvoie { title, agree, matched, onlyEspn, onlyWiki, wikiMinutes, note } ou null (fail-soft).
export async function crosscheckMinutes(homeTeam, awayTeam, espnGoals) {
  const ids = (t) => [t?.name, t?.shortName, t?.tla].map(norm).filter((x) => x.length >= 4);
  const hIds = ids(homeTeam);
  const aIds = ids(awayTeam);
  if (!hIds.length || !aIds.length) return null;

  const q = `2026 FIFA World Cup ${homeTeam?.name || ''} ${awayTeam?.name || ''}`;
  const sr = await cachedGet(
    `${API}?action=query&list=search&format=json&srlimit=5&srsearch=${encodeURIComponent(q)}`,
    `wiki-search-${norm(q)}.json`
  );
  const hits = sr?.query?.search || [];
  const title = hits.find((h) => /group/i.test(h.title))?.title || hits[0]?.title;
  if (!title) return null;

  const pj = await cachedGet(
    `${API}?action=parse&format=json&prop=wikitext&page=${encodeURIComponent(title)}`,
    `wiki-${norm(title)}.json`
  );
  const wt = pj?.parse?.wikitext?.['*'];
  if (!wt) return null;

  // localiser la SECTION du match (titre `===Équipe A vs Équipe B===`) contenant les 2 équipes.
  // Robuste : indépendant du nom de template de la box (ici les buts sont en `|goals1=`/`|goals2=`).
  const sections = wt.split(/\n==+\s*([^=\n]+?)\s*==+\n/);
  let body = null;
  for (let i = 1; i < sections.length; i += 2) {
    const nt = norm(sections[i]);
    if (hIds.some((x) => nt.includes(x)) && aIds.some((x) => nt.includes(x))) {
      body = sections[i + 1] || '';
      break;
    }
  }
  if (!body) return { title, found: false }; // section non localisée → pas de divergence

  // minutes des buts : cibler les blocs |goals1= / |goals2= (sinon stats/cartons/subs polluent)
  const goalBlocks = [...body.matchAll(/\|\s*goals[12]\s*=([\s\S]*?)(?=\n\s*\|)/g)].map((m) => m[1]).join('\n');
  const src = goalBlocks || body.slice(0, 1200);
  const wikiSet = new Set([...src.matchAll(/(\d{1,2}(?:\+\d{1,2})?)\s*['’]/g)].map((m) => normMinute(m[1])));

  if (!wikiSet.size) return { title, found: true, agree: null, reason: 'no-minutes', note: extractNote(body) };

  const espnSet = new Set((espnGoals || []).map((g) => normMinute(g.minute)));
  const matched = [...espnSet].filter((m) => wikiSet.has(m));
  const onlyEspn = [...espnSet].filter((m) => !wikiSet.has(m));
  const onlyWiki = [...wikiSet].filter((m) => !espnSet.has(m));

  return {
    title,
    found: true,
    agree: onlyEspn.length === 0 && onlyWiki.length === 0,
    matched,
    onlyEspn,
    onlyWiki,
    wikiMinutes: [...wikiSet],
    note: extractNote(body),
  };
}
