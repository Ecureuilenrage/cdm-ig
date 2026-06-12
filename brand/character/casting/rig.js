// Rig commun du casting — même grammaire que poses.js :
// traits ink, linecap round, courbes légèrement irrégulières, viewBox 200x280.
// Chaque candidat fournit parts({pose, expression}) -> markup SVG interne ;
// wrap() l'emballe dans un <svg> (taille, flip, viewBox de recadrage pour les icônes).

export const INK = '#1A1A1A';
export const PAPER = '#FDFDFB';
export const RED = '#E5484D';
export const ORANGE = '#F76B15';
export const BLUE = '#2563EB';

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

export const EXPRESSION_NAMES = Object.keys(FACES);

// Visage paramétrique centré entre les yeux. browLift écarte les sourcils
// vers le haut (lunettes, casquettes), rot incline le visage (fanion penché).
export function face({ cx, cy, s = 1, expr = 'neutral', browLift = 0, rot = 0, ink = INK }) {
  const e = FACES[expr] || FACES.neutral;
  const sw = (5 / s).toFixed(2);
  return `<g transform="translate(${cx} ${cy})${rot ? ` rotate(${rot})` : ''} scale(${s})" stroke-width="${sw}">
    <circle cx="-14" cy="0" r="4.2" fill="${ink}" stroke="none"/>
    <circle cx="14" cy="-1" r="4.2" fill="${ink}" stroke="none"/>
    <g${browLift ? ` transform="translate(0 ${-browLift})"` : ''}><path d="${e.brows[0]}"/><path d="${e.brows[1]}"/></g>
    <path d="${e.mouth}" fill="none"/>
  </g>`;
}

export function hand(x, y, r = 5) {
  return `<circle cx="${x}" cy="${y}" r="${r}" />`;
}

// Petit pied façon coach : virgule vers l'extérieur (dir -1 = gauche, 1 = droite).
export function foot(x, y, dir = -1) {
  return `<path d="M ${x} ${y} Q ${x + 8 * dir} ${y + 4} ${x + 16 * dir} ${y + 2}" />`;
}

// Expression par défaut selon la pose.
export const DEFAULT_EXPR = {
  neutral: 'neutral',
  celebrating: 'happy',
  dejected: 'sad',
  pointing: 'happy',
  shocked: 'shocked',
};

export function wrap(inner, { size = 280, flip = false, vb = '0 0 200 280' } = {}) {
  const [x, , vw, vh] = vb.split(' ').map(Number);
  const w = Math.round(size * (vw / vh));
  return `<svg width="${w}" height="${size}" viewBox="${vb}" fill="none"
  stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <g ${flip ? `transform="translate(${2 * x + vw},0) scale(-1,1)"` : ''}>${inner}</g>
</svg>`;
}
