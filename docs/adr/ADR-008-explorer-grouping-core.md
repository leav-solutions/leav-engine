# Explorer grouping engine (core backend)

Date: 30/06/2026

## Status

Proposed

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
- `treeNodeChildren` (`treeApp.ts`) : enfants directs d'un nœud, paginés. **Manque** : le
  compteur cumulé de records par nœud (aujourd'hui = une requête `records(CLASSIFIED_IN)` par
  nœud, soit N round-trips au dépliage).

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
records par groupe) est faite par le consommateur.** Concrètement, trois briques :

1. **Nouveau resolver `recordsGroups`** (énumération d'un niveau de groupes). Il prend
   `library`, `attribute`, `filters`, `searchQuery`, un tri et une pagination **des groupes**, et
   renvoie `{totalCount, list: [GenericDistinctValues!]}`. Il **réutilise l'infra `COLLECT`
   existante** de `listDistinctValues` (et son traitement du bucket nul / JOIN / permissions) — on
   ne touche pas à `listDistinctValues`, qui reste l'API simple consommée ailleurs (pickers de
   filtres). On évite ainsi un breaking change sur son type de retour et on garde deux contrats
   distincts et lisibles.

2. **`records` inchangé** pour fetcher les records d'un groupe : le consommateur ajoute un filtre
   d'égalité cumulé (`{field: attr, condition: EQUAL, value}` pour simple, `{field: "attr.id", …}`
   pour un lien, `{field: attr, condition: CLASSIFIED_IN, value: nodeId, treeId}` pour un arbre,
   `{field: attr, condition: IS_EMPTY}` pour le bucket nul) et pagine avec l'offset/limit existant.
   C'est exactement le « 10 puis voir plus » sans aucun code backend.

3. **Nouveau champ `TreeNode.recordCount`** (compteur cumulé par nœud), **batché par DataLoader**
   sur la durée de la requête, pour que `treeNodeChildren { list { recordCount(...) } }` ramène
   tous les compteurs d'une fratrie en **un seul** round-trip au lieu de N.

Le **multi-niveaux** est obtenu par récursion **côté consommateur** : déplier un groupe de niveau
_n_ rappelle `recordsGroups` sur l'attribut du niveau _n+1_ en cumulant le filtre d'égalité du
parent ; au dernier niveau, on appelle `records`.

### Tri des groupes (v1)

`recordsGroups` trie les groupes **par compteur** (`order: ASC | DESC`, défaut `DESC` =
groupes les plus gros d'abord), le bucket nul toujours **en dernier**. Le tri par
**libellé** des groupes (lien/arbre) est volontairement hors v1 : il exige de résoudre les
`whoAmI` côté serveur ou de les pousser en AQL. C'est explicite (pas de tri implicite par id de
record, qui n'aurait aucun sens pour l'utilisateur). Cf. _Open points_.

## Consequences

- La surface backend nouvelle se réduit à **un resolver** (`recordsGroups`) + **un champ**
  (`TreeNode.recordCount`) + **un paramètre optionnel** (`searchQuery` dans la méthode domaine
  `listDistinctValues`, réutilisée par `recordsGroups`). Tout le reste est de la composition.
- Le fetch des records d'un groupe emprunte le **même chemin** que le mode plat → tri, pagination,
  permissions et recherche sont garantis cohérents, sans code dédié.
- Les deux consommateurs partagent le même backend : le kanban appelle `recordsGroups` une fois
  (1 niveau) ; la table le rappelle à chaque dépliage (N niveaux). Aucun des deux n'impose sa
  stratégie à l'autre.
- **Cohérence recherche/compteurs** : `searchQuery` est plombé jusqu'à `findRecordsHelper`, donc
  les compteurs de groupes respectent une recherche active (incohérence corrigée vs aujourd'hui).
- L'arbre ne nécessite **aucun** nouveau resolver de groupe : il se compose via
  `treeNodeChildren` (structure) + `TreeNode.recordCount` (compteur cumulé) + `records`
  (`CLASSIFIED_IN`).

## Open points

| Sujet | Statut |
| ----- | ------ |
| Matérialisation de **tous** les recordIds dans `listDistinctValues` avant le `COLLECT` (le domaine charge tous les ids filtrés en mémoire puis les passe à l'infra) — limite de scaling sur très grosses libraries. v2 : pousser le filtrage dans l'AQL du `COLLECT`. | Connu, non bloquant v1 |
| Tri/`LIMIT` des groupes poussés dans l'AQL des 3 repos (v1 = tri + slice en mémoire dans le domaine, après le `COLLECT`). | v2 perf |
| Tri des groupes **par libellé** (lien/arbre) — exige résolution `whoAmI` serveur. v1 = tri par compteur uniquement. | v2 |
| Attribut **multivalué** : un record apparaît dans plusieurs groupes ⇒ Σ compteurs ≠ `totalCount`. À cadrer côté UX (message d'info ou restriction aux mono-valués). | À cadrer |
| `TreeNode.recordCount` batché aujourd'hui en N counts parallèles dans la fonction de batch ; un `COLLECT` AQL unique par fratrie serait le vrai gain DB. | v2 perf |

## Sources

- MR 2181 — `docs/explorer-kanban-plan.md` (consommateur kanban)
- MR 2182 — `docs/explorer-group-by.md` (consommateur table)