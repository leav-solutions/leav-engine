# Explorer grouping engine (core backend)

Date: 30/06/2026

## Status

Accepted

> **Révision 2026-07-30** — Simplification décisive après revue (MR 2327). La brique
> `recordsGroups` initialement prévue (nouveau resolver = wrapper tri/pagination/`{totalCount, list}`
> autour de `listDistinctValues`) est **abandonnée** : tri et pagination des groupes ne sont **pas
> nécessaires** pour le kanban V1, et le reste n'était qu'un ré-emballage. **Le regroupement passe
> directement par `listDistinctValues`, inchangé** (même nom, même type de retour
> `[GenericDistinctValues!]`). Surface backend nouvelle pour le regroupement = **néant côté query** ;
> seul le **modèle de vue** gagne un type `KANBAN` et un marqueur `isGroupBy`. Cf. _Decision_.
>
> **Révision 2026-07-01** — La brique `TreeNode.recordCount` (initialement prévue) est **abandonnée**
> après vérification empirique : `CLASSIFIED_IN` compte l'appartenance propre du record à l'arbre
> (`r._id IN {sous-arbre}`) et **ne passe pas par un attribut arbre**. L'axe arbre est donc servi par
> `listDistinctValues` (compteur **par nœud exact**) + un **cumul côté front**.

## Context

Deux chantiers Explorer V2 convergent vers un même besoin — le **regroupement** des records par
valeur d'attribut — mais avec des contraintes différentes :

