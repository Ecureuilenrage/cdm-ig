// Casting Scribble Pitch — 17 candidats, organisés par rôle (Phase 1).
// Chaque candidat : parts({pose, expression}) -> markup SVG interne (viewBox 0 0 200 280).
// Poses : neutral | celebrating | dejected. Règles : anatomie non ambiguë,
// lisible à 40 px, traits ink, linecap round, zéro dégradé.

import { INK, PAPER, RED, ORANGE, face, hand, foot, DEFAULT_EXPR } from './rig.js';

const pickExpr = (pose, expression) => expression || DEFAULT_EXPR[pose] || 'neutral';

// ---- pièces humanoïdes partagées (la famille graphique du coach) ----

const HEAD = `<path d="M 60 80 C 60 53 76 40 100 40 C 126 40 140 56 140 80 C 140 104 124 120 100 120 C 76 120 60 105 60 80 Z" fill="${PAPER}" />`;

const SPINE = `<path d="M 100 120 C 99 142 101 168 100 196" />`;

const LEGS = `
  <path d="M 100 196 C 96 216 89 234 84 252" />
  ${foot(84, 252, -1)}
  <path d="M 100 196 C 104 216 111 234 116 252" />
  ${foot(116, 252, 1)}`;

const ARMS_DOWN = `
  <path d="M 100 136 C 88 144 78 156 72 170" />
  ${hand(70, 174)}
  <path d="M 100 136 C 112 144 122 156 128 170" />
  ${hand(130, 174)}`;

const ARMS_UP = `
  <path d="M 100 136 C 76 114 52 78 40 46" />
  ${hand(38, 40, 5.5)}
  <path d="M 100 136 C 126 116 152 84 161 50" />
  ${hand(163, 44, 5.5)}`;

const ARMS_SLUMP = `
  <path d="M 100 138 C 93 154 90 170 89 184" />
  ${hand(89, 189)}
  <path d="M 100 138 C 107 154 110 170 111 184" />
  ${hand(111, 189)}`;

// Bascule "objet dépité" : tout le corps penche.
const tilt = (inner) => `<g transform="rotate(-7 100 250)">${inner}</g>`;

