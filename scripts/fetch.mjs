// Fetch football-data.org (free tier) → briefing du matin + draft content.json.
// Usage : npm run fetch -- [--date=YYYY-MM-DD] [--scorers]
//   --date     jour des matchs racontés (défaut : hier, heure locale)
//   --scorers  interroge aussi /scorers (top buteurs agrégés, libre tier) pour les stat-cards
//
// Free tier : fixtures, résultats, classements UNIQUEMENT — pas de buteurs/minutes/
// cartons par match. Le script garantit scores + calendrier ; la recherche web du
// matin (2 sources) reste obligatoire pour le récit.

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchScoreboard, eventsForMatch } from './lib/espn.mjs';
import { crosscheckMinutes } from './lib/wikipedia.mjs';
import {
  loadKey, addDays, editorialDay, prettyDate, dayMs, iso,
  fetchMatchesRange, fetchScorers, teamName as name, totalGoals,
} from './lib/footballdata.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MAX_STAT_CARDS = 4; // cover + 2 turning-points + stat-cards + cta ≤ 8 slides (schéma)

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

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

// ---- matchs : une seule requête couvre J, J+1 (teaser) et le débord UTC
const dateTo = addDays(matchDate, 2);
const all = await fetchMatchesRange(matchDate, dateTo);
const byDay = (d) => all.filter((m) => editorialDay(m.utcDate) === d);
const played = byDay(matchDate);
const nextDay = byDay(addDays(matchDate, 1));

const scoreLabel = (m) =>
  m.status === 'FINISHED' ? `${m.score.fullTime.home}–${m.score.fullTime.away}`
  : m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 'EN COURS'
  : m.status === 'POSTPONED' ? 'REPORTÉ'
  : 'à venir';

// ---- events détaillés via ESPN (gratuit, sans clé) : buteurs+minute, cartons, subs.
// FAIL-SOFT : indisponible → on continue avec les seuls scores garantis par football-data.
const scoreboard = await fetchScoreboard(matchDate);
const finishedToday = played.filter((m) => m.status === 'FINISHED');
const eventsByMatch = new Map();
for (const m of finishedToday) {
  try {
    const r = await eventsForMatch(m, scoreboard);
    if (r) eventsByMatch.set(m.id, r);
  } catch {}
}
if (!scoreboard.length) {
  console.log('· ESPN indisponible — briefing scores seuls (recherche web requise pour le récit).');
} else {
  console.log(`· ESPN : events récupérés pour ${eventsByMatch.size}/${finishedToday.length} match(s) terminé(s).`);
}

const goalLine = (e) =>
  `${e.minute} ${e.scorer}${e.kind === 'own-goal' ? ' (o.g.)' : e.kind === 'penalty' ? ' (pen)' : ''}` +
  `${e.assist ? ` — assist ${e.assist}` : ''} [${e.team}]`;

