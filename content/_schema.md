# Contrat content.json — rédaction (Claude) ↔ rendu (code)

Un dossier par jour de match : `content/YYYY-MM-DD/` contenant `content.json`, `caption.txt`, et `out/` (PNG générés).

## Racine

```json
{
  "matchDate": "YYYY-MM-DD",   // jour des matchs racontés
  "title": "...",              // titre interne de l'histoire
  "slides": [ ... ]            // 5 à 8 slides, la 1re = cover, la dernière = cta
}
```

## Markup texte

Dans `hook`, `headline`, `body`, `context`, `text` : `*mots*` → soulignement gribouillé couleur d'accent. Un seul groupe souligné par champ, sur LE mot/groupe qui porte l'idée.

## Accent

Chaque slide a un `accent` (`"red"` | `"orange"` | `"blue"`) — UNE couleur dominante par slide :
- `red` : erreur, danger, carton, friction, problème
- `orange` : mouvement, course, transition, remontada
- `blue` : stat, preuve, score, état

## Personnages

**Le personnage est déduit de l'accent** : `orange` → Otto (tacticien), `blue` → Numa (chrono), `red` → Vera (carton). Champs optionnels par slide :

- `character` : `"otto"` | `"numa"` | `"vera"` — force un personnage malgré l'accent (rare) — ou `"guest"` : slot invité (silhouette en pointillés, vivier casting). Avec `"guest"`, l'accent n'est pas déductible : le préciser explicitement.
- `mood` : `"yellow"` | `"red"` — Vera uniquement. Défaut : jaune ; passe automatiquement au rouge si `expression: "angry"` ou `pose: "dejected"`. Forcer `"red"` pour un carton rouge avec un visage non fâché (ex. Vera ravie d'un match à 3 rouges).
- `pose` : `neutral` | `pointing` | `shocked` | `celebrating` | `dejected` — `expression` : `neutral` | `shocked` | `happy` | `angry` | `sad`.

Compatibilité : le contenu écrit avant le cast (2026-06-11) rend tel quel — mêmes noms de poses/expressions, le personnage vient de l'accent.

**Signature du jour** : la slide CTA et la **dernière story** sont signées par le même personnage, **choisi selon le fait marquant du jour** (gros carton → Vera, stat/record → Numa, bascule tactique → Otto). Sur la CTA, c'est l'`accent` qui le désigne (orange/blue/red) ; les semaines à invité, `character: "guest"`.

## Types de slides

### cover (toujours en 1re position)
```json
{ "type": "cover",
  "kicker": "Matchday N · Month D, YYYY",
  "hook": "Phrase choc, 8-12 mots max, *accent* sur le mot clé",
  "score": { "home": "...", "away": "...", "homeGoals": 0, "awayGoals": 0 },
  "note": "Apparté manuscrit court (optionnel, flèche auto vers le coach)",
  "pose": "shocked", "accent": "orange" }
```
Le hook doit tenir en 3 lignes max (≈ 34 caractères/ligne en 96px).

### turning-point
```json
{ "type": "turning-point",
  "minute": 59,
  "kicker": "The setup | The turnaround | The collapse…",
  "headline": "6-8 mots max (2 lignes en 76px)",
  "body": "3-5 phrases courtes, ≈ 280 caractères max",
  "annotations": [{ "text": "fait court", "color": "red" }],   // 0-2 annotations
  "pose": "neutral", "expression": "angry",                     // optionnel
  "bodyTop": 520,                                               // optionnel, px
  "accent": "red" }
```

### stat-card
```json
{ "type": "stat-card",
  "kicker": "contexte court en haut",
  "value": "3",            // la taille s'adapte à la longueur (max ~8 caractères)
  "unit": "red cards",
  "context": "1-2 phrases, ≈ 160 caractères max",
  "pose": "shocked",       // optionnel (coach en bas à gauche)
  "accent": "red" }
```

### cta (toujours en dernière position)
```json
{ "type": "cta",
  "text": "One illustrated story. *Every matchday.*",
  "note": "Tomorrow: …  (teaser du lendemain)",
  "pose": "pointing", "accent": "orange" }
```
L'`accent` désigne le personnage signature du jour (voir « Signature du jour »). La box `Follow @scribblepitch` et la ligne `newsletter → link in bio` sont automatiques (demande complète) — ne pas les dupliquer dans `text`/`note`.

### preview (post avant-match — cadence 3 posts/jour, D13)

Vit dans `content/<date>/preview.json` (même schéma racine `{ matchDate, title, slides }`), rendu par `npm run preview -- --date=YYYY-MM-DD` → `out/preview-0N.png`.

**Gabarit standard TIERED (généré par `npm run fetch -- --date=J --preview`)** : une slide **OVERVIEW** (tous les matchs du jour) → le(s) **gros match(s) en 2 slides** : *Otto's Board* (prono 1/X/2 + key battle) puis *Numa's Rewind* (un chiffre + head-to-head) → le **reste en cartes compactes** (prono + note h2h) → cta. On voit dès la 1re slide qu'il y a plusieurs matchs, et les gros matchs respirent. Le **personnage est déduit de l'accent** (orange→Otto, blue→Numa, red→Vera) et **dessiné** sur la slide. Tous les `TODO` sont à compléter avec des faits **vérifiés sur le web (2 sources)**.

Les usages d'une slide `preview` selon les champs fournis :

```json
{ "type": "preview", "kicker": "Coming up · Month D, YYYY",
  "hook": "Accroche 8-12 mots, *accent* (OVERVIEW / LEAD)",            // optionnel
  "matches": [ { "home": "Spain", "away": "Cape Verde", "kickoff": "16:00 UTC" } ],  // OVERVIEW
  "home": "Belgium", "away": "Egypt", "kickoff": "19:00 UTC",          // board / rewind / file
  "outcome": "1",        // OTTO'S BOARD — "1" = home · "X" = draw · "2" = away (le choix est entouré)
  "pick": "Le call d'Otto (1-2 phrases, *accent* sur l'idée)",         // OTTO'S BOARD
  "battle": { "a": "Egypt's Salah", "b": "Belgium's back line" },      // OTTO'S BOARD (gros match) — key battle, flèche dessinée
  "h2h": "Head-to-head + 1 anecdote vérifiée",                         // carte compacte (note Numa) OU Numa's Rewind
  "number": { "value": "20", "unit": "FIFA places apart" },            // NUMA'S REWIND — le chiffre du match
  "discipline": "La note discipline (cartons, VAR, match tendu)",      // VERA'S FILE
  "pose": "pointing", "accent": "orange" }
```

- **OVERVIEW** : `matches[]` → liste centrée de tous les matchs (Team v Team · kickoff) dans un cadre, Otto en bas (`pose: "none"` pour masquer). 1re slide, `hook` optionnel au-dessus.
- **OTTO'S BOARD** (accent orange) : `outcome` → matchup + rangée **1 / X / 2** (choix entouré + légende home/draw/away) + `pick`. Si `battle` → **gros match** : key battle « The game turns on : a → b » (flèche) + Otto en grand. Sinon **carte compacte** : `h2h` en note Numa + petit Otto.
- **NUMA'S REWIND** (accent blue) : `h2h`/`number`/`rewind` **sans** `outcome` → matchup + le `number` (gros chiffre) + head-to-head + Numa dessiné.
- **VERA'S FILE** (accent red) : `discipline` → matchup + note discipline + Vera dessinée. Situationnel (derby, arbitre à cartons, match tendu).
- **LEAD / FOCUS / CARTE** (compat ancien format) : `hook` seul / `pick` seul / `home`+`away` seuls.

### quiz (3e post — jours de match)

```json
{ "type": "quiz",
  "kicker": "Quiz · matchday N",
  "question": "Phrase de question, *accent* sur un mot",
  "options": ["A label", "B label", "C label"],   // 0-4 ; clés A/B/C/D auto
  "prompt": "Swipe for the answer →",              // optionnel
  "pose": "pointing", "accent": "blue" }
```
La réponse se révèle sur une slide `stat-card` suivante. L'accent désigne le personnage (défaut Numa).

## 3e post — `third.json` (cadence 3 posts/jour, D13)

Vit dans `content/<date>/third.json` (même schéma racine), rendu par `npm run render -- --file=third.json` → `out/third-0N.png` (aussi rendu par `npm run build`). Deux formes, choisies **automatiquement** par `npm run third` / `npm run day` :

- **quiz** (jour de match, si `facts.json` présent) : `quiz` (question + options) → `stat-card` (réponse révélée) → `stat-card` (chiffre bonus) → `cta`. 100% tiré de `facts.json` (aucune trivia inventée) ; `--draft` affine la copie, la **réponse factuelle reste verrouillée**.
- **état du tournoi** (jour creux, sans `facts.json`) : 2-3 `stat-card`s depuis les classements football-data (`/standings`) + top buteur + `cta`.

**Evergreens** (`content/evergreen-0N/`, réserve du 3e slot) : `npm run evergreen -- --team="X"` rédige un « Did you know? » thématique Mondial où **chaque fait porte un `[VERIFY]`** ; fact-check (2 sources) + retrait des `[VERIFY]`, puis `npm run render` et `npm run buffer -- --verify=…` (barrière : pas de publication tant que non vérifié).

## Footer & micro-CTA (automatiques — rien à écrire dans le JSON)

Le moteur pose sur chaque slide un footer 3 zones : `@scribblepitch` | **UNE micro-demande en rotation** par index de slide (`follow for the next one` → `save this for later` → `share it with a fan` → `newsletter → link in bio`, en boucle) | `N / M`. La slide CTA n'a pas de micro-ask : son corps porte la demande complète.

## stories (racine, optionnel mais attendu chaque jour)

3-4 stories 1080×1920 dérivées du carrousel. Chaque entrée :

```json
{ "character": "otto|numa|vera",   // accent déduit du personnage
  "kicker": "Otto's board · matchday N",
  "big": "Titre 88px, *accent* possible",      // OU mega/unit :
  "mega": "80,824", "unit": "légende du chiffre",
  "note": "apparté Caveat (optionnel)",
  "pose": "pointing", "expression": "...", "mood": "red",   // optionnels
  "sticker": "[ poll: “…” ]",     // placeholder — le sticker réel est posé dans l'app
  "cta": "Full story → today's post" }
```

Gabarits quotidiens : **teaser** (otto, big = le hook de la cover, juste après le post), **Numa's number** (mega + slider), **Vera's file** (big + note + poll). Hot take 2-3×/semaine.

La **dernière story du jour** est signée par le personnage signature — le même que la slide CTA du carrousel (`character: "guest"` + `accent` explicite les semaines à invité).

## caption.txt

Deux sections : `CAPTION` (hook 1re ligne, déroulé avec émojis ●, CTA follow, 8-10 hashtags) et `ALT-TEXTS` (une ligne par slide, descriptif).

## Rendu

- Slides : `npm run render -- --date=YYYY-MM-DD` (ajouter `--slide=N` pour une seule).
- Stories : `npm run stories -- --date=YYYY-MM-DD` (ajouter `--story=N`) → `out/story-0N.png`.
Les warnings d'overflow/zone utile s'affichent en fin de commande — raccourcir le texte concerné et re-rendre.

**Lint temporel** (automatique au render/stories sur `content.json`) : le recap se poste **le lendemain** du match, donc « tonight / today / tomorrow / this evening » sont faux dans la copie du match. Le présent narratif reste OK ; ancrer au passé (« yesterday », « on matchday N »). Le build liste les `✗` (recap à corriger) et les `·` (slot preview cta/story à vérifier contre le calendrier). Seuls la slide `cta` et les stories à kicker preview (`· tonight`, `coming up`) ont le droit de regarder vers l'avant.
