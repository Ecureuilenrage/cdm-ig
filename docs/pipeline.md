# Pipelines & flux de données

> Comment circulent les données dans Scribble Pitch — et quelle commande consomme (ou non) le quota de l'API.

## En une phrase

**Le réseau n'est touché que par `npm run fetch`** (football-data pour les scores + ESPN pour les events, les deux **fail-soft** ; `--draft` ajoute un appel Claude). `render`, `preview`, `stories`, `build`, `buffer` et `shoot` sont 100 % locaux et déterministes : relançables à volonté, **aucun** quota consommé.

## Tableau récapitulatif

| Commande | Réseau | Lit | Écrit |
|---|:---:|---|---|
| `npm run fetch -- --date=J` | ✅ football-data + ESPN | les 2 API | `data/raw/*.json` (cache) · `content/J/content.json` (draft enrichi) · `content/J/facts.json` |
| `… --draft` (+ clé) | ✅ + Claude | facts + draft | `content/J/content.draft.llm.json` · `caption.draft.txt` |
| `… --preview` | ✅ (mêmes appels) | fixtures J+1 | `content/J+1/preview.json` (post avant-match) |
| `npm run render -- --date=J [--file=preview.json]` | ❌ local | `content/J/<fichier>.json` | `out/slide-0N.png` ou `out/preview-0N.png` |
| `npm run preview -- --date=J` | ❌ local | `content/J/preview.json` | `out/preview-0N.png` |
| `npm run stories -- --date=J` | ❌ local | `content/J/content.json` (clé `stories`) | `out/story-0N.png` |
| `npm run build -- --date=J` | ❌ local | tout `content/J/*.json` | carrousel + stories + preview, en une fois |
| `npm run buffer [-- --next \| --mark=evergreen-0N]` | ❌ local | `content/evergreen-*` + `data/buffer-state.json` | l'état du buffer |
| `npm run shoot` | ❌ local | une page HTML quelconque | un PNG arbitraire |

**Anti-hallucination / fail-soft :** les FAITS (buteurs, minutes, cartons) viennent d'ESPN en JSON structuré → `facts.json`, jamais d'un LLM. Le `--draft` Claude rédige UNIQUEMENT depuis ces faits (et marque tout claim historique `[VERIFY]`). Si ESPN/Claude tombe, le pipeline retombe sur le draft déterministe / le brief manuel — la routine ne dépend jamais d'eux.

