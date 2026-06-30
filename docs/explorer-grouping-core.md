# Regroupement de l'Explorer — brique backend `core`

> Doc de référence du **backend partagé** consommé par les deux chantiers Explorer V2 :
> le **Kanban générique** (MR 2181, 1 niveau eager) et le **regroupement de table** (MR 2182,
> N niveaux lazy + arbres). Décision d'architecture : [ADR-008](adr/ADR-008-explorer-grouping-core.md).
>
> **Périmètre de cette livraison : `apps/core` uniquement, testé en E2E.** Aucun code front.
> La persistance du regroupement sur la vue V2 (`groupBy`) est **hors périmètre** (turfu).

## Principe

Le backend offre un **moteur d'énumération de groupes mono-niveau**. Tout le reste
(multi-niveaux, records par groupe, hiérarchie d'arbre) est de la **composition** côté
consommateur à partir de primitives existantes. Voir ADR-007 pour le pourquoi.

```
recordsGroups(library, attribute, filters, searchQuery, sort, pagination)   ← NOUVEAU
        → { totalCount, list: [{ value, count }] }   (1 niveau de groupes, paginé/trié)

records(library, filters: [...cumulés, <égalité du groupe>], pagination)    ← EXISTANT, inchangé
        → { totalCount, list }   (les records d'un groupe : "10 puis voir plus")

treeNodeChildren(treeId, node) { list { id recordCount(library, attribute, filters) } }  ← recordCount NOUVEAU
        → enfants directs + compteur cumulé par nœud, en 1 round-trip (batché)
```

## Surface backend (3 briques)

### 1. `recordsGroups` — énumération d'un niveau de groupes

```graphql
type DistinctValuesList {
    totalCount: Int!          # nombre total de groupes (avant pagination)
    list: [GenericDistinctValues!]!
}

extend type Query {
    recordsGroups(
        library: ID!
        attribute: ID!
        filters: [RecordFilterInput]     # filtres de la vue + filtres d'égalité cumulés des niveaux parents
        searchQuery: String              # recherche fulltext (compteurs cohérents avec la recherche active)
        sort: RecordsGroupsSortInput     # tri des GROUPES (par compteur en v1)
        pagination: Pagination           # pagination des GROUPES (forte cardinalité)
        version: [ValueVersionInput]
    ): DistinctValuesList!
}

input RecordsGroupsSortInput {
    order: SortOrder!   # asc | desc ; défaut desc (plus gros groupes d'abord)
}
```

- Réutilise le `GenericDistinctValues` (`Standard`/`Link`/`Tree`) et toute l'infra `COLLECT … WITH
  COUNT` de `listDistinctValues` : bucket nul, permissions, labels lien/arbre, libraries JOIN.
- **`listDistinctValues` n'est pas modifié** (reste l'API simple des pickers de filtre).
- Tri par **compteur** uniquement en v1, bucket nul **toujours en dernier** (cf. ADR-007 open points).

### 2. `records` — fetch des records d'un groupe (inchangé)

Filtre d'égalité cumulé à ajouter aux filtres de la vue, selon le type d'attribut du niveau :

| Type d'attribut | Filtre du groupe |
| --------------- | ---------------- |
| simple | `{field: attr, condition: EQUAL, value}` |
| lien | `{field: "attr.id", condition: EQUAL, value: <recordId>}` |
| arbre (nœud + sous-arbre) | `{field: attr, condition: CLASSIFIED_IN, value: <nodeId>, treeId}` |
| bucket nul | `{field: attr, condition: IS_EMPTY}` |

Pagination = `pagination: {limit, offset}` existante → « charger 10, puis voir plus » = `offset` qui avance.

### 3. `TreeNode.recordCount` — compteur cumulé par nœud (batché)

```graphql
type TreeNode {
    # …
    recordCount(library: ID!, attribute: ID!, filters: [RecordFilterInput]): Int
}
```

- Compte les records de `library` dont l'attribut arbre `attribute` est **classé dans ce nœud ou
  ses descendants** (`CLASSIFIED_IN`), en cumulant les `filters` fournis.
- **Batché par DataLoader** sur la durée de la requête : `treeNodeChildren { list { recordCount } }`
  ramène tous les compteurs d'une fratrie en **un seul** round-trip (au lieu de N requêtes `records`).
- Bucket « SANS CATÉGORIE » (records sur le nœud exact, hors enfants) = `count(nœud) − Σ count(enfants)`.

## Recettes de consommation

### Kanban (1 niveau, eager) — chantier MR 2181

```
1. recordsGroups(library, attribute: axe, filters: <préfiltre>)         → colonnes + compteurs
2. pour chaque colonne :
   records(library, filters: [<préfiltre>, <égalité colonne>], pagination: {limit: 10, offset: 0})   → 10 premières cartes
3. "voir plus" colonne : même requête, offset += 10
```

Axe de type arbre : remplacer l'étape 1 par `treeNodeChildren(tree, root) { list { id recordCount(library, attribute) } }`.

### Table (N niveaux, lazy) — chantier MR 2182

```
1. recordsGroups(library, attribute: niveau1, filters: <vue>)           → en-têtes niveau 1 (lazy)
2. au dépliage d'un groupe G de niveau n :
   - niveau intermédiaire : recordsGroups(library, attribute: niveau(n+1), filters: [<vue>, <égalité de G>])
   - dernier niveau : records(library, filters: [<vue>, <égalité de G>], pagination)   → records + "voir plus"
3. niveau de type arbre : treeNodeChildren + recordCount (lazy par nœud), records via CLASSIFIED_IN
```

## Fichiers (`apps/core`)

- **app** : `src/app/core/valueApp.ts` (`recordsGroups` SDL + resolver, `DistinctValuesList`,
  `RecordsGroupsSortInput`) ; `src/app/core/treeApp/treeApp.ts` (`TreeNode.recordCount` SDL + resolver).
- **domain** : `src/domain/value/valueDomain.ts` (méthode `recordsGroups` + `searchQuery` ajouté à
  `listDistinctValues`) ; `src/domain/tree/treeDomain.ts` (helper de comptage si nécessaire).
- **infra** : aucun nouveau repo — réutilise `attribute*Repo.listDistinctValues` et `recordRepo.find`.
- **types** : `src/_types/value.ts` (params `recordsGroups`).
- **tests E2E** : `src/__tests__/e2e/api/values/recordsGroups.test.ts`,
  `src/__tests__/e2e/api/trees/treeNodeRecordCount.test.ts`.

## Tests E2E (cas passants)

- `recordsGroups` simple/lien : compteurs + bucket nul ; `searchQuery` → compteurs cohérents ;
  pagination + tri des groupes ; **invariant** `records(filtre d'égalité du groupe).totalCount ===
  count` du groupe.
- `TreeNode.recordCount` : compteur cumulé (nœud + descendants) ; **invariant** `count(parent) ===
  Σ count(enfants) + bucket SANS CATÉGORIE`.
