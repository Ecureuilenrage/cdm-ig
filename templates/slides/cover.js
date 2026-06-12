// Slide de couverture : kicker + hook + scoreboard + coach + note manuscrite.
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'orange';
  const s = slide.score;

  content.innerHTML = `
    <div class="cover">
      ${slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : ''}
      <h1 class="hook txt">${md(slide.hook)}</h1>
      <div class="scoreboard txt" id="board" style="top: 600px;">
        <div class="team home"><span class="tname">${esc(s.home)}</span></div>
        <div class="tscore">${s.homeGoals}</div>
        <div class="dash c-${accent}">–</div>
        <div class="tscore">${s.awayGoals}</div>
        <div class="team away"><span class="tname">${esc(s.away)}</span></div>
      </div>
      ${slide.note ? `<div class="cover-note note txt c-${accent}" id="note" style="left: 90px; top: 920px;">${esc(slide.note)}</div>` : ''}
      <div class="coach-spot" id="coach" style="right: 95px; bottom: 115px;">
        ${coach({ pose: slide.pose || 'shocked', expression: slide.expression, size: 330, flip: true })}
      </div>
    </div>`;

  kit.box('#board', { pad: 26, strokeWidth: 5 });
  kit.underlineAll(content, accent);

  if (slide.note) {
    // flèche de la note vers le coach
    const n = kit.rectOf('#note');
    const c = kit.rectOf('#coach');
    kit.arrow(n.x + n.w + 24, n.y + n.h - 6, c.x - 18, c.y + c.h * 0.42, {
      color: accent,
      bend: 0.3,
    });
  }
}