## Le flux de bout en bout

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  MATIN — la SEULE étape connectée à internet                      │
  └─────────────────────────────────────────────────────────────────┘
              npm run fetch -- --date=J
                        │
                        ▼
            football-data.org  (header X-Auth-Token)
              GET /competitions/WC/matches?dateFrom=J&dateTo=J+2
              GET /competitions/WC/scorers   (si --scorers)
                        │
       ┌────────────────┴───────────────┐
       ▼                                ▼
  cache 10 min                    auto-throttle
  data/raw/*.json                 (lit les headers de quota :
  (réutilisé si < 10 min)          X-Requests-Available-Minute…)
                        │
                        ▼
        DRAFT  content/<date>/content.json
        (cover = match le plus prolifique, stat-cards,
         teaser, squelette stories ; turning-points = TODO)
        ⚠ n'écrase JAMAIS un content.json existant
           → écrit content.draft.json à côté

  ┌─────────────────────────────────────────────────────────────────┐
  │  TOI — recherche web + édition (récit, buteurs vérifiés 2 sources)│
  │  content/<date>/content.json = LA SOURCE DE VÉRITÉ                 │
  └─────────────────────────────────────────────────────────────────┘
                        │
       ┌────────────────┴───────────────┐
       ▼                                ▼
  npm run render -- --date=J      npm run stories -- --date=J
       │                                │
       ▼                                ▼
  Playwright (Chromium headless) + rough.js   ← 100 % local, 0 réseau
  seed = hashSeed("<date>#<slide>")           ← rendu déterministe
       │                                │
       ▼                                ▼
  out/slide-0N.png (1080×1350)    out/story-0N.png (1080×1920)
                        │
                        ▼
              Publication manuelle sur Instagram
```

## Détails par commande

### `npm run fetch` — `scripts/fetch.mjs` (la seule connectée)

- Appelle football-data.org avec le header `X-Auth-Token` (clé `FOOTBALL_DATA_KEY` dans `.env`, jamais commitée).
- **Cache** les réponses brutes 10 min dans `data/raw/` (gitignoré) ; une relance < 10 min ne refait aucun appel.
- **S'auto-throttle** en lisant les headers de quota de l'API (`X-Requests-Available-Minute`, reset) — pas de comptage à l'aveugle. Free tier = 10 appels/min.
- **Jour éditorial** : un coup d'envoi appartient au jour J si `utcDate − 8 h` tombe le J (les matchs du soir US/MX débordent sur J+1 en UTC).
- Génère un **draft** `content/<date>/content.json` pré-rempli — et **n'écrase jamais** un fichier existant (écrit `content.draft.json` à côté).
- `--scorers` ajoute le top buteurs agrégé du tournoi (fonctionne en free tier).

### `npm run render` — `scripts/render.mjs` (local)

- Sert le projet sur un serveur HTTP local, lance Chromium (Playwright) en 1080×1350, charge `templates/render.html?date=…&slide=…`.
- Le moteur (`templates/lib/engine.js` + `slide-kit.js`) lit `content/<date>/content.json` et dessine en rough.js.
- **Déterministe** : le seed = `hashSeed("<date>#<slide>")`. Re-rendre produit exactement les mêmes pixels. **Ne pas retirer le seed.**
- `--slide=N` ne rend qu'une slide ; `--date` accepte aussi un nom de dossier (ex. `evergreen-01`).

### `npm run stories` — `scripts/stories.mjs` (local)

- Identique à `render` mais en 1080×1920, à partir du tableau `stories` du même `content.json`. Sortie `out/story-0N.png`.

### `npm run shoot` — `scripts/shoot.mjs` (local)

- Capture générique d'une page HTML du projet (planches de casting, mocks, assets de marque). Aucun accès à `content/` ni au réseau.

## Données — état et évolution

**Le free tier de football-data.org ne fournit PAS** les buteurs+minute, cartons, ni compositions par match — uniquement scores, calendrier, classements et top buteurs agrégés. C'est pourquoi le récit se complète aujourd'hui à la main après recherche web.

**Décision 13/06 (soir) — voie GRATUITE, prouvée.** API-Football free = NO-GO (saison 2026 bloquée). À la place, les events WC 2026 viennent du **JSON ESPN non officiel, gratuit, sans clé** (`site.api.espn.com/.../soccer/fifa.world/{scoreboard,summary}`, champ `keyEvents`) — vérifié sur USA 4-1 Paraguay : buteurs+passeur+minute, c.s.c., cartons J/R horodatés, VAR, subs. football-data reste l'ancre des scores ; Wikipedia est prévu en 2ᵉ source de cross-check. Client : `scripts/lib/espn.mjs` (cache `data/raw/`, fail-soft). On ne paie **aucun** tier data. Détail : `BACKLOG.md` → D8′.

**État des chantiers (voir `TODO.md` → Chantier A′) :**
- **Phase 1 — FAIT** : ESPN câblé dans `fetch` → briefing avec timeline complète + `facts.json` + draft pré-rempli (turning-points, stat-cards, Vera's file auto depuis les cartons).
- **Phase 2 — FAIT (code), à activer** : `scripts/lib/llm.mjs` + `fetch --draft` ; Claude rédige le draft dans la voix de marque depuis `facts.json` (Opus 4.8 défaut, surchargeable). Attend `ANTHROPIC_API_KEY` dans `.env`.
- **Phase 3 — à faire** : Wikipedia REST en 2ᵉ source (cross-check des minutes).
- **Preview (D13) — FAIT** : `fetch --preview` → `preview.json` + type de slide `preview` + `npm run preview`.
- **Buffer (3e slot) — FAIT** : `npm run buffer` (rotation des evergreen de secours).
