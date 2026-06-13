# TODO — Scribble Pitch

> Créé le 2026-06-12. Fenêtre critique : la Journée 1 se termine le **17 juin** (confirmé).
> Source de vérité des idées : `BACKLOG.md` (plan de sessions v3). Ce fichier = l'exécution.
> Légende : **[TOI]** = action utilisateur · **[CLAUDE]** = session Claude Code · **[ENSEMBLE]** = les deux.

---

## 🆕 Séquençage révisé 13-18 juin (session brainstorming 13/06 — voir BACKLOG v4)

> Principe (Quinn) : la **routine quotidienne est le tambour** ; les chantiers prennent les créneaux entre les postages ; le **Wall Chart** (revenu, deadline 18/06) prime sur tout le reste ; chaque chantier timeboxé ; **jamais débugger dans la fenêtre de routine**.

### Chantier A — events API-Football (PoC fail-soft) — LE multiplicateur de temps
- [x] **[TOI]** Compte **api-sports.io** créé → clé `API_FOOTBALL_KEY` dans `.env` (plan Free, 100 req/j, 10/min) ✅ (13/06)
- [x] **[CLAUDE]** Étape 0 GO/NO-GO ✅ (13/06, sonde `scripts/apifootball-check.mjs`) → **NO-GO sur le free tier** : la data 2026 existe (league id 1, `coverage.fixtures` events/lineups/stats = true) mais le free la bloque (« Free plans do not have access to this season, try from 2022 to 2024 »). Events WC 2026 = **plan payant requis** (Pro ≈ 19 €/mois, sans reconduction auto). Conforme à D8.
- **[DÉCISION 13/06] Chantier A GELÉ — on reste en MANUEL** (football-data pour les scores + recherche web pour les events ; rapide et fiable au matin n°1). On chronomètre 2-3 matins et on re-décide de payer si le manuel devient un goulot. Les 2 items ci-dessous attendent ce GO.
- [ ] **[CLAUDE]** *(gelé)* Client `scripts/lib/apifootball.mjs` + injection events dans le draft, **FAIL-SOFT**, table d'alias de noms de pays — option pour prendre de l'avance sans payer : pré-construire/valider sur la CDM **2022** (accessible en free)
- [ ] **[ENSEMBLE]** *(gelé)* Chrono de la routine sur 3 matins → verdict : payer+industrialiser A ou rester manuel

### Chantier A′ — DÉGELÉ via ESPN (events gratuits, prouvés le 13/06 soir) → agrégateur + LLM

> Recherche de faisabilité menée le 13/06 (agent + vérif manuelle). **Verdict : GO.** La voie payante n'est pas nécessaire : les events WC 2026 (buteurs **+ minute**, passeurs, buts c.s.c., cartons J/R horodatés, upgrades VAR, remplacements, compos) sont dans le **JSON ESPN gratuit, sans clé** : `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={id}` (champ `keyEvents`, 55 entrées sur USA-Paraguay ; cross-vérifié contre le contenu réel du 12). RSS (BBC) = appoint narratif seulement, pas le socle (résumés tronqués). Détail : voir BACKLOG D8′.
>
> **Architecture cible (fail-soft) :** football-data = ancre scores garantis (déjà câblé) · ESPN = events horodatés · Wikipedia = 2ᵉ source de cross-check (automatise la règle « 2 sources ») · Claude = rédaction du draft dans la voix Otto/Numa/Vera. Anti-hallucination : le LLM ne rédige QUE depuis le tableau d'events ; scores cross-checkés ESPN↔football-data ; si une source tombe → on retombe sur le brief manuel actuel, jamais de blocage. **Légal :** on extrait des FAITS (non protégeables), jamais la prose des articles.
>
> **But :** ramener la routine du matin à ~2 commandes (`brief` qui pré-remplit tout + `render`/`stories`), l'utilisateur ne faisant plus que relire/valider.

