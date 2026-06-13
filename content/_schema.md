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

Vit dans `content/<date>/preview.json` (même schéma racine `{ matchDate, title, slides }`), rendu par `npm run preview -- --date=YYYY-MM-DD` → `out/preview-0N.png`. Trois usages d'une même slide `preview` selon les champs fournis :

```json
{ "type": "preview",
  "kicker": "Coming up · Month D, YYYY",
  "hook": "Accroche 8-12 mots, *accent* (slide de TÊTE uniquement)",   // optionnel
  "home": "Brazil", "away": "Morocco",
  "kickoff": "22:00 UTC",                                              // optionnel
  "rewind": "Anecdote / head-to-head (slide Numa, accent blue)",       // optionnel
  "pick": "Pronostic d'Otto (slide Otto, accent orange)",              // optionnel
  "pose": "pointing", "accent": "orange" }
```

- **LEAD** : `hook` présent → accroche 96px + matchup au centre + coach. C'est la 1re slide.
- **FOCUS** : `rewind` (rituel *Numa's Rewind*) OU `pick` (*Otto's Board*) → matchup compact en haut + le texte en focus. Le label est posé automatiquement.
- **CARTE** : juste `home`/`away`/`kickoff` (mettre `pose: "none"` pour masquer le coach) → un match secondaire du jour.

Gabarit type (généré par `npm run fetch -- --date=J --preview`, écrit `content/<J+1>/preview.json`) : le match vedette en 3 slides (lead → Numa's Rewind → Otto's Board) + 1 carte par autre match + cta. `rewind`/`pick`/`hook` restent des TODO à compléter (anecdotes vérifiées sur le web).

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
