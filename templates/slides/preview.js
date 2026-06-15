// Slide "preview" (post avant-match, cadence 3 posts/jour — D13). Format TIERED :
//   • OVERVIEW      : `matches[]` → liste de TOUS les matchs du jour (slide de tête, Otto).
//   • OTTO'S BOARD  : `outcome` (1/X/2) → matchup + prono entouré + `pick`.
//                       - gros match : + `battle` (key battle, flèche dessinée), Otto en grand.
//                       - carte compacte : + `h2h` (note Numa), petit Otto.
//   • NUMA'S REWIND : `h2h`/`number`/`rewind` sans `outcome` → matchup + chiffre + head-to-head, Numa.
//   • VERA'S FILE   : `discipline` → matchup + note discipline, Vera (matchs chauds, situationnel).
//   • LEAD / FOCUS / CARTE (compat ancien format).
// Le personnage est déduit de l'accent (orange→Otto, blue→Numa, red→Vera).
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'orange';

  const kicker = slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : '';
  const matchup = (top) => `
    <div class="matchup txt" id="matchup" style="top: ${top}px;">
      <div class="team home"><span class="tname">${esc(slide.home)}</span></div>
      <div class="vs c-${accent}">vs</div>
      <div class="team away"><span class="tname">${esc(slide.away)}</span></div>
    </div>`;
  const kickoff = (top) =>
    slide.kickoff ? `<div class="kickoff txt" style="top: ${top}px;">${esc(slide.kickoff)}</div>` : '';
  const coachSpot = ({ style, pose, size }) =>
    slide.pose === 'none'
      ? ''
      : `<div class="coach-spot" id="coach" style="${style}">${coach({ pose: slide.pose || pose, expression: slide.expression, size, flip: true })}</div>`;

  // ---- OVERVIEW : tous les matchs du jour ----
  if (Array.isArray(slide.matches)) {
    const hasHook = !!slide.hook;
    const listTop = hasHook ? 470 : 360;
    const rows = slide.matches
      .map(
        (m) => `
        <div class="fix-row">
          <div class="fix-teams">${esc(m.home)} <span class="vs c-${accent}">v</span> ${esc(m.away)}</div>
          ${m.kickoff ? `<div class="fix-ko">${esc(m.kickoff)}</div>` : ''}
        </div>`
      )
      .join('');
    content.innerHTML = `
      <div class="preview">
        ${kicker}
        ${hasHook ? `<h1 class="hook txt" style="margin-top: 40px; max-width: 920px;">${md(slide.hook)}</h1>` : ''}
        <div class="fixtures txt" id="fixtures" style="top: ${listTop}px;">${rows}</div>
        ${coachSpot({ style: 'right: 64px; bottom: 80px;', pose: 'pointing', size: 190 })}
      </div>`;
    kit.box('#fixtures', { pad: 40, strokeWidth: 5, color: accent });
    kit.underlineAll(content, accent);
    return;
  }

  // ---- OTTO'S BOARD : 1/X/2 (choix entouré) + le call d'Otto ----
  if (slide.outcome) {
    const outcome = String(slide.outcome).toUpperCase().replace('N', 'X');
    const labels = { '1': slide.home, X: 'Draw', '2': slide.away };
    const cells = ['1', 'X', '2']
      .map((k) => {
        const picked = k === outcome;
        return `
        <div class="odd-cell${picked ? ' picked' : ''}"${picked ? ' id="pick"' : ''}>
          <div class="odd-key${picked ? ` c-${accent}` : ''}">${k}</div>
          <div class="odd-lbl">${esc(labels[k] || '')}</div>
        </div>`;
      })
      .join('');
    const big = !!slide.battle;
    content.innerHTML = `
      <div class="preview">
        ${kicker}
        ${matchup(big ? 190 : 200)}
        ${kickoff(big ? 415 : 430)}
        <div class="odds txt" id="odds" style="top: ${big ? 500 : 520}px;">${cells}</div>
        ${slide.pick ? `<div class="pick-line txt" style="top: ${big ? 760 : 790}px; max-width: ${big ? 900 : 720}px;">${md(slide.pick)}</div>` : ''}
        ${big && slide.battle ? `<div class="read txt" id="read" style="top: 960px; max-width: 660px;"><span class="lbl">The game turns on</span><div class="battle"><span class="b-a" id="b-a">${esc(slide.battle.a)}</span><span class="b-gap"></span><span class="b-b" id="b-b">${esc(slide.battle.b)}</span></div></div>` : ''}
        ${!big && slide.h2h ? `<div class="h2h txt" style="top: 1080px; max-width: 720px;"><span class="lbl c-blue">Numa's note</span> ${md(slide.h2h)}</div>` : ''}
        ${coachSpot({ style: `right: 60px; bottom: ${big ? 96 : 80}px;`, pose: 'pointing', size: big ? 200 : 165 })}
      </div>`;
    kit.box('#matchup', { pad: 24, strokeWidth: 5, color: accent });
    if (content.querySelector('#pick')) kit.circle('#pick', { color: accent, padX: 30, padY: 16, strokeWidth: 6 });
    if (big && content.querySelector('#b-a') && content.querySelector('#b-b')) {
      const ra = kit.rectOf('#b-a');
      const rb = kit.rectOf('#b-b');
      kit.arrow(ra.x + ra.w + 8, ra.y + ra.h / 2, rb.x - 8, rb.y + rb.h / 2, { color: accent, strokeWidth: 5, bend: 0.12 });
    }
    kit.underlineAll(content, accent);
    return;
  }

  // ---- NUMA'S REWIND : un chiffre + le head-to-head (accent blue → Numa) ----
  if (slide.h2h || slide.number || slide.rewind) {
    const story = slide.h2h || slide.rewind;
    content.innerHTML = `
      <div class="preview">
        ${kicker}
        ${matchup(190)}
        ${kickoff(415)}
        ${slide.number ? `<div class="num txt" style="top: 480px;"><div class="val c-${accent}">${esc(slide.number.value)}</div><div class="unit">${esc(slide.number.unit || '')}</div></div>` : ''}
        ${story ? `<div class="rewind txt" style="top: ${slide.number ? 770 : 520}px; max-width: 700px;"><span class="lbl c-${accent}">Head to head</span>${md(story)}</div>` : ''}
        ${coachSpot({ style: 'right: 60px; bottom: 96px;', pose: 'celebrating', size: 195 })}
      </div>`;
    kit.box('#matchup', { pad: 24, strokeWidth: 5, color: accent });
    kit.underlineAll(content, accent);
    return;
  }

  // ---- VERA'S FILE : note discipline (accent red → Vera, matchs chauds) ----
  if (slide.discipline) {
    content.innerHTML = `
      <div class="preview">
        ${kicker}
        ${matchup(190)}
        ${kickoff(415)}
        <div class="rewind txt" style="top: 520px; max-width: 700px;"><span class="lbl c-${accent}">Discipline</span>${md(slide.discipline)}</div>
        ${coachSpot({ style: 'right: 60px; bottom: 96px;', pose: 'pointing', size: 195 })}
      </div>`;
    kit.box('#matchup', { pad: 24, strokeWidth: 5, color: accent });
    kit.underlineAll(content, accent);
    return;
  }

  // ---- compat : LEAD / FOCUS / CARTE (ancien format avant le 15/06) ----
  const lead = !!slide.hook;
  const focusText = !lead ? slide.pick : null;
  const matchTop = lead ? 600 : focusText ? 300 : 470;

  content.innerHTML = `
    <div class="preview">
      ${kicker}
      ${lead ? `<h1 class="hook txt" style="margin-top: 40px; max-width: 920px;">${md(slide.hook)}</h1>` : ''}
      ${matchup(matchTop)}
      ${kickoff(matchTop + 200)}
      ${focusText ? `<div class="pre-focus txt c-${accent}" style="top: ${matchTop + 330}px;"><span class="lbl">Otto's Board</span>${md(focusText)}</div>` : ''}
      ${coachSpot({ style: 'right: 88px; bottom: 110px;', pose: 'pointing', size: 290 })}
    </div>`;

  kit.box('#matchup', { pad: 26, strokeWidth: 5, color: accent });
  kit.underlineAll(content, accent);
}
