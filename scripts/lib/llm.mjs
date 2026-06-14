// Couche LLM (Phase 2 du Chantier A′) — Claude rédige un DRAFT éditorial dans la voix
// Otto/Numa/Vera À PARTIR des faits structurés d'ESPN. Anti-hallucination : le modèle
// ne rédige QUE depuis le tableau d'events ; il n'invente ni buteur, ni minute, ni
// record historique. Tout est FAIL-SOFT : pas de clé / SDK absent / erreur → renvoie
// null et le pipeline garde son draft déterministe.
//
// Modèles (décision 13/06) — surchargeables par variable d'env :
//   SCRIBBLE_LLM_MODEL    rédaction (défaut claude-opus-4-8)
//   SCRIBBLE_LLM_EXTRACT  extraction d'appoint (défaut claude-sonnet-4-6) — réservé Phase B
//
// Clé : ANTHROPIC_API_KEY (env ou .env à la racine). Jamais commitée.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DRAFT_MODEL = process.env.SCRIBBLE_LLM_MODEL || 'claude-opus-4-8';

async function loadKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*ANTHROPIC_API_KEY\s*=\s*"?([^"#]+?)"?\s*$/);
      if (m) return m[1].trim();
    }
  } catch {}
  return null;
}

// Brief de voix de marque, condensé (la charte complète est dans brand/identity.md).
const VOICE = `Scribble Pitch — illustrated World Cup storytelling, in English.
Cast: OTTO (coach, orange, tactics — "Trust the board."), NUMA (stopwatch, blue, numbers
— "...under protest."), VERA (cards, red, discipline — "Filed."). Voice: dry, confident,
a little playful; short sentences; no clichés; never the words "World Cup" or "FIFA" on
the visuals (legal). One underlined accent word per field with *asterisks*.`;

// Schéma de SORTIE (structured output). Champs plats que l'on fusionne ensuite dans le
// draft. Pas de contraintes non supportées (minLength/maximum…).
function outputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      coverHook: { type: 'string' },
      coverNote: { type: 'string' },
      turningPoints: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { kicker: { type: 'string' }, headline: { type: 'string' }, body: { type: 'string' } },
          required: ['kicker', 'headline', 'body'],
        },
      },
      statCardContexts: { type: 'array', items: { type: 'string' } },
      ottoTeaser: { type: 'string' },
      numaNumber: {
        type: 'object',
        additionalProperties: false,
        properties: { mega: { type: 'string' }, unit: { type: 'string' }, note: { type: 'string' } },
        required: ['mega', 'unit', 'note'],
      },
      caption: { type: 'string' },
      altTexts: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'coverHook', 'coverNote', 'turningPoints', 'statCardContexts', 'ottoTeaser', 'numaNumber', 'caption', 'altTexts'],
  };
}