export const CANDIDATES = [
  // ============================================================
  // RÔLE A — OTTO, le tacticien (orange)
  // ============================================================
  {
    id: 'otto-coach',
    role: 'OTTO — le tacticien',
    name: 'Otto',
    label: 'le coach redessiné (cap + marqueur, sans cordon)',
    design: 'humanoïde',
    iconFocus: { x: 100, y: 80, r: 58 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const cap = `
        <path d="M 58 66 C 62 40 80 28 102 28 C 124 28 140 44 142 64 C 114 56 86 58 58 66 Z" fill="${INK}" stroke-width="4" />
        <path d="M 136 62 C 152 56 166 56 173 61 C 167 68 150 70 133 69 Z" fill="${INK}" stroke-width="4" />`;
      const marker = (x1, y1, x2, y2) => `
        <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke-width="9" />
        <path d="M ${x2} ${y2} L ${x2 + (x2 - x1) * 0.22} ${y2 + (y2 - y1) * 0.22}" stroke-width="4" />`;
      let arms;
      if (pose === 'celebrating') {
        arms = ARMS_UP + marker(150, 58, 172, 36);
      } else if (pose === 'dejected') {
        // marqueur lâché au sol, jamais entre les jambes (ambiguïté de membre)
        arms = ARMS_SLUMP + `<g transform="rotate(-18 162 244)">${marker(146, 248, 178, 240)}</g>`;
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
      return `${HEAD}${cap}${face({ cx: 101, cy: 87, expr })}${SPINE}${arms}${LEGS}`;
    },
  },
  {
    id: 'otto-marker',
    role: 'OTTO — le tacticien',
    name: 'Otto',
    label: 'le marqueur de tableau blanc',
    design: 'objet',
    iconFocus: { x: 100, y: 116, r: 52 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const body = `
        <rect x="74" y="78" width="52" height="130" rx="16" fill="${PAPER}" />
        <rect x="80" y="36" width="40" height="44" rx="9" fill="${INK}" stroke-width="4" />
        <path d="M 124 44 L 124 70" stroke-width="4" />
        ${face({ cx: 100, cy: 120, expr })}
        <path d="M 88 164 Q 94 157 100 164 T 112 163" stroke-width="3.5" />`;
      const legs = `
        <path d="M 88 208 C 86 222 83 236 80 248" />
        ${foot(80, 248, -1)}
        <path d="M 112 208 C 114 222 117 236 120 248" />
        ${foot(120, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 74 148 C 60 134 48 116 42 98" />
          ${hand(40, 93)}
          <path d="M 126 148 C 140 134 152 116 158 98" />
          ${hand(160, 93)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 74 152 C 68 166 66 178 66 188" />
          ${hand(66, 193)}
          <path d="M 126 152 C 132 166 134 178 134 188" />
          ${hand(134, 193)}`;
      } else if (pose === 'pointing') {
        arms = `
          <path d="M 74 152 C 66 158 62 166 66 172" />
          <path d="M 126 148 C 142 140 156 128 168 114" />
          <path d="M 168 114 L 178 104" />`;
      } else if (pose === 'shocked') {
        arms = `
          <path d="M 74 146 C 64 128 56 108 52 90" />
          ${hand(51, 84, 5.5)}
          <path d="M 126 146 C 136 128 144 108 148 90" />
          ${hand(149, 84, 5.5)}`;
      } else {
        arms = `
          <path d="M 74 150 C 62 156 54 164 50 174" />
          ${hand(48, 178)}
          <path d="M 126 150 C 138 156 146 164 150 174" />
          ${hand(152, 178)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
  {
    id: 'otto-board',
    role: 'OTTO — le tacticien',
    name: 'Otto',
    label: 'le tableau tactique sur chevalet',
    design: 'objet',
    iconFocus: { x: 88, y: 102, r: 54 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const scribble =
        pose === 'dejected'
          ? `<path d="M 124 150 Q 138 156 152 152" stroke-width="3.5" />`
          : `<path d="M 122 150 Q 138 138 152 146" stroke-width="3.5" />
             <path d="M 152 146 L 147 139" stroke-width="3.5" />
             <path d="M 152 146 L 144 148" stroke-width="3.5" />
             <path d="M 126 128 L 133 135 M 133 128 L 126 135" stroke-width="3.5" />`;
      const body = `
        <rect x="36" y="64" width="128" height="104" rx="10" fill="${PAPER}" />
        ${face({ cx: 78, cy: 98, s: 0.9, expr })}
        ${scribble}
        <path d="M 56 168 L 42 248" />
        ${foot(42, 248, -1)}
        <path d="M 144 168 L 158 248" />
        ${foot(158, 248, 1)}
        <path d="M 62 212 L 138 212" stroke-width="4" />`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 36 126 C 24 112 16 96 12 80" />
          ${hand(11, 75)}
          <path d="M 164 126 C 176 112 184 96 188 80" />
          ${hand(189, 75)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 36 132 C 32 146 30 158 30 168" />
          ${hand(30, 173)}
          <path d="M 164 132 C 168 146 170 158 170 168" />
          ${hand(170, 173)}`;
      } else {
        arms = `
          <path d="M 36 130 C 26 138 20 148 18 158" />
          ${hand(17, 162)}
          <path d="M 164 130 C 174 138 180 148 182 158" />
          ${hand(183, 162)}`;
      }
      const all = body + arms;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
  {
    id: 'otto-cone',
    role: 'OTTO — le tacticien',
    name: 'Otto',
    label: 'le cône d’entraînement',
    design: 'objet',
    iconFocus: { x: 100, y: 162, r: 52 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const body = `
        <path d="M 100 108 L 142 224 L 58 224 Z" fill="${PAPER}" />
        <path d="M 100 108 L 109 134 L 91 134 Z" fill="${INK}" stroke-width="4" />
        <rect x="46" y="224" width="108" height="16" rx="8" fill="${PAPER}" />
        ${face({ cx: 100, cy: 170, expr })}
        <path d="M 82 240 L 80 250" />
        ${foot(80, 250, -1)}
        <path d="M 118 240 L 120 250" />
        ${foot(120, 250, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 78 168 C 63 154 53 136 47 118" />
          ${hand(45, 113)}
          <path d="M 122 168 C 137 154 147 136 153 118" />
          ${hand(155, 113)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 78 174 C 71 186 67 196 66 204" />
          ${hand(66, 209)}
          <path d="M 122 174 C 129 186 133 196 134 204" />
          ${hand(134, 209)}`;
      } else {
        arms = `
          <path d="M 78 172 C 65 178 57 186 53 196" />
          ${hand(51, 200)}
          <path d="M 122 172 C 135 178 143 186 147 196" />
          ${hand(149, 200)}`;
      }
      const all = body + arms;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  // ============================================================
  // RÔLE B — NUMA, l'archiviste des nombres (bleu)
  // ============================================================
  {
    id: 'numa-nerd',
    role: 'NUMA — les nombres',
    name: 'Numa',
    label: 'l’analyste à lunettes + calepin',
    design: 'humanoïde',
    iconFocus: { x: 100, y: 82, r: 56 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const hair = `
        <path d="M 78 42 Q 84 28 92 40" stroke-width="5" />
        <path d="M 94 38 Q 100 24 108 38" stroke-width="5" />
        <path d="M 110 40 Q 118 28 124 42" stroke-width="5" />`;
      const glasses = `
        <circle cx="86" cy="87" r="13" stroke-width="4.5" />
        <circle cx="116" cy="86" r="13" stroke-width="4.5" />
        <path d="M 99 86 L 103 85" stroke-width="4" />
        <path d="M 73 86 L 63 83" stroke-width="4" />
        <path d="M 129 85 L 139 81" stroke-width="4" />`;
      const notebook = (x, y, rot) => `
        <g transform="rotate(${rot} ${x + 18} ${y + 23})">
          <rect x="${x}" y="${y}" width="36" height="46" rx="4" fill="${PAPER}" stroke-width="5" />
          <path d="M ${x + 7} ${y + 12} L ${x + 28} ${y + 11}" stroke-width="3" />
          <path d="M ${x + 7} ${y + 22} L ${x + 28} ${y + 21}" stroke-width="3" />
          <path d="M ${x + 7} ${y + 32} L ${x + 24} ${y + 31}" stroke-width="3" />
        </g>`;
      let arms;
      if (pose === 'celebrating') {
        // le calepin touche la main levée (tenu, pas flottant)
        arms = ARMS_UP + notebook(24, 34, -16);
      } else if (pose === 'dejected') {
        arms = ARMS_SLUMP + `
          <rect x="28" y="230" width="46" height="22" rx="4" fill="${PAPER}" stroke-width="5" />
          <path d="M 36 240 L 64 239" stroke-width="3" />`;
      } else if (pose === 'pointing') {
        arms = `
          <path d="M 100 140 C 86 148 80 160 91 168" />
          <path d="M 100 138 C 116 130 134 118 152 104" />
          <path d="M 152 104 L 165 95" />`;
      } else if (pose === 'shocked') {
        // le calepin lui échappe des mains
        arms = `
          <path d="M 100 136 C 84 124 70 110 62 93" />
          ${hand(60, 88, 5.5)}
          <path d="M 100 136 C 118 126 132 112 142 95" />
          ${hand(144, 90, 5.5)}
          ${notebook(20, 48, -28)}`;
      } else {
        arms = `
          <path d="M 100 136 C 90 142 80 148 74 156" />
          ${hand(72, 160)}
          <path d="M 100 136 C 112 144 122 156 128 170" />
          ${hand(130, 174)}
          ${notebook(56, 152, -8)}`;
      }
      return `${HEAD}${hair}${face({ cx: 101, cy: 87, expr, browLift: 9 })}${glasses}${SPINE}${arms}${LEGS}`;
    },
  },
  {
    id: 'numa-watch',
    role: 'NUMA — les nombres',
    name: 'Numa',
    label: 'le chronomètre',
    design: 'objet',
    iconFocus: { x: 100, y: 148, r: 74 },
    parts({ pose = 'neutral', expression } = {}) {
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
    },
  },
  {
    id: 'numa-ball',
    role: 'NUMA — les nombres',
    name: 'Numa',
    label: 'le ballon old-school (les archives)',
    design: 'objet',
    iconFocus: { x: 100, y: 146, r: 72 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const body = `
        <circle cx="100" cy="150" r="60" fill="${PAPER}" />
        <path d="M 100 164 L 115 175 L 109 193 L 91 193 L 85 175 Z" fill="${INK}" stroke-width="4" />
        <path d="M 52 122 Q 64 130 70 142" stroke-width="4" />
        <path d="M 148 122 Q 136 130 130 142" stroke-width="4" />
        ${face({ cx: 100, cy: 128, s: 0.95, expr })}`;
      const legs = `
        <path d="M 84 208 C 82 222 80 236 78 248" />
        ${foot(78, 248, -1)}
        <path d="M 116 208 C 118 222 120 236 122 248" />
        ${foot(122, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 45 150 C 32 136 24 120 20 104" />
          ${hand(19, 99)}
          <path d="M 155 150 C 168 136 176 120 180 104" />
          ${hand(181, 99)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 45 158 C 41 172 40 184 40 192" />
          ${hand(40, 197)}
          <path d="M 155 158 C 159 172 160 184 160 192" />
          ${hand(160, 197)}`;
      } else {
        arms = `
          <path d="M 45 155 C 35 163 29 173 27 183" />
          ${hand(26, 187)}
          <path d="M 155 155 C 165 163 171 173 173 183" />
          ${hand(174, 187)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  {
    id: 'numa-abacus',
    role: 'NUMA — les nombres',
    name: 'Numa',
    label: 'le boulier (il compte TOUT)',
    design: 'objet',
    iconFocus: { x: 100, y: 126, r: 58 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const bead = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${INK}" stroke="none" />`;
      // celebrating : toutes les billes glissent du même côté (le compte est bon)
      const beads =
        pose === 'celebrating'
          ? bead(76, 158) + bead(92, 158) + bead(108, 158) + bead(108, 180) + bead(124, 180)
          : bead(76, 158) + bead(92, 158) + bead(124, 158) + bead(80, 180) + bead(118, 180);
      const body = `
        <rect x="58" y="88" width="84" height="110" rx="12" fill="${PAPER}" />
        ${face({ cx: 100, cy: 120, s: 0.9, expr })}
        <path d="M 62 158 L 138 158" stroke-width="3.5" />
        <path d="M 62 180 L 138 180" stroke-width="3.5" />
        ${beads}`;
      const legs = `
        <path d="M 84 198 C 82 216 80 232 78 248" />
        ${foot(78, 248, -1)}
        <path d="M 116 198 C 118 216 120 232 122 248" />
        ${foot(122, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 58 134 C 46 120 38 104 34 88" />
          ${hand(33, 83)}
          <path d="M 142 134 C 154 120 162 104 166 88" />
          ${hand(167, 83)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 58 146 C 52 160 50 172 50 182" />
          ${hand(50, 187)}
          <path d="M 142 146 C 148 160 150 172 150 182" />
          ${hand(150, 187)}`;
      } else {
        arms = `
          <path d="M 58 144 C 48 152 42 162 40 172" />
          ${hand(39, 176)}
          <path d="M 142 144 C 152 152 158 162 160 172" />
          ${hand(161, 176)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  // ============================================================
  // RÔLE C — VERA, la discipline (rouge)
  // ============================================================
  {
    id: 'vera-ref',
    role: 'VERA — la discipline',
    name: 'Vera',
    label: 'l’arbitre au carnet de cartons',
    design: 'humanoïde',
    iconFocus: { x: 102, y: 80, r: 58 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const hair = `
        <path d="M 62 64 Q 100 44 138 60" stroke-width="5" />
        <circle cx="134" cy="44" r="11" fill="${INK}" stroke="none" />`;
      const pocket = `
        <rect x="70" y="144" width="26" height="24" rx="3" stroke-width="4" />
        <rect x="73" y="130" width="9" height="16" rx="2" fill="${PAPER}" stroke-width="3.5" />
        <rect x="85" y="128" width="9" height="18" rx="2" fill="${INK}" stroke-width="3.5" />`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 100 136 C 90 146 82 158 78 170" />
          ${hand(76, 174)}
          <path d="M 100 136 C 116 118 128 94 132 66" />
          ${hand(133, 60)}
          <g transform="rotate(14 140 50)">
            <rect x="131" y="34" width="17" height="24" rx="2" fill="${INK}" stroke-width="4" />
          </g>`;
      } else if (pose === 'dejected') {
        arms = ARMS_SLUMP;
      } else if (pose === 'pointing') {
        // le geste de l'arbitre qui désigne le point de penalty
        arms = `
          <path d="M 100 140 C 86 148 80 160 91 168" />
          <path d="M 100 138 C 116 132 134 124 152 112" />
          <path d="M 152 112 L 166 103" />`;
      } else if (pose === 'shocked') {
        arms = `
          <path d="M 100 136 C 84 124 70 110 62 93" />
          ${hand(60, 88, 5.5)}
          <path d="M 100 136 C 118 126 132 112 142 95" />
          ${hand(144, 90, 5.5)}`;
      } else {
        arms = ARMS_DOWN;
      }
      return `${HEAD}${hair}${face({ cx: 101, cy: 87, expr })}${SPINE}${pocket}${arms}${LEGS}`;
    },
  },
  {
    id: 'vera-whistle',
    role: 'VERA — la discipline',
    name: 'Vera',
    label: 'le sifflet anthropomorphe',
    design: 'objet',
    iconFocus: { x: 112, y: 150, r: 66 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const peep =
        pose === 'celebrating'
          ? `<path d="M 30 110 L 18 100" stroke-width="4" />
             <path d="M 26 126 L 12 124" stroke-width="4" />
             <path d="M 30 141 L 18 148" stroke-width="4" />`
          : '';
      // sifflet à bille de profil : tube d'embouchure épais qui vise le centre
      // de la chambre + encoche d'air bien marquée sur le dessus.
      const body = `
        <rect x="36" y="116" width="58" height="30" rx="13" fill="${PAPER}" stroke-width="5.5" />
        <circle cx="116" cy="156" r="50" fill="${PAPER}" />
        <path d="M 92 112 L 116 108" stroke-width="6" />
        <path d="M 104 113 L 106 124" stroke-width="5" />
        ${face({ cx: 118, cy: 156, expr })}
        ${peep}`;
      const legs = `
        <path d="M 100 202 C 98 218 96 233 94 248" />
        ${foot(94, 248, -1)}
        <path d="M 132 200 C 134 216 136 232 138 248" />
        ${foot(138, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 70 178 C 56 168 46 154 40 140" />
          ${hand(38, 134)}
          <path d="M 162 168 C 174 158 182 144 186 130" />
          ${hand(187, 124)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 70 184 C 66 196 65 206 65 214" />
          ${hand(65, 219)}
          <path d="M 162 176 C 166 190 167 202 167 210" />
          ${hand(167, 215)}`;
      } else {
        arms = `
          <path d="M 70 182 C 60 190 54 200 52 210" />
          ${hand(51, 214)}
          <path d="M 162 172 C 172 180 178 190 180 200" />
          ${hand(181, 204)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
  {
    id: 'vera-card',
    role: 'VERA — la discipline',
    name: 'Vera',
    label: 'le carton sur pattes (orange calme / rouge fâché)',
    design: 'objet',
    iconFocus: { x: 100, y: 116, r: 60 },
    parts({ pose = 'neutral', expression } = {}) {
      // le carton vire au rouge dès que l'humeur est mauvaise (pose OU expression)
      const expr = expression || (pose === 'dejected' ? 'angry' : DEFAULT_EXPR[pose] || 'neutral');
      const mad = pose === 'dejected' || expr === 'angry';
      const accent = mad ? RED : ORANGE;
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
      } else if (mad) {
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
    },
  },

  {
    id: 'vera-book',
    role: 'VERA — la discipline',
    name: 'Vera',
    label: 'le règlement à marque-page (le dossier)',
    design: 'objet',
    iconFocus: { x: 102, y: 118, r: 60 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      // marque-page : retombe d'un côté, se dresse quand le dossier est chaud
      const ribbon =
        pose === 'celebrating'
          ? `<path d="M 118 84 L 116 56 L 126 64 L 136 52 L 134 84" fill="${PAPER}" stroke-width="4.5" />`
          : `<path d="M 118 84 L 120 62 L 128 68 L 136 60 L 136 84" fill="${PAPER}" stroke-width="4.5" />`;
      const body = `
        <rect x="64" y="84" width="72" height="108" rx="6" fill="${PAPER}" />
        <path d="M 78 84 L 78 192" stroke-width="4" />
        ${ribbon}
        ${face({ cx: 106, cy: 124, s: 0.92, expr })}
        <path d="M 90 164 L 126 163" stroke-width="3" />
        <path d="M 90 174 L 120 173" stroke-width="3" />`;
      const legs = `
        <path d="M 86 192 C 84 212 81 230 78 248" />
        ${foot(78, 248, -1)}
        <path d="M 114 192 C 116 212 119 230 122 248" />
        ${foot(122, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 64 138 C 52 124 44 108 40 92" />
          ${hand(39, 87)}
          <path d="M 136 138 C 148 124 156 108 160 92" />
          ${hand(161, 87)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 64 148 C 58 162 56 174 56 184" />
          ${hand(56, 189)}
          <path d="M 136 148 C 142 162 144 174 144 184" />
          ${hand(144, 189)}`;
      } else {
        arms = `
          <path d="M 64 146 C 54 154 48 164 46 174" />
          ${hand(45, 178)}
          <path d="M 136 146 C 146 154 152 164 154 174" />
          ${hand(155, 178)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
  {
    id: 'vera-lineflag',
    role: 'VERA — la discipline',
    name: 'Vera',
    label: 'le drapeau de touche damier (hors-jeu repéré)',
    design: 'objet',
    iconFocus: { x: 120, y: 90, r: 60 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const checker = `
        <rect x="140" y="58" width="30" height="32" fill="${INK}" stroke="none" />
        <rect x="110" y="90" width="30" height="32" fill="${INK}" stroke="none" />`;
      const flag = `
        <rect x="88" y="58" width="82" height="64" fill="${PAPER}" stroke-width="5.5" />
        ${checker}
        ${face({ cx: 106, cy: 78, s: 0.62, expr })}`;
      const pole = `<path d="M 88 54 L 88 232" stroke-width="9" />`;
      const base = `
        <path d="M 62 234 Q 88 224 114 234" stroke-width="6" />
        <path d="M 74 237 L 72 250" />
        ${foot(72, 250, -1)}
        <path d="M 102 237 L 104 250" />
        ${foot(104, 250, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 88 156 C 72 142 60 124 54 106" />
          ${hand(52, 100)}
          <path d="M 88 156 C 104 144 116 128 122 112" />
          ${hand(124, 106)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 88 160 C 81 172 77 184 76 194" />
          ${hand(76, 199)}
          <path d="M 88 160 C 95 172 99 184 100 194" />
          ${hand(100, 199)}`;
      } else {
        arms = `
          <path d="M 88 156 C 76 162 68 172 64 182" />
          ${hand(62, 186)}
          <path d="M 88 156 C 100 162 108 172 112 182" />
          ${hand(114, 186)}`;
      }
      const all = pole + flag + arms + base;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  // ============================================================
  // RÔLE D — OLA, le supporter (cœur du match)
  // ============================================================
  {
    id: 'ola-fan',
    role: 'OLA — le supporter',
    name: 'Ola',
    label: 'le fan à écharpe + bonnet',
    design: 'humanoïde',
    iconFocus: { x: 100, y: 76, r: 60 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const hat = `
        <path d="M 62 62 C 66 38 84 28 102 28 C 120 28 134 42 138 60 L 62 62 Z" fill="${INK}" stroke-width="4" />
        <path d="M 58 64 Q 100 50 142 62 L 142 74 Q 100 62 58 76 Z" fill="${INK}" stroke-width="4" />
        <circle cx="100" cy="22" r="9" fill="${PAPER}" stroke-width="5" />`;
      const scarfNeck = `
        <path d="M 78 124 Q 100 134 122 124 L 122 138 Q 100 148 78 138 Z" fill="${PAPER}" stroke-width="5" />`;
      const scarfEnd = (yEnd) => `
        <path d="M 84 137 L 78 ${yEnd} L 96 ${yEnd} L 98 140 Z" fill="${PAPER}" stroke-width="5" />
        <path d="M 81 ${yEnd} L 81 ${yEnd + 10}" stroke-width="4" />
        <path d="M 87 ${yEnd} L 87 ${yEnd + 11}" stroke-width="4" />
        <path d="M 93 ${yEnd} L 93 ${yEnd + 10}" stroke-width="4" />`;
      const spine = `<path d="M 100 146 C 99 162 101 180 100 198" />`;
      const legs = `
        <path d="M 100 198 C 96 217 89 235 84 252" />
        ${foot(84, 252, -1)}
        <path d="M 100 198 C 104 217 111 235 116 252" />
        ${foot(116, 252, 1)}`;
      let arms;
      let scarf = scarfNeck;
      if (pose === 'celebrating') {
        // saut de kop : bras au ciel, l'écharpe claque au vent sur le côté
        arms = `
          <path d="M 100 148 C 78 126 56 92 46 58" />
          ${hand(44, 52, 5.5)}
          <path d="M 100 148 C 122 126 144 92 154 58" />
          ${hand(156, 52, 5.5)}
          <path d="M 78 128 L 40 112 L 44 132 L 78 142 Z" fill="${PAPER}" stroke-width="5" />
          <path d="M 42 114 L 34 108" stroke-width="4" />
          <path d="M 44 124 L 35 121" stroke-width="4" />`;
      } else if (pose === 'dejected') {
        scarf += scarfEnd(192);
        arms = `
          <path d="M 100 150 C 92 164 88 178 88 190" />
          ${hand(88, 195)}
          <path d="M 100 150 C 108 164 112 178 112 190" />
          ${hand(112, 195)}`;
      } else {
        // bras le long du corps : le pan d'écharpe reste seul au centre, lisible
        scarf += scarfEnd(178);
        arms = `
          <path d="M 100 150 C 89 157 80 168 74 181" />
          ${hand(72, 185)}
          <path d="M 100 150 C 111 157 120 168 126 181" />
          ${hand(128, 185)}`;
      }
      return `${HEAD}${hat}${face({ cx: 101, cy: 87, expr })}${scarf}${spine}${arms}${legs}`;
    },
  },
  {
    id: 'ola-flag',
    role: 'OLA — le supporter',
    name: 'Ola',
    label: 'le fanion de corner',
    design: 'objet',
    iconFocus: { x: 124, y: 86, r: 60 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const pole = `<path d="M 86 50 L 86 232" stroke-width="10" />`;
      const base = `
        <path d="M 60 234 Q 86 224 112 234" stroke-width="6" />
        <path d="M 72 237 L 70 250" />
        ${foot(70, 250, -1)}
        <path d="M 100 237 L 102 250" />
        ${foot(102, 250, 1)}`;
      let flag;
      if (pose === 'celebrating') {
        flag = `
          <path d="M 86 44 L 184 28 L 86 122 Z" fill="${PAPER}" stroke-width="5.5" />
          ${face({ cx: 116, cy: 64, s: 0.85, expr, rot: -16 })}`;
      } else if (pose === 'dejected') {
        flag = `
          <path d="M 86 62 L 158 142 L 86 138 Z" fill="${PAPER}" stroke-width="5.5" />
          ${face({ cx: 112, cy: 106, s: 0.8, expr, rot: 26 })}`;
      } else {
        flag = `
          <path d="M 86 50 L 186 84 L 86 120 Z" fill="${PAPER}" stroke-width="5.5" />
          ${face({ cx: 118, cy: 85, s: 0.88, expr })}`;
      }
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 86 156 C 70 142 58 124 52 106" />
          ${hand(50, 100)}
          <path d="M 86 156 C 100 144 110 130 114 116" />
          ${hand(115, 110)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 86 160 C 79 172 75 184 74 194" />
          ${hand(74, 199)}
          <path d="M 86 160 C 93 172 97 184 98 194" />
          ${hand(98, 199)}`;
      } else {
        arms = `
          <path d="M 86 156 C 74 162 66 172 62 182" />
          ${hand(60, 186)}
          <path d="M 86 156 C 98 162 106 172 110 182" />
          ${hand(112, 186)}`;
      }
      return pole + flag + arms + base;
    },
  },
  {
    id: 'ola-mega',
    role: 'OLA — le supporter',
    name: 'Ola',
    label: 'le mégaphone de tribune',
    design: 'objet',
    iconFocus: { x: 100, y: 148, r: 66 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const sound =
        pose === 'celebrating'
          ? `<path d="M 162 110 L 176 98" stroke-width="4" />
             <path d="M 168 152 L 186 150" stroke-width="4" />
             <path d="M 164 196 L 178 206" stroke-width="4" />`
          : '';
      // pavillon vers le haut-droite, embout simple en bas-gauche : silhouette
      // de mégaphone brandi, bras symétriques sous le corps.
      const body = `
        <path d="M 56 168 L 148 112 L 148 210 L 56 196 Z" fill="${PAPER}" stroke-width="6" />
        <path d="M 148 112 Q 162 160 148 210" stroke-width="4" />
        <rect x="34" y="160" width="24" height="34" rx="10" fill="${PAPER}" stroke-width="5" />
        ${face({ cx: 104, cy: 166, s: 0.95, expr })}
        ${sound}`;
      const legs = `
        <path d="M 84 200 C 82 218 80 234 78 248" />
        ${foot(78, 248, -1)}
        <path d="M 122 206 C 123 222 124 236 125 248" />
        ${foot(125, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 62 162 C 50 148 42 132 38 116" />
          ${hand(37, 111)}
          <path d="M 142 116 C 148 100 151 84 152 70" />
          ${hand(153, 64)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 62 184 C 56 196 54 206 54 214" />
          ${hand(54, 219)}
          <path d="M 144 196 C 148 208 149 218 149 226" />
          ${hand(149, 231)}`;
      } else {
        arms = `
          <path d="M 62 182 C 52 190 46 200 44 210" />
          ${hand(43, 214)}
          <path d="M 144 192 C 152 200 156 208 158 216" />
          ${hand(159, 220)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  // ============================================================
  // RÔLE E — SCOUT, le dénicheur de pépites
  // ============================================================
  {
    id: 'scout-human',
    role: 'SCOUT — les pépites',
    name: 'Scout',
    label: 'le recruteur au bob + longue-vue',
    design: 'humanoïde',
    iconFocus: { x: 100, y: 78, r: 58 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const hat = `
        <path d="M 66 58 C 70 34 88 26 102 26 C 118 26 132 36 136 54 L 66 58 Z" fill="${INK}" stroke-width="4" />
        <path d="M 52 66 Q 100 50 148 62 L 144 74 Q 100 60 56 78 Z" fill="${INK}" stroke-width="4" />`;
      const spyglass = (x1, y1, x2, y2) => {
        const ex = x2 + (x2 - x1) * 0.5;
        const ey = y2 + (y2 - y1) * 0.5;
        return `
        <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke-width="10" />
        <path d="M ${x2} ${y2} L ${ex} ${ey}" stroke-width="6" />`;
      };
      let arms;
      if (pose === 'celebrating') {
        arms = ARMS_UP + spyglass(154, 52, 174, 33);
      } else if (pose === 'dejected') {
        // longue-vue posée au sol, pas entre les jambes
        arms = ARMS_SLUMP + spyglass(140, 248, 168, 242);
      } else {
        arms = `
          <path d="M 100 136 C 88 144 78 156 72 170" />
          ${hand(70, 174)}
          <path d="M 100 136 C 112 144 122 156 128 168" />
          ${hand(130, 172)}
          ${spyglass(124, 178, 146, 196)}`;
      }
      return `${HEAD}${hat}${face({ cx: 101, cy: 88, expr, browLift: 4 })}${SPINE}${arms}${LEGS}`;
    },
  },
  {
    id: 'scout-lens',
    role: 'SCOUT — les pépites',
    name: 'Scout',
    label: 'la loupe (le détail que personne ne voit)',
    design: 'objet',
    iconFocus: { x: 100, y: 112, r: 56 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const sparkle =
        pose === 'celebrating'
          ? `<path d="M 152 58 L 152 72 M 145 65 L 159 65" stroke-width="4" />
             <path d="M 44 70 L 44 80 M 39 75 L 49 75" stroke-width="3.5" />`
          : '';
      const body = `
        <circle cx="100" cy="112" r="48" fill="${PAPER}" stroke-width="9" />
        <circle cx="100" cy="112" r="38" stroke-width="3" />
        <path d="M 78 92 Q 84 82 94 78" stroke-width="3.5" />
        ${face({ cx: 100, cy: 114, s: 0.95, expr })}
        <path d="M 86 161 L 114 161" stroke-width="7" />
        <path d="M 100 164 L 100 208" stroke-width="14" />
        ${sparkle}`;
      const legs = `
        <path d="M 92 208 C 89 222 86 236 83 248" />
        ${foot(83, 248, -1)}
        <path d="M 108 208 C 111 222 114 236 117 248" />
        ${foot(117, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 56 122 C 42 110 32 94 28 78" />
          ${hand(27, 73)}
          <path d="M 144 122 C 158 110 168 94 172 78" />
          ${hand(173, 73)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 56 128 C 51 142 49 154 49 164" />
          ${hand(49, 169)}
          <path d="M 144 128 C 149 142 151 154 151 164" />
          ${hand(151, 169)}`;
      } else {
        arms = `
          <path d="M 56 128 C 46 138 40 148 38 158" />
          ${hand(37, 162)}
          <path d="M 144 128 C 154 138 160 148 162 158" />
          ${hand(163, 162)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
  {
    id: 'scout-gem',
    role: 'SCOUT — les pépites',
    name: 'Scout',
    label: 'la pépite (le diamant brut)',
    design: 'objet',
    iconFocus: { x: 100, y: 134, r: 62 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const sparkle = (x, y, s) =>
        `<path d="M ${x} ${y - s} L ${x} ${y + s} M ${x - s} ${y} L ${x + s} ${y}" stroke-width="4" />`;
      const sparkles =
        pose === 'celebrating'
          ? sparkle(54, 74, 7) + sparkle(148, 66, 7) + sparkle(100, 64, 5)
          : pose === 'dejected'
            ? ''
            : sparkle(56, 80, 6);
      const body = `
        <path d="M 72 96 L 128 96 L 144 124 L 56 124 Z" fill="${PAPER}" />
        <path d="M 56 124 L 144 124 L 100 186 Z" fill="${PAPER}" />
        <path d="M 72 96 L 84 124 M 128 96 L 116 124" stroke-width="3.5" />
        ${face({ cx: 100, cy: 146, s: 0.85, expr })}
        ${sparkles}`;
      const legs = `
        <path d="M 80 158 C 76 188 72 218 70 248" />
        ${foot(70, 248, -1)}
        <path d="M 120 158 C 124 188 128 218 130 248" />
        ${foot(130, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 58 124 C 46 110 38 94 34 78" />
          ${hand(33, 73)}
          <path d="M 142 124 C 154 110 162 94 166 78" />
          ${hand(167, 73)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 58 128 C 53 142 51 154 51 164" />
          ${hand(51, 169)}
          <path d="M 142 128 C 147 142 149 154 149 164" />
          ${hand(149, 169)}`;
      } else {
        arms = `
          <path d="M 58 128 C 48 136 42 146 40 156" />
          ${hand(39, 160)}
          <path d="M 142 128 C 152 136 158 146 160 156" />
          ${hand(161, 160)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },

  // ============================================================
  // WILDCARD — MITT, le spécialiste des gardiens (rôle bonus)
  // ============================================================
  {
    id: 'mitt-glove',
    role: 'WILDCARD — les gardiens',
    name: 'Mitt',
    label: 'le gant de gardien (rôle bonus éventuel)',
    design: 'objet',
    iconFocus: { x: 100, y: 122, r: 66 },
    parts({ pose = 'neutral', expression } = {}) {
      const expr = pickExpr(pose, expression);
      const fingers = `
        <rect x="66" y="62" width="20" height="40" rx="10" fill="${PAPER}" stroke-width="5" />
        <rect x="90" y="56" width="20" height="46" rx="10" fill="${PAPER}" stroke-width="5" />
        <rect x="114" y="64" width="20" height="38" rx="10" fill="${PAPER}" stroke-width="5" />`;
      const body = `
        ${fingers}
        <g transform="rotate(-28 52 142)">
          <rect x="42" y="120" width="17" height="40" rx="8.5" fill="${PAPER}" stroke-width="5" />
        </g>
        <rect x="62" y="96" width="76" height="86" rx="18" fill="${PAPER}" />
        ${face({ cx: 100, cy: 136, s: 0.95, expr })}
        <rect x="66" y="182" width="68" height="18" rx="6" fill="${PAPER}" stroke-width="5" />
        <path d="M 74 191 L 126 191" stroke-width="3.5" />`;
      const legs = `
        <path d="M 88 200 C 86 217 83 233 80 248" />
        ${foot(80, 248, -1)}
        <path d="M 112 200 C 114 217 117 233 120 248" />
        ${foot(120, 248, 1)}`;
      let arms;
      if (pose === 'celebrating') {
        arms = `
          <path d="M 62 130 C 48 118 38 102 34 86" />
          ${hand(33, 81)}
          <path d="M 138 130 C 152 118 162 102 166 86" />
          ${hand(167, 81)}`;
      } else if (pose === 'dejected') {
        arms = `
          <path d="M 62 142 C 56 156 54 168 54 178" />
          ${hand(54, 183)}
          <path d="M 138 142 C 144 156 146 168 146 178" />
          ${hand(146, 183)}`;
      } else {
        arms = `
          <path d="M 62 140 C 52 148 46 158 44 168" />
          ${hand(43, 172)}
          <path d="M 138 140 C 148 148 154 158 156 168" />
          ${hand(157, 172)}`;
      }
      const all = body + arms + legs;
      return pose === 'dejected' ? tilt(all) : all;
    },
  },
];
