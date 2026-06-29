# Regroupement ("Regroupement") dans l'Explorer V2 + Vues V2

## Contexte

On travaille sur les **Vues V2** et l'**Explorer V2**. Aujourd'hui une vue V2 décrit
l'affichage (`display`), les `filters` et les `sorts` ; l'Explorer rend les records dans une
table plate (`KitTable`, `dataSource: IItemData[]`, pagination offset manuelle).

On veut introduire le **regroupement** : permettre à l'utilisateur de choisir, dans un nouvel
onglet du volet de paramétrage de la vue, un ou plusieurs attributs de **regroupement**, et que
l'Explorer affiche alors les données regroupées par valeur — chaque groupe étant une ligne
d'en-tête repliable (pleine largeur) affichant le libellé du groupe + un compteur de records,
les records se chargeant au dépliage.

### Décisions produit (verrouillées avec l'utilisateur)

1. **Pilotage serveur obligatoire** — un regroupement purement client n'a pas de sens avec la
   pagination offset (un groupe serait coupé arbitrairement entre deux pages). Les groupes et
   leurs compteurs viennent du serveur.
2. **Types d'attributs groupables (v1)** : **simples + liens + arbres**.
3. **Rendu** : en-tête de groupe **pleine largeur (colSpan)**, **repliable**, avec **compteur**
   de records par groupe.
4. **Multi-niveaux** : **multi-attributs imbriqués** — `groupBy` est une **liste ordonnée**
   d'attributs ; chaque attribut = un niveau d'imbrication (ex. grouper par Statut **puis** par
   Fournisseur).