function buildPrompt(facts, baseDraft) {
  const tp = baseDraft.slides.filter((s) => s.type === 'turning-point');
  const stat = baseDraft.slides.filter((s) => s.type === 'stat-card');
  return `${VOICE}

You are drafting the editorial copy for ONE day's recap carousel. Work ONLY from the
structured facts below (scores, scorers, minutes, cards — all from the match feed). Hard rules:
- Never invent a scorer, a minute, an assist, a card, or any historical/record claim. If a
  sentence would need a fact not in FACTS, don't write it. If you reference history, you MUST
  append " [VERIFY]" so a human checks it on the web.
- TIME FRAMING: this recap is published the DAY AFTER the match. Never write "tonight",
  "today", "tomorrow", "this evening/afternoon/morning" about the match — the reader sees it
  the next day, so those words are wrong. Narrative present for the ACTION is fine ("Balogun
  strikes"), but anchor time in the past or by matchday: "yesterday", "on matchday 1". The
  only forward-looking teaser is the cover/cta note about the NEXT matches.
- Lengths: coverHook 8-12 words; turning-point headline 6-8 words, body 3-5 short sentences
  (~280 chars max); statCardContext 1-2 sentences (~160 chars). Put exactly one *accent* word
  per hook/headline/body where it sharpens the idea.
- numaNumber must be DERIVED from FACTS only (e.g. goals in the match, fastest goal minute,
  cards count) — mega = the number as a short string.
- FACTS may include a "wikiNote" on the featured match (a record / head-to-head line from
  Wikipedia). You MAY use it for the cover hook, an angle, or numaNumber — but it is a second
  source not yet hand-checked, so append " [VERIFY]" to ANY sentence that relies on it.
- caption: first line = the hook, then 3-5 "● " bullet lines, then a follow CTA, then 8-10
  hashtags (no #WorldCup / #FIFA). altTexts: one plain-language line PER SLIDE (${baseDraft.slides.length} slides, in order).

Return turningPoints in the SAME ORDER as these ${tp.length} turning-point slide(s), and
statCardContexts in the SAME ORDER as these ${stat.length} stat-card slide(s).

FACTS:
${JSON.stringify(facts, null, 2)}

Current draft skeleton (for slide order/kickers — replace the TODO/DRAFT text):
${JSON.stringify({ slides: baseDraft.slides.map((s) => ({ type: s.type, kicker: s.kicker })) }, null, 2)}`;
}

// Fusionne la sortie LLM dans une COPIE du draft déterministe. Défensif sur les longueurs.
function merge(baseDraft, out) {
  const draft = JSON.parse(JSON.stringify(baseDraft));
  if (out.title) draft.title = out.title;
  let tpI = 0;
  let statI = 0;
  for (const s of draft.slides) {
    if (s.type === 'cover') {
      if (out.coverHook) s.hook = out.coverHook;
      if (out.coverNote) s.note = out.coverNote;
    } else if (s.type === 'turning-point') {
      const t = out.turningPoints?.[tpI++];
      if (t) {
        if (t.kicker) s.kicker = t.kicker;
        if (t.headline) s.headline = t.headline;
        if (t.body) s.body = t.body;
      }
    } else if (s.type === 'stat-card') {
      const c = out.statCardContexts?.[statI++];
      if (c) s.context = c;
    }
  }
  for (const st of draft.stories || []) {
    if (st.character === 'otto' && /today/i.test(st.kicker || '') && out.ottoTeaser) st.big = out.ottoTeaser;
    if (st.character === 'numa' && out.numaNumber) {
      st.mega = out.numaNumber.mega;
      st.unit = out.numaNumber.unit;
      if (out.numaNumber.note) st.note = out.numaNumber.note;
    }
  }
  return draft;
}

// Construit le caption.txt (format CAPTION + ALT-TEXTS du schéma).
function buildCaption(out) {
  const alts = (out.altTexts || []).map((a, i) => `${i + 1}. ${a}`).join('\n');
  return `CAPTION\n\n${out.caption || ''}\n\nALT-TEXTS\n\n${alts}\n`;
}

// API publique : renvoie { draft, caption } enrichis, ou null (fail-soft).
export async function enrichDraft(facts, baseDraft) {
  const key = await loadKey();
  if (!key) {
    console.log('· LLM : ANTHROPIC_API_KEY introuvable (.env) — draft déterministe conservé (fail-soft).');
    return null;
  }
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    console.log('· LLM : @anthropic-ai/sdk non installé (`npm i @anthropic-ai/sdk`) — fail-soft.');
    return null;
  }
  try {
    const client = new Anthropic({ apiKey: key });
    const stream = client.messages.stream({
      model: DRAFT_MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: VOICE,
      output_config: { format: { type: 'json_schema', schema: outputSchema() } },
      messages: [{ role: 'user', content: buildPrompt(facts, baseDraft) }],
    });
    const msg = await stream.finalMessage();
    const textBlock = msg.content.find((b) => b.type === 'text');
    if (!textBlock) return null;
    const out = JSON.parse(textBlock.text);
    console.log(`· LLM : draft rédigé par ${DRAFT_MODEL} (relire avant publication).`);
    return { draft: merge(baseDraft, out), caption: buildCaption(out) };
  } catch (e) {
    console.log(`· LLM : échec (${e.message}) — draft déterministe conservé (fail-soft).`);
    return null;
  }
}

