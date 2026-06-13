// Slide "preview" (post avant-match, cadence 3 posts/jour — D13). Trois usages selon
// les champs fournis (accent → personnage) :
//   • LEAD   : `hook` présent → accroche 96px + matchup au centre + coach.
//   • FOCUS  : `rewind` (Numa) ou `pick` (Otto) → matchup compact en haut + texte en focus.
//   • CARTE  : juste home/away/kickoff → matchup centré (les « autres matchs du jour »).
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'orange';
  const lead = !!slide.hook;
  const focusText = !lead ? slide.pick || slide.rewind : null;
  const focusLabel = slide.pick ? "Otto's Board" : slide.rewind ? "Numa's Rewind" : '';
  const matchTop = lead ? 600 : focusText ? 300 : 470;

  content.innerHTML = `
    <div class="preview">
      ${slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : ''}
      ${lead ? `<h1 class="hook txt" style="margin-top: 40px; max-width: 920px;">${md(slide.hook)}</h1>` : ''}
      <div class="matchup txt" id="matchup" style="top: ${matchTop}px;">
        <div class="team home"><span class="tname">${esc(slide.home)}</span></div>
        <div class="vs c-${accent}">vs</div>
        <div class="team away"><span class="tname">${esc(slide.away)}</span></div>
      </div>
      ${slide.kickoff ? `<div class="kickoff txt" style="top: ${matchTop + 200}px;">${esc(slide.kickoff)}</div>` : ''}
      ${focusText ? `<div class="pre-focus txt c-${accent}" style="top: ${matchTop + 330}px;"><span class="lbl">${esc(focusLabel)}</span>${md(focusText)}</div>` : ''}
      ${slide.pose !== 'none' ? `<div class="coach-spot" id="coach" style="right: 88px; bottom: 110px;">${coach({ pose: slide.pose || 'pointing', expression: slide.expression, size: 290, flip: true })}</div>` : ''}
    </div>`;

  kit.box('#matchup', { pad: 26, strokeWidth: 5, color: accent });
  kit.underlineAll(content, accent);
}
