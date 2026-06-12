# Scribble Pitch

Storytelling de match illustré (hand-drawn, rough.js + Playwright) pour la Coupe du Monde 2026. Un carrousel Instagram 1080×1350 + 3-4 stories 1080×1920 par jour de match, en anglais. Funnel : IG → site → newsletter → Gumroad.

Le cast : **OTTO** (coach, orange, tactique), **NUMA** (chrono, bleu, chiffres), **VERA** (carton jaune→rouge, rouge, discipline). L'accent d'une slide désigne le personnage ; chaque personnage a son highlight IG à son prénom.

Lire avant de produire du contenu : `brand/identity.md` (cast, voix, palette, règles légales) et `content/_schema.md` (contrat JSON slides + stories).

## Session quotidienne (le matin, pour les matchs de la veille)

1. `npm run fetch -- --date=<date>` : briefing des scores (garantis par l'API) + draft `content/<date>/content.json` pré-rempli (n'écrase jamais un content.json existant — écrit content.draft.json à côté). Ajouter `--scorers` pour le top buteurs agrégé.
2. Chercher les résultats/recaps de la veille sur le web (buteurs + minutes, cartons, affluence, moment de bascule — le free tier ne les donne pas). Vérifier chaque fait sur 2 sources — les minutes de buts notamment.
3. Choisir l'angle : **UN match vedette raconté en profondeur** (cover + 2 turning-points) + le reste en stat-cards. Ne jamais raconter tous les matchs. Choisir aussi le **personnage signature du jour** selon le fait marquant (gros carton → Vera, stat/record → Numa, bascule tactique → Otto) : il signe la slide CTA (via son `accent`) ET la dernière story.
4. Compléter le draft de fetch (à défaut : copier `content/_template.json`) — slides (limites de longueur dans `_schema.md`) + `caption.txt` (caption + alt-texts). Penser aux rituels : un chiffre "Numa's number", la note de discipline "Vera's file" quand il y a des cartons.
5. Écrire le tableau `stories` du même content.json : teaser (otto, reprend le hook), Numa's number (mega), Vera's file (poll) — hot take en plus 2-3×/semaine. La dernière story porte le personnage signature. Les placeholders `sticker` indiquent ce que l'utilisateur posera dans l'app.
6. `npm run render -- --date=<date>` puis `npm run stories -- --date=<date>` — corriger les warnings en RACCOURCISSANT le texte.
7. Contrôle visuel des PNG dans `content/<date>/out/` (lire les images) : hook lisible, 1 accent par slide, footer présent (handle · micro-ask en rotation · pagination ; pas de micro-ask sur la CTA), **bon personnage sur la bonne couleur** (orange=Otto, bleu=Numa, rouge=Vera, carton rouge seulement si ça chauffe), personnage pas en collision avec le texte ; stories : texte dans la zone utile, place pour le sticker.
8. L'utilisateur poste manuellement : carrousel 15h-17h FR (matin US/Canada/Mexique), puis story teaser **juste après**, stat/quiz ~17h30, sondage de pronostic 20h-22h FR. Meilleure story du jour → highlight du personnage (OTTO / NUMA / VERA).

## Commandes

- `npm run fetch -- [--date=YYYY-MM-DD] [--scorers]` — briefing du matin + draft content.json (date par défaut : hier)
- `npm run render -- --date=YYYY-MM-DD [--slide=N]` — rend les slides du carrousel
- `npm run stories -- --date=YYYY-MM-DD [--story=N]` — rend les stories 1080×1920
- `npm run shoot -- --path=/page.html --out=fichier.png [--width --height --clip --selector]` — capture une page quelconque (planches, mocks)
- `brand/character/preview.html` (via tout serveur statique) — planche des poses du cast

## Données — football-data.org

- Clé API dans `.env` à la racine (`FOOTBALL_DATA_KEY`), jamais commitée (gitignoré). Header HTTP : `X-Auth-Token`.
- Compétition : code `WC` (FIFA World Cup), incluse dans le free tier.
- Free tier = fixtures, résultats, classements UNIQUEMENT — pas de buteurs/minutes/cartons par match ; 10 appels/min.
- Tout client doit **lire les headers de réponse pour s'auto-throttler** (`X-Requests-Available-Minute`, compteur de reset) — recommandation officielle de l'API, ne pas compter à l'aveugle.
- Conséquence : l'API garantit scores/calendrier/classements ; la recherche web du matin (étape 1) reste obligatoire pour le récit.

## Pièges connus

- Windows PowerShell 5.1 : pas de `&&` ; utiliser `;`.
- Le rendu est déterministe (seed rough.js par date+slide) : ne pas l'enlever.
- Les fontes sont vendorées dans `templates/fonts/` — pas de CDN.
- Toujours `--` avant les arguments de `npm run render`.
