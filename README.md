# Scribble Pitch ✏️⚽

Hand-drawn football match storytelling. Every matchday of the 2026 tournament, one illustrated carousel: the moment the game flipped, told whiteboard-style by a small coach with a flat cap and a whistle.

- **Stack**: HTML/CSS + [rough.js](https://roughjs.com) templates, screenshotted to 1080×1350 PNG by Playwright. 100% code-generated — no AI images, fully deterministic (seeded).
- **Pipeline**: match data + web recaps → `content/<date>/content.json` (written daily with Claude Code) → `npm run render -- --date=<date>` → PNGs ready to post + caption.
- **Funnel**: Instagram [@scribblepitch] → site → newsletter → digital wall chart.

## Quick start

```
npm install
npx playwright install chromium
npm run render -- --date=2026-06-11
```

Output lands in `content/<date>/out/`. See `CLAUDE.md` for the daily routine, `brand/identity.md` for the visual grammar, `content/_schema.md` for the slide contract.

*Not affiliated with FIFA or any federation.*
