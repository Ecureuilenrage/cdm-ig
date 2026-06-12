// Primitives de dessin hand-drawn (rough.js) + helpers texte.
// Toutes les formes utilisent un seed déterministe dérivé de (date, slide) :
// re-rendre une slide produit exactement les mêmes traits.

import rough from './rough.esm.js';

export const COLORS = {
  ink: '#1A1A1A',
  paper: '#FDFDFB',
  red: '#E5484D',
  orange: '#F76B15',
  blue: '#2563EB',
  yellow: '#EAB308', // couleur de personnage (carton de Vera), pas d'accent de slide
};

export function hashSeed(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return (h % 2147483646) + 1;
}

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// *mot* -> <span data-u>mot</span> (souligné rough par underlineAll)
export function md(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<span data-u>$1</span>');
}

export function createKit({ svgUnder, svgOver, slideEl, seed }) {
  const under = rough.svg(svgUnder);
  const over = rough.svg(svgOver);
  let n = 0;
  const nextSeed = () => ((seed + n++ * 7919) % 2147483646) + 1;

  const resolve = (c) => COLORS[c] || c || COLORS.ink;

  function rectOf(target) {
    const el = typeof target === 'string' ? slideEl.querySelector(target) : target;
    const r = el.getBoundingClientRect();
    const s = slideEl.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  const base = (color, opts = {}) => ({
    stroke: resolve(color),
    strokeWidth: 4.5,
    roughness: 1.6,
    bowing: 1.3,
    seed: nextSeed(),
    ...opts,
  });

  // Boîte rough autour d'un élément (dessinée SOUS le texte)
  function box(target, { color = 'ink', pad = 20, strokeWidth = 4.5, fill = null } = {}) {
    const r = rectOf(target);
    const opts = base(color, { strokeWidth });
    if (fill) {
      opts.fill = resolve(fill);
      opts.fillStyle = 'hachure';
      opts.fillWeight = 1.4;
      opts.hachureGap = 16;
    }
    svgUnder.appendChild(
      under.rectangle(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, opts)
    );
    return r;
  }

  // Ellipse rough autour d'un élément (dessinée SOUS le texte)
  function circle(target, { color = 'ink', padX = 50, padY = 34, strokeWidth = 5 } = {}) {
    const r = rectOf(target);
    svgUnder.appendChild(
      under.ellipse(
        r.x + r.w / 2,
        r.y + r.h / 2,
        r.w + padX * 2,
        r.h + padY * 2,
        base(color, { strokeWidth, roughness: 1.9 })
      )
    );
    return r;
  }

  // Soulignement gribouillé sous un élément
  function underline(target, { color = 'orange', offset = 6, strokeWidth = 5 } = {}) {
    const r = rectOf(target);
    const y = r.y + r.h + offset;
    svgOver.appendChild(
      over.line(r.x - 4, y, r.x + r.w + 8, y + 3, base(color, { strokeWidth, roughness: 2.2 }))
    );
  }

  // Souligne tous les <span data-u> d'un conteneur avec la couleur d'accent
  function underlineAll(container, color = 'orange') {
    for (const el of container.querySelectorAll('[data-u]')) underline(el, { color });
  }

  // Flèche courbe de (x1,y1) vers (x2,y2). bend > 0 courbe à gauche du sens de la flèche.
  function arrow(x1, y1, x2, y2, { color = 'ink', bend = 0.22, strokeWidth = 4.5 } = {}) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * len * bend;
    const cy = my + (dx / len) * len * bend;
    const opts = base(color, { strokeWidth, roughness: 1.4 });
    svgOver.appendChild(over.path(`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, opts));
    // pointe : orientée selon la tangente au point d'arrivée (ctrl -> end)
    const ang = Math.atan2(y2 - cy, x2 - cx);
    const hl = 20;
    for (const da of [Math.PI * 0.82, -Math.PI * 0.82]) {
      const hx = x2 + hl * Math.cos(ang + da);
      const hy = y2 + hl * Math.sin(ang + da);
      svgOver.appendChild(over.line(x2, y2, hx, hy, base(color, { strokeWidth, roughness: 1 })));
    }
  }

  function line(x1, y1, x2, y2, { color = 'ink', strokeWidth = 4 } = {}) {
    svgOver.appendChild(over.line(x1, y1, x2, y2, base(color, { strokeWidth })));
  }

  return { box, circle, underline, underlineAll, arrow, line, rectOf, colors: COLORS };
}
