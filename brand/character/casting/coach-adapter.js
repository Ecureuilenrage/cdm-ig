// Adaptateur de test : expose coach() compatible avec templates/lib/engine.js
// mais rend un candidat du casting. Le candidat est choisi via les paramètres
// d'URL de la PAGE (?team=A|B|C&member=otto|numa|vera).
// Usage : render.html?date=...&slide=N&char=/brand/character/casting/coach-adapter.js&team=B&member=otto

import { CANDIDATES } from './candidates.js';
import { wrap } from './rig.js';

export const TEAMS = {
  A: { label: 'Touchline (tout humanoïde)', otto: 'otto-coach', numa: 'numa-nerd', vera: 'vera-ref' },
  B: { label: 'Kit Bag (tout objet)', otto: 'otto-marker', numa: 'numa-watch', vera: 'vera-card' },
  C: { label: 'Mixte (coach + chrono + carton)', otto: 'otto-coach', numa: 'numa-watch', vera: 'vera-card' },
  D: { label: 'Mixte alt (coach + boulier + drapeau)', otto: 'otto-coach', numa: 'numa-abacus', vera: 'vera-lineflag' },
};

const params = new URLSearchParams(location.search);
const team = TEAMS[params.get('team') || 'A'] || TEAMS.A;
const member = params.get('member') || 'otto';
const candidate = CANDIDATES.find((c) => c.id === team[member]) || CANDIDATES[0];

export function coach({ pose = 'neutral', expression, size = 280, flip = false } = {}) {
  return wrap(candidate.parts({ pose, expression }), { size, flip });
}

export const POSES = ['neutral', 'pointing', 'shocked', 'celebrating', 'dejected'];