5. **Attribut arbre = hiérarchie dépliée** — quand un niveau de regroupement est un attribut de
   type **arbre**, on déroule **toute la hiérarchie de nœuds** (ancêtres → enfants) avec
   **compteurs cumulés** (cf. maquette : Fraîcheur & Hydratation › GT1-Liquides › SODAS sont les
   nœuds d'un même arbre). Un bucket « SANS CATÉGORIE » regroupe les records rattachés à un nœud
   sans sous-nœud (ou sans valeur).

## Architecture retenue

**Regrouper = énumérer les groupes côté serveur (valeur + compteur), rendre chaque groupe comme
une ligne d'en-tête synthétique repliable, et charger en lazy les records (ou le sous-niveau) au
dépliage.** Moteur récursif « lazy-expand » :

- **Énumération des groupes** d'un niveau : `listDistinctValues(library, attribute, recordFilters,
searchQuery)` → renvoie déjà `{value, count}` + bucket nul + permissions + labels lien/arbre.
  Couvre nativement simple / lien / arbre (`Standard/Link/TreeDistinctValues`).
- **Récursion multi-attributs** : déplier un groupe de niveau _n_ relance `listDistinctValues` sur
  l'attribut du niveau _n+1_, en **cumulant les filtres d'égalité** des parents. Au dernier
  niveau, on charge les **records** via la query `records` existante (filtres cumulés + tri de la
  vue + pagination intra-groupe).
- **Niveau de type arbre** : exception au modèle plat — au lieu de `listDistinctValues`, on
  déroule la hiérarchie de nœuds via `treeNodeChildren` (enfants directs, lazy) + comptage
  `CLASSIFIED_IN` de la query `records`. Compteurs cumulés sur les ancêtres (détail § Couche 3.c).

Le **fetch des records dans un groupe ne nécessite aucun changement backend** (query `records`
existante + filtre d'égalité sur la valeur du groupe). Les seuls ajouts backend concernent le
**modèle de vue** (champ `groupBy`) et **deux extensions de `listDistinctValues`** (recherche
fulltext + pagination/tri des groupes), plus le **comptage par nœud d'arbre**.

## Découpage en phases (recommandé)

La feature est large ; livrer en 2 phases dé-risque et valide la machinerie commune d'abord.

- **Phase 1 — Simples + liens (multi-attributs, sans arbre)** : modèle `groupBy`, onglet
  Regroupement, moteur récursif `listDistinctValues` + records par groupe, rendu synthetic-rows +
  colSpan + repli/lazy, extensions backend `searchQuery` + pagination des groupes. Couvre déjà le
  « grouper par Statut puis Fournisseur ».
- **Phase 2 — Arbres** : dépliage de la hiérarchie de nœuds avec compteurs cumulés. Réutilise
  toute la machinerie de la Phase 1 + des queries **déjà existantes** (`treeNodeChildren` +
  `records`/`CLASSIFIED_IN`) → **essentiellement du front**, sans nouveau resolver backend.

## Couche 1 — Modèle de données : le champ `groupBy`

Modèle = **liste ordonnée** (multi-attributs), chaque entrée calquée sur `IViewV2Sort` mais sans
`pinned` (le regroupement n'a pas de notion d'épinglage) :

```ts
interface IViewV2GroupBy {
    attributes: string[]; // chemin de descente (ex. ['categorie'] ou ['fournisseur','pays'])
    order: SortOrder;     // tri du listing des groupes (asc/desc)
}
// dans IViewV2UserFields :
groupBy?: IViewV2GroupBy[] | null;
```

Fichiers (backend, apps/core) :

- [apps/core/src/\_types/viewsV2.ts](apps/core/src/_types/viewsV2.ts) — `IViewV2GroupBy` + `groupBy?: IViewV2GroupBy[] | null` dans `IViewV2UserFields` (calquer sur `IViewV2Sort`).
- [apps/core/src/domain/viewV2/viewV2ZodSchema.ts](apps/core/src/domain/viewV2/viewV2ZodSchema.ts) — `viewV2GroupBySchema` (calquer sur `viewV2SortSchema`) + champ dans `viewV2UserFieldsSchema` (update reste `.partial()`).
- [apps/core/src/app/core/viewV2App.ts](apps/core/src/app/core/viewV2App.ts) — `type ViewV2GroupBy {attributes: [Attribute!]!, order: SortOrder!}` + `input ViewV2GroupByInput {attributes: [ID!]!, order: SortOrder!}` ; ajouter `groupBy: [ViewV2GroupBy!]` à `ViewV2` et `groupBy: [ViewV2GroupByInput!]` aux inputs create/update ; ajouter un **field resolver** `ViewV2GroupBy.attributes` qui hydrate les IDs en `Attribute` (calquer sur le resolver `ViewV2Sort.attributes`). La persistance est automatique (le domaine `viewV2Domain` spread les user fields — à vérifier qu'il ne whiteliste pas les champs).

Fichiers (store frontend, app-studio — `.../panel-view-settings/store-current-view/`) :

- [\_types.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/_types.ts) — type `CurrentViewGroupBy` (dérivé de `GetViewV2Query`) ; actions `SET_GROUP_BY` / `MOVE_GROUP_BY` (réordonner) / `SET_GROUP_BY_ORDER` / `TOGGLE_GROUP_BY` (ajout/retrait d'un attribut).
- [currentViewReducer.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/currentViewReducer.ts) — gérer ces actions ; `createDefaultView` initialise `groupBy: []`.
- [useCurrentView.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/useCurrentView.ts) — sélecteur `groupBy` + dispatchers ; **ajouter `groupBy` au `displayFingerprint`** (sinon une modif de regroupement ne marque pas la vue dirty).
- [viewV2Fragment.graphql](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/viewV2Fragment.graphql) — `groupBy { attributes { id label } order }`.
- [viewV2ToSerializedView.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/viewV2ToSerializedView.ts) — `groupBy: (view.groupBy ?? []).map(g => ({field: g.attributes.map(a => a.id).join('.'), order: g.order}))` (même format `.`-joint que `sort`).

Fichier (contrat partagé, libs/ui) :

- [libs/ui/src/components/ExplorerV2/\_types.ts](libs/ui/src/components/ExplorerV2/_types.ts) — ajouter à `SerializedView` : `groupBy?: Array<{field: string; order: SortOrder}>`.

> Régénérer le codegen GraphQL (apps/core SDK e2e + app-studio + libs/ui) après modif des `.graphql`/SDL.

## Couche 2 — Onglet « Regroupement » du volet

L'ajout d'un 5ᵉ onglet est typé `keyof` de bout en bout (le compilateur force la complétude) :

- [libs/ui/src/constants.ts](libs/ui/src/constants.ts) — ajouter `{key: 'regroupement', icon: faLayerGroup}` à `VIEW_SETTINGS_TABS`.
- [libs/ui/src/hooks/usePanelMessenger/schema.ts](libs/ui/src/hooks/usePanelMessenger/schema.ts) — ajouter `z.literal('regroupement')` à `ViewSettingsTabSchema` (élargit `ViewSettingsTab` + `ViewSettingsShortcuts`).
- [tabs/\_constantes.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/tabs/_constantes.ts) — `regroupement: 'view_settings.tab.regroupement'` dans `LABEL_KEY_BY_TAB`.
- [PanelViewSettings.tsx](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/PanelViewSettings.tsx) — `regroupement: <TabRegroupement />` dans `tabsContent`.
- **Nouveau** `tabs/tab-regroupement/TabRegroupement.tsx` — calqué sur **`TabSorts.tsx`** (le meilleur modèle, car comme les sorts c'est une **liste ordonnée réordonnable**) : liste d'attributs de regroupement avec **DnD `dnd-kit`** pour fixer l'ordre d'imbrication, un dropdown asc/desc par entrée, et un bouton d'ajout/retrait.
- **Sélection des attributs** : réutiliser le pattern de la roue « attributs disponibles » (`AvailableAttributesDropdown` + `attributeTreeNodes.ts`) en **filtrant les types** à `simple | simple_link | tree` (la query `getViewSettingsLibraryAttributes.graphql` renvoie déjà `type`). Ajouter un mode/`filterTypes` à `buildAttributeNode`.
- i18n : clés `view_settings.tab.regroupement` (+ libellés asc/desc, état vide) dans les locales app-studio.

## Couche 3 — Backend : moteur de groupes

### 3.a Extensions de `listDistinctValues` (simples / liens) — petit effort

`listDistinctValues(libraryId, attributeId, recordFilters, options)` est le moteur (AQL `COLLECT
... WITH COUNT`), gère déjà bucket nul + permissions + labels lien/arbre. Deux manques :

1. **`searchQuery` (fulltext)** — actuellement non supporté ; sans lui, les compteurs de groupes
   ignorent une recherche active alors que les records dépliés la respectent (incohérence).
   Plomberie triviale : `searchQuery` → `valueDomain.listDistinctValues` →
   `findRecordsHelper({..., fulltextSearch})`. Fichiers : [valueApp.ts](apps/core/src/app/core/valueApp.ts) (SDL + resolver), [valueDomain.ts](apps/core/src/domain/value/valueDomain.ts) (signature interface `:165` + impl `:1064`).
2. **Pagination / tri des groupes** — `listDistinctValues` renvoie TOUS les distincts sans
   limite ni tri → risque sur attribut à forte cardinalité (des milliers de lignes d'en-tête).
   v1 : ajouter args `groupsPagination`/`groupsSort` et **post-trier + slicer dans le resolver**
   (le coût — le COLLECT sur records filtrés — tourne déjà ; cardinalité de groupes généralement
   modeste). v2 possible : pousser `SORT`/`LIMIT` dans l'AQL des 3 repos.

### 3.b Filtre d'égalité par groupe (fetch des records) — aucun changement backend

`RecordFilterInput` est plat `{field, value, condition, operator, withEmptyValues, treeId}`. Le
filtre cumulé par groupe :

- **simple** : `{field: attrId, condition: EQUAL, value}`
- **lien** : `{field: "<attrId>.id", condition: EQUAL, value: <recordId>}` (le front fait déjà ça : `prepareFiltersForRequest.ts`)
- **arbre** : `{field: "<attrId>.<libraryId>.id", condition: CLASSIFIED_IN, value: <nodeId>, treeId}` (cf. `prepareFiltersForRequest.ts`) — `CLASSIFIED_IN` = nœud **+ sous-arbre**
- **bucket nul** : `{field, condition: IS_EMPTY}`

Sémantique nœud exact (confirmée) : il n'existe pas de condition « nœud exact » native, mais
`NOT_CLASSIFIED_IN` existe → les records rattachés au nœud N **hors** ses enfants se fetchent via
`[CLASSIFIED_IN N, NOT_CLASSIFIED_IN enfant1, NOT_CLASSIFIED_IN enfant2, …]` (cf. § 3.c).

### 3.c Comptage par nœud d'arbre (Phase 2) — aucun nouveau resolver backend

Confirmé par l'exploration : les arbres n'utilisent **pas** `listDistinctValues` (qui ne renvoie
que les nœuds exacts référencés, à plat). Ils empruntent un chemin **déjà existant**, éprouvé par
la `NavigationView` de data-studio. **Lazy-par-niveau** :

- **Structure (enfants directs)** : `treeNodeChildren(treeId, node, pagination)` →
  `{totalCount, list: [TreeNodeLight{id, childrenCount, record{...whoAmI}}]}`. C'est la query de
  [getTreeNodeChildren.ts](apps/data-studio/src/components/Navigation/NavigationView/) à
  recopier dans libs/ui. `node: null` = racine ; `childrenCount` distingue nœud intermédiaire vs feuille.
- **Compteur cumulé d'un nœud** : `records(library: L, filters: [...filtres cumulés, {field:
"<attr>.<libId>.id", condition: CLASSIFIED_IN, value: nodeId, treeId}], withCount, pagination:
{limit: 0}).totalCount`. `CLASSIFIED_IN` = nœud + descendants → c'est le cumul voulu.
- **Bucket « SANS CATÉGORIE »** (records sur le nœud exact, hors enfants) : compteur =
  `count(nœud) − Σ count(enfants)` ; fetch = `records(filters: [...cumulés, CLASSIFIED_IN nœud,
NOT_CLASSIFIED_IN enfant1, …])`.
- **Feuille** (`childrenCount === 0`) : déplier charge directement les records (`CLASSIFIED_IN
feuille` = exact).
- **Filtres cumulés** : les compteurs/records d'un niveau arbre incluent les filtres d'égalité des
  niveaux parents (multi-attributs) + les filtres de la vue.

→ **Zéro nouveau resolver backend** : on compose `treeNodeChildren` + `records`/`CLASSIFIED_IN`.
Coût : une requête de comptage par nœud enfant à chaque dépliage (lazy, fan-out modeste, façon
cadrage). **Optimisation post-v1 (perf)** : champ `TreeNode.recordCount(filters): Int` (field
resolver `recordDomain.find` + CLASSIFIED_IN, batché DataLoader) pour ramener tous les compteurs en
une seule requête `treeNodeChildren`.

## Couche 4 — Rendu Explorer (synthetic rows + colSpan)

**Choix : lignes de groupe synthétiques + `onCell` colSpan**, PAS le `expandable`/`children`
d'Ant. Raisons : la colonne `whoAmI` fixe-gauche (largeur dynamique via ResizeObserver) + la
colonne de sélection entrent en conflit avec la colonne d'expand d'Ant et le `tableLayout="fixed"`
; les lignes de groupe sont **hétérogènes** des lignes-records (pas de `whoAmI`, pas de valeurs
par colonne, pleine largeur). `onCell → {colSpan}` est l'idiome Ant canonique pour une ligne
pleine largeur, déjà utilisé dans libs/ui (`ImportModalConfigStep.tsx`), et exposé par
`KitTableColumnType`.

Conception :

- **Union de lignes** dans le `dataSource` : `GroupedRow = IItemData | IGroupHeaderRow` avec
  `IGroupHeaderRow = {key; __isGroup: true; depth: number; groupLabel; count; groupValue: string|null; expanded; loading; isTreeNode?: boolean}`.
  `depth` pilote l'indentation et le fond dégradé (cf. maquette).
- **Ligne d'en-tête pleine largeur** : sur la colonne `whoAmI`, `onCell` renvoie
  `{colSpan: nbColonnesData}` si `__isGroup` ; toutes les autres colonnes renvoient `{colSpan: 0}`
  (Ant masque les cellules à span nul). Le `render` de `whoAmI` branche sur `__isGroup` →
  chevron (repli) + libellé indenté + `KitBadge` compteur ; sinon `<TableNameCell>` actuel.
- **Sélection** : `rowSelection.getCheckboxProps` désactive/masque la case sur les lignes de
  groupe (sélection de groupe = hors scope v1).
- **Repli + lazy** : état propre (`useGroupedExplorer`) indexé par le **chemin de groupe cumulé**.
  Au 1ᵉʳ dépliage : si niveau intermédiaire → fetch du sous-niveau (`listDistinctValues` attr
  suivant + filtres cumulés, ou enfants d'arbre) ; si dernier niveau → fetch des **records**
  (query `records` filtres cumulés + tri de la vue + pagination intra-groupe). Le `dataSource` est
  recalculé : chaque groupe déplié est suivi de ses sous-lignes.
- **Pagination intra-groupe** : chaque groupe garde son `{offset, pageSize, totalCount}` ; un
  contrôle compact « voir plus » en ligne de pied de groupe (`__isGroupFooter` colSpan). Le
  `KitPagination` global est **masqué en mode groupé** (c'est la liste des groupes de 1ᵉʳ niveau
  qui est paginée — cf. 3.a).
- **Coexistence** : si `view.groupBy` est vide → chemin plat actuel inchangé (toggle).

Nouveaux fichiers (libs/ui ExplorerV2) :

- `_queries/listDistinctValues.graphql` + `_queries/useExplorerGroups.ts` — énumère/mappe un
  niveau de groupes (`{key, groupLabel résolu, count, groupValue}`), trié selon `order`.
- `useGroupedExplorer.ts` — état repli/lazy par chemin + construction des filtres cumulés
  (simple/lien/arbre/nul) + fetch records par groupe (réutilise `_mappingLibrary` de `useExplorerData`).
- `buildGroupedDataSource.ts` — transform pur `(groupes, état) => GroupedRow[]` (testable unitairement).

Fichiers modifiés :

- [Explorer.tsx](libs/ui/src/components/ExplorerV2/Explorer.tsx) — lire `view.groupBy` (ajouté au merge `IViewSettingsState`, source `currentView.groupBy`, comme `sort`) ; brancher mode groupé vs plat ; passer rows groupées + config colonnes `__isGroup`-aware à `DataView`.
- [DataView.tsx](libs/ui/src/components/ExplorerV2/DataView.tsx) — `dataSource: GroupedRow[]` + prop `grouping` ; logique `onCell` colSpan ; branchements `render` / `getCheckboxProps` sur `__isGroup` ; masquage `KitPagination` en mode groupé.
- [\_queries/useExplorerData.ts](libs/ui/src/components/ExplorerV2/_queries/useExplorerData.ts) — accepter un `groupFilter?` optionnel (la query `ExplorerLibraryData` prend déjà `$filters`) pour le fetch intra-groupe.

## Cas limites

- **Bucket nul / SANS CATÉGORIE** — simple/lien : `listDistinctValues` renvoie `{value: null,
count}`, fetch via `IS_EMPTY`. Arbre : records sur un nœud hors ses enfants, compteur par
  soustraction (§ 3.c). Placé en fin de liste quel que soit l'ordre.
- **Forte cardinalité** — cf. 3.a, pagination des groupes nécessaire avant GA.
- **Compteurs vs filtres + recherche** — `recordFilters` déjà respecté ; fulltext = le gap (3.a#1).
- **Multivalué** — un record multi-valué apparaît dans plusieurs groupes (somme des compteurs ≠
  `totalCount`). Décider : message d'info, ou restreindre v1 aux attributs mono-valués.
- **Sélection de masse / actions** — cases sur les records chargés uniquement ; en-têtes de groupe
  sans case en v1 ; `MASS_SELECTION_ALL` (sélection par filtre) reste valable.
- **Tri intra-groupe** — utilise le `sort` de la vue (déjà dans `SerializedView.sort`).

## Vérification / tests

**Unitaires (Jest) :** reducer (`SET_GROUP_BY`/`MOVE_GROUP_BY`/`SET_GROUP_BY_ORDER`, default
`groupBy:[]`) ; `displayFingerprint` (modif groupBy ⇒ dirty) ; serializer
(`viewV2ToSerializedView` → `[{field, order}]`) ; `buildGroupedDataSource` (groupes → union de
lignes, replié/déplié, bucket nul, pied de groupe, forme colSpan) ; `DataView` (en-tête colSpan +
chevron + compteur ; case masquée sur groupe ; lignes-records inchangées).

**Backend (e2e) :** étendre [listDistinctValues.test.ts](apps/core/src/__tests__/e2e/api/values/listDistinctValues.test.ts) pour `searchQuery` + pagination/tri des groupes ; e2e viewV2 : create/update avec `groupBy`, relecture, `ViewV2GroupBy.attributes` hydraté, zod rejette un `groupBy` malformé.

**E2E manuel (stack lancée + MCP `mcp__leav-runtime__graphql_query/mutation`) :**

1. **simple/lien** : `listDistinctValues` (SIMPLE, SIMPLE_LINK) → compteurs, bucket nul, labels
   `Record` ; tester le nouvel arg `searchQuery` (compteurs cohérents avec une recherche active).
2. **arbre** : `treeNodeChildren(treeId, node)` (racine puis un nœud) → enfants + `childrenCount` ;
   pour un nœud, `records(CLASSIFIED_IN node, withCount).totalCount` → compteur cumulé ; vérifier
   `count(parent) == Σ count(enfants) + bucket SANS CATÉGORIE`.
3. Pour une valeur de groupe, `records` + filtre d'égalité cumulé (simple / lien `.id` / arbre
   nœud) + tri/pagination de la vue → vérifier `totalCount == count` du groupe.
4. `createViewV2`/`updateViewV2` avec un payload `groupBy` (liste), puis `viewV2(viewId)` → round-trip.
5. Skill `run-explorer-studio` : ouvrir une vue groupée dans le front réel et screenshoter
   (en-têtes repliables, compteurs, lazy-load au dépliage, retour au mode plat quand `groupBy` vide).

## Fichiers critiques (récap)

- Triade modèle de vue : [viewsV2.ts](apps/core/src/_types/viewsV2.ts) + [viewV2ZodSchema.ts](apps/core/src/domain/viewV2/viewV2ZodSchema.ts) + [viewV2App.ts](apps/core/src/app/core/viewV2App.ts)
- Moteur groupes backend : [valueDomain.ts](apps/core/src/domain/value/valueDomain.ts) + [valueApp.ts](apps/core/src/app/core/valueApp.ts) (+ comptage arbre § 3.c, à finaliser)
- Store vue : [currentViewReducer.ts](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/store-current-view/currentViewReducer.ts) (+ `_types.ts`, `useCurrentView.ts`, `viewV2ToSerializedView.ts`, `viewV2Fragment.graphql`)
- Onglet : nouveau `tabs/tab-regroupement/TabRegroupement.tsx` (modèle [TabSorts.tsx](apps/app-studio/src/modules/ApplicationRouting/content/panel-view-settings/tabs/tab-sorts/TabSorts.tsx)) + registre d'onglets (`constants.ts`, `schema.ts`, `_constantes.ts`, `PanelViewSettings.tsx`)
- Rendu : [Explorer.tsx](libs/ui/src/components/ExplorerV2/Explorer.tsx) + [DataView.tsx](libs/ui/src/components/ExplorerV2/DataView.tsx) + nouveaux `useExplorerGroups.ts` / `useGroupedExplorer.ts` / `buildGroupedDataSource.ts`