// ---- Appel structuré générique (réutilisé par les générateurs quiz/evergreen). Fail-soft → null.
async function runStructured(system, prompt, schema) {
  const key = await loadKey();
  if (!key) {
    console.log('· LLM : ANTHROPIC_API_KEY introuvable (.env) — base déterministe conservée (fail-soft).');
    return null;
  }
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    console.log('· LLM : @anthropic-ai/sdk non installé (`npm i @anthropic-ai/sdk`) — fail-soft.');
    return null;
  }
  try {
    const client = new Anthropic({ apiKey: key });
    const stream = client.messages.stream({
      model: DRAFT_MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system,
      output_config: { format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: prompt }],
    });
    const msg = await stream.finalMessage();
    const textBlock = msg.content.find((b) => b.type === 'text');
    if (!textBlock) return null;
    return JSON.parse(textBlock.text);
  } catch (e) {
    console.log(`· LLM : échec (${e.message}) — base déterministe conservée (fail-soft).`);
    return null;
  }
}

// ---- enrichQuiz : affine la COPIE du quiz (le 3e post jour de match). La RÉPONSE factuelle
// (options + valeur révélée) reste verrouillée — le modèle ne touche qu'au phrasé. → { doc, caption } | null.
function buildQuizPrompt(facts, baseDoc) {
  const quiz = baseDoc.slides.find((s) => s.type === 'quiz');
  const stats = baseDoc.slides.filter((s) => s.type === 'stat-card');
  const [reveal, bonus] = stats;
  return `${VOICE}

You are polishing a one-day QUIZ post (the 3rd daily slot, a 4-slide carousel). Work ONLY
from FACTS. Hard rules:
- Do NOT change the factual answer. The quiz OPTIONS and the reveal VALUE are fixed numbers
  from the match feed — keep the premise identical (it asks the minute of the last goal). You
  ONLY sharpen wording, never the numbers.
- question: ONE punchy sentence, present tense, exactly one *accent* word. Keep the matchup
  and the "last goal minute" premise.
- Write each context as PLAIN PROSE in the house tone — do NOT prefix with a speaker name
  (never "OTTO:", "NUMA:", "VERA:"). One short sentence each, ≤140 chars.
- revealContext explains the reveal VALUE (the goal minute) and names the real scorer.
- bonusContext must explain the BONUS number below (bonusValue/bonusUnit) — keep it about
  THAT number, do not drift to another stat.
- No invented record/history: only facts present in FACTS (a "wikiNote" counts as a fact).
- TIME: posted the day AFTER the match — never "tonight/today/tomorrow". No "World Cup"/"FIFA".
- caption: first line = the question (do NOT reveal the answer in it), then 2-3 "● " tease
  lines, a "comment your score" CTA, then 6-8 hashtags (no #WorldCup/#FIFA).

FACTS:
${JSON.stringify(facts, null, 2)}

Current quiz (KEEP options & reveal value; refine copy only):
${JSON.stringify({
    question: quiz?.question,
    options: quiz?.options,
    revealValue: reveal?.value,
    revealUnit: reveal?.unit,
    bonusValue: bonus?.value,
    bonusUnit: bonus?.unit,
  }, null, 2)}`;
}

