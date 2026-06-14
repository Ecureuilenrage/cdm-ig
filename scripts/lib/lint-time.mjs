// Garde-fou éditorial — un RECAP se poste le LENDEMAIN du match (cf. CLAUDE.md :
// « le matin, pour les matchs de la veille »). Donc toute ANCRE TEMPORELLE relative qui
// suppose une lecture le soir même — « tonight », « today », « this evening »… — est
// fausse dans la copie du match : au moment où on lit, le match était hier.
//
// Attention : le PRÉSENT NARRATIF (« Balogun strikes ») est la voix maison (brand/identity.md)
// et reste OK. On ne traque pas le présent, on traque les ancres relatives.
//
// Les slots qui regardent VERS L'AVANT — la slide `cta` (teaser du prochain post) et les
// stories « preview » dont le kicker annonce un à-venir (· tonight, coming up…) — peuvent
// légitimement dire tonight/today/tomorrow, MAIS seulement si ça colle au calendrier réel,
// ce qu'un regex ne sait pas vérifier. On les classe donc en « à vérifier » (review), jamais
// en bug certain (mustFix).

// Ancres relatives. La lookahead négative épargne les renvois au post frère publié le
// MÊME jour que la story (« → today's post », « tonight's drop ») — convention de la cta
// de story (cf. _schema.md), pas une ancre sur le match.
const ANCHORS = /\b(tonight|today|tomorrow|this (?:morning|afternoon|evening)|right now|just now|moments ago)\b(?!['’]s (?:post|story|drop|edition|carousel|breakdown|thread))/gi;

function hits(text) {
  if (typeof text !== 'string') return [];
  const found = new Set();
  for (const m of text.matchAll(ANCHORS)) found.add(m[1].toLowerCase().replace(/\s+/g, ' '));
  return [...found];
}

function snippet(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > 70 ? t.slice(0, 67) + '…' : t;
}

const SLIDE_FIELDS = ['hook', 'note', 'headline', 'body', 'context', 'unit', 'text', 'value'];
const STORY_FIELDS = ['big', 'note', 'unit', 'cta'];

// Un kicker de story qui annonce le prochain match → slot « preview » (forward).
const PREVIEW_KICKER = /\btonight\b|coming up|next up|preview|\btomorrow\b/i;

// lintTime(doc, { slides, stories }) → { mustFix:[…], review:[…] }
// mustFix = copie recap avec une ancre relative (à corriger). review = slot forward avec
// une ancre (à vérifier contre le calendrier).
export function lintTime(doc, { slides = false, stories = false } = {}) {
  const mustFix = [];
  const review = [];

  if (slides && Array.isArray(doc.slides)) {
    doc.slides.forEach((s, i) => {
      const sink = s.type === 'cta' ? review : mustFix; // la cta est le teaser du prochain post
      for (const f of SLIDE_FIELDS) {
        for (const w of hits(s[f])) sink.push(`slides[${i}] (${s.type}).${f} — « ${w} » dans “${snippet(s[f])}”`);
      }
      if (Array.isArray(s.annotations)) {
        s.annotations.forEach((a, j) => {
          for (const w of hits(a?.text)) sink.push(`slides[${i}].annotations[${j}] — « ${w} » dans “${snippet(a.text)}”`);
        });
      }
    });
  }

  if (stories && Array.isArray(doc.stories)) {
    doc.stories.forEach((st, i) => {
      const sink = PREVIEW_KICKER.test(st.kicker || '') ? review : mustFix;
      for (const f of STORY_FIELDS) {
        for (const w of hits(st[f])) sink.push(`stories[${i}] (${st.character || '?'}).${f} — « ${w} » dans “${snippet(st[f])}”`);
      }
    });
  }

  return { mustFix, review };
}

// Affichage uniforme (réutilisé par render.mjs et stories.mjs).
export function reportTime({ mustFix, review }) {
  if (mustFix.length) {
    console.warn('\n⚠ Temporel — le recap se poste le LENDEMAIN : bannir « tonight/today/tomorrow »');
    console.warn('  dans la copie du match (présent narratif OK, mais ancrer au passé : « yesterday », « on matchday N »).');
    for (const w of mustFix) console.warn('  ✗ ' + w);
  }
  if (review.length) {
    console.warn('\nℹ Slot preview (teaser du prochain post) — vérifier que le mot colle au calendrier du jour :');
    for (const w of review) console.warn('  · ' + w);
  }
  return mustFix.length > 0;
}
