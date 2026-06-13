# Scribble Pitch — charte

**Concept** : du storytelling de match illustré façon tableau blanc hand-drawn. On ne montre pas des dashboards de stats, on raconte LE moment où le match a basculé.

## Voix

- Anglais. Phrases courtes. Présent narratif ("Krejci strikes", pas "Krejci struck a goal that…").
- Ton : l'analyste passionné qui dessine au tableau — précis sur les faits, expressif sur l'émotion.
- Jamais de jargon xG/opta-speak sur les slides : les chiffres qu'on montre sont compréhensibles par tous (minutes, buts, cartons, affluence).
- Le hook de cover répond à "pourquoi je m'arrête de scroller ?" — une tension, pas un résumé.
- **Tagline** : « One illustrated story. Every matchday. » — ligne d'offre/rituel, garde sa place sur la slide CTA et le thumbnail. **Ligne longue de positionnement** (bio IG, hero du site, À propos) : *« Hand-drawn stories from every matchday — the moment the game flipped, told on a whiteboard by Otto, Numa & Vera. »* [confirmé 13/06]

## Le cast — 3 analystes, 1 couleur chacun

**L'accent de la slide désigne le personnage.** C'est la règle éditoriale centrale : choisir la couleur, c'est choisir qui parle.

| | Personnage | Couleur | Spécialité | Voix |
|---|---|---|---|---|
| **OTTO** | le coach (humain, cap + marqueur) | orange | le tacticien : comment le match bascule | précis, dessine tout, sûr de son tableau |
| **NUMA** | le chronomètre | bleu | les nombres : records, affluences, séries | factuel, fact-checke tout le monde ("under protest") |
| **VERA** | le carton sur pattes | rouge | la discipline : cartons, VAR, effondrements | sévère en façade, adore secrètement le chaos |

- **Signature du jour** (slide CTA + dernière story) : **rotation pilotée par le contenu** — le personnage du fait marquant du jour signe (gros carton → Vera, stat/record → Numa, bascule tactique → Otto). Otto reste **l'avatar et le visage officiel** du compte. Les semaines à invité, un **slot guest** (`character: "guest"`, silhouette en pointillés) remplace le personnage du jour — vivier : `brand/character/casting/` (ex. Scout). [Décision 7, actée le 12/06]
- Le carton de Vera est **jaune** au repos et **vire au rouge** quand le match dérape (expression `angry`, pose `dejected`, ou `mood` explicite). Le jaune #EAB308 est une couleur de personnage, **jamais un accent de slide**.
- Rituels : *Otto's Board* (la prédiction), *Numa's Number* (UN chiffre par jour), *Vera's File* (la note de discipline en lettre). L'absence d'un personnage se joue en gag ("Day off for Vera.").
- **Tics verbaux** (un par tête, à répéter jusqu'à l'usure) : Otto « Trust the board. » (surtout quand le tableau a tort) · Numa « …under protest. » · Vera « Filed. » [13/06]
- **Dynamique du trio** : Numa fact-checke Otto en note de bas de page ; Vera ouvre un dossier sur quiconque exagère (Otto inclus) ; Otto efface le tableau quand on le contredit. **Une pique inter-personnages max par carrousel.** [13/06]
- **Otto's Board = compteur public** : chaque prédiction est tenue (« X right, Y wrong, never in doubt »). Otto a toujours tort avec panache — c'est sa faille et son charme ; alimenté par le format Before/After. [Décision 12, 13/06]
- **Guests du vivier** (`brand/character/casting/`) : Ola (le supporter — la ferveur, jours d'upset/qualification), Scout (les pépites — phase à élimination directe). Le slot pointillé (`character: "guest"`) se teaser en story la veille (« someone new is joining the board »). [13/06]
- Source de vérité visuelle : `brand/character/poses.js` (`analyst({character, pose, expression, mood})`), planche : `brand/character/preview.html`.

## Visuel

- Fond `--paper` #FDFDFB, traits `--ink` #1A1A1A, 3 accents sémantiques :
  - **rouge** #E5484D = erreur / danger / carton / friction
  - **orange** #F76B15 = mouvement / transition / remontada
  - **bleu** #2563EB = stat / preuve / score / état
  - (+ **jaune** #EAB308 réservé au corps du carton de Vera)
- **Une slide = UNE couleur d'accent.** Jamais les trois à parts égales.
- Typo : Shantell Sans (titres), Patrick Hand (corps), Caveat (annotations manuscrites).
- Beaucoup d'espace blanc. Si une slide semble pleine, couper du texte, pas réduire la police.
- **Footer & micro-CTA** (spec 12/06) : chaque slide porte `@scribblepitch` | **UNE micro-demande en rotation** (follow for the next one → save this for later → share it with a fan → newsletter → link in bio) | pagination `N / M`. **Une seule demande par slide, zone footer uniquement.** La slide CTA finale porte la demande complète dans son corps (box Follow + ligne newsletter) — son footer n'a pas de micro-ask.

## Règles légales (NON NÉGOCIABLES)

- ❌ "FIFA", "World Cup", trophée, emblème, mascottes officielles : jamais dans le nom du compte, le domaine, les visuels, ou le titre d'un produit payant. (Usage descriptif en caption/hashtag : toléré, rester sobre.)
- ❌ Écussons de fédérations, reproductions fidèles de maillots, photos.
- ❌ Caricatures ressemblantes de joueurs dans les produits payants (right of publicity US). Sur les slides : noms en texte = fait journalistique, OK ; silhouettes génériques seulement.
- ✅ Drapeaux simplifiés, noms d'équipes en texte, scores, faits de match.
- Disclaimer site/produits : "Not affiliated with FIFA or any federation."

## Funnel

Instagram (@scribblepitch) → link in bio → site (archive + email Beehiiv) → Gumroad ("2026 Tournament Wall Chart").
L'actif réel est la liste email, pas le compte. Si une journée déborde : sauter le site, jamais le post.

### Stories & highlights (le 2e pilier)

- 3-4 stories/jour max, zone utile **1080×1420 centrée** (250 px réservés à l'UI IG en haut ET en bas), stickers interactifs dans le tiers central-bas.
- Rythme : teaser **juste après** le post (15h-17h FR) → stat express ou quiz (~17h30) → sondage de pronostic (20h-22h FR) → hot take signé 2-3×/semaine.
- Un highlight par prénom : **OTTO · NUMA · VERA** (+ "START") — titres ≤ 10 caractères. On y épingle la meilleure story du jour, le reste expire à 24h. Ne pas multiplier les highlights : Instagram les déplace dans un onglet dédié depuis fin 2025.
