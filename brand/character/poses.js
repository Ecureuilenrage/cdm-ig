// Le cast Scribble Pitch — 3 analystes en SVG paramétrable.
// OTTO le tacticien (coach humain, cap + marqueur) · NUMA les nombres (chronomètre)
// · VERA la discipline (carton jaune, rouge quand ça chauffe).
// Tout en courbes légères, linecap round : le hand-drawn vient du dessin, pas d'un filtre.
//
// analyst({ character, pose, expression, mood, size, flip }) -> string <svg>
//   character : 'otto' | 'numa' | 'vera'  (sur une slide : déduit de l'accent)
//   pose      : 'neutral' | 'pointing' | 'shocked' | 'celebrating' | 'dejected'
//   expression: 'neutral' | 'happy' | 'shocked' | 'sad' | 'angry'
//   mood      : Vera uniquement — 'yellow' | 'red' (défaut : yellow ;
//               passe au rouge si expression angry ou pose dejected)
// coach(opts) reste exporté = analyst({ character: 'otto' }) (compat).

const INK = '#1A1A1A';
const PAPER = '#FDFDFB';
const RED = '#E5484D';
const YELLOW = '#EAB308'; // réservé au carton de Vera — pas un accent de slide

const FACES = {
  neutral: {
    brows: ['M -22 -13 Q -14 -17 -6 -14', 'M 6 -14 Q 14 -18 22 -15'],
    mouth: 'M -11 13 Q 0 19 11 12',
  },
  happy: {
    brows: ['M -22 -16 Q -14 -21 -6 -17', 'M 6 -17 Q 14 -22 22 -18'],
    mouth: 'M -15 9 Q 0 26 15 8',
  },
  shocked: {
    brows: ['M -22 -19 Q -14 -26 -6 -22', 'M 6 -22 Q 14 -28 22 -24'],
    mouth: 'M 0 9 C -6 10 -8 16 -5 21 C -1 25 6 24 7 18 C 8 12 5 9 0 9',
  },
  sad: {
    brows: ['M -22 -10 Q -14 -14 -6 -17', 'M 6 -17 Q 14 -14 22 -10'],
    mouth: 'M -11 19 Q 0 12 11 19',
  },
  angry: {
    brows: ['M -22 -17 Q -14 -15 -6 -10', 'M 6 -10 Q 14 -15 22 -17'],
    mouth: 'M -10 16 Q 0 13 10 15',
  },
};

const DEFAULT_EXPR = {
  neutral: 'neutral',
  pointing: 'happy',
  shocked: 'shocked',
  celebrating: 'happy',
  dejected: 'sad',
};

function face({ cx, cy, s = 1, expr = 'neutral' }) {
  const e = FACES[expr] || FACES.neutral;
  const sw = (5 / s).toFixed(2);
  return `<g transform="translate(${cx} ${cy}) scale(${s})" stroke-width="${sw}">
    <circle cx="-14" cy="0" r="4.2" fill="${INK}" stroke="none"/>
    <circle cx="14" cy="-1" r="4.2" fill="${INK}" stroke="none"/>
    <path d="${e.brows[0]}"/><path d="${e.brows[1]}"/>
    <path d="${e.mouth}" fill="none"/>
  </g>`;
}

const hand = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" />`;
const foot = (x, y, dir = -1) =>
  `<path d="M ${x} ${y} Q ${x + 8 * dir} ${y + 4} ${x + 16 * dir} ${y + 2}" />`;
const tilt = (inner) => `<g transform="rotate(-7 100 250)">${inner}</g>`;
const pickExpr = (pose, expression) => expression || DEFAULT_EXPR[pose] || 'neutral';

// ---------------------------------------------------------------- OTTO
const OTTO_HEAD = `<path d="M 60 80 C 60 53 76 40 100 40 C 126 40 140 56 140 80 C 140 104 124 120 100 120 C 76 120 60 105 60 80 Z" fill="${PAPER}" />`;
const OTTO_CAP = `
  <path d="M 58 66 C 62 40 80 28 102 28 C 124 28 140 44 142 64 C 114 56 86 58 58 66 Z" fill="${INK}" stroke-width="4" />
  <path d="M 136 62 C 152 56 166 56 173 61 C 167 68 150 70 133 69 Z" fill="${INK}" stroke-width="4" />`;
