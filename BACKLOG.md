# Scribble Pitch — Backlog & Idées

> Fichier de travail brut. Les idées sont posées ici avant d'être planifiées ou priorisées.
> Dernière mise à jour : 2026-06-13 (v4 — session brainstorming BMAD : décisions 8-13 actées, chantiers data A/B/C, cadence 3 posts/jour. v3 et les idées brutes plus bas sont intactes.)

---

## 🆕 MAJ 2026-06-13 — Session brainstorming BMAD

> Issue d'un brainstorming à 4 agents (Victor/innovation, Maya/design, Sophia/récit, Quinn/problème) + 2 rapports de recherche (APIs de données, RSS/LLM). Détail du raisonnement : `C:\Users\darkl\.claude\plans\dans-ce-projet-explique-moi-spicy-sun.md`. Le flux des pipelines est désormais documenté dans `docs/pipeline.md`.

### Décisions actées le 13/06

- **D8 — Sources de données (résout le goulot du remplissage manuel).** Le free tier football-data.org ne donne pas buteurs/minutes/cartons. → On bascule les **events sur API-Football (api-sports.io), free tier** (events/cartons/lineups + couvre la WC). Si le free tier ne couvre pas la saison 2026 (à tester en 15 min, étape 0 du chantier A) → **payer ~1 mois (~17 €)**. On NE paie PAS le tier « Deep Data » de football-data. football-data reste la source scores/standings/calendrier (déjà câblée).
- **D8′ — MAJ 13/06 (soir) : la voie GRATUITE existe, pas besoin de payer (remplace l'orientation payante de D8).** Test 13/06 : API-Football free = NO-GO (saison 2026 bloquée). Mais recherche de faisabilité (agent + vérif manuelle) → **ESPN JSON non officiel, gratuit, sans clé**, livre les events WC 2026 complets : `site.api.espn.com/.../soccer/fifa.world/scoreboard?dates=` puis `summary?event={id}` (champ `keyEvents`). **Prouvé** sur USA 4-1 Paraguay (12/06) : buteurs+passeur+minute, buts c.s.c., 6 cartons jaunes horodatés, upgrade VAR rouge, remplacements, compos. → **Agrégateur = ESPN (events) + football-data (ancre scores) + Wikipedia (2ᵉ source cross-check) + Claude (rédaction voix de marque, optionnelle/fail-soft).** RSS (BBC) = appoint narratif seulement (résumés tronqués), pas le socle. **LLM (décision 13/06) :** Claude via `@anthropic-ai/sdk`, structured output (`output_config.format`) ; **Opus 4.8** (`claude-opus-4-8`) pour TOUTE la rédaction / **Sonnet 4.6** (`claude-sonnet-4-6`) pour l'extraction pure (au lieu de Haiku, meilleure qualité) ; coût ~3-5 €/mois à 1 match vedette/jour, même tout en Opus (très en deçà du budget 10-20 €). **Légal :** extraction de FAITS (non protégeables), jamais de republication de la prose des articles. Plan d'exécution en 3 phases : voir `TODO.md` → Chantier A′. **Décision : GO, voie gratuite, on ne paie aucun tier data.**
- **D9 — Wall Chart Gumroad = mécanique HYBRIDE.** PDF A2 imprimable **vierge** (l'acheteur remplit à la main) + version **remplie re-rendue et poussée** aux acheteurs à chaque fin de phase (~8 push, via « remplacer le fichier + notifier » natif Gumroad). Prix **9 $**. Livré en ZIP **A2 + A4 + PNG 300 dpi**. Contenu : 12 groupes + bracket Round-of-32→finale + **tracker des 8 meilleurs 3es** + légende + disclaimer. **Drapeaux simplifiés** (formes géométriques, jamais l'emblème) + **les 3 personnages**. Génération : `templates/wallchart.html` + `templates/lib/wallchart.js` + `scripts/wallchart.mjs` (Playwright `page.pdf()`), source `data/wallchart/bracket.json` (un seul fichier, flag `fill=blank|filled`). Spec complète disponible. **EN VENTE le 18/06.** *(13/06 : échafaudage + page « groupes » rendus en PNG/PDF A2 ; reste le bracket KO, le mode `filled`, l'export A4, le branchement des vraies 48 équipes et les mockups Gumroad — détail dans `TODO.md`.)*
- **D10 — Site = Astro (pas Next.js).** Landing 1 page dont le **hero EST le formulaire email** ; galerie auto depuis `content/*/out/slide-01.png` ; formulaire custom aux couleurs de marque → API Beehiiv (clé en env Vercel) ; état « merci » avec rebond IG. Tokens/fontes copiés depuis `templates/`. **SEO gelé** (la règle « pas de "World Cup" dans les titres » bride la longue traîne).
- **D11 — Monétisation = Gumroad SEUL, pas de Shopify.** Le merch physique attend le **gate : logo final + >1 000 abonnés + ≥5 demandes spontanées DM/commentaires**. Si gate atteint → **Printify Pop-Up Store** (0 €/mois) d'abord, Shopify seulement si ça sature. Voie digitale prioritaire (marge ~87 %) : pack wallpapers **gratuit** (lead magnet Beehiiv), posters print-it-yourself 5 $, **recap premium post-finale** « The Tournament, Illustrated » (12-15 $, pré-vente en phase KO) + bundle Wall Chart.
- **D12 — Identité enrichie.** Avatar/photo de profil = **tête d'Otto** (conservé) ; **glyphe de marque « tableau + flèche-qui-tourne »** développé pour les autres usages (wordmark, merch, animations). **Otto devient faillible** : compteur public de pronostics (« X right, Y wrong, never in doubt »), alimenté par le Before/After. **Tics verbaux** : Otto « Trust the board. » · Numa « …under protest. » · Vera « Filed. ». **Guests** : Ola (la ferveur, jours d'upset) / Scout (les pépites, phase KO). Newsletter = gabarit « the whiteboard room » (édito Otto + Numa's Number of the Week + P.S. de Vera). **Tagline/positionnement : en cours de brainstorming dédié** (Sophia).
- **D13 — Cadence de contenu élargie : viser 3 posts/jour** (la fréquence fait grossir un compte jeune). Recap du matin + **post preview séparé** chaque soir (format adaptable : 1 gros match en 3 slides + 1 slide par autre match du jour ; gérer les journées à plusieurs petits matchs) + 3e slot. → soit **+2 carrousels/jour** à industrialiser (dépend du chantier A pour rester tenable en solo). Composition exacte du 3e slot à préciser.

### Nouveaux chantiers techniques (section Automatisation)

- **Chantier A — Auto-collecte des faits + draft de récit (LE multiplicateur de temps, ~15-30 h économisées).** Étape 0 GO/NO-GO (15 min : la clé API-Football couvre-t-elle la saison WC 2026 ?) AVANT tout code. Puis client `scripts/lib/apifootball.mjs` (`API_FOOTBALL_KEY` en `.env`, quota 100 req/j auto-compté, cache) ; mapping fixtures football-data ↔ API-Football par (date, équipes) + table d'alias de noms de pays ; injection des events dans le draft `content.json`. **FAIL-SOFT obligatoire** : si l'API échoue, draft identique à aujourd'hui + bannière « recherche web requise » — la routine ne dépend JAMAIS de A. Anti-hallucination : le LLM rédige uniquement depuis le tableau d'events ; match vedette = 1 contre-vérif web ; scores cross-checkés entre les 2 API. Industrialiser SEULEMENT après 3 matins chronométrés.
- **Chantier B — Preview avant-match (post preview quotidien, D13).** head-to-head + anecdotes (« 8e confrontation au Mondial », séries) pour les matchs du soir/de la nuit. Source : `fixtures/headtohead` API-Football + Wikipedia/Wikidata ; toute affirmation historique vérifiée web (profondeur des bases non garantie avant ~2008). Rituel narratif : *Numa's Rewind* (anecdote) + *Otto's Board* (pronostic, sticker poll). Format de post adaptable selon le nombre de matchs.
- **Chantier C — Bascule des events sur API-Football** (free tier), documenté dans `docs/pipeline.md`. football-data conservé pour scores/standings (et pour le remplissage du Wall Chart via `/standings`).
- **Chantier D — Distribution mobile : upload auto des PNG sur Google Drive (demandé le 13/06).** Aujourd'hui les visuels finis restent dans `content/<date>/out/*.png` sur le PC ; pour poster depuis le téléphone il faut les transférer à la main. → Pousser automatiquement les rendus finaux vers un dossier Drive daté (ex. `Scribble Pitch/<date>/`) en fin de pipeline, pour les récupérer sur mobile et poster. **But UX :** zéro manipulation de fichiers entre le PC et le téléphone. **Trois voies à arbitrer (de la plus simple à la plus intégrée) :**
  1. **Google Drive Desktop (zéro code)** — rediriger/synchroniser `content/*/out/` dans un dossier Drive synchronisé. Immédiat, aucune clé, mais pousse aussi les fichiers intermédiaires. *Reco court terme.*
  2. **Script `npm run push -- --date=J` (`scripts/lib/drive.mjs`)** — n'envoie QUE les PNG finaux du jour (carrousel + stories + preview) dans un dossier daté, via OAuth/compte de service Google. **FAIL-SOFT** (Drive down → on n'a rien cassé, les PNG restent en local). S'enchaîne après `build`. *Le bon niveau pour la routine.*
  3. **Via le MCP Google Drive déjà connecté** — Claude téléverse à la demande chaque matin dans le cadre de la routine (pas de clé à gérer côté repo, mais ce n'est pas un `npm run` autonome ni utilisable hors session Claude).
  - Légal/contenu : on n'expose rien de sensible (PNG publics destinés à IG) ; ne pas pousser `.env`/caches. Bonus possible : ranger aussi `caption.txt` à côté pour copier-coller la légende depuis le téléphone.

### Décisions de détail (lot 3, 13/06)

- **Wallpapers** du cast = **GRATUIT** (lead magnet Beehiiv), pas payant — vaut plus en aimant à emails.
- **Recap premium** « The Tournament, Illustrated » : **pré-vente dès les 8es** + bundle avec le Wall Chart.
- **Horizon marque (précise D11)** : la marque **VIT après l'été 2026** (pivot envisagé : foot de club / Euro 2028) → justifie d'investir dans un **logo durable** et une identité long terme.
- **3e post quotidien (précise D13)** : nature **flexible selon le jour** (contextuel les jours creux, quiz/engagement les jours de match, evergreen en secours).
- **Site (compléments D10)** : formulaire **custom → API Beehiiv** (clé en env Vercel) ; **domaine à acheter** (scribblepitch.com indispo → `.co` dispo, ou `.ink` — thématiquement parfait) ; **Vercel Analytics** ; v1 = landing **+ archive complète paginée** (périmètre élargi vs la reco "3 covers").

---

## ⚡ PLAN DE SESSIONS — fenêtre "Journée 1" (12 → ~17 juin)

> Objectif : tout ce qui suit est tranché ou livré avant la fin du 1er match de chaque groupe (dernier "match 1" : **17 juin, confirmé**).
> **MAJ 12/06 soir** : S0 bouclée (compte IG ✅, **Beehiiv ✅**, git ✅ → `github.com/Ecureuilenrage/cdm-ig`, clé football-data ✅ en `.env` — compétition `WC` dispo en free tier) ; S1 cast ✅ (Otto/Numa/Vera intégrés) ; S3 stories ✅ (`npm run stories`) ; **assets Beehiiv générés** (logo provisoire tête d'Otto 1024² + thumbnail 1200×630, `brand/assets/out/`). Post du 12 manqué → rattrapage le 13 en double post. Détail d'exécution : `TODO.md`.
> Contrainte transverse : la **routine quotidienne** (carrousel du jour, ~1-2h chaque matin) tourne en parallèle de TOUTES ces sessions. Chaque session est dimensionnée en plus de cette charge.

### S0 — AUJOURD'HUI 12 juin : lancement du compte (bloquant absolu, ~2-3h, surtout côté utilisateur)
- [x] Créer le compte IG `@scribblepitch` (vérifier dispo ; fallbacks : whistleandink, sketchytactics)
- [ ] Avatar **provisoire** = tête du coach (le logo ne bloque PAS le lancement — voir Décision 4)
- [ ] Bio + disclaimer "Not affiliated with FIFA or any federation"
- [x] Ouvrir le compte **Beehiiv** + page d'inscription hébergée → c'est le **link in bio jour 1** (le site Next.js ne bloque pas non plus)
- [ ] **Poster le carrousel J1 entre 15h-17h FR** — il est DANS les temps : matchs du 11 postés le 12 = le rythme prévu par CLAUDE.md. Chaque jour de retard maintenant coûte le pic d'attention de la semaine d'ouverture.
- [ ] Compte football-data.org + clé API ; **vérifier que le tier gratuit couvre la compétition 2026** avant d'investir dans le script
- [ ] `git init` + premier commit (15 min — le projet n'est pas versionné, voir Gap 5)

### S1 — 12-13 juin : trancher le cast (décision utilisateur, débloque 4 chantiers)
- [ ] Valider les 3 personnages + prénoms (casting prêt dans `brand/character/casting/`)
- [ ] Puis : MAJ `poses.js`, `identity.md`, `_schema.md` (mapping rétrocompatible pour ne pas casser 2026-06-11), `CLAUDE.md`
- Débloque : pipeline Stories, covers de highlights, fiches personnages, routine éditoriale "1 accent = 1 personnage"

### S2 — 13-14 juin : script fetch football-data.org → draft `content.json`
- L'investissement le plus rentable de la semaine : économise du temps chaque matin, et l'économie se cumule sur 5 semaines de tournoi.

### S3 — 14-15 juin : pipeline Stories v1 (version légère)
- 1 template statique 1080×1920 (même stack rough.js + Playwright que le carrousel)
- Routine déjà validée : teaser après le post 15-17h → quiz/stat ~17h30 → sondage pronostic 20-22h
- Posting manuel — PAS d'automatisation Graph API à ce stade

### S4 — 15-17 juin : Wall Chart Gumroad (GAP MAJEUR — voir Gap 1)
- [ ] Concevoir le produit lui-même : PDF A2, bracket 48 équipes, mécanique de mise à jour des scores au fil du tournoi
- [ ] Créer la page Gumroad (prix 7-9 $, disclaimer, visuels)
- Deadline dure : vendu "dès la semaine 2" = à partir du ~18 juin. Il doit donc EXISTER cette semaine.

### S5 — 16-17 juin : site Next.js (peut glisser sans casse)
- Landing + capture email + archive. Tant que la page Beehiiv tourne en bio, le site n'est pas bloquant.
- À ne lancer que si S0-S4 sont bouclées. Règle de la charte : "si une journée déborde, sauter le site, jamais le post".

### Hors fenêtre (après le ~17 juin) — ordre suggéré
1. Agent Content Manager (propose l'angle du jour, validation humaine)
2. Logo final + déclinaisons (avatar définitif, favicon)
3. Posts contextuels en version compressée (voir Décision 5)
4. Blog SEO + pages stats
5. Reels Remotion (voir Décision 6)
6. Store merch + générateur d'assets print
7. Posting automatisé Instagram Graph API
8. Segmentation newsletter (seulement si la liste grossit)

---

## 🕳️ GAPS IDENTIFIÉS (absents du backlog jusqu'ici)

1. **Le Wall Chart n'existe pas comme tâche de création.** C'est le seul produit payant du funnel, annoncé "dès semaine 2" (≈ 18 juin), et aucune ligne ne prévoyait de le concevoir. → ajouté en S4.
2. **Link in bio jour 1.** Le funnel suppose un site qui n'existe pas encore. → page Beehiiv hébergée dès S0, le site vient après.
3. **Ouverture du compte Beehiiv.** La fréquence d'envoi est en débat (section 4) mais la création du compte n'était nulle part.
4. **La routine quotidienne est une charge récurrente non budgétée.** Le backlog liste des projets ; le carrousel du jour prend 1-2h chaque matin pendant 5 semaines. Toute planification doit la compter d'office.
5. **Pas de versioning.** Le repo n'est pas un dépôt git : code + 5 semaines de contenu sans historique ni sauvegarde = risque réel. 15 min en S0.
6. **Aucune mesure.** Pas d'item analytics : IG Insights (reach, saves, follows) hebdo, UTM sur le lien bio, taux d'inscription email. Sans données, les débats de fréquence (sections 1 et 4) resteront des opinions. → à caler en semaine 2.
7. **Pas de plan de secours.** Si un matin saute (panne, vie personnelle), rien en réserve. → pré-rendre 1-2 posts evergreen ("Did you know?", section 1c) comme buffer.
8. **Séquence de lancement du compte.** Un compte neuf qui démarre sur un recap sec : prévoir un post épinglé "Meet Scribble Pitch / le concept" dans la semaine (pas forcément avant J1).
9. **football-data.org : couverture de la CDM 2026 sur le tier gratuit à vérifier AVANT d'écrire le script** (S2 en dépend).
10. **Transfermarkt : le scraping viole leurs CGU et casse régulièrement.** Pour ~12 posts, une saisie semi-manuelle des valeurs (copier-coller assisté) est plus simple, plus fiable et sans risque.

---

## 🎯 DÉCISIONS À PRENDRE (avec recommandations)

1. **Stratégie de publication** (section 1) → reco : **Option C allégée**. 1 carrousel vedette/jour + Stories SEULEMENT sur le match vedette (teaser + sondage). Une Story par match est intenable : 4-6 matchs/jour en phase de groupes, en solo.
2. **Fréquence newsletter** (section 4) → reco : **démarrer Option A** (1 envoi/phase, ~8 au total). Passer en bi-hebdo si la liste réagit. L'option C (segments) est une complexité prématurée à 0 abonné — Beehiiv permet de changer plus tard sans douleur.
3. **Cast de personnages** → à valider en S1. C'est LE bloqueur en cascade (Stories, highlights, fiches, schéma).
4. **Logo** → reco : **généré dans la grammaire rough.js** (cohérent, gratuit, déterministe, déclinable). Vectorisation propre seulement quand le merch devient concret. Ne bloque pas le lancement : avatar provisoire = tête du coach.
5. **"Most Expensive XI" ×12** (section 1b) → la fenêtre se referme : ces posts ont leur valeur avant/pendant la J1. Reco : **compresser en 2-3 posts à fort angle** ("Group of Death", "One-team group", "le XI le plus cher du tournoi") posés dans les creux du calendrier, plutôt que 12 posts qui arriveraient après la bataille.
6. **Reels / Remotion** → reco : **geler jusqu'à la phase à élimination directe**, et n'investir que si les carrousels montrent une traction mesurée (saves, follows). Gros coût d'ingénierie, zéro preuve de demande aujourd'hui.
7. **Rotation de la signature (CTA + dernière story)** (ajout 12/06) → reco : **rotation pilotée par le contenu, pas un simple tour de rôle** — le personnage du jour est celui du fait marquant (gros carton → Vera, stat record → Numa, bascule tactique → Otto) ; Otto reste l'avatar et le visage officiel du compte ; le slot invité remplace le personnage du jour les semaines à invité. À acter avant la retouche template (S1bis, 13/06) car ça réécrit la règle "Otto signe la CTA" d'`identity.md`.

---

## 1. Contenu — Stratégie de publication

### Formats à créer
- [ ] **Carrousel Instagram** (en place — J1 livré)
- [ ] **Instagram Stories** — highlights automatisés des grands faits de match (buteurs, cartons, score final) ; format vertical 1080×1920
- [ ] **Instagram Reels** — mini-animations identité visuelle hand-drawn ; stack envisagée : HTML/CSS/JS + **Remotion** (garde toute la grammaire rough.js/coach)
- [ ] **Posts à la une (Highlights Stories)** — sélection des stories à épingler ; réfléchir à la curation : tout ? quelques-unes ? seulement le post carrousel reshared ?

### Fréquence & découpage éditorial
- [ ] **À trancher** : post par jour (1 carrousel highlight + stat-cards) vs post par match (1 carrousel dédié par match)
  - Option A : 1 post highlight/jour + quick-hits → moins de volume, plus de curation
  - Option B : 1 post/match → volume élevé en phase de groupes (3+ matchs/jour)
  - Option C hybride : 1 carrousel vedette/jour + 1 Story par match (format léger)
- [ ] Définir le rythme pour les phases à élimination directe (16e, 8e, QF, SF, finale, 3e place)

### Idées ajoutées le 12/06 au soir
- [ ] **Micro-CTA sur chaque slide** — footer enrichi, validé 12/06 : UNE micro-demande par slide en rotation sur le carrousel (follow → like/save → share/repost → "newsletter, link in bio"), en plus du tagline "one illustrated story every matchday" ; la slide CTA finale garde la demande complète ; rester discret, l'espace blanc prime (règle de la charte)
- [x] **Rotation du personnage signature** — sur la slide CTA et la dernière story : UN personnage par jour (rotation Otto/Numa/Vera) au lieu du trio ou d'Otto fixe ; prévoir un **slot invité** (placeholder) pour accueillir un personnage du vivier casting (ex. Scout en semaine 3)
  - ✅ Décision 7 actée le 12/06 (rotation pilotée par le contenu) — implémenté, docs à jour
- [ ] **Story quotidienne "Did You Know"** (idée 12/06 soir) : une story par jour mêlant 1-2 stats du tournoi en cours (alimentées par `npm run fetch --scorers` : buteurs agrégés, classements) ET des stats historiques du mondial (vivier evergreen — ex. Fontaine 1958, Battle of Nuremberg 2006, déjà produits en posts dans `content/evergreen-0*`) ; sticker quiz ou slider pour l'engagement ; signée par le personnage que la stat concerne → alimente les highlights NUMA/VERA. À caler dans la routine du soir (~17h30, créneau stat/quiz).

---

## 1b. Contenu — Posts contextuels & data-driven (nouvelle pipeline)

Ces posts ne racontent pas un match : ils **racontent un groupe, une équipe, un angle thématique** à partir de données externes (Transfermarkt, classements FIFA, stats historiques). Peuvent être préparés en avance, avant ou pendant le tournoi.

### "Most Expensive XI" par groupe
- [ ] **Template "Most Expensive XI"** — pour chaque groupe (A→L), afficher le 11 le plus cher en cumulant les valeurs Transfermarkt ; mettre en avant le joueur hors-clan (ex : groupe I = tout France sauf Haaland Norvège ; groupe J = tout Argentine sauf Haïd Nouri Algérie + Laimer Autriche)
- [ ] **Source données** : Transfermarkt (scraping ou API non officielle) — valeurs en millions €
- [ ] **Format visuel** : terrain hand-drawn rough.js avec noms + valeurs en annotations, couleur d'accent = nationalité dominante ; coach en bas avec clipboard
- [ ] **Timing** : 1 post/groupe avant ou pendant la phase de groupes (12 posts total, planifiables à l'avance)

### Autres angles contextuels à explorer
- [ ] **"Oldest vs Youngest squad"** par groupe — contraste générationnel
- [ ] **"Most caps combined"** — quel groupe cumule le plus de sélections ?
- [ ] **"One-team group"** — groupes dominés par une nationalité (ex : groupe J Argentine) → angle narratif fort
- [ ] **"Group of Death" breakdown** — analyse des groupes les plus équilibrés vs les plus déséquilibrés
- [ ] **"Players from the same club"** — ex : combien de joueurs du Real Madrid/City/Bayern sont présents ?
- [ ] **"First-timers"** — nations qualifiées pour la 1re fois à une CDM
- [ ] **Portraits de nations** — histoire footballistique courte d'une équipe surprise (Maroc, Panama, etc.)
- [ ] **"What if" tactique** — le XI idéal d'un groupe fictif, le meilleur coach des équipes présentes, etc.

### Pipeline de génération pour ces posts
- [ ] **Script de pré-génération** — récupère les données (Transfermarkt / API FIFA rankings) et génère un draft `content.json` pour chaque post contextuel
- [ ] **Template de slide dédié** (type `group-context`) dans le schéma — distinct du `stat-card` car il affiche un terrain ou un classement visuel
- [ ] **Calendrier éditorial prévisionnel** — planifier ces posts entre les jours de match pour combler les "creux" (jours sans matchs ou journées légères)

---

## 1c. Brainstorming — Angles éditoriaux à explorer

> Section ouverte : toutes les façons dont on peut travailler le projet au fil du tournoi.

### Avant le tournoi / entre les matchs
- Posts contextuels groupes (voir 1b)
- Preview du match vedette du lendemain (teaser cover)
- "Did you know?" — fait historique sur une équipe ou un joueur

### Pendant la phase de groupes
- Carrousel J quotidien (en place)
- Story par match (à automatiser)
- Thread "live annotations" fictif — comme si le coach dessinait en direct (format Stories séquentielles)

### En phase finale
- "Road to the final" — bracket visuel mis à jour à chaque tour
- Comparatifs tête-à-tête avant chaque match éliminatoire
- "Pressure map" — qui a le plus à perdre/gagner ? (angle narratif, pas xG)

### Après le tournoi
- "Wall chart final" — le bracket complet avec tous les scores → produit Gumroad
- "Best XI of the tournament" — sélection éditoriale illustrée
- Rétrospective par groupe : les surprises, les déceptions
- Rapport newsletter de clôture

### Formats à tester
- Carrousel "quiz" — "Devine le score avant de swiper" → engagement fort
- Poll Stories — "Qui va gagner ce soir ?" → collecte d'opinions + visibilité algorithme
- Before/After — prédiction J-1 vs résultat réel (format 2 slides côte à côte)

---

## 2. Automatisation du pipeline

- [ ] **Script fetch football-data.org** — récupération automatique scores + buteurs + minutes + cartons + affluence → alimente le `content.json` en draft
- [ ] **Agent "Content Manager / Brainstormer"** — IA qui propose l'angle éditorial du jour (quel match vedette ? quel hook ?) à partir des données brutes ; relecture humaine avant rendu
- [ ] **Connexion CMS ou MCP** — système de validation/relecture avant publication ; candidats : Sanity, Contentful, Notion (via MCP), ou simple JSON dans un repo versionné
- [ ] **Génération automatique des Stories** — template Stories analogue au pipeline carrousel (rough.js + Playwright, format 1080×1920)
- [ ] **Génération automatique des Reels** — pipeline Remotion : keyframes HTML/Canvas → vidéo MP4 ; garder le seed déterministe par date+match
- [ ] **Posting automatisé** — Instagram Graph API (carrousels, Stories, Reels) avec étape de relecture optionnelle ; le posting manuel reste acceptable à court terme

---

## 3. Site web

### Landing page (prioritaire)
- [ ] **Capture email** — formulaire Beehiiv embedded, CTA clair, A/B test accroche
- [ ] **Archive des carrousels** — galerie des posts passés avec date + match vedette
- [ ] **CTA Gumroad** — "2026 Tournament Wall Chart" (PDF A2, 7-9 $) dès semaine 2

### SEO / Contenu long
- [ ] **Blog / articles** — recaps de matchs, analyses, statistiques ; cibler des requêtes longue-traîne ("World Cup 2026 group stage results", "Morocco vs Portugal highlights", etc.)
- [ ] **Pages stats** — tableaux de groupes, classements, buteurs — données issues de football-data.org
- [ ] **Stack envisagée** : Next.js sur Vercel (déjà mentionné dans les prochaines étapes)

### Merchandising
- [ ] **Logo Scribble Pitch** — à créer (priorité élevée ; identité de marque bloquante pour le merch)
- [ ] **Identité visuelle par personnage** — le coach a la sienne ; les autres personnages en cours dans une conversation parallèle devront chacun avoir une fiche identité (couleur, pose, usage)
- [ ] **Store merch** — impression à la demande (Printful / Printify) avec le logo + motifs issus des visuels générés ; intégrer au site ou lien externe
- [ ] **Générateur d'assets merch** — outil interne pour décliner les visuels rough.js (coach, motifs) en formats print (PNG haute résolution, SVG) adaptés au merch

---

## 4. Newsletter

- [ ] **À trancher** : fréquence d'envoi
  - Option A : 1 newsletter/phase (groupes J1, J2, J3 → 16e → 8e → QF → SF → finale) — ~8 envois total, faible pression
  - Option B : 1 newsletter/jour de match — volume élevé, risque de fatigue abonnés
  - Option C : 2 segments — "Daily digest" (chaque jour) + "Weekly recap" (hebdo) — les abonnés choisissent
- [ ] **Contenu** : recap illustré du jour + teaser du prochain match vedette + lien vers l'archive + CTA produit
- [ ] **Plateforme** : Beehiiv (déjà acté)

---

## 5. Identité visuelle & personnages

- [ ] **Logo Scribble Pitch** — logotype + icône (utilisable en avatar IG, favicon, merch)
- [ ] **Fiche personnage pour chaque character** — nom, couleur signature, poses disponibles, usage éditorial (quel type de contenu ?)
- [ ] **Le coach** — déjà existant et en cours de développement dans une session parallèle
- [ ] **Extension du cast** — autres personnages à définir selon les besoins narratifs

---

## Division des tâches — Proposition

> ⚠️ 2026-06-12 : cette section est remplacée par le « PLAN DE SESSIONS » en tête de fichier (conservée ici pour mémoire — rien n'est supprimé).

### Ce que tu dois faire toi (bloquant pour la suite)
1. **Créer le compte Instagram `@scribblepitch`** et poster le carrousel J1 (11 juin)
2. **Décider du format logo** — rough sketch ou vecteur propre ? (débloque le merch)
3. **Choisir la fréquence newsletter** — option A/B/C (débloque la config Beehiiv)
4. **Choisir la stratégie de publication** — post/jour vs post/match (débloque le pipeline Stories/Reels)
5. **Ouvrir un compte football-data.org** (gratuit) — récupérer une clé API

### Ce qu'on fait ensemble en priorité (J2-J7)
6. **Script fetch football-data.org** → draft `content.json` automatique
7. **Pipeline Stories** (template 1080×1920 + rendu Playwright)
8. **Site Next.js sur Vercel** — landing page + capture email + archive
9. **Agent Content Manager** — propose l'angle éditorial du jour, tu valides
10. **Logo** — génération dans l'identité rough.js + déclinaison favicon/avatar/merch

### À planifier mais pas urgent (après J7)
11. **Pipeline Reels / Remotion** — animations identité visuelle
12. **Blog SEO** — articles recaps + pages stats
13. **Store merch + générateur d'assets print**
14. **Posting automatisé Instagram Graph API**
15. **Segmentation newsletter** (si on part sur l'option C)
16. **Script "Most Expensive XI"** — fetch Transfermarkt + génération des 12 posts groupes
17. **Template `group-context`** dans le schéma de rendu (terrain visuel, classement)
18. **Calendrier éditorial prévisionnel** — planifier les posts contextuels entre les jours de match
