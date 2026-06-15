# Scribble Pitch

Storytelling de match illustré (hand-drawn, rough.js + Playwright) pour la Coupe du Monde 2026. Un carrousel Instagram 1080×1350 + 3-4 stories 1080×1920 par jour de match, en anglais. Funnel : IG → site → newsletter → Gumroad.

Le cast : **OTTO** (coach, orange, tactique), **NUMA** (chrono, bleu, chiffres), **VERA** (carton jaune→rouge, rouge, discipline). L'accent d'une slide désigne le personnage ; chaque personnage a son highlight IG à son prénom.

Lire avant de produire du contenu : `brand/identity.md` (cast, voix, palette, règles légales) et `content/_schema.md` (contrat JSON slides + stories).

## Session quotidienne (le matin, pour les matchs de la veille)

1. `npm run fetch -- --date=<date> --draft --preview` : briefing complet (scores football-data + **timeline ESPN** : buteurs+minute, cartons, subs) + `facts.json` (faits structurés) + draft `content/<date>/content.json` pré-rempli (turning-points, stat-cards, **Vera's file auto si cartons**) + `content.draft.llm.json` rédigé par Claude (si `ANTHROPIC_API_KEY`) + `preview.json` du post avant-match (J+1). N'écrase jamais un fichier existant (écrit `*.draft.json` à côté). `--scorers` ajoute le top buteurs agrégé. Tout est **fail-soft**.
2. **Vérifier les faits auto-collectés** (ESPN reste non officiel) et trancher l'angle — recherche web sur 2 sources, surtout les minutes de buts et tout claim marqué `[VERIFY]` par le LLM. La recherche ne PART plus de zéro : elle confirme `facts.json`.
3. Choisir l'angle : **UN match vedette raconté en profondeur** (cover + 2 turning-points) + le reste en stat-cards. Ne jamais raconter tous les matchs. Choisir aussi le **personnage signature du jour** selon le fait marquant (gros carton → Vera, stat/record → Numa, bascule tactique → Otto) : il signe la slide CTA (via son `accent`) ET la dernière story.
4. Compléter le draft de fetch (à défaut : copier `content/_template.json`) — slides (limites de longueur dans `_schema.md`) + `caption.txt` (caption + alt-texts). Penser aux rituels : un chiffre "Numa's number", la note de discipline "Vera's file" quand il y a des cartons.
5. Écrire le tableau `stories` du même content.json : teaser (otto, reprend le hook), Numa's number (mega), Vera's file (poll) — hot take en plus 2-3×/semaine. La dernière story porte le personnage signature. Les placeholders `sticker` indiquent ce que l'utilisateur posera dans l'app.
6. `npm run build -- --date=<date>` (= carrousel + stories, et la preview si présente) — corriger les warnings en RACCOURCISSANT le texte. Le post preview du soir se rend aussi seul avec `npm run preview -- --date=<J+1>`.
7. Contrôle visuel des PNG dans `content/<date>/out/` (lire les images) : hook lisible, 1 accent par slide, footer présent (handle · micro-ask en rotation · pagination ; pas de micro-ask sur la CTA), **bon personnage sur la bonne couleur** (orange=Otto, bleu=Numa, rouge=Vera, carton rouge seulement si ça chauffe), personnage pas en collision avec le texte ; stories : texte dans la zone utile, place pour le sticker. **Relire la véracité de chaque copie rédigée à la main** — surtout les notes/apartés manuscrits et les accroches « punchy » (`note`, `hook`, annotations) — contre `facts.json` : qui marque en premier, ordre et minutes des buts, qui égalise. Aucun garde-fou ne l'attrape : le lint temporel ne traque que tonight/today/tomorrow, le détecteur d'overflow ne regarde que la mise en page — **ni l'un ni l'autre ne vérifie les faits**. (Piège réel le 14/06 : une note de cover disait « Curaçao struck first » alors que l'Allemagne ouvrait à la 6' et Curaçao égalisait à la 21'.)
8. L'utilisateur poste manuellement : carrousel 15h-17h FR (matin US/Canada/Mexique), puis story teaser **juste après**, stat/quiz ~17h30, sondage de pronostic 20h-22h FR. Meilleure story du jour → highlight du personnage (OTTO / NUMA / VERA). **Cadence 3 posts/jour (D13), pilotée par le calendrier** : lancer `npm run day` le matin → recap (matin) · post preview avant-match (soir, `preview.json`) · **3e post** auto (quiz les jours de match, état du tournoi les jours creux ; evergreen en secours via `npm run buffer`). Marche tel quel jusqu'à la finale.

## Commandes

- `npm run day -- [--date=YYYY-MM-DD] [--draft]` — **commande du matin (orchestrateur)**. Classe le jour via le calendrier (jour de match / jour creux + round), scaffolde le recap (J-1) + la preview (J) et génère le **3e post** (quiz si match, état du tournoi si creux), puis imprime la **planche du jour** (quoi poster + commandes `build`). Ne rend pas : on relit les drafts puis on `build`. Défaut : aujourd'hui.
- `npm run fetch -- [--date=YYYY-MM-DD] [--scorers] [--draft] [--preview]` — briefing (football-data + events ESPN) + `facts.json` + draft `content.json` (défaut : hier). `--draft` : rédaction Claude (clé requise). `--preview` : scaffold du post avant-match (écrit `content/<J+1>/preview.json`).
- `npm run third -- --date=YYYY-MM-DD [--draft]` — **3e post**. Si `content/<date>/facts.json` existe → **quiz** (mini-carrousel tiré des faits) ; sinon → **état du tournoi** (classements `/standings`). Écrit `content/<date>/third.json` (jamais d'écrasement). `--draft` : copie affinée par Claude.
- `npm run evergreen -- (--team="X" | --theme="Y" | "sujet libre")` — **usine à evergreens** : Claude rédige un « Did you know? » thématique Mondial dans le prochain `content/evergreen-0N`. Chaque fait porte un `[VERIFY]` → fact-check + retrait AVANT publication. Clé requise.
- `npm run render -- --date=YYYY-MM-DD [--slide=N] [--file=preview.json|third.json]` — rend les slides (content.json, ou un autre doc du dossier via `--file`)
- `npm run preview -- --date=YYYY-MM-DD` — rend le post avant-match (`preview.json`) → `out/preview-0N.png`
- `npm run stories -- --date=YYYY-MM-DD [--story=N]` — rend les stories 1080×1920
- `npm run build -- --date=YYYY-MM-DD` — carrousel + stories + preview + **third.json** (tout ce qui est présent) en une commande
- `npm run buffer [-- --next | --mark=… | --unmark=… | --verify=… | --unverify=…]` — inventaire/suivi du buffer evergreen. **Barrière** : « PRÊT » = rendu **ET** vérifié (`--verify`, refusé tant qu'il reste des `[VERIFY]`) **ET** non posté.
- `npm run shoot -- --path=/page.html --out=fichier.png [--width --height --clip --selector]` — capture une page quelconque (planches, mocks)
- `brand/character/preview.html` (via tout serveur statique) — planche des poses du cast

## Données — football-data.org (scores) + ESPN (events) + Claude (rédaction)

- **football-data.org** = ancre des scores. Clé `.env` (`FOOTBALL_DATA_KEY`), jamais commitée, header `X-Auth-Token`. Compétition `WC`. Free tier = fixtures/résultats/**classements**/buteurs agrégés UNIQUEMENT (pas de buteurs/minutes/cartons par match), 10 appels/min ; client auto-throttlé par les headers de quota. Client partagé : `scripts/lib/footballdata.mjs` (`apiGet`, helpers dates, `fetchMatchesRange/Standings/Scorers/Teams`) ; classifieur de journée : `scripts/lib/calendar.mjs` (`classifyDay` → recap/preview/jour de match vs creux/round).
- **ESPN** (JSON non officiel, gratuit, sans clé) = events horodatés que football-data n'a pas. `scripts/lib/espn.mjs` : `summary?event=` → `keyEvents` (buteurs+minute, c.s.c., cartons J/R, VAR, subs), cache `data/raw/`, **fail-soft** (toute erreur → null). On extrait des FAITS, jamais la prose des articles. Non officiel → toujours vérifié sur 2 sources (Wikipedia prévu en Phase 3).
- **Claude** (`--draft`, optionnel) = rédaction du draft dans la voix de marque depuis `facts.json` UNIQUEMENT. Clé `.env` (`ANTHROPIC_API_KEY`). `scripts/lib/llm.mjs` ; modèles surchargeables par `SCRIBBLE_LLM_MODEL` (défaut `claude-opus-4-8`). Fail-soft sans clé.
- Conséquence : la collecte des faits est automatisée (`facts.json`) ; la recherche web du matin devient une **vérification** (2 sources), plus une saisie à blanc.

## Pièges connus

- Windows PowerShell 5.1 : pas de `&&` ; utiliser `;`.
- Le rendu est déterministe (seed rough.js par date+slide) : ne pas l'enlever.
- Les fontes sont vendorées dans `templates/fonts/` — pas de CDN.
- Toujours `--` avant les arguments de `npm run render`.