- [x] **[CLAUDE] Phase 1 — ESPN events → enrichir le draft (SANS clé, SANS coût, SANS dépendance).** ✅ (13/06 — `scripts/lib/espn.mjs` + `fetch` enrichi : briefing timeline + `facts.json` + draft pré-rempli, prouvé sur USA-Paraguay) `scripts/lib/espn.mjs` : scoreboard `fifa.world?dates=` → eventId ; `summary?event=` → keyEvents. Mapping fixtures football-data ↔ ESPN par (date, équipes) + table d'alias de noms. Pré-remplir `content.draft.json` : turning-points (buteur+minute), stat-cards, **Vera's file auto si cartons**, **Numa's number auto**. Fail-soft. → gros morceau du remplissage manuel levé d'un coup.
- [x] **[CLAUDE] Phase 2 — couche LLM (Claude) — code LIVRÉ (`scripts/lib/llm.mjs` + `fetch --draft`, fail-soft), *s'active avec la clé `ANTHROPIC_API_KEY`*.** `@anthropic-ai/sdk` (Node) ; à partir du tableau d'events, rédige un draft de récit + caption dans la voix de marque, via **structured output** (`output_config.format`, schéma calqué sur `content.json`). Modèles (décision 13/06) : **Opus 4.8** (`claude-opus-4-8`) pour TOUTE la rédaction (prose voix de marque), **Sonnet 4.6** (`claude-sonnet-4-6`) pour l'extraction pure (appoint narratif RSS/web — pas les faits, qui viennent d'ESPN). Défauts câblés dans `llm.mjs`, surchargeables par variable d'env. Coût ~3-5 €/mois au volume d'1 match/jour, même tout en Opus (cf. BACKLOG D8′). Toujours relu avant publication.
- [ ] **[CLAUDE] Phase 3 — Wikipedia REST en 2ᵉ source** : cross-check des minutes de buts (concordance ESPN↔Wiki → confiance haute ; divergence → drapeau « à vérifier »).
- [ ] **[ENSEMBLE] Chrono sur 3 matins** après Phase 1 → décider si Phase 2 vaut le coup ou si l'enrichissement mécanique suffit.

### Wall Chart (D9 — EN VENTE le 18/06)

**Fait le 13/06 :**
- [x] **[CLAUDE]** Échafaudage : `data/wallchart/bracket.json` (structure 12 groupes + KO r32→finale + thirds), `templates/wallchart.html` + `templates/wallchart.css` + `templates/lib/wallchart.js`, `scripts/wallchart.mjs`, script npm `wallchart`
- [x] **[CLAUDE]** Page « groupes » rendue (PNG + PDF A2, modes `blank`/`filled`) : titre + soulignement, 12 groupes encadrés (rough.js) + drapeaux simplifiés + colonnes vides `P W D L Pts`, Otto + Numa, tracker des 8 meilleurs 3es, disclaimer + handle

