# Next steps — Scribble Pitch

> Créé le **2026-06-15**. Pistes notées à la suite de la refonte du **post preview tiered** (overview + gros matchs en 2 slides Otto's Board / Numa's Rewind + cartes compactes). Non bloquant pour la cadence actuelle (jours à ~4 matchs, 1-2 gros) ; à prendre quand on veut.

## 1. Gérer 3 gros matchs ou plus — ⚠️ à moitié
État : le **rendu** gère déjà N gros matchs (on écrit autant de paires *Otto's Board + Numa's Rewind* qu'on veut). Le **scaffold** `fetch.mjs` n'en marque qu'**un** (`marquee = cards[0]`) ; au-delà, c'est à la main. Aucun garde-fou sur la longueur (IG plafonne à 20 slides).

- [ ] Marquer les gros matchs au lieu d'en deviner un seul : champ `tier:"marquee"` par match **ou** heuristique (écart de classement faible = match serré = gros).
- [ ] Générer 1 paire de slides (board + rewind) par match marqué dans le scaffold.
- [ ] Garde-fou de longueur : avertir si total slides > ~12, cap dur < 20.

## 2. Tenir une journée à 6 matchs — ❌ non (overview déborde)
État : les **cartes** scalent (capées à 6). L'**overview** non — testé : à 6 lignes la liste chevauche Otto + le footer (gap/police calibrés pour ~4). Le détecteur d'overflow ne l'attrape pas (il ne regarde pas le personnage).

- [ ] Overview **adaptatif** : police + gap qui se réduisent selon `matches.length` (ex. ≥5 → ~48px, gap ~26).
- [ ] Passer en **2 colonnes** au-delà de 4 matchs.
- [ ] **Masquer Otto** sur l'overview quand ≥5 matchs (libérer la place).
- [ ] Détecter le débord du cadre fixtures et auto-réduire (ou splitter en 2 slides overview).

## 3. Faire que la preview impacte les stories — ❌ non (aucun lien)
État : `scripts/stories.mjs` lit **uniquement** `content.json` (le recap) → `doc.stories`. La preview ne génère **aucune** story.

- [ ] Ajouter un bloc `stories[]` dans **`preview.json`** et faire lire ce fichier par `stories.mjs` (via `--file`, comme `render`).
- [ ] Générer des **stories avant-match depuis les données déjà saisies** (zéro ressaisie) : teaser = le `hook` de l'overview (Otto) · 1 **sondage 1/X/2** par gros match (Otto) · **Numa's number** story (le `number`) · key battle (Otto) · dernière story signée par le perso du jour.
- [ ] Option : un mode dans `day.mjs` qui scaffolde ces stories preview en même temps que le reste.

**Priorité suggérée :** #3 (stories preview, nouvel usage) → #2 (overview adaptatif, robustesse grosses journées) → #1 (3+ gros matchs).
