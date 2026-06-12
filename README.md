# Scribble Pitch ✏️⚽

Hand-drawn football match storytelling. Every matchday of the 2026 tournament, one illustrated carousel plus Stories: the moment the game flipped, told whiteboard-style by a cast of three analysts — **Otto** (the coach, tactics), **Numa** (the stopwatch, numbers) and **Vera** (the card, discipline).

- **Stack**: HTML/CSS + [rough.js](https://roughjs.com) templates, screenshotted to 1080×1350 PNG by Playwright. 100% code-generated — no AI images, fully deterministic (seeded).
- **Pipeline**: `npm run fetch` (scores + fixtures from football-data.org) + web recaps → `content/<date>/content.json` (written daily with Claude Code) → `npm run render -- --date=<date>` (carousel 1080×1350) + `npm run stories -- --date=<date>` (Stories 1080×1920) → PNGs ready to post + caption.
- **Funnel**: Instagram [@scribblepitch] → site → newsletter → digital wall chart.

## Quick start

```
npm install
npx playwright install chromium
npm run fetch -- --date=2026-06-11   # needs FOOTBALL_DATA_KEY in .env
npm run render -- --date=2026-06-11
npm run stories -- --date=2026-06-11
```

Output lands in `content/<date>/out/`. See `CLAUDE.md` for the daily routine, `brand/identity.md` for the visual grammar, `content/_schema.md` for the slide contract.

## Commands

### `npm run fetch -- [--date=YYYY-MM-DD] [--scorers]`

Morning briefing + pre-filled draft `content/<date>/content.json` from [football-data.org](https://www.football-data.org) (free tier: scores, fixtures, standings — no per-match scorers/cards, hence the web research step). Date defaults to yesterday. Needs `FOOTBALL_DATA_KEY` in `.env` at the project root.

- Self-throttles by reading the API's rate-limit response headers; raw responses are cached 10 min in `data/raw/` (gitignored).
- Never overwrites an existing `content.json` — writes `content.draft.json` next to it instead.
- Evening kick-offs in the US spill into the next UTC day: a match belongs to day D if `utcDate - 8h` falls on D.
- `--scorers` also prints the tournament's aggregated top scorers (works on the free tier).

### `npm run render -- --date=YYYY-MM-DD [--slide=N]`

Renders the carousel slides (1080×1350 PNG) for a given matchday. `--date` also accepts a non-date folder name (e.g. `evergreen-01` — the backup "Did you know?" posts in `content/evergreen-0*`).

### `npm run stories -- --date=YYYY-MM-DD [--story=N]`

Renders the Stories (1080×1920 PNG) for a given matchday (same folder-name flexibility as `render`).

### `npm run shoot -- --path=/page.html --out=file.png [options]`

Generic PNG capture of any project page via Playwright (headless Chromium). Spins up a local static server, waits for `window.__shotReady` or `window.__renderDone`, then screenshots.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `--path` | ✓ | — | Page to capture (relative to project root, starts with `/`) |
| `--out` | ✓ | — | Output PNG path (relative to project root) |
| `--width` | — | `1500` | Viewport width in pixels |
| `--height` | — | `900` | Viewport height in pixels |
| `--selector` | — | — | CSS selector: captures only that element's bounding box |
| `--clip` | — | — | Flag: crop to the viewport rectangle instead of full page |

**Capture modes** (in order of precedence):
- `--selector=#id` → element bounding box only
- `--clip` → viewport rectangle (`width × height`)
- *(neither)* → full page height (`fullPage: true`)

```powershell
# Cast board
npm run shoot -- --path=/brand/character/casting/board.html --out=brand/character/casting/out/board.png

# Slide preview at carousel dimensions
npm run shoot -- --path=/templates/slide.html --out=tmp/preview.png --width=1080 --height=1350

# Single component
npm run shoot -- --path=/templates/slide.html --out=tmp/footer.png --selector=#footer
```

> Always put `--` between `npm run shoot` and the arguments (npm/PowerShell requirement).

*Not affiliated with FIFA or any federation.*
