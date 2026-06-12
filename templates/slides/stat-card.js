// Slide stat : une valeur géante encerclée + unité + contexte.
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'blue';

  const v = String(slide.value);
  const size = v.length <= 2 ? 330 : v.length <= 4 ? 230 : v.length <= 6 ? 170 : 130;

  content.innerHTML = `
    <div class="stat">
      ${slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : ''}
      <div class="big-wrap" style="top: 330px;">
        <div class="big txt" id="big" style="font-size: ${size}px;">${esc(v)}</div>
        <div class="unit txt c-${accent}">${esc(slide.unit)}</div>
      </div>
      <div class="context txt${slide.pose ? ' has-coach' : ''}">${md(slide.context)}</div>
      ${slide.pose ? `<div class="coach-spot" id="coach" style="position:absolute; left: 80px; bottom: 130px;">${ctx.coach({ pose: slide.pose, expression: slide.expression, size: 210 })}</div>` : ''}
    </div>`;

  kit.circle('#big', { color: accent, padX: 60, padY: 10, strokeWidth: 6 });
  kit.underlineAll(content, accent);
}
