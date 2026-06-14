// Slide quiz (3e post les jours de match) : kicker + question + options A/B/C.
// Le carrousel quiz est : cette slide (question) → stat-card (réponse révélée) → cta.
// L'accent désigne le personnage qui anime (défaut Numa, bleu).
export function render(slide, ctx) {
  const { kit, coach, esc, md, content } = ctx;
  const accent = slide.accent || 'blue';
  const letters = ['A', 'B', 'C', 'D'];

  const options = (slide.options || [])
    .map((o, i) => `<div class="opt txt"><span class="opt-key c-${accent}">${letters[i]}</span><span class="opt-text">${md(String(o))}</span></div>`)
    .join('');

  content.innerHTML = `
    <div class="quiz">
      ${slide.kicker ? `<div class="kicker txt c-${accent}">${esc(slide.kicker)}</div>` : ''}
      <h2 class="headline txt quiz-q">${md(slide.question)}</h2>
      ${options ? `<div class="options" id="options">${options}</div>` : ''}
      ${slide.prompt ? `<div class="quiz-prompt note txt c-${accent}">${esc(slide.prompt)}</div>` : ''}
      ${slide.pose ? `<div class="coach-spot" id="coach" style="right: 80px; bottom: 130px;">${coach({ pose: slide.pose, expression: slide.expression, size: 230, flip: true })}</div>` : ''}
    </div>`;

  kit.underlineAll(content, accent);
}