const OTTO_LEGS = `
  <path d="M 100 196 C 96 216 89 234 84 252" />
  ${foot(84, 252, -1)}
  <path d="M 100 196 C 104 216 111 234 116 252" />
  ${foot(116, 252, 1)}`;
const marker = (x1, y1, x2, y2) => `
  <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke-width="9" />
  <path d="M ${x2} ${y2} L ${x2 + (x2 - x1) * 0.22} ${y2 + (y2 - y1) * 0.22}" stroke-width="4" />`;

function otto({ pose, expression }) {
  const expr = pickExpr(pose, expression);
  let arms;
  if (pose === 'celebrating') {
    arms = `
      <path d="M 100 136 C 76 114 52 78 40 46" />
      ${hand(38, 40, 5.5)}
      <path d="M 100 136 C 126 116 152 84 161 50" />
      ${hand(163, 44, 5.5)}
      ${marker(150, 58, 172, 36)}`;
  } else if (pose === 'dejected') {
    // marqueur lâché au sol — jamais entre les jambes (ambiguïté de membre)
    arms = `
      <path d="M 100 138 C 93 154 90 170 89 184" />
      ${hand(89, 189)}
      <path d="M 100 138 C 107 154 110 170 111 184" />
      ${hand(111, 189)}
      <g transform="rotate(-18 162 244)">${marker(146, 248, 178, 240)}</g>`;
  } else if (pose === 'pointing') {
    arms = `
      <path d="M 100 140 C 86 148 80 160 91 168" />
      <path d="M 100 138 C 116 130 134 118 152 104" />
      <path d="M 152 104 L 165 95" />`;
  } else if (pose === 'shocked') {
    arms = `
      <path d="M 100 136 C 84 124 70 110 62 93" />
      ${hand(60, 88, 5.5)}
      <path d="M 100 136 C 118 126 132 112 142 95" />
      ${hand(144, 90, 5.5)}`;
  } else {
    arms = `
      <path d="M 100 136 C 88 144 78 156 72 170" />
      ${hand(70, 174)}
      <path d="M 100 136 C 114 138 128 134 138 124" />
      ${hand(140, 121)}
      ${marker(132, 128, 158, 106)}`;
  }
  return `${OTTO_HEAD}${OTTO_CAP}${face({ cx: 101, cy: 87, expr })}
    <path d="M 100 120 C 99 142 101 168 100 196" />
    ${arms}${OTTO_LEGS}`;
}

// ---------------------------------------------------------------- NUMA
function numa({ pose, expression }) {
  const expr = pickExpr(pose, expression);
  const body = `
    <path d="M 100 92 L 100 76" stroke-width="9" />
    <path d="M 88 72 L 112 72" stroke-width="7" />
    <path d="M 146 110 L 156 100" stroke-width="7" />
    <circle cx="100" cy="152" r="60" fill="${PAPER}" />
    <path d="M 100 100 L 100 110" stroke-width="3.5" />
    <path d="M 152 152 L 142 152" stroke-width="3.5" />
    <path d="M 100 204 L 100 194" stroke-width="3.5" />
    <path d="M 48 152 L 58 152" stroke-width="3.5" />
    ${face({ cx: 100, cy: 150, s: 1.05, expr })}`;
  const legs = `
    <path d="M 84 210 C 82 224 80 236 78 248" />
    ${foot(78, 248, -1)}
    <path d="M 116 210 C 118 224 120 236 122 248" />
    ${foot(122, 248, 1)}`;
  let arms;
  if (pose === 'celebrating') {
    arms = `
      <path d="M 43 155 C 30 140 22 124 18 108" />
      ${hand(17, 103)}
      <path d="M 157 155 C 170 140 178 124 182 108" />
      ${hand(183, 103)}`;
  } else if (pose === 'dejected') {
    arms = `
      <path d="M 43 162 C 39 176 38 188 38 196" />
      ${hand(38, 201)}
      <path d="M 157 162 C 161 176 162 188 162 196" />
      ${hand(162, 201)}`;
  } else if (pose === 'pointing') {
    arms = `
      <path d="M 43 160 C 35 166 32 174 37 180" />
      <path d="M 157 158 C 170 148 181 134 189 119" />
      <path d="M 189 119 L 195 110" />`;
  } else if (pose === 'shocked') {
    arms = `
      <path d="M 43 152 C 34 136 28 118 24 102" />
      ${hand(23, 96, 5.5)}
      <path d="M 157 152 C 166 136 172 118 176 102" />
      ${hand(177, 96, 5.5)}`;
  } else {
    arms = `
      <path d="M 43 160 C 33 168 27 178 25 188" />
      ${hand(24, 192)}
      <path d="M 157 160 C 167 168 173 178 175 188" />
      ${hand(176, 192)}`;
  }
  const all = body + arms + legs;
  return pose === 'dejected' ? tilt(all) : all;
}

