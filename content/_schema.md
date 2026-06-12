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

- `character` : `"otto"` | `"numa"` | `"vera"` — force un personnage malgré l'accent (rare).
- `mood` : `"yellow"` | `"red"` — Vera uniquement. Défaut : jaune ; passe automatiquement au rouge si `expression: "angry"` ou `pose: "dejected"`. Forcer `"red"` pour un carton rouge avec un visage non fâché (ex. Vera ravie d'un match à 3 rouges).
- `pose` : `neutral` | `pointing` | `shocked` | `celebrating` | `dejected` — `expression` : `neutral` | `shocked` | `happy` | `angry` | `sad`.

Compatibilité : le contenu écrit avant le cast (2026-06-11) rend tel quel — mêmes noms de poses/expressions, le personnage vient de l'accent. La CTA reste orange → Otto, c'est la signature.

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

## caption.txt

Deux sections : `CAPTION` (hook 1re ligne, déroulé avec émojis ●, CTA follow, 8-10 hashtags) et `ALT-TEXTS` (une ligne par slide, descriptif).

## Rendu

- Slides : `npm run render -- --date=YYYY-MM-DD` (ajouter `--slide=N` pour une seule).
- Stories : `npm run stories -- --date=YYYY-MM-DD` (ajouter `--story=N`) → `out/story-0N.png`.
Les warnings d'overflow/zone utile s'affichent en fin de commande — raccourcir le texte concerné et re-rendre.