// ---- briefing console
const matchday = played.find((m) => m.matchday)?.matchday;
console.log(`\n=== Briefing — matchs du ${matchDate}${matchday ? ` (matchday ${matchday})` : ''} ===`);
if (!played.length) console.log('  (aucun match ce jour-là)');
for (const m of played) {
  const ko = new Date(m.utcDate).toISOString().slice(11, 16);
  console.log(`  ${name(m.homeTeam)} ${scoreLabel(m)} ${name(m.awayTeam)}  · ${ko} UTC${m.venue ? ` · ${m.venue}` : ''}`);
  const ev = eventsByMatch.get(m.id);
  if (ev) {
    for (const g of ev.digest.goals) console.log(`      ⚽ ${goalLine(g)}`);
    if (ev.digest.cards.length) {
      console.log(
        `      🟨${ev.digest.yellowCount} 🟥${ev.digest.redCount} · ` +
        ev.digest.cards.map((c) => `${c.minute} ${c.scorer}(${c.kind === 'red' ? 'R' : 'Y'})`).join(', ')
      );
    }
  }
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
  const scorers = await fetchScorers(10);
  console.log('\nTop buteurs (agrégé tournoi) :');
  for (const s of scorers.slice(0, 10)) {
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
const featEv = featured ? eventsByMatch.get(featured.id) : null;

// 2ᵉ SOURCE (Phase 3) : cross-check des minutes de buts du match vedette via Wikipedia.
// Best-effort, fail-soft : indispo / non localisé → pas de divergence, juste « vérifier à la main ».
let crosscheck = null;
if (featEv && featEv.digest.goals.length && featured) {
  try {
    crosscheck = await crosscheckMinutes(featured.homeTeam, featured.awayTeam, featEv.digest.goals);
  } catch {}
  if (crosscheck?.found && crosscheck.agree === true) {
    console.log(`\n✓ Cross-check Wikipedia : ${crosscheck.matched.length} minute(s) de but concordante(s) — confiance haute.`);
  } else if (crosscheck?.found && crosscheck.agree === false) {
    console.log(`\n⚠ Cross-check Wikipedia : minutes divergentes — ESPN seul ${JSON.stringify(crosscheck.onlyEspn)}, Wiki seul ${JSON.stringify(crosscheck.onlyWiki)} → VÉRIFIER avant publication.`);
  } else if (crosscheck?.found) {
    console.log('\n· Cross-check Wikipedia : match localisé mais minutes non extraites — vérifier à la main.');
  } else if (crosscheck) {
    console.log('\n· Wikipedia : match non localisé dans l’article de groupe — pas de 2ᵉ source auto (vérifier à la main).');
  } else {
    console.log('\n· Wikipedia indisponible — pas de 2ᵉ source auto (fail-soft).');
  }
  if (crosscheck?.note) console.log(`  ↳ Contexte Wiki (à VÉRIFIER) : ${crosscheck.note}`);
}

// cross-check du score : football-data (garanti) vs ESPN. Divergence → drapeau, jamais de blocage.
if (featEv && featured) {
  const fd = [featured.score.fullTime.home, featured.score.fullTime.away].sort().join('-');
  const es = [featEv.event.home.score, featEv.event.away.score].sort().join('-');
  if (fd !== es) {
    console.log(`\n⚠ Score divergent ESPN(${es}) ≠ football-data(${fd}) sur le match vedette — vérifier avant publication.`);
  }
}

// annotation factuelle d'un event ESPN (minute + acteur) — formats courts pour les slides
const annOf = (e) => ({
  text: `${e.minute} ${e.scorer}${e.kind === 'own-goal' ? ' (o.g.)' : e.kind === 'penalty' ? ' (pen)' : ''}`,
  color: e.kind === 'red' || e.kind === 'yellow' ? 'red' : 'blue',
});
const draftBody = (arr) =>
  'DRAFT (vérifier sur 2 sources, reformuler) — ' +
  arr.map((e) => `${e.scorer} ${e.minute}${e.assist ? ` (${e.assist})` : ''}`).join('; ') + '.';

// turning-points : si ESPN dispo, pré-remplir les ANNOTATIONS avec les vrais buts
// (les minutes = précisément ce qui doit être vérifié sur 2 sources) ; sinon TODO.
let tp1, tp2;
if (featEv && featEv.digest.goals.length) {
  const g = featEv.digest.goals;
  const mid = Math.ceil(g.length / 2);
  const setup = g.slice(0, mid);
  const turn = g.slice(mid).length ? g.slice(mid) : setup;
  tp1 = {
    type: 'turning-point', minute: Math.floor(setup[0]?.minuteSort || 0),
    kicker: 'The setup', headline: 'TODO — 6-8 mots',
    body: draftBody(setup), annotations: setup.slice(0, 2).map(annOf),
    accent: 'blue',
  };
  tp2 = {
    type: 'turning-point', minute: Math.floor(turn[0]?.minuteSort || 0),
    kicker: 'The turn', headline: 'TODO — 6-8 mots',
    body: draftBody(turn), annotations: turn.slice(-2).map(annOf),
    pose: 'celebrating', accent: 'orange',
  };
} else {
  tp1 = { type: 'turning-point', minute: 0, kicker: 'The setup', headline: 'TODO', body: 'TODO — recherche web, chaque fait vérifié sur 2 sources', annotations: [], accent: 'red' };
  tp2 = { type: 'turning-point', minute: 0, kicker: 'The turnaround', headline: 'TODO', body: 'TODO — recherche web, chaque fait vérifié sur 2 sources', annotations: [], pose: 'celebrating', accent: 'orange' };
}

// stat-cards : contexte pré-rempli avec les buteurs si ESPN dispo
const statCard = (m) => {
  const ev = eventsByMatch.get(m.id);
  const ctx = ev && ev.digest.goals.length
    ? 'DRAFT — ' + ev.digest.goals.map((e) => `${e.scorer} ${e.minute}`).join(', ') + '.'
    : "TODO — l'angle de ce match en 1-2 phrases (≈ 160 caractères)";
  return {
    type: 'stat-card',
    kicker: `${name(m.homeTeam)} vs ${name(m.awayTeam)}`,
    value: `${m.score.fullTime.home}–${m.score.fullTime.away}`,
    unit: 'full time',
    context: ctx,
    accent: 'blue',
  };
};

// Vera's file : auto depuis les cartons réels (rattrape l'erreur classique « aucun carton »)
let veraStory;
if (featEv && featEv.digest.cards.length) {
  const d = featEv.digest;
  const red = d.reds[0];
  veraStory = {
    character: 'vera', kicker: `Vera's file · matchday ${mdLabel}`,
    big: `${d.yellowCount} yellow${d.redCount ? `, *${d.redCount} red*` : ''}.`,
    note: red ? `${red.scorer} — ${red.minute}. Filed.` : 'DRAFT — pick the flashpoint, then file it.',
    pose: 'pointing', expression: d.redCount ? 'angry' : 'neutral',
    sticker: '[ poll ]', cta: "The whole file → today's post",
  };
} else {
  veraStory = {
    character: 'vera', kicker: `Vera's file · matchday ${mdLabel}`,
    big: 'TODO — la note de discipline en lettre', note: '',
    pose: 'pointing', sticker: '[ poll ]', cta: "The whole file → today's post",
  };
}

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
    tp1,
    tp2,
    ...others.slice(0, MAX_STAT_CARDS).map(statCard),
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
    veraStory,
  ],
};