// ---------------------------------------------------------------- VERA
function vera({ pose, expression, mood }) {
  const expr = expression || (pose === 'dejected' ? 'angry' : DEFAULT_EXPR[pose] || 'neutral');
  // le carton vire au rouge dès que l'humeur est mauvaise, sauf mood explicite
  const mad = mood ? mood === 'red' : pose === 'dejected' || expr === 'angry';
  const accent = mad ? RED : YELLOW;
  const body = `
    <rect x="62" y="76" width="76" height="108" rx="12" fill="${PAPER}" />
    <rect x="71" y="85" width="58" height="90" rx="8" stroke="${accent}" stroke-width="5" />
    <path d="M 120 76 L 138 94" stroke-width="4" />
    ${mad ? `<path d="M 78 168 L 96 150" stroke="${accent}" stroke-width="4" />
             <path d="M 92 172 L 112 152" stroke="${accent}" stroke-width="4" />` : ''}
    ${face({ cx: 100, cy: 118, expr })}`;
  const legs = `
    <path d="M 84 184 C 82 206 80 228 78 248" />
    ${foot(78, 248, -1)}
    <path d="M 116 184 C 118 206 120 228 122 248" />
    ${foot(122, 248, 1)}`;
  let arms;
  if (pose === 'celebrating') {
    arms = `
      <path d="M 62 140 C 48 128 38 112 32 96" />
      ${hand(30, 91)}
      <path d="M 138 140 C 152 128 162 112 168 96" />
      ${hand(170, 91)}`;
  } else if (pose === 'dejected') {
    // mains sur les hanches : le carton est furieux
    arms = `
      <path d="M 62 150 C 50 158 48 170 58 176" />
      <path d="M 138 150 C 150 158 152 170 142 176" />`;
  } else if (pose === 'pointing') {
    arms = `
      <path d="M 62 150 C 54 156 51 164 56 170" />
      <path d="M 138 144 C 152 136 164 124 174 110" />
      <path d="M 174 110 L 182 100" />`;
  } else if (pose === 'shocked') {
    arms = `
      <path d="M 62 144 C 52 128 44 110 40 94" />
      ${hand(39, 88, 5.5)}
      <path d="M 138 144 C 148 128 156 110 160 94" />
      ${hand(161, 88, 5.5)}`;
  } else {
    arms = `
      <path d="M 62 150 C 52 158 46 168 44 178" />
      ${hand(43, 182)}
      <path d="M 138 150 C 148 158 154 168 156 178" />
      ${hand(157, 182)}`;
  }
  return body + arms + legs;
}

// ---------------------------------------------------------------- API
const DRAW = { otto, numa, vera };

// Markup interne sans <svg> (viewBox 0 0 200 280) — pour recadrages (icônes rondes).
export function analystParts({ character = 'otto', pose = 'neutral', expression, mood } = {}) {
  return (DRAW[character] || otto)({ pose, expression, mood });
}

export function analyst({
  character = 'otto',
  pose = 'neutral',
  expression,
  mood,
  size = 280,
  flip = false,
} = {}) {
  const inner = (DRAW[character] || otto)({ pose, expression, mood });
  const w = Math.round(size * (200 / 280));
  return `
<svg width="${w}" height="${size}" viewBox="0 0 200 280" fill="none"
     stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <g ${flip ? 'transform="translate(200,0) scale(-1,1)"' : ''}>${inner}</g>
</svg>`;
}

// Compat : l'ancien point d'entrée rend Otto (la signature de la marque).
export const coach = (opts = {}) => analyst({ ...opts, character: 'otto' });

export const CHARACTERS = Object.keys(DRAW);
export const POSES = Object.keys(DEFAULT_EXPR);
export const EXPRESSION_NAMES = Object.keys(FACES);
