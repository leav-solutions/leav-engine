# Explorer grouping engine (core backend)

Date: 30/06/2026

## Status

Proposed

> **Révision 2026-07-01** — La brique `TreeNode.recordCount` (initialement prévue) est **abandonnée**
> après vérification empirique : `CLASSIFIED_IN` compte l'appartenance propre du record à l'arbre
> (`r._id IN {sous-arbre}`) et **ne passe pas par un attribut arbre**. L'axe arbre est donc servi par
> la brique 1 (`recordsGroups`) + un **cumul côté front**. Surface backend V1 = **`recordsGroups`
> seul**. Voir _Decision_ § « option écartée » et _Consequences_.

## Context

Deux chantiers Explorer V2 convergent vers un même besoin — le **regroupement** des records par
valeur d'attribut — mais avec des contraintes différentes :

- **Kanban générique** (MR 2181) : **un seul niveau** de regroupement (l'axe = les colonnes),
  chargement **eager** du niveau 1, puis quelques records par colonne (« 10 puis voir plus »).
- **Regroupement de table** (MR 2182) : **N niveaux** imbriqués, chargement **lazy** (on déplie
  un groupe pour charger le sous-niveau ou les records), regroupement par arbre déroulé en
  hiérarchie.

Les deux ont en commun : les groupes et leurs compteurs doivent venir du **serveur** (un
regroupement purement client est incompatible avec la pagination offset — un groupe serait coupé
arbitrairement entre deux pages), et **chaque groupe doit pouvoir être paginé** (un groupe peut
être trop gros pour être chargé d'un coup).

Le core fournit déjà trois primitives pertinentes :

- `listDistinctValues` (`valueDomain.ts` / `valueApp.ts`) : énumère les valeurs distinctes d'un
  attribut avec compteur (`COLLECT … WITH COUNT`), gère le bucket nul, les permissions et les
  labels lien/arbre. **Manque** : recherche fulltext, tri/pagination des groupes ; renvoie un
  tableau nu (`[GenericDistinctValues!]`).
- `records` (`recordApp.ts`) : recherche paginée (offset + cursor), tri, `searchQuery` fulltext,
  `withCount`, filtres `EQUAL`/`IS_EMPTY`/`CLASSIFIED_IN`. **Complète** pour fetcher les records
  d'un groupe via un filtre d'égalité — aucun manque.
- `treeNodeChildren` (`treeApp.ts`) : enfants directs d'un nœud, paginés — fournit la **structure**
  de l'arbre au front. Les compteurs par nœud viennent de `recordsGroups` (cf. Decision), le cumul
  est sommé côté front.

Il faut décider **quelle surface backend** offrir pour servir les deux consommateurs sans dupliquer
la machinerie ni sur-concevoir.

## Options

1. **Regroupement côté client**
    - Pros : zéro backend.
    - Cons : incompatible avec la pagination offset (groupe coupé entre deux pages), compteurs
      faux dès qu'un filtre/recherche est actif. **Éliminé d'office** (décision produit verrouillée).

2. **Resolver récursif côté serveur** — un seul appel rend l'arbre de groupes complet (N niveaux),
   records inclus.
    - Pros : un seul round-trip pour tout.
    - Cons : doit gérer à la fois l'eager mono-niveau (kanban) et le lazy multi-niveaux (table)
      dans le même resolver ; re-implémente la pagination/tri/permissions déjà parfaites de
      `records` ; surface large, difficile à tester et à lire.

3. **Moteur d'énumération de groupes _mono-niveau_ + composition par le consommateur** (retenu).
    - Pros : surface backend minimale, contrat focalisé ; réutilise `records` tel quel pour les
      records d'un groupe (pagination/tri/permissions/recherche gratuits et identiques au mode
      plat) ; sert eager-1-niveau **et** lazy-N-niveaux sans récursion serveur.
    - Cons : le multi-niveaux demande N appels (un par dépliage) — acceptable car lazy par nature.

## Decision

**On expose un moteur d'énumération de groupes mono-niveau, et la composition (multi-niveaux +
records par groupe + hiérarchie d'arbre) est faite par le consommateur.** Concrètement, **deux
briques** :

1. **Nouveau resolver `recordsGroups`** (énumération d'un niveau de groupes). Il prend
   `library`, `attribute`, `filters`, `searchQuery`, un tri et une pagination **des groupes**, et
   renvoie `{totalCount, list: [GenericDistinctValues!]}`. Il **réutilise l'infra `COLLECT`
   existante** de `listDistinctValues` (bucket nul / JOIN / permissions / labels lien/arbre) — on
   ne touche pas à `listDistinctValues`, qui reste l'API simple consommée ailleurs (pickers de
   filtres). Pour un **attribut arbre**, il renvoie les groupes = nœuds pointés + compteur **par
   nœud exact** (`TreeDistinctValues`).

2. **`records` inchangé** pour fetcher les records d'un groupe : le consommateur ajoute un filtre
   d'égalité cumulé — `{field: attr, condition: EQUAL, value}` (simple), `{field: "attr.id", …}`
   (lien), `{field: attr, condition: IS_EMPTY}` (bucket nul) — et pagine avec l'offset/limit
   existant. C'est exactement le « 10 puis voir plus » sans aucun code backend.

Le **multi-niveaux** est obtenu par récursion **côté consommateur** : déplier un groupe de niveau
_n_ rappelle `recordsGroups` sur l'attribut du niveau _n+1_ en cumulant le filtre d'égalité du
parent ; au dernier niveau, on appelle `records`.

L'**axe arbre** (regroupement par attribut arbre → liste de valeurs) est servi **entièrement par la
brique 1** : `recordsGroups(library, attributArbre)` donne les compteurs **par nœud**, et le **cumul
par nœud** (nœud + descendants) est **calculé côté front** en sommant sur le sous-arbre déplié (le
front a la structure via `treeNodeChildren`).

### Option écartée : un champ `TreeNode.recordCount` backend

Initialement, une 3ᵉ brique était prévue : `TreeNode.recordCount(library, attribute, filters)`,
batché DataLoader, donnant le compteur cumulé par nœud via `records(CLASSIFIED_IN)`. **Écartée après
vérification empirique** (arbre système `users_groups` / attribut `user_groups`) :

- `records(users, [{field: user_groups, condition: CLASSIFIED_IN, treeId: users_groups, value: <node>}])`
  renvoie **0** — `CLASSIFIED_IN` filtre `r._id IN {records du sous-arbre}` (appartenance **propre**
  du record à l'arbre) et **ignore l'attribut**. Il ne convient donc que si les records de la
  library **sont eux-mêmes les nœuds** (fichiers/dossiers, arbre auto-référencé), pas pour un
  attribut arbre pointant vers une liste de valeurs — le cas réel (AMONT-1102).
- `recordsGroups(users, user_groups)` compte pourtant correctement par nœud (Administrators = 21).
  Le mécanisme de comptage par nœud d'attribut arbre **existe déjà** (brique 1).
- Un `recordCount` correct aurait exigé une logique attribut-aware (expansion du sous-arbre + filtre
  « attribut ∈ nœuds »), dont même le filtre d'égalité de base sur un nœud d'attribut arbre n'est pas
  établi (`EQUAL value: <nodeId>` renvoie 0 sur ce jeu de données). Coût/risque élevés pour un cumul
  que le front fait déjà en sommant les compteurs exacts de la brique 1.

### Périmètre des axes (V1)

Le regroupement **n'est pas réservé aux arbres** : le moteur `recordsGroups` groupe par
**n'importe quel attribut** (simple, lien, arbre, date…). On refuse de câbler une restriction de
type dans le core.

La question soulevée en revue — « on pourrait grouper par label, date, ou n'importe quel attribut,
faut-il limiter, et est-ce coûteux de changer après ? » — se tranche **au niveau produit/front, pas
backend**. En V1, l'UI n'expose comme **axe** que les attributs à ensemble de groupes **borné et
curé** :

- attributs de type **arbre** (les groupes = les nœuds) ;
- attributs portant une **liste de valeurs finie stricte** :
  `values_list.enable === true && allowFreeEntry !== true` (cf. `IValuesListConf`,
  `apps/core/src/_types/attribute.ts`).

`allowFreeEntry === true` est exclu : la saisie hors liste rend l'ensemble des valeurs non borné.

**Coût de levée nul côté core** (répond directement à la préoccupation de revue) : le backend étant
déjà agnostique, élargir les axes en v2 (dates, labels libres, liens quelconques) est un changement
**front-only** — on relâche le filtre d'axes éligibles dans l'UI, sans toucher au core ni migrer
quoi que ce soit. Limiter maintenant n'engage donc **aucune dette backend**.

### Tri des groupes (v1)

`recordsGroups` trie les groupes **par compteur** (`order: ASC | DESC`, défaut `DESC` =
groupes les plus gros d'abord), le bucket nul toujours **en dernier**. Le tri par
**libellé** des groupes (lien/arbre) est volontairement hors v1 : il exige de résoudre les
`whoAmI` côté serveur ou de les pousser en AQL. C'est explicite (pas de tri implicite par id de
record, qui n'aurait aucun sens pour l'utilisateur). Cf. _Open points_.

## Consequences

- La surface backend nouvelle se réduit à **un resolver** (`recordsGroups`) + **un paramètre
  optionnel** (`searchQuery` dans la méthode domaine `listDistinctValues`, réutilisée par
  `recordsGroups`). Tout le reste est de la composition.
- Le fetch des records d'un groupe emprunte le **même chemin** que le mode plat → tri, pagination,
  permissions et recherche sont garantis cohérents, sans code dédié.
- Les deux consommateurs partagent le même backend : le kanban appelle `recordsGroups` une fois
  (1 niveau) ; la table le rappelle à chaque dépliage (N niveaux). Aucun des deux n'impose sa
  stratégie à l'autre.
- **Cohérence recherche/compteurs** : `searchQuery` est plombé jusqu'à `findRecordsHelper`, donc
  les compteurs de groupes respectent une recherche active (incohérence corrigée vs aujourd'hui).
- L'arbre ne nécessite **aucun** nouveau champ backend : compteurs **par nœud** via `recordsGroups`,
  **structure** via `treeNodeChildren`, **cumul** (nœud + descendants) sommé **côté front**. Point
  ouvert : le filtre exact pour fetcher les records d'un nœud d'attribut arbre reste à déterminer
  (ni `CLASSIFIED_IN` ni `EQUAL <nodeId>` ne matchent — cf. § option écartée).

## Open points

| Sujet                                                                                                                                                                                                                                                                        | Statut                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Matérialisation de **tous** les recordIds dans `listDistinctValues` avant le `COLLECT` (le domaine charge tous les ids filtrés en mémoire puis les passe à l'infra) — limite de scaling sur très grosses libraries. v2 : pousser le filtrage dans l'AQL du `COLLECT`.        | Connu, non bloquant v1 |
| Tri/`LIMIT` des groupes poussés dans l'AQL des 3 repos (v1 = tri + slice en mémoire dans le domaine, après le `COLLECT`).                                                                                                                                                    | v2 perf                |
| Tri des groupes **par libellé** (lien/arbre) — exige résolution `whoAmI` serveur. v1 = tri par compteur uniquement.                                                                                                                                                          | v2                     |
| Attribut **multivalué** : un record apparaît dans plusieurs groupes ⇒ Σ compteurs ≠ `totalCount`. À cadrer côté UX (message d'info ou restriction aux mono-valués).                                                                                                          | À cadrer               |
| **Fetch des records d'un nœud d'attribut arbre** : le filtre d'égalité exact reste à déterminer (`CLASSIFIED_IN` compte l'appartenance propre du record, `EQUAL <nodeId>` renvoie 0 sur `users_groups`). Bloquant pour le « voir les records » d'un groupe arbre côté front. | À creuser (front)      |
| **Cumul front sur attribut multivalué** : sommer les compteurs exacts d'un nœud + descendants peut double-compter un record présent sur un parent **et** un descendant (ou dans plusieurs groupes). À cadrer côté UX.                                                        | À cadrer               |

## Sources

- MR 2181 — `docs/explorer-kanban-plan.md` (consommateur kanban)
- MR 2182 — `docs/explorer-group-by.md` (consommateur table)
