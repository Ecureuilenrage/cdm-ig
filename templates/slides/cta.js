// Slide finale : le personnage signature du jour + la demande complète
// (follow + newsletter) + note "demain". L'accent désigne qui signe.
export function render(slide, ctx) {
  const { kit, coach, esc, md, content, meta } = ctx;
  const accent = slide.accent || 'orange';

  content.innerHTML = `
    <div class="cta">
      <h2 class="headline txt">${md(slide.text)}</h2>
      <div class="coach-spot" id="coach">${coach({ pose: slide.pose || 'pointing', expression: slide.expression, size: 380 })}</div>
      <div class="follow txt" id="follow">Follow ${esc(meta.handle)}</div>
      <div class="newsletter txt c-${accent}">newsletter → link in bio</div>
      ${slide.note ? `<div class="note txt c-${accent}">${esc(slide.note)}</div>` : ''}
    </div>`;

  kit.box('#follow', { pad: 22, color: accent, strokeWidth: 5 });
  kit.underlineAll(content, accent);
}
