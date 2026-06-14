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