export async function enrichQuiz(facts, baseDoc) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      question: { type: 'string' },
      revealContext: { type: 'string' },
      bonusContext: { type: 'string' },
      caption: { type: 'string' },
    },
    required: ['question', 'revealContext', 'bonusContext', 'caption'],
  };
  const out = await runStructured(VOICE, buildQuizPrompt(facts, baseDoc), schema);
  if (!out) return null;
  const doc = JSON.parse(JSON.stringify(baseDoc));
  const quiz = doc.slides.find((s) => s.type === 'quiz');
  const stats = doc.slides.filter((s) => s.type === 'stat-card');
  if (quiz && out.question) quiz.question = out.question;
  if (stats[0] && out.revealContext) stats[0].context = out.revealContext;
  if (stats[1] && out.bonusContext) stats[1].context = out.bonusContext;
  console.log(`· LLM : quiz raffiné par ${DRAFT_MODEL} (relire avant publication).`);
  return { doc, caption: `CAPTION\n\n${out.caption || ''}\n` };
}

// ---- generateEvergreen : draft un evergreen « Did you know? » thématique Mondial. Chaque fait
// est suffixé " [VERIFY]" (à fact-checker + nettoyer AVANT publication). Légal : jamais « World
// Cup »/« FIFA » sur le visuel. → { doc, caption } | null (fail-soft).
const CHAR_ACCENT = { otto: 'orange', numa: 'blue', vera: 'red' };

function buildEvergreenPrompt(topic) {
  return `${VOICE}

Write an EVERGREEN "Did you know?" post (timeless trivia, no fixture attached) about: ${topic}.
Format: exactly THREE stat-cards (one number each) + a closing line. Hard rules:
- Each card centers on ONE concrete, CHECKABLE number — a record, a tally, a year, an age, a
  margin. Pick genuinely interesting, little-known facts; avoid the obvious.
- These facts are NOT from a verified feed. Append " [VERIFY]" to the END of EVERY context
  sentence that states a fact — a human fact-checks on the web before publishing.
- NEVER write "World Cup" or "FIFA" in any slide text (legal). Use "the tournament", "the
  finals", "at this level", "on the biggest stage". Team/player names as text are fine; no
  caricatures implied.
- Choose ONE narrator for the whole post: numbers/records → numa; tactics/comeback → otto;
  cards/discipline/drama → vera.
- value = the number as a short string (≤8 chars, e.g. "13", "1958", "17y"). unit = a 3-6 word
  label. context = 1-2 short sentences, ≤160 chars, with exactly ONE *accent* word.
- caption: first line = a hook, then 2-3 "● " lines, a follow CTA, then 6-8 hashtags
  (no #WorldCup / #FIFA).`;
}

export async function generateEvergreen(topic) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      character: { type: 'string', enum: ['otto', 'numa', 'vera'] },
      cards: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            kicker: { type: 'string' },
            value: { type: 'string' },
            unit: { type: 'string' },
            context: { type: 'string' },
          },
          required: ['kicker', 'value', 'unit', 'context'],
        },
      },
      ctaNote: { type: 'string' },
      caption: { type: 'string' },
    },
    required: ['title', 'character', 'cards', 'ctaNote', 'caption'],
  };
  const out = await runStructured(VOICE, buildEvergreenPrompt(topic), schema);
  if (!out) return null;

  const character = ['otto', 'numa', 'vera'].includes(out.character) ? out.character : 'numa';
  const accent = CHAR_ACCENT[character];
  const poses = ['shocked', undefined, 'celebrating'];
  const slides = (out.cards || []).slice(0, 3).map((c, i) => ({
    type: 'stat-card',
    kicker: c.kicker,
    value: c.value,
    unit: c.unit,
    context: c.context,
    ...(poses[i] ? { pose: poses[i] } : {}),
    accent,
  }));
  slides.push({
    type: 'cta',
    text: 'One illustrated story. *Every matchday.*',
    note: out.ctaNote || 'Numa counts. You enjoy.',
    pose: 'pointing',
    accent,
  });

  console.log(`· LLM : evergreen « ${out.title} » rédigé par ${DRAFT_MODEL} — contient des [VERIFY] à lever.`);
  return {
    doc: { matchDate: 'evergreen', title: out.title, character, slides },
    caption: `CAPTION\n\n${out.caption || ''}\n`,
  };
}