**Reste à faire :**
- [ ] **[CLAUDE]** Page 2 — **bracket KO** (Round of 32 → R16 → QF → SF → finale + 3e place), layout de l'arbre + liaisons, Vera en gardienne de la discipline
- [ ] **[CLAUDE]** PDF **multi-pages** (groupes + bracket) + export **A4** (impression maison) + PNG 300 dpi dans le ZIP
- [ ] **[CLAUDE]** Mode `filled` : style « rempli au marqueur » (valeurs en accent, coches) + test de bout en bout
- [ ] **[ENSEMBLE]** Brancher les **vraies 48 équipes** (remplacer les données d'exemple de `bracket.json`) via `/standings` football-data ou saisie ; script optionnel `scripts/wallchart-data.mjs`
- [ ] **[CLAUDE]** Mockups page produit Gumroad (cover, vierge vs rempli côte à côte, zoom thirds, in-situ)
- [ ] **[TOI]** Compte Gumroad + page produit **9 $**, titre SANS FIFA/World Cup, disclaimer
- [ ] **[TOI]** Tester le push Gumroad (remplacer le fichier + notifier) avec un achat test

### Site Astro (D10 — peut glisser ; gate le 14/06 à 15h si Wall Chart en bonne voie)
- [ ] **[TOI]** Acheter `scribblepitch.com` (fallback .co/.studio)
- [ ] **[CLAUDE]** Scaffold Astro one-pager : hero = formulaire, galerie auto (`content/*/out/slide-01.png`), footer disclaimer
- [ ] **[DÉCISION]** formulaire embed Beehiiv brut vs custom → endpoint serverless → API Beehiiv
- [ ] **[TOI]** Bascule link in bio avec UTM ; analytics (Vercel Analytics ou Plausible)

### Contenu — cadence 3 posts/jour (D13)
- [x] **[ENSEMBLE]** Spécifier le **post preview quotidien** (gabarit adaptable : 1 gros match en 3 slides + 1 slide/autre match) + définir le **3e slot** ✅ — preview livrée (lead + Numa's Rewind + Otto's Board + cartes) ; 3e slot = buffer evergreen (`npm run buffer`)
- [x] **[CLAUDE]** Gabarit "preview" (slide/post) dans `content/_schema.md` ✅ — type `preview` + `preview.json` + `npm run preview` / `npm run build`

### Identité (D12)
- [ ] **[CLAUDE]** Tagline : finaliser (en cours) → MAJ `identity.md`, bio IG, hero site, slide CTA
- [ ] **[CLAUDE]** `identity.md` : tics verbaux, dynamique du trio, Otto prediction tracker, guests Ola/Scout, gabarit newsletter "the whiteboard room"
- [ ] **[CLAUDE]** Logo : glyphe « tableau + flèche-qui-tourne » (rough.js) + wordmark ; avatar reste la tête d'Otto

---

## ✅ Déjà fait (pour situer)

- [x] Pipeline de rendu opérationnel (`npm run render`), déterministe
- [x] Carrousel J1 (matchs du 11 juin) rendu et vérifié — 6 slides + caption
- [x] Compte football-data.org créé (free tier : 12 compétitions, fixtures/résultats/classements, 10 appels/min)
- [x] Git initialisé + push vers `github.com/Ecureuilenrage/cdm-ig` (12 juin)
- [x] **Cast VALIDÉ et intégré : Otto (orange, tacticien) / Numa (bleu, chrono/stats) / Vera (jaune→rouge, discipline)** — `poses.js` réécrit, règle "accent = personnage" dans le moteur, contenu du 11 juin re-rendu OK
- [x] Pipeline Stories opérationnel : `npm run stories -- --date=...` (`templates/story.html` + `scripts/stories.mjs`), les 3 Stories du 11 juin sont rendues (`content/2026-06-11/out/story-0*.png`)
- [x] Routine quotidienne enrichie dans `CLAUDE.md` : carrousel + 3-4 stories + highlights par prénom

---

## 1. À FAIRE — de A à Z (ordre d'exécution)

### 🔴 12 juin (S0 : lancement) — bilan du soir

- [x] **Compte IG créé, arrobase obtenu** ✅ (12/06)
- [x] Clé API football-data dans `.env` (gitignoré, header `X-Auth-Token`) — **compétition `WC` (FIFA World Cup) confirmée dans le free tier** ✅
- [x] **[TOI] Ouvrir Beehiiv** : créer la publication + activer la page d'inscription hébergée → **c'est le link in bio jour 1** (dernier compte manquant)
- [x] **Assets Beehiiv générés** (12/06 soir) : `brand/assets/out/logo-1024.png` (carré, tête d'Otto — logo de publication + favicon + mobile app icon) et `brand/assets/out/thumbnail-1200x630.png` (default thumbnail / og-image). Sources `brand/assets/logo.html` + `thumb.html`, re-rendables via `npm run shoot`. Logo provisoire : le logotype final reste un item post-J1.
- [x] **[TOI] Uploader les 2 assets dans Beehiiv** (Settings → logo, favicon/app icon, default thumbnail) — et utiliser le même `logo-1024.png` en avatar IG pour la cohérence
- [x] ~~Poster le 12 entre 15h-17h~~ manqué → **rattrapé le 12 au soir : post "Meet Scribble Pitch" publié** (mini-carrousel 5 slides, `brand/meet/out/`). Le compte démarre sur la présentation du cast ; les carrousels de matchs partent le 13.
- [ ] **[TOI] Ce soir, une seule action restante : reshare du post Meet en story** (reshare natif IG, pas de visuel à rendre) — puis **épingler le post Meet** en haut du profil si pas déjà fait. Les stories rendues du J1 teasent "today's post" → elles partent le 13 avec le carrousel, pas ce soir.

### 🔴 13 juin — double post : carrousel J1 (matchs du 11) + jour 2 (matchs du 12)

- [x] **[CLAUDE] Matin : retouches templates** (S1bis ci-dessous) — ✅ faites le 12 au soir, rien à refaire
- [x] **[CLAUDE] Matin : carrousel + stories des matchs du 12** ✅ (13/06) — vedette **USA 4-1 Paraguay** (doublé Balogun, 1er doublé US depuis 1930) + stat-card Canada 1-1 Bosnie ; signature **Numa** ; **4 stories** : 01 teaser Otto, 02 Vera poll, 03 Numa 1930 (ovale retravaillé + correction `.mega`), 04 Otto's Board prono **Brésil-Maroc** (Maroc 2-1 Brésil 2023, vérifié). Template sticker = texte seul (sans cadre) pour recouvrir avec le vrai sticker.
- [x] **[TOI] ~11h-12h : poster le carrousel J1 (matchs du 11)** ✅ posté le 13 (+ story-01 teaser du 11) — **prêt tel quel** : re-rendu le 12 au soir avec les nouveaux footers micro-CTA, slide CTA re-teasée "Day 2 — Canada and the USA's openers — drops this afternoon." Story teaser J1 (`story-01.png`) juste après le post.
- [ ] **[TOI] 15h-17h : poster le carrousel du 12** (le frais) + routine stories (teaser juste après, quiz ~17h30, sondage 20h-22h)
- [ ] **[TOI] Créer les highlights OTTO / NUMA / VERA / START** et y épingler la meilleure story (le reshare du post Meet a sa place dans START) — **covers prêtes** dans `brand/highlights/out/` (otto/numa/vera/start). Rappel : un highlight a besoin d'≥1 story dedans ; curer (le meilleur par perso), pas tout ranger.
- [ ] **[TOI] Beehiiv** si pas fait la veille → lien en bio

### 🟠 13 juin matin (S1bis : retouches templates demandées le 12/06) — ✅ FAIT le 12/06 au soir

- [x] **Micro-CTA sur chaque slide** : footer 3 zones (`@scribblepitch` | micro-ask centrée | `N/M`), rotation par index de slide : "follow for the next one" → "save this for later" → "share it with a fan" → "newsletter → link in bio". La slide CTA garde la demande complète (box Follow + ligne "newsletter → link in bio" automatiques) et n'a pas de micro-ask au footer. Carrousel 2026-06-11 re-rendu et vérifié.
- [x] **Rotation du personnage signature** — **Décision 7 ACTÉE (12/06) : rotation pilotée par le contenu** (gros carton → Vera, stat/record → Numa, bascule tactique → Otto ; Otto reste l'avatar). Sur la CTA, l'`accent` désigne le signataire ; la dernière story porte le même personnage. **Slot invité** : `character: "guest"` → silhouette en pointillés (poses.js), accent explicite requis ; le vrai rig viendra du vivier casting le moment venu.
- [x] `identity.md` + `_schema.md` + `CLAUDE.md` mis à jour avec la règle

### 🟠 13 juin (S1 : cast — ✅ FAIT à 90 %, validé le 12 juin)

- [x] Cast choisi et intégré : **Otto / Numa / Vera** (poses.js, engine.js, CLAUDE.md à jour ; rétrocompatible avec 2026-06-11)
- [x] **[CLAUDE] Vérifier que `brand/identity.md` et `content/_schema.md` reflètent le cast** ✅ (12/06 : fiches nom/couleur/spécialité/voix dans identity.md, poses/expressions/mood + mapping accent→personnage dans _schema.md ; règle de signature et slot guest ajoutés des deux côtés)
- [x] **[ENSEMBLE] Post épinglé "Meet Scribble Pitch"** — partie [CLAUDE] ✅ FAITE (12/06 soir) : mini-carrousel 5 slides rendu dans `brand/meet/out/meet-01..05.png` (cover trio "One match. Three verdicts." → fiche Otto → Numa → Vera, avec rituel encadré + réplique → CTA complète) + `brand/meet/caption.txt` (caption + alt-texts). Source re-rendable : `brand/meet/meet.html?slide=N` via `npm run shoot`. **Posté le 12/06 au soir ✅ — reste : l'épingler en haut du profil + reshare en story.**

### 🟠 13 juin (S2 : script fetch football-data.org — script ✅ FAIT le 12/06 au soir)

- [x] **[CLAUDE] Script `scripts/fetch.mjs`** (`npm run fetch -- [--date=YYYY-MM-DD] [--scorers]`) ✅ testé sur les matchs réels du 11/06 :
  - Briefing console (résultats du jour + fixtures du lendemain) + draft `content/<date>/content.json` pré-rempli (cover avec le match le plus prolifique, stat-cards des autres scores, teaser "Tomorrow:", squelette stories) — **n'écrase jamais** un content.json existant (écrit `content.draft.json` à côté)
  - Auto-throttling par lecture des headers (`X-Requests-Available-Minute`, `X-RequestCounter-Reset`, retry sur 429) + cache 10 min dans `data/raw/`
  - **Jour éditorial** : un coup d'envoi est rattaché au jour J si `utcDate - 8h` tombe le J (les matchs du soir US/MX débordent sur J+1 en UTC — vérifié : Korea–Czechia 02:00 UTC le 12 → rattaché au 11)
  - `/scorers` testé ✅ : **fonctionne en free tier** (buts + passes agrégés tournoi) — exploitable pour des stat-cards
- [x] **[CLAUDE] Buffer de secours** ✅ (12/06 soir) : 2 posts evergreen "Did you know?" rendus et prêts à poster (faits vérifiés multi-sources, captions + alt-texts inclus) :
  - `content/evergreen-01/` — **Fontaine 1958** : 13 buts en 6 matchs, record intouché (Müller 10 en 1970), chaussures empruntées — signé Numa (bleu)
  - `content/evergreen-02/` — **Battle of Nuremberg 2006** : 20 cartons (16 J + 4 R, record), Ivanov, Portugal 1–0 Maniche 23e — signé Vera (rouge, carton rouge)
  - `npm run render -- --date=evergreen-0N` (la validation `--date` accepte désormais les noms de dossier) ; pas de "World Cup" sur les visuels (règle légale respectée)

### 🟡 14-15 juin (S3 : Stories — ✅ pipeline FAIT, reste tes actions)

- [x] Template 1080×1920 + `npm run stories -- --date=...` opérationnel, routine intégrée à CLAUDE.md
- [ ] **[TOI] Valider la routine Stories sur un jour réel** (stickers sondage/quiz posés à la main dans l'app)
- [ ] **[TOI] Créer les highlights OTTO / NUMA / VERA / START** (covers aux prénoms, ≤ 10 caractères)

### 🟡 14-16 juin (S4 : Wall Chart Gumroad — deadline dure : en vente le 18 juin)

- [ ] **[ENSEMBLE] Concevoir le produit** : PDF A2, bracket 48 équipes, grammaire rough.js, mécanique de mise à jour des scores au fil du tournoi (l'acheteur reçoit les mises à jour)
- [ ] **[TOI] Compte Gumroad** + page produit (7-9 $, disclaimer, titre SANS "FIFA"/"World Cup")
- [ ] **[CLAUDE] Visuels de la page produit** (mockups depuis le pipeline)

### 🟢 16-17 juin (S5 : site — peut glisser sans casse)

- [ ] **[CLAUDE] Site Next.js sur Vercel** : landing + embed Beehiiv + archive des carrousels
- [ ] **[TOI] Basculer le link in bio** Beehiiv → site, avec UTM pour mesurer
- Règle : ne lancer S5 que si S0-S4 sont bouclées. "Si une journée déborde : sauter le site, jamais le post."

### ⚪ Après le 17 juin (post-J1, ordre suggéré)

1. [ ] **18 juin : premier envoi newsletter** "Matchday 1 recap" (option A = 1 envoi/phase) — brancher le CTA wall chart
2. [ ] Rituel analytics hebdo (voir Récurrent) — décider Reels/merch sur données, pas au feeling
3. [ ] Agent Content Manager (propose l'angle du jour, tu valides)
4. [ ] Logo final généré en rough.js + favicon/avatar définitif
5. [ ] 2-3 posts contextuels compressés ("Group of Death", "One-team group", "XI le plus cher du tournoi") — valeurs Transfermarkt saisies à la main, PAS de scraping
6. [ ] Blog SEO + pages stats (football-data : classements OK en free tier)
7. [ ] Reels/Remotion — **gelé jusqu'à la phase à élimination directe**, conditionné à une traction mesurée
8. [ ] Store merch + générateur d'assets print (débloqué par le logo)
9. [ ] Posting automatisé Graph API · segmentation newsletter (si la liste grossit)

---

## 2. RÉCURRENT — la routine

### Chaque matin de match (~1-2h) — [CLAUDE] avec ta relecture

1. `npm run fetch -- --date=<date>` → briefing + draft content.json (scores garantis)
2. Recherche web des recaps de la veille — **chaque fait vérifié sur 2 sources**, surtout les minutes de buts
3. Choisir l'angle : **UN match vedette** (cover + 2 turning-points) + le reste en stat-cards, et le **personnage signature du jour** (carton → Vera, record → Numa, tactique → Otto) pour la CTA + dernière story
4. Compléter le draft + `caption.txt` (caption + alt-texts)
5. `npm run render -- --date=<date>` — corriger les overflows en RACCOURCISSANT le texte
6. Contrôle visuel des PNG : hook lisible, 1 accent/slide, footer (handle · micro-ask · N/M), personnage sans collision
7. Rendre les Stories du jour en même temps (`npm run stories`)

### Chaque après-midi/soir (~20 min) — [TOI]

- **15h-17h FR : poster le carrousel** (créneau matin US/Canada/Mexique)
- Juste après le post : **Story teaser** (reshare ou visuel dédié)
- **~17h30 : Story quiz/stat**
- **20h-22h : Story sondage pronostic** sur le match vedette du lendemain
- **Répondre aux commentaires/DM dans la première heure** après le post (signal algorithme)
- Fin de journée : `git add -A ; git commit -m "content <date>" ; git push`

### Chaque semaine (ex. lundi, ~30 min) — [ENSEMBLE]

- IG Insights : reach, saves, partages, nouveaux abonnés **par post** → noter les 3 meilleurs hooks
- Clics du link in bio + inscriptions email de la semaine (taux de conversion)
- Revue `BACKLOG.md` + ce fichier : cocher, repriorisier, élaguer
- Vérifier que le buffer evergreen contient ≥ 1 post prêt

### À chaque fin de phase

- Envoi newsletter (fin J1 ≈ 18/6 → fin J2 → fin J3 → 16es → 8es → QF → SF → finale)
- Mise à jour du wall chart + push de la nouvelle version aux acheteurs Gumroad

---

## 3. ROUTE VERS 100 % DU BACKLOG

Le principe : **chaque session livre soit du temps gagné, soit un débloqueur, soit une donnée de décision.** Le backlog se vide dans cet ordre-là, pas section par section.

| Section backlog | État | Prochaine action | Condition pour aller plus loin |
|---|---|---|---|
| 1. Stratégie publication | Décision prise (C allégée) | Exécuter la routine | Revoir à la J2 avec les Insights |
| 1b. Posts contextuels | Compressé à 2-3 posts | Saisie manuelle des valeurs | Créneaux libres entre 18 et 27/6 |
| 1c. Angles éditoriaux | Réservoir d'idées | Piocher pour le buffer evergreen | — (jamais "fini", c'est un vivier) |
| 2. Automatisation | Script fetch en S2 | Stories S3, agent post-J1 | Graph API seulement si le manuel devient le goulot |
| 3. Site web | Beehiiv fait office de bio | S5 si S0-S4 bouclées | Blog/SEO après le site, merch après le logo |
| 4. Newsletter | Option A actée | 1er envoi le 18 juin | Bi-hebdo si taux d'ouverture > ~40 % |
| 5. Identité | Cast en S1 | Logo post-J1 | Merch quand logo + 1ers chiffres de traction |

**Les trois multiplicateurs** (à protéger en priorité, ils accélèrent tout le reste) :
1. **Script fetch (S2)** — rend du temps chaque matin pendant 5 semaines
2. **Cast validé (S1)** — débloque Stories, highlights, fiches, schéma
3. **Rituel analytics hebdo** — transforme les débats (Reels ? merch ? fréquence ?) en décisions chiffrées

**Seuils de déclenchement suggérés** (à ajuster avec les vraies données) :
- Reels : > 500 abonnés OU un carrousel > 50 saves → on prototype Remotion
- Merch : logo fait ET > 1 000 abonnés OU demandes répétées en DM
- Posting automatisé : seulement si la routine manuelle dépasse 30 min/jour côté [TOI]

**Lignes de coupe si une semaine déborde** (dans l'ordre du sacrifice) :
blog/SEO → site → stories du soir → posts contextuels → **jamais le carrousel quotidien, jamais la newsletter de phase**