- **Kanban générique** : **un seul niveau** de regroupement (l'axe = les colonnes), chargement
  **eager** du niveau 1, puis quelques records par colonne (« 10 puis voir plus »).
- **Regroupement de table** (à venir) : **N niveaux** imbriqués, chargement **lazy** (on déplie un
  groupe pour charger le sous-niveau ou les records), regroupement par arbre déroulé en hiérarchie.

Les deux ont en commun : les groupes et leurs compteurs doivent venir du **serveur** (un
regroupement purement client est incompatible avec la pagination offset — un groupe serait coupé
arbitrairement entre deux pages).

Le core fournit déjà les primitives nécessaires :

- `listDistinctValues` (`valueDomain.ts` / `valueApp.ts`) : énumère les valeurs distinctes d'un
  attribut avec compteur (`COLLECT … WITH COUNT`), gère le bucket nul, les permissions et les
  labels lien/arbre. Renvoie `[GenericDistinctValues!]` (`Standard`/`Link`/`Tree`).
- `records` (`recordApp.ts`) : recherche paginée (offset + cursor), tri, `searchQuery` fulltext,
  `withCount`, filtres `EQUAL`/`IS_EMPTY`/`CLASSIFIED_IN`. **Complète** pour fetcher les records
  d'un groupe via un filtre d'égalité — aucun manque.
- `treeNodeChildren` (`treeApp.ts`) : enfants directs d'un nœud, paginés — fournit la **structure**
  de l'arbre au front (le cumul par nœud est sommé côté front, cf. Decision).

Il faut décider **quelle surface backend** offrir pour servir les deux consommateurs sans dupliquer
la machinerie ni sur-concevoir.

## Options

1. **Regroupement côté client** — Pros : zéro backend. Cons : incompatible pagination offset
   (groupe coupé entre deux pages), compteurs faux dès qu'un filtre/recherche est actif.
   **Éliminé d'office** (décision produit verrouillée).

2. **Resolver récursif côté serveur** — un seul appel rend l'arbre de groupes complet, records
   inclus. Pros : un seul round-trip. Cons : doit gérer eager-mono-niveau **et** lazy-multi-niveaux
   dans le même resolver, re-implémente pagination/tri/permissions déjà parfaites de `records`,
   surface large et difficile à tester.

3. **Réutiliser `listDistinctValues` tel quel + composition par le consommateur** (retenu).
   Pros : **zéro nouvelle surface** ; réutilise `records` tel quel pour les records d'un groupe
   (pagination/tri/permissions/recherche gratuits et identiques au mode plat) ; sert
   eager-1-niveau **et** lazy-N-niveaux sans récursion serveur. Cons : le multi-niveaux demande N
   appels (un par dépliage) — acceptable car lazy par nature.

4. **Nouveau resolver `recordsGroups`** (envisagé puis écarté, MR 2327) — wrapper de
   `listDistinctValues` ajoutant tri + pagination des groupes + enveloppe `{totalCount, list}`.
   Écarté : tri et pagination des groupes ne sont **pas requis** par le kanban V1 (cardinalité de
   groupes modeste sur des axes bornés, cf. _Périmètre des axes_) ; sans eux il ne restait qu'un
   ré-emballage du type de retour, i.e. **deux méthodes faisant presque la même chose** — exactement
   ce qu'on veut éviter pour rationaliser l'API.

## Decision

**Le regroupement passe directement par `listDistinctValues`, inchangé, et la composition
(multi-niveaux + records par groupe + hiérarchie d'arbre) est faite par le consommateur.**

1. **`listDistinctValues` inchangé** — même nom, même type de retour `[GenericDistinctValues!]`.
   Il énumère un niveau de groupes `{value, count}` (bucket nul inclus, permissions, labels
   lien/arbre, libraries JOIN). Pour un **attribut arbre**, les groupes = nœuds pointés + compteur
   **par nœud exact** (`TreeDistinctValues`). Aucun ajout de tri, de pagination, ni de wrapper.

2. **`records` inchangé** pour fetcher les records d'un groupe : le consommateur ajoute un filtre
   d'égalité cumulé et pagine avec l'offset/limit existant. C'est le « 10 puis voir plus » sans
   aucun code backend.

3. **Modèle de vue V2** — seuls ajouts backend, **additifs et rétro-compatibles** :
    - `ViewV2Types.KANBAN` (nouveau type de vue) ;
    - `IViewV2DisplayAttribute.isGroupBy?` (marqueur générique, display-mode-agnostic, désignant
      l'attribut porteur de l'axe de regroupement — colonnes kanban, regroupement de table… ; au
      plus un attribut par vue). Exposé en GraphQL (`ViewV2DisplayAttribute` + input) et validé zod.

Le **multi-niveaux** (table) est obtenu par récursion **côté consommateur** : déplier un groupe de
niveau _n_ rappelle `listDistinctValues` sur l'attribut du niveau _n+1_ en cumulant le filtre
d'égalité du parent ; au dernier niveau, on appelle `records`.

L'**axe arbre** est servi **entièrement par `listDistinctValues`** (compteurs **par nœud**), le
**cumul par nœud** (nœud + descendants) étant **calculé côté front** en sommant sur le sous-arbre
déplié (structure via `treeNodeChildren`).

### Fetch des records d'un groupe (via `records`, inchangé)

Filtre d'égalité cumulé à ajouter aux filtres de la vue, selon le type d'attribut du niveau :

| Type d'attribut | Filtre du groupe                                                                              |
| --------------- | --------------------------------------------------------------------------------------------- |
| simple          | `{field: attr, condition: EQUAL, value}`                                                      |
| lien            | `{field: "attr.id", condition: EQUAL, value: <recordId>}`                                     |
| arbre (nœud)    | `{field: "attr.<libraryDuNœud>.id", condition: EQUAL, value: <record id du nœud>}` (cf. note) |
| bucket nul      | `{field: attr, condition: IS_EMPTY}`                                                          |

> **Axe arbre — filtre confirmé** (vérifié sur l'arbre système `users_groups` / attribut
> `user_groups`). Chemin à **3 segments** `<attr>.<libraryDuNœud>.id` avec `EQUAL` sur le **record
> id du nœud** : `records(users, [{field: "user_groups.users_groups.id", condition: EQUAL, value: "1"}])`
> → **21** (= le compteur d'Administrators de `listDistinctValues`). Le `field` nu ou à 2 segments
> ne matche pas. La library du milieu = celle du nœud (un arbre peut mélanger des libraries — prendre
> celle du nœud courant) ; `listDistinctValues` la fournit via `value.record.whoAmI.library.id`.
> `CLASSIFIED_IN` reste **inadapté** ici (appartenance propre du record à l'arbre → 0).

### Option écartée : un champ `TreeNode.recordCount` backend

Initialement, une brique `TreeNode.recordCount(library, attribute, filters)` batchée DataLoader,
donnant le compteur cumulé par nœud via `records(CLASSIFIED_IN)`, était prévue. **Écartée après
vérification empirique** (arbre système `users_groups` / attribut `user_groups`) :

- `records(users, [{field: user_groups, condition: CLASSIFIED_IN, treeId: users_groups, value: <node>}])`
  renvoie **0** — `CLASSIFIED_IN` filtre `r._id IN {records du sous-arbre}` (appartenance **propre**
  du record à l'arbre) et **ignore l'attribut**. Il ne convient donc que si les records de la
  library **sont eux-mêmes les nœuds** (fichiers/dossiers, arbre auto-référencé), pas pour un
  attribut arbre pointant vers une liste de valeurs — le cas réel.
- `listDistinctValues(users, user_groups)` compte pourtant correctement par nœud (Administrators = 21).
  Le mécanisme de comptage par nœud d'attribut arbre **existe déjà**.
- Coût/risque élevés pour un cumul que le front fait déjà en sommant les compteurs exacts.

### Périmètre des axes (V1)

Le regroupement **n'est pas réservé aux arbres** : `listDistinctValues` groupe par **n'importe quel
attribut** (simple, lien, arbre, date…). On refuse de câbler une restriction de type dans le core.

En V1, l'UI n'expose comme **axe** que les attributs à ensemble de groupes **borné et curé** :

- attributs de type **arbre** (les groupes = les nœuds) ;
- attributs portant une **liste de valeurs finie stricte** :
  `values_list.enable === true && allowFreeEntry !== true` (cf. `IValuesListConf`,
  `apps/core/src/_types/attribute.ts`). `allowFreeEntry === true` est exclu (valeurs non bornées).

**Coût de levée nul côté core** : le backend étant déjà agnostique, élargir les axes en v2 (dates,
labels libres, liens quelconques) est un changement **front-only** — aucune dette backend.

## Consequences

- **Aucune** nouvelle surface de query pour le regroupement : `listDistinctValues` et `records`
  sont réutilisés tels quels. Tout le reste est de la composition côté consommateur.
- Le fetch des records d'un groupe emprunte le **même chemin** que le mode plat → tri, pagination,
  permissions et recherche sont garantis cohérents, sans code dédié.
- Les deux consommateurs partagent le même backend : le kanban appelle `listDistinctValues` une
  fois (1 niveau) ; la table le rappelle à chaque dépliage (N niveaux).
- L'arbre ne nécessite **aucun** nouveau champ backend : compteurs **par nœud** via
  `listDistinctValues`, **structure** via `treeNodeChildren`, **cumul** sommé **côté front**.
- **Limite V1 assumée — colonnes/valeurs vides.** `listDistinctValues` n'énumère que les valeurs
  **présentes dans au moins un record** (`COLLECT` sur l'existant). Une valeur d'une liste fermée —
  ou un nœud d'arbre — **sans aucun record** ne produit **aucun groupe** ; pour un kanban à colonnes
  fixes, les colonnes vides sont **complétées côté front** (arbre : `treeNodeChildren` ; liste
  fermée : les valeurs de `values_list`).
- **Cohérence recherche/compteurs (limite connue)** : la query GraphQL `listDistinctValues`
  n'expose pas `searchQuery`, donc les compteurs de groupes ignorent une recherche active. Le
  domaine `listDistinctValues` accepte déjà `options.fulltextSearch` — exposer l'arg côté query sera
  un ajout **additif** (input arg, sans changement de type de retour) le jour où un consommateur en
  aura besoin. Hors périmètre de la livraison actuelle.

## Open points

| Sujet                                                                                                                                                                                                                                                                 | Statut                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Matérialisation de **tous** les recordIds dans `listDistinctValues` avant le `COLLECT` (le domaine charge tous les ids filtrés en mémoire puis les passe à l'infra) — limite de scaling sur très grosses libraries. v2 : pousser le filtrage dans l'AQL du `COLLECT`. | Connu, non bloquant v1 |
| `searchQuery` sur la **query** `listDistinctValues` (le domaine le supporte déjà) — à exposer si un consommateur veut des compteurs cohérents avec une recherche active. Additif.                                                                                     | v2 si besoin           |
| Tri / pagination des **groupes** — non requis en V1 (axes bornés). À réintroduire uniquement si un axe à forte cardinalité est ouvert.                                                                                                                                | v2 si besoin           |
| Attribut **multivalué** : un record apparaît dans plusieurs groupes ⇒ Σ compteurs ≠ `totalCount` ; le cumul front d'un nœud + descendants peut double-compter. À cadrer côté UX.                                                                                      | À cadrer               |

## Sources

- `docs/explorer-kanban-plan.md` (consommateur kanban)
