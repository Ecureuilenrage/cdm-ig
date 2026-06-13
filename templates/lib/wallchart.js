// Moteur du Wall Chart — page "groupes" (A2 paysage, 2245×1587).
// ?fill=blank|filled : blank = cases vides (imprimable), filled = écrit les
// valeurs non-nulles de bracket.json. Pose window.__renderDone pour Playwright.

import { createKit, hashSeed, esc } from './slide-kit.js';
import { analyst } from '/brand/character/poses.js';

const W = 2245, H = 1587;
window.__overflowWarnings = [];

try {
  const params = new URLSearchParams(location.search);
  const fill = params.get('fill') || 'blank';
  const data = await (await fetch('/data/wallchart/bracket.json')).json();

  await Promise.all([
    document.fonts.load('800 80px "Shantell Sans"'),
    document.fonts.load('700 50px "Shantell Sans"'),
    document.fonts.load('400 31px "Patrick Hand"'),
    document.fonts.load('700 42px "Caveat"'),
  ]);
  await document.fonts.ready;

  const flagHTML = (cols) =>
    `<i class="flag">${(cols || []).map((c) => `<b style="background:${c}"></b>`).join('')}</i>`;
  const cell = (v) => `<span>${fill === 'filled' && v != null ? esc(String(v)) : ''}</span>`;

  const groupHTML = (g) => `
    <div class="group" id="g-${g.id}">
      <div class="g-head"><span class="g-letter">${g.id}</span><span class="g-title">Group ${g.id}</span></div>
      <div class="g-table">
        <div class="g-row colhead"><span class="c-team">Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>Pts</span></div>
        ${g.teams
          .map(
            (t) => `
          <div class="g-row">
            <span class="c-team">${flagHTML(t.flag)}<span class="nm txt">${esc(t.name)}</span></span>
            ${cell(t.played)}${cell(t.w)}${cell(t.d)}${cell(t.l)}${cell(t.pts)}
          </div>`
          )
          .join('')}
      </div>
    </div>`;

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="chart" id="chart">
      <svg class="under" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>
      <div class="wc">
        <div class="wc-head">
          <div class="wc-title txt">${esc(data.title)}</div>
          <div class="wc-sub txt">${esc(data.subtitle)}</div>
        </div>
        <div class="wc-otto">${analyst({ character: 'otto', pose: 'pointing', size: 250 })}</div>
        <div class="wc-numa">${analyst({ character: 'numa', pose: 'neutral', size: 150 })}</div>
        <div class="groups">${data.groups.map(groupHTML).join('')}</div>
        <div class="thirds">
          <span class="lbl">Best 3rd-placed — ${data.thirds.qualify} qualify:</span>
          <div class="cells">${data.groups.map((g) => `<div class="cell">${g.id}</div>`).join('')}</div>
        </div>
        <div class="wc-disclaimer">Not affiliated with FIFA or any federation. Team names &amp; flags shown for identification only.</div>
        <div class="wc-handle">@scribblepitch</div>
      </div>
      <svg class="over" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>
    </div>`;

  const chart = document.getElementById('chart');
  const kit = createKit({
    svgUnder: chart.querySelector('svg.under'),
    svgOver: chart.querySelector('svg.over'),
    slideEl: chart,
    seed: hashSeed('wallchart#groups#' + fill),
  });

  // cadre rough autour de chaque groupe
  for (const g of data.groups) kit.box(`#g-${g.id}`, { pad: 14, strokeWidth: 3.5 });
  // soulignement du titre (accent orange = Otto présente)
  const t = kit.rectOf('.wc-title');
  kit.line(t.x - 4, t.y + t.h + 10, t.x + t.w + 8, t.y + t.h + 14, { color: 'orange', strokeWidth: 6 });
  // encadré bleu (Numa = les nombres) autour des cases "best thirds"
  kit.box('.thirds .cells', { pad: 10, strokeWidth: 3, color: 'blue' });

  // contrôle d'overflow sur les libellés
  const sRect = chart.getBoundingClientRect();
  for (const el of chart.querySelectorAll('.txt')) {
    const r = el.getBoundingClientRect();
    if (r.right > sRect.right + 4 || r.bottom > sRect.bottom + 4) {
      window.__overflowWarnings.push(`"${(el.textContent || '').slice(0, 30)}…" déborde`);
    }
  }
} catch (err) {
  window.__renderError = String(err && err.stack ? err.stack : err);
}
window.__renderDone = true;
