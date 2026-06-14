# Scribble Pitch ✏️⚽

Hand-drawn football match storytelling. Every matchday of the 2026 tournament, one illustrated carousel plus Stories: the moment the game flipped, told whiteboard-style by a cast of three analysts — **Otto** (the coach, tactics), **Numa** (the stopwatch, numbers) and **Vera** (the card, discipline).

- **Stack**: HTML/CSS + [rough.js](https://roughjs.com) templates, screenshotted to 1080×1350 PNG by Playwright. 100% code-generated — no AI images, fully deterministic (seeded).
- **Pipeline**: `npm run fetch` aggregates **football-data.org** (guaranteed scores) + **ESPN** (free, keyless — scorers, minutes, cards) + **Wikipedia** (2nd-source minute cross-check) into `content/<date>/facts.json`, pre-fills a draft `content/<date>/content.json`, and — with `--draft` — has **Claude** write it in the cast's voice (grounded *only* on the collected facts). Then `npm run build -- --date=<date>` renders the carousel + Stories (+ pre-match preview). Everything network-side is **fail-soft**; rendering is fully local & deterministic (seeded).
- **Daily engine** (3 posts/day): `npm run day -- --date=<D>` reads the fixture calendar, classifies the day (match day vs rest day, tournament round) and scaffolds all three daily posts — the **recap** (yesterday), the evening **pre-match preview** (today), and a contextual **3rd post**: a facts-based **quiz** on match days, a **tournament-state** card on rest days, or an AI-drafted **evergreen** from the reserve. Works every day to the final.
- **Funnel**: Instagram [@scribblepitch] → site → newsletter → digital wall chart.

## Quick start

```
npm install
npx playwright install chromium
npm run day -- --date=2026-06-14 --draft   # FOOTBALL_DATA_KEY (+ ANTHROPIC_API_KEY for --draft) in .env
# day scaffolds all 3 posts + prints the day's plan. Review the drafts, verify any [VERIFY]
# tags on 2 sources, then render the dates it lists:
npm run build -- --date=2026-06-13         # recap + Stories + quiz (3rd post)
npm run build -- --date=2026-06-14         # preview
```

`npm run day` is the one morning command: it gathers facts, scaffolds the recap, the preview, and the contextual 3rd post, and tells you exactly what to review and which dates to `build`. (The lower-level `fetch` / `third` / `render` / `stories` / `preview` commands stay available for one-off work.) Output lands in `content/<date>/out/`. See `CLAUDE.md` for the daily routine, `brand/identity.md` for the visual grammar, `content/_schema.md` for the slide contract, and `docs/pipeline.md` for how the data flows (which command hits the network, which are fully local).

## Commands

### `npm run day -- [--date=YYYY-MM-DD] [--draft]`

The **morning orchestrator** (calendar-driven). For a publication day D it: classifies the day from the fixture calendar (match day vs rest day, tournament round), scaffolds the **recap** (J-1) + the **preview** (J) via `fetch`, generates the **3rd post** (`third`), and prints the **day's plan** — what to review and which dates to `build`. It does *not* render (you review the drafts first — the recap needs a human angle). `--draft` runs Claude on the recap + quiz copy. Defaults to today. Fail-soft.

### `npm run fetch -- [--date=YYYY-MM-DD] [--scorers] [--draft] [--preview]`

The morning aggregator. Pulls **scores** from [football-data.org](https://www.football-data.org) (the guaranteed anchor) + **events** (scorers + minute, cards, subs) from ESPN's free, keyless JSON, **cross-checks** the featured match's goal minutes against Wikipedia, and writes `content/<date>/facts.json` (structured ground truth) plus a pre-filled draft `content/<date>/content.json` (turning-points, stat-cards, *Vera's file auto-built from the cards*). Date defaults to yesterday. Needs `FOOTBALL_DATA_KEY` in `.env`.

- **Fail-soft everywhere**: if ESPN, Wikipedia, or Claude is unreachable, you fall back to the deterministic draft / manual brief — the routine never depends on them. ESPN is unofficial → minutes are still cross-checked on a 2nd source; `[VERIFY]` flags mark anything to re-check.
- Self-throttles on football-data rate-limit headers; raw responses cached 10 min in `data/raw/` (gitignored). Editorial day: a US evening kick-off belongs to day D if `utcDate - 8h` falls on D.
- Never overwrites an existing file — writes `*.draft.json` next to it.
- `--draft` (needs `ANTHROPIC_API_KEY`): **Claude** writes the editorial copy in the cast's voice from `facts.json` only — never inventing a scorer, minute, or record — into `content.draft.llm.json` + `caption.draft.txt`. Default model `claude-opus-4-8` (override via `SCRIBBLE_LLM_MODEL`).
- `--preview`: scaffolds the evening pre-match post into `content/<J+1>/preview.json` (the marquee match in 3 slides + a card per other fixture).
- `--scorers`: prints the tournament's aggregated top scorers (free tier).

### `npm run render -- --date=YYYY-MM-DD [--slide=N] [--file=<doc>.json]`

Renders the carousel slides (1080×1350 PNG) for a given matchday. `--file` renders any document in the day's folder (`content.json` default, `preview.json`, `third.json`). `--date` also accepts a non-date folder name (e.g. `evergreen-01` — the backup "Did you know?" posts in `content/evergreen-0*`).

### `npm run stories -- --date=YYYY-MM-DD [--story=N]`

Renders the Stories (1080×1920 PNG) for a given matchday (same folder-name flexibility as `render`).

### `npm run preview -- --date=YYYY-MM-DD`

Renders the pre-match post from `content/<date>/preview.json` → `out/preview-0N.png`. (Shorthand for `render --file=preview.json`; `render` also takes `--file=<doc>.json` to render any document in a day's folder.)

### `npm run build -- --date=YYYY-MM-DD`

Renders everything in a day's folder in one go: carousel (`content.json`) + Stories + preview (`preview.json`) + **3rd post** (`third.json`), whichever are present.

### `npm run third -- --date=YYYY-MM-DD [--draft]`

Generates the **3rd post** and decides its kind automatically: if `content/<date>/facts.json` exists it builds a **quiz** mini-carousel (question → revealed answer → bonus number → cta) drawn **only** from the day's facts (no invented trivia); otherwise it builds a **tournament-state** card from football-data `/standings` + top scorer. Writes `content/<date>/third.json` (never overwrites). `--draft` polishes the copy with Claude — the factual answer stays locked.

### `npm run evergreen -- (--team="X" | --theme="Y" | "free topic")`

The **evergreen factory**: Claude drafts a timeless "Did you know?" post tied to the tournament (teams, records, fun stories) into the next `content/evergreen-0N`. **Every fact is suffixed with `[VERIFY]`** — fact-check on 2 sources and strip the tags before publishing. Needs `ANTHROPIC_API_KEY`.

### `npm run buffer [-- --next | --mark=… | --unmark=… | --verify=… | --unverify=…]`

Manages the evergreen "3rd-slot" reserve (`content/evergreen-*`): inventory, which to post next, mark/unmark posted, and a low-reserve warning (state in `data/buffer-state.json`). A **verification gate** guards AI-drafted evergreens: a post counts as **ready** only when it's rendered **and** `--verify`'d **and** unposted — and `--verify` refuses while any `[VERIFY]` tag remains in its `content.json`. Build new ones with `npm run evergreen`.

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
