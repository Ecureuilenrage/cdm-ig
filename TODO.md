# TODO — Scribble Pitch

> Créé le 2026-06-12. Fenêtre critique : la Journée 1 se termine le **17 juin** (confirmé).
> Source de vérité des idées : `BACKLOG.md` (plan de sessions v3). Ce fichier = l'exécution.
> Légende : **[TOI]** = action utilisateur · **[CLAUDE]** = session Claude Code · **[ENSEMBLE]** = les deux.

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
- [ ] **[TOI] Uploader les 2 assets dans Beehiiv** (Settings → logo, favicon/app icon, default thumbnail) — et utiliser le même `logo-1024.png` en avatar IG pour la cohérence
- [ ] ~~Poster le 12 entre 15h-17h~~ **manqué (constaté à 21h)** → rattrapage le 13, voir ci-dessous. Pas grave : le compte vient d'être créé, personne n'attendait.

### 🔴 13 juin — rattrapage J1 + jour 2 (la vraie journée de lancement)

- [ ] **[CLAUDE] Matin : retouches templates** (S1bis ci-dessous) — à faire AVANT le rendu du jour
- [ ] **[CLAUDE] Matin : carrousel + stories des matchs du 12** (routine normale)
- [ ] **[TOI] ~11h-12h : poster le carrousel J1 (matchs du 11)** en post de lancement — option : l'accompagner de la slide cast `brand/character/casting/out/meet-C.png` ("One match. Three verdicts.")
- [ ] **[TOI] 15h-17h : poster le carrousel du 12** (le frais) + routine stories (teaser juste après, quiz ~17h30, sondage 20h-22h)
- [ ] **[TOI] Créer les highlights OTTO / NUMA / VERA / START** et y épingler la meilleure story
- [ ] **[TOI] Beehiiv** si pas fait la veille → lien en bio

### 🟠 13 juin matin (S1bis : retouches templates demandées le 12/06) — [CLAUDE]

- [ ] **Micro-CTA sur chaque slide** (spec validée 12/06) : en plus du tagline "one illustrated story every matchday", chaque slide porte UNE micro-demande dans le footer, **en rotation sur le carrousel** pour couvrir tous les asks sans surcharger : follow → like/save → share/repost → "newsletter, link in bio". La slide CTA finale garde la demande complète (follow + newsletter). Une seule demande par slide, zone footer uniquement.
- [ ] **Rotation du personnage signature** sur la slide CTA et la dernière story : UN personnage par jour (pas le trio, pas Otto fixe) + **slot "invité"** (placeholder) pour les guests du vivier casting (ex. Scout)
  - ⚠️ Conflit doc : `identity.md` dit "Otto signe la CTA chaque jour" → trancher d'abord (reco : rotation pilotée par le contenu du jour, Otto reste l'avatar — voir Décision 7 du BACKLOG)
- [ ] Mettre à jour `identity.md` + `_schema.md` une fois la règle tranchée

### 🟠 13 juin (S1 : cast — ✅ FAIT à 90 %, validé le 12 juin)

- [x] Cast choisi et intégré : **Otto / Numa / Vera** (poses.js, engine.js, CLAUDE.md à jour ; rétrocompatible avec 2026-06-11)
- [ ] **[CLAUDE] Vérifier que `brand/identity.md` et `content/_schema.md` reflètent le cast** (fiches : nom, couleur, poses, usage éditorial)
- [ ] **[ENSEMBLE] Post épinglé "Meet Scribble Pitch"** — présentation du concept + du cast (dans la semaine, pas bloquant pour le quotidien)

### 🟠 13 juin (S2 : script fetch football-data.org — avancé d'un jour, S1/S3 étant faites)

- [ ] **[CLAUDE] Script `scripts/fetch.mjs`** → pré-remplit un draft `content.json` du jour
  - ⚠️ **Limite du free tier** : fixtures, résultats, classements SEULEMENT. Pas de buteurs/minutes/cartons match par match (données payantes). Le script garantit les **scores et le calendrier** ; la **recherche web du matin reste nécessaire** pour le récit (buteurs, minutes, bascule — 2 sources).
  - Clé : `.env` → `FOOTBALL_DATA_KEY` ✅ en place ; header HTTP `X-Auth-Token` ; compétition code `WC`
  - **S'auto-throttler en lisant les headers de réponse** (`X-Requests-Available-Minute`…) — recommandation explicite de football-data, ne pas compter "10/min" à l'aveugle ; cache des réponses dans `data/raw/` (déjà gitignoré)
  - À tester : l'endpoint `/scorers` (top buteurs agrégés) — utilisable pour des stat-cards
- [ ] **[CLAUDE] Buffer de secours** : pré-rendre 1-2 posts evergreen "Did you know?" pour les matins qui sautent

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

1. (Dès S2 : lancer le script fetch → scores garantis)
2. Recherche web des recaps de la veille — **chaque fait vérifié sur 2 sources**, surtout les minutes de buts
3. Choisir l'angle : **UN match vedette** (cover + 2 turning-points) + le reste en stat-cards
4. `content/_template.json` → `content/<date>/content.json` + `caption.txt` (caption + alt-texts)
5. `npm run render -- --date=<date>` — corriger les overflows en RACCOURCISSANT le texte
6. Contrôle visuel des PNG : hook lisible, 1 accent/slide, footer, coach sans collision
7. (Dès S3 : rendre les Stories du jour en même temps)

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