const dir = join(ROOT, 'content', matchDate);
await mkdir(dir, { recursive: true });

// facts.json : faits structurés bruts (ancre = ce que l'humain relit et ce que la
// Phase 2 LLM consomme pour rédiger). Toujours réécrit — c'est de la donnée dérivée.
const facts = {
  matchDate,
  matchday: matchday ?? null,
  generatedFrom: 'football-data (scores garantis) + ESPN (events, fail-soft)',
  matches: finished.map((m) => {
    const ev = eventsByMatch.get(m.id);
    const entry = {
      home: name(m.homeTeam),
      away: name(m.awayTeam),
      score: { home: m.score.fullTime.home, away: m.score.fullTime.away },
      featured: m === featured,
      events: ev
        ? {
            goals: ev.digest.goals.map((e) => ({ minute: e.minute, kind: e.kind, team: e.team, scorer: e.scorer, assist: e.assist })),
            cards: ev.digest.cards.map((e) => ({ minute: e.minute, color: e.kind, team: e.team, player: e.scorer })),
            yellowCount: ev.digest.yellowCount,
            redCount: ev.digest.redCount,
            subs: ev.digest.subs.length,
          }
        : null,
    };
    if (m === featured && crosscheck) {
      entry.crosscheck = crosscheck.found
        ? { source: 'wikipedia', title: crosscheck.title, minutesAgree: crosscheck.agree, onlyEspn: crosscheck.onlyEspn, onlyWiki: crosscheck.onlyWiki }
        : { source: 'wikipedia', found: false };
      if (crosscheck.note) entry.wikiNote = crosscheck.note; // contexte/record — À VÉRIFIER avant publication
    }
    return entry;
  }),
};
await writeFile(join(dir, 'facts.json'), JSON.stringify(facts, null, 2) + '\n');
console.log(`✓ Faits structurés : content/${matchDate}/facts.json (${eventsByMatch.size} match(s) avec events ESPN)`);

const fileName = existsSync(join(dir, 'content.json')) ? 'content.draft.json' : 'content.json';
await writeFile(join(dir, fileName), JSON.stringify(draft, null, 2) + '\n');
if (fileName === 'content.draft.json') {
  console.log(`\n⚠ content/${matchDate}/content.json existe déjà — draft écrit dans content/${matchDate}/content.draft.json (rien d'écrasé).`);
} else {
  console.log(`\n✓ Draft écrit : content/${matchDate}/content.json`);
}

// ---- --draft : couche LLM (Phase 2) — Claude rédige un draft éditorial depuis les faits.
// Fail-soft : sans clé / SDK / erreur → on garde le draft déterministe ci-dessus.
if (args.draft) {
  const { enrichDraft } = await import('./lib/llm.mjs');
  const res = await enrichDraft(facts, draft);
  if (res) {
    await writeFile(join(dir, 'content.draft.llm.json'), JSON.stringify(res.draft, null, 2) + '\n');
    await writeFile(join(dir, 'caption.draft.txt'), res.caption);
    console.log(`✓ Draft LLM : content/${matchDate}/content.draft.llm.json + caption.draft.txt — À RELIRE (vérifier chaque [VERIFY]).`);
  }
}

