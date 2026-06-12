// Slide moment-clé : badge minute + kicker + headline + récit + annotations.
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'orange';

  const annotations = (slide.annotations || [])
    .map((a) => `<div class="annotation note txt c-${a.color || accent}">↳ ${esc(a.text)}</div>`)
    .join('');

  content.innerHTML = `
    <div class="tp">
      <div class="minute-badge txt" id="minute">${esc(slide.minute)}’</div>
      ${slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : ''}
      <h2 class="headline txt">${md(slide.headline)}</h2>
      <div class="body-text txt" id="body" style="top: ${slide.bodyTop || 520}px;">${md(slide.body)}</div>
      ${annotations ? `<div class="annotations" id="annos">${annotations}</div>` : ''}
      ${slide.pose ? `<div class="coach-spot" id="coach" style="right: 80px; bottom: 130px;">${coach({ pose: slide.pose, expression: slide.expression, size: 230, flip: true })}</div>` : ''}
    </div>`;

  kit.circle('#minute', { color: accent, padX: 16, padY: 26 });
  kit.underlineAll(content, accent);
}
