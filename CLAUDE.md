# Scribble Pitch

Storytelling de match illustré (hand-drawn, rough.js + Playwright) pour la Coupe du Monde 2026. Un carrousel Instagram 1080×1350 + 3-4 stories 1080×1920 par jour de match, en anglais. Funnel : IG → site → newsletter → Gumroad.

Le cast : **OTTO** (coach, orange, tactique), **NUMA** (chrono, bleu, chiffres), **VERA** (carton jaune→rouge, rouge, discipline). L'accent d'une slide désigne le personnage ; chaque personnage a son highlight IG à son prénom.

Lire avant de produire du contenu : `brand/identity.md` (cast, voix, palette, règles légales) et `content/_schema.md` (contrat JSON slides + stories).

## Session quotidienne (le matin, pour les matchs de la veille)

1. Chercher les résultats/recaps de la veille sur le web (scores, buteurs + minutes, cartons, affluence, moment de bascule). Vérifier chaque fait sur 2 sources — les minutes de buts notamment.
2. Choisir l'angle : **UN match vedette raconté en profondeur** (cover + 2 turning-points) + le reste en stat-cards. Ne jamais raconter tous les matchs.
3. Copier `content/_template.json` → `content/<date>/content.json`, écrire les slides (limites de longueur dans `_schema.md`) + `caption.txt` (caption + alt-texts). Penser aux rituels : un chiffre "Numa's number", la note de discipline "Vera's file" quand il y a des cartons.
4. Écrire le tableau `stories` du même content.json : teaser (otto, reprend le hook), Numa's number (mega), Vera's file (poll) — hot take en plus 2-3×/semaine. Les placeholders `sticker` indiquent ce que l'utilisateur posera dans l'app.
5. `npm run render -- --date=<date>` puis `npm run stories -- --date=<date>` — corriger les warnings en RACCOURCISSANT le texte.
6. Contrôle visuel des PNG dans `content/<date>/out/` (lire les images) : hook lisible, 1 accent par slide, footer présent, **bon personnage sur la bonne couleur** (orange=Otto, bleu=Numa, rouge=Vera, carton rouge seulement si ça chauffe), personnage pas en collision avec le texte ; stories : texte dans la zone utile, place pour le sticker.
7. L'utilisateur poste manuellement : carrousel 15h-17h FR (matin US/Canada/Mexique), puis story teaser **juste après**, stat/quiz ~17h30, sondage de pronostic 20h-22h FR. Meilleure story du jour → highlight du personnage (OTTO / NUMA / VERA).

## Commandes

- `npm run render -- --date=YYYY-MM-DD [--slide=N]` — rend les slides du carrousel
- `npm run stories -- --date=YYYY-MM-DD [--story=N]` — rend les stories 1080×1920
- `npm run shoot -- --path=/page.html --out=fichier.png [--width --height --clip --selector]` — capture une page quelconque (planches, mocks)
- `brand/character/preview.html` (via tout serveur statique) — planche des poses du cast

## Pièges connus

- Windows PowerShell 5.1 : pas de `&&` ; utiliser `;`.
- Le rendu est déterministe (seed rough.js par date+slide) : ne pas l'enlever.
- Les fontes sont vendorées dans `templates/fonts/` — pas de CDN.
- Toujours `--` avant les arguments de `npm run render`.