// ---- --preview : scaffold du POST avant-match du lendemain (cadence 3 posts/jour, D13)
if (args.preview) {
  const pvDate = addDays(matchDate, 1);
  if (!nextDay.length) {
    console.log(`\n(--preview) Aucun match le ${pvDate} — pas de preview générée.`);
  } else {
    const ko = (m) => `${new Date(m.utcDate).toISOString().slice(11, 16)} UTC`;
    const dayMatches = nextDay.map((m) => ({ home: name(m.homeTeam), away: name(m.awayTeam), kickoff: ko(m) }));
    // L'overview liste TOUS les matchs ; on cap les cartes prono pour ne pas exploser le carrousel.
    const MAX_PRONO_CARDS = MAX_STAT_CARDS + 2;
    const cards = dayMatches.slice(0, MAX_PRONO_CARDS);
    if (dayMatches.length > cards.length) {
      console.log(`  ⚠ ${dayMatches.length - cards.length} match(s) listé(s) dans l'overview mais sans carte prono (cap ${MAX_PRONO_CARDS}).`);
    }
    // Format TIERED : le(s) gros match(s) en 2 slides (Otto's Board + Numa's Rewind),
    // le reste en cartes compactes. marquee = heuristique 1er match ; l'humain re-choisit.
    const marquee = cards[0];
    const ottoBoard = (m, extra) => ({
      type: 'preview', kicker: "Otto's Board",
      home: m.home, away: m.away, kickoff: m.kickoff,
      outcome: '1', // TODO — 1 = home win · X = draw · 2 = away win — VÉRIFIER
      pick: "TODO — Otto's call, verified (1-2 phrases, *accent* sur l'idée)",
      ...extra, pose: 'pointing', accent: 'orange',
    });
    const preview = {
      matchDate: pvDate,
      title: 'TODO — angle de la preview',
      slides: [
        // 1) OVERVIEW — tous les matchs du jour (on sait direct qu'il y en a plusieurs)
        { type: 'preview', kicker: `Coming up · ${prettyDate(pvDate)}`,
          hook: 'TODO — *hook* here (8-12 words)',
          matches: dayMatches, pose: 'pointing', accent: 'orange' },
        // 2-3) GROS MATCH — Otto's Board (prono 1/X/2 + key battle) + Numa's Rewind (chiffre + h2h)
        ...(marquee ? [
          ottoBoard(marquee, { battle: { a: 'TODO — key man / unit', b: 'TODO — zone' } }),
          { type: 'preview', kicker: "Numa's Rewind",
            home: marquee.home, away: marquee.away, kickoff: marquee.kickoff,
            number: { value: 'TODO', unit: 'TODO — ex. FIFA places apart' },
            h2h: 'TODO — head-to-head vérifié (2 sources) + 1 anecdote marquante',
            pose: 'celebrating', accent: 'blue' },
        ] : []),
        // 4..N) AUTRES MATCHS — carte compacte (prono + note h2h)
        ...cards.slice(1).map((m) => ottoBoard(m, { h2h: 'TODO — head-to-head vérifié (2 sources)' })),
        // (option) match chaud → ajouter une Vera's File :
        //   { type: 'preview', kicker: "Vera's File", home, away, discipline: 'TODO', accent: 'red' }
        { type: 'cta', text: "Who's your pick? *Tap to vote.*", note: 'Recap drops tomorrow.', pose: 'pointing', accent: 'orange' },
      ],
    };
    const pvDir = join(ROOT, 'content', pvDate);
    await mkdir(pvDir, { recursive: true });
    const pvFile = existsSync(join(pvDir, 'preview.json')) ? 'preview.draft.json' : 'preview.json';
    await writeFile(join(pvDir, pvFile), JSON.stringify(preview, null, 2) + '\n');
    console.log(`\n✓ Preview avant-match (${nextDay.length} match(s) le ${pvDate}) : content/${pvDate}/${pvFile}`);
    console.log(`  Rendre : npm run preview -- --date=${pvDate}`);
  }
}

console.log(`
Prochaines étapes :
  1. Recherche web (2 sources) : buteurs + minutes, cartons, moment de bascule.
  2. Choisir le match vedette (le draft propose celui avec le plus de buts) et le
     personnage signature du jour (carton → Vera, record → Numa, tactique → Otto)
     → accent de la slide CTA + dernière story.
  3. Compléter les TODO, écrire caption.txt, puis :
     npm run render -- --date=${matchDate} ; npm run stories -- --date=${matchDate}`);
