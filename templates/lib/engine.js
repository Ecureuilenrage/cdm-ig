// Moteur de rendu : ?date=YYYY-MM-DD&slide=N (1-based) -> rend la slide N
// dans un .slide 1080x1350, puis pose window.__renderDone pour Playwright.

import { createKit, hashSeed, esc, md, COLORS } from './slide-kit.js';

const W = 1080;
const H = 1350;
const HANDLE = '@scribblepitch';

window.__overflowWarnings = [];

try {
  const params = new URLSearchParams(location.search);
  const date = params.get('date');
  const idx = parseInt(params.get('slide') || '1', 10);
  // ?char=/chemin/vers/module.js permet de tester un autre cast sans toucher
  // au pipeline ; défaut = le cast officiel (poses.js).
  const charModule = await import(params.get('char') || '/brand/character/poses.js');

  const doc = await (await fetch(`/content/${date}/content.json`)).json();
  const slide = doc.slides[idx - 1];
  if (!slide) throw new Error(`slide ${idx} absente (${doc.slides.length} slides)`);

  await Promise.all([
    document.fonts.load('800 96px "Shantell Sans"'),
    document.fonts.load('700 76px "Shantell Sans"'),
    document.fonts.load('400 44px "Shantell Sans"'),
    document.fonts.load('400 44px "Patrick Hand"'),
    document.fonts.load('400 42px "Caveat"'),
    document.fonts.load('700 46px "Caveat"'),
  ]);
  await document.fonts.ready;

  // Micro-CTA (spec 12/06) : UNE micro-demande par slide, en rotation sur le
  // carrousel — sauf la slide CTA finale, dont le corps porte la demande
  // complète (follow + newsletter) : son footer reste handle + pagination.
  const MICRO_ASKS = [
    'follow for the next one',
    'save this for later',
    'share it with a fan',
    'newsletter → link in bio',
  ];
  const microAsk = slide.type === 'cta' ? '' : MICRO_ASKS[(idx - 1) % MICRO_ASKS.length];

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="slide" id="slide">
      <svg class="under" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>
      <div class="content" id="content"></div>
      <svg class="over" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>
      <div class="footer">
        <span>${HANDLE}</span>
        ${microAsk ? `<span class="micro-ask">${esc(microAsk)}</span>` : ''}
        <span>${idx} / ${doc.slides.length}</span>
      </div>
    </div>`;

  const slideEl = document.getElementById('slide');
  const kit = createKit({
    svgUnder: slideEl.querySelector('svg.under'),
    svgOver: slideEl.querySelector('svg.over'),
    slideEl,
    seed: hashSeed(`${date}#${idx}`),
  });

  // L'accent de la slide désigne le personnage (règle éditoriale) ;
  // slide.character et slide.mood (Vera) permettent de forcer.
  const ACCENT_CHARACTER = { orange: 'otto', blue: 'numa', red: 'vera' };
  const coach = charModule.analyst
    ? (opts = {}) =>
        charModule.analyst({
          character: slide.character || ACCENT_CHARACTER[slide.accent] || 'otto',
          mood: slide.mood,
          ...opts,
        })
    : charModule.coach;

  const ctx = {
    kit,
    coach,
    esc,
    md,
    colors: COLORS,
    content: document.getElementById('content'),
    slideEl,
    meta: { date, title: doc.title, index: idx, count: doc.slides.length, handle: HANDLE },
  };

  const mod = await import(`/templates/slides/${slide.type}.js`);
  mod.render(slide, ctx);

  // Contrôle d'overflow : tout élément texte marqué .txt doit tenir dans le cadre
  const sRect = slideEl.getBoundingClientRect();
  for (const el of slideEl.querySelectorAll('.txt')) {
    const r = el.getBoundingClientRect();
    const tol = 4;
    if (
      r.left < sRect.left - tol ||
      r.top < sRect.top - tol ||
      r.right > sRect.right + tol ||
      r.bottom > sRect.bottom + tol
    ) {
      window.__overflowWarnings.push(
        `slide ${idx}: "${(el.textContent || '').slice(0, 40)}…" déborde du cadre`
      );
    }
  }
} catch (err) {
  window.__renderError = String(err && err.stack ? err.stack : err);
}

window.__renderDone = true;
