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
recordsGroups(library, attribute, filters, searchQuery, sort, pagination)   ← NOUVEAU (seule surface backend)
        → { totalCount, list: [{ value, count }] }   (1 niveau de groupes, paginé/trié)

records(library, filters: [...cumulés, <égalité du groupe>], pagination)    ← EXISTANT, inchangé
        → { totalCount, list }   (les records d'un groupe : "10 puis voir plus")
```

> **Axe arbre** : `recordsGroups(library, attributArbre)` renvoie directement les groupes = nœuds
> pointés par l'attribut, avec le compteur **par nœud exact** (via `listDistinctValues`, cf. type
> `TreeDistinctValues`). Le compteur **cumulé** (nœud + descendants) pour l'affichage arborescent est
> calculé **côté front** en sommant les compteurs exacts sur le sous-arbre déplié (le front a la
> structure via `treeNodeChildren`). Voir § _Axe arbre — cumul côté front_ pour le pourquoi (pas de
> champ backend dédié).

## Axes de regroupement éligibles (V1)

Le backend `recordsGroups` est **agnostique du type d'attribut** : il sait énumérer les groupes
de n'importe quel attribut (simple, lien, arbre, date…). **On ne câble aucune restriction de type
dans le core.**

La restriction V1 est **produit/front uniquement** : l'UI n'expose comme **axe de regroupement**
que les attributs dont l'ensemble des groupes est **borné et curé** :

| Axe éligible V1            | Condition                                                | Groupes                                                                                             |
| -------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Arbre**                  | `type === tree`                                          | les nœuds de l'arbre (liste finie et curée par nature)                                              |
| **Liste de valeurs finie** | `values_list.enable === true && allowFreeEntry !== true` | les valeurs prédéfinies de l'attribut (cf. onglet _Liste de valeurs_ de l'admin, `IValuesListConf`) |

> `allowFreeEntry === true` est **exclu** : la saisie libre rendrait l'ensemble des valeurs non
> borné, donc le nombre de groupes non maîtrisé (colonnes Kanban ingérables, compteurs peu
> signifiants). On veut des groupes bornés et pensés métier.

**Pourquoi cette limite ne coûte rien à lever plus tard** : le moteur backend étant déjà générique,
élargir les axes en v2 (dates, labels libres, liens quelconques…) est un changement **front-only** —
on élargit le filtre d'axes éligibles dans l'UI, **aucun rework core, aucune migration**. Cf.
ADR-007 § _Périmètre des axes (V1)_.

## Surface backend (2 briques)

### 1. `recordsGroups` — énumération d'un niveau de groupes

```graphql
type DistinctValuesList {
    totalCount: Int! # nombre total de groupes (avant pagination)
    list: [GenericDistinctValues!]!
}

extend type Query {
    recordsGroups(
        library: ID!
        attribute: ID!
        filters: [RecordFilterInput] # filtres de la vue + filtres d'égalité cumulés des niveaux parents
        searchQuery: String # recherche fulltext (compteurs cohérents avec la recherche active)
        sort: RecordsGroupsSortInput # tri des GROUPES (par compteur en v1)
        pagination: Pagination # pagination des GROUPES (forte cardinalité)
        version: [ValueVersionInput]
    ): DistinctValuesList!
}

input RecordsGroupsSortInput {
    order: SortOrder! # asc | desc ; défaut desc (plus gros groupes d'abord)
}
```

- Réutilise le `GenericDistinctValues` (`Standard`/`Link`/`Tree`) et toute l'infra `COLLECT … WITH
COUNT` de `listDistinctValues` : bucket nul, permissions, labels lien/arbre, libraries JOIN.
- **`listDistinctValues` n'est pas modifié** (reste l'API simple des pickers de filtre).
- Tri par **compteur** uniquement en v1, bucket nul **toujours en dernier** (cf. ADR-007 open points).

#### Contrat des filtres — identique à la query `records` de l'Explorer

`filters` est **exactement** le `[RecordFilterInput]` que l'Explorer V2 passe déjà à `records`
(`ExplorerLibraryData` dans `libs/ui/.../_queries/explorerQuery.graphql`) : un **tableau aplati**
produit par `prepareFiltersForRequest(filters, filtersOperator, valuesList)` — il porte les
conditions **et** les opérateurs logiques (`AND`/`OR`) et les parenthèses (`OPEN_BRACKET` /
`CLOSE_BRACKET`) en entrées du tableau. Pas de paramètre `filtersOperator` séparé : l'opérateur est
déjà aplati dans le tableau. `recordsGroups` réutilisant `findRecordsHelper`, la validation
d'expression (RPN + parenthèses) et toutes les conditions sont gratuites et **identiques** au mode
plat — un même jeu de filtres donne les mêmes records, qu'on les compte par groupe ou qu'on les liste.

> ⚠️ **Composition des filtres cumulés (multi-niveaux)** : on **n'append pas** naïvement le filtre
> d'égalité du parent à un tableau qui contient des `OR`. Il faut **parenthéser** les filtres de la
> vue avant de les `AND`-er avec l'égalité du groupe :
> `[OPEN_BRACKET, …filtres vue…, CLOSE_BRACKET, AND, <égalité du groupe>]`.
> Sinon `[A, OR, B]` + `axisEQ` devient `[A, OR, B, axisEQ]` (faux). Helper à prévoir côté front.

### 2. `records` — fetch des records d'un groupe (inchangé)

Filtre d'égalité cumulé à ajouter aux filtres de la vue, selon le type d'attribut du niveau :

| Type d'attribut | Filtre du groupe                                                                              |
| --------------- | --------------------------------------------------------------------------------------------- |
| simple          | `{field: attr, condition: EQUAL, value}`                                                      |
| lien            | `{field: "attr.id", condition: EQUAL, value: <recordId>}`                                     |
| arbre (nœud)    | `{field: "attr.<libraryDuNœud>.id", condition: EQUAL, value: <record id du nœud>}` (cf. note) |
| bucket nul      | `{field: attr, condition: IS_EMPTY}`                                                          |

> **Axe arbre — filtre confirmé** (vérifié sur l'arbre système `users_groups` / attribut
> `user_groups`). On matche l'attribut arbre par un **chemin à 3 segments** `<attr>.<libraryDuNœud>.id`
> avec `EQUAL` sur le **record id du nœud** :
> `records(users, [{field: "user_groups.users_groups.id", condition: EQUAL, value: "1"}])` → **21**
> (= le compteur d'Administrators de `recordsGroups`). À retenir :
>
> - Le `field` **nu** (`user_groups`) ou à **2 segments** (`user_groups.id`) **ne marche pas** (valeur
>   vide / AQL invalide). Le chemin traverse l'attribut → record du nœud → sous-attribut (`id`,
>   `label`…) ; `id` = record id du nœud (`NODE_RECORD_ID_FIELD`).
> - Segment du milieu = la **library du nœud** (un arbre peut mélanger des libraries → prendre celle
>   du nœud courant, pas une constante). La brique 1 la fournit : `recordsGroups` renvoie
>   `value.record.id` + `value.record.whoAmI.library.id`.
> - `CLASSIFIED_IN` reste **inadapté** ici : il filtre `r._id IN {records du sous-arbre}`
>   (appartenance **propre** du record à l'arbre), sans passer par l'attribut (→ 0).

Pagination = `pagination: {limit, offset}` existante → « charger 10, puis voir plus » = `offset` qui avance.

## Axe arbre — cumul côté front (pas de champ backend dédié)

> **Décision (2026-07-01)** : un champ `TreeNode.recordCount` backend a été **envisagé puis
> abandonné**. Motif ci-dessous. L'axe arbre est entièrement servi par la **brique 1**.

**Ce qui marche** : `recordsGroups(library, attributArbre)` renvoie les groupes = nœuds pointés par
l'attribut, avec le compteur **par nœud exact** (type `TreeDistinctValues { value: TreeNode, count }`).
Vérifié : `recordsGroups(users, user_groups)` → Administrators = 21, Files admins = 6, etc.

**Cumul par nœud** (nœud + descendants, pour l'affichage arborescent) = **calcul front** : le front
possède la structure de l'arbre (`treeNodeChildren`) et les compteurs exacts par nœud
(`recordsGroups`) → il **somme** les compteurs exacts sur le sous-arbre qu'il déplie.

**Pourquoi pas un `recordCount` backend via `CLASSIFIED_IN`** : `CLASSIFIED_IN` compte l'appartenance
**propre** du record à l'arbre (`r._id IN {records du sous-arbre}`), **sans passer par l'attribut** —
il ne compte donc pas une library L regroupée par un attribut arbre pointant vers une liste de
valeurs (renvoie 0, cf. ⚠️ section précédente). Un `recordCount` correct aurait dû réécrire une
logique attribut-aware (expansion du sous-arbre + filtre « attribut ∈ nœuds »), dont le filtre de
base n'est même pas établi — coût/risque élevés pour ce que le cumul front fait déjà.

> ⚠️ **Multivalué** : un attribut arbre peut être multivalué (ex. `user_groups`). Un record dans
> plusieurs nœuds compte dans chacun ⇒ **Σ compteurs ≠ records distincts**, et le cumul front peut
> double-compter un record présent sur un parent **et** un descendant. À cadrer côté UX (cf. ADR-007
> open points).

## Recettes de consommation

### Kanban (1 niveau, eager) — chantier MR 2181

```
1. recordsGroups(library, attribute: axe, filters: <préfiltre>)         → colonnes + compteurs
2. pour chaque colonne :
   records(library, filters: [<préfiltre>, <égalité colonne>], pagination: {limit: 10, offset: 0})   → 10 premières cartes
3. "voir plus" colonne : même requête, offset += 10
```

Axe de type arbre : l'étape 1 reste `recordsGroups(library, attributArbre)` (groupes = nœuds + compteurs **par nœud exact**). Le compteur **cumulé** par nœud est sommé **côté front** sur le sous-arbre (structure via `treeNodeChildren`).

### Table (N niveaux, lazy) — chantier MR 2182

```
1. recordsGroups(library, attribute: niveau1, filters: <vue>)           → en-têtes niveau 1 (lazy)
2. au dépliage d'un groupe G de niveau n :
   - niveau intermédiaire : recordsGroups(library, attribute: niveau(n+1), filters: [<vue>, <égalité de G>])
   - dernier niveau : records(library, filters: [<vue>, <égalité de G>], pagination)   → records + "voir plus"
3. niveau de type arbre : `recordsGroups(library, attributArbre)` → compteurs par nœud exact ; structure via `treeNodeChildren` ; cumul nœud+descendants **sommé côté front**. Fetch des records d'un nœud : `records(library, [{field: "attr.<record.library>.id", condition: EQUAL, value: <record.id>}])` (cf. § Surface backend).
```

## Fichiers (`apps/core`)

- **app** : `src/app/core/valueApp.ts` (`recordsGroups` SDL + resolver, `DistinctValuesList`,
  `RecordsGroupsSortInput`).
- **domain** : `src/domain/value/valueDomain.ts` (méthode `recordsGroups` + `searchQuery` ajouté à
  `listDistinctValues`).
- **infra** : aucun nouveau repo — réutilise `attribute*Repo.listDistinctValues` et `recordRepo.find`.
- **types** : `src/_types/value.ts` (params `recordsGroups`).
- **tests E2E** : `src/__tests__/e2e/api/values/recordsGroups/recordsGroups.test.ts`.

## Tests E2E (cas passants)

- `recordsGroups` simple/lien : compteurs + bucket nul ; `searchQuery` → compteurs cohérents ;
  pagination + tri des groupes ; **invariant** `records(filtre d'égalité du groupe).totalCount ===
count` du groupe.
- Axe arbre : `recordsGroups(library, attributArbre)` → compteurs **par nœud** (type
  `TreeDistinctValues`). Le cumul étant calculé côté front, il n'y a pas de test backend de cumul.
