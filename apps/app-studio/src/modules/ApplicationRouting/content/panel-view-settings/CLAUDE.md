# panel-view-settings — CLAUDE.md

Volet latéral de **configuration des vues** (`ViewV2`) de l'explorateur. app-studio est la **source de vérité** de la vue ; il convertit la vue en `SerializedView` et la passe en prop contrôlée à [`ExplorerV2`](../../../../../../../libs/ui/src/components/ExplorerV2/CLAUDE.md).

> Décisions d'architecture : **ADR-006** (`docs/adr/ADR-006-explorer-views-settings-volet.md`).
> Cadre produit : épic **LEAVC-762** — modèle de vues à deux niveaux : un **admin** configure
> une vue de référence et la partage ; un **utilisateur** la personnalise et la sauvegarde en
> clonant une vue perso indépendante. Ce document reste **technique**.

---

## Architecture d'état (`store-current-view/`)

Pattern reducer. Représente **LA vue en cours d'édition**, partagée par tous les onglets et le
header `CurrentViewSection`.

- **`CurrentViewStoreProvider`** est monté **au-dessus du volet**, dans
  `ApplicationRouting/Panel.tsx` → il **survit à la fermeture/réouverture** du volet.
- Deux snapshots dans le state (`ICurrentViewState`) :
    - `view` : copie live, éditable, reflétée par l'UI.
    - `savedView` : dernier état persisté → sert à `isDirty` et à `RESET_VIEW`.
- **`isDirty`** = comparaison d'un _fingerprint_ `JSON.stringify({label, display, sorts})` entre
  `view` et `savedView` (`useCurrentView.ts`). ⚠️ `shared` est volontairement **hors** du
  fingerprint (persisté hors-bande, ne doit jamais rendre la vue « dirty »).

### Actions reducer (`currentViewReducer.ts` / `_types.ts`)

`LOAD_VIEW`, `RESET_VIEW`, `MARK_SAVED`, `SET_LABEL`, `SET_SHARED`, `SET_VIEW_TYPE`,
`TOGGLE_VISIBILITY`, `MOVE_ATTRIBUTE`, **`MOVE_SORT`**, **`SET_SORT_ORDER`**,
**`MOVE_FILTER`**, **`TOGGLE_FILTER_PINNED`**, **`SET_FILTER_CONFIG`** (condition+valeurs d'un filtre ;
dispatché soit par `VoletFiltersProvider` (édition volet), soit par `useViewSettingsProps.onFiltersChange`
(édition/suppression depuis la `FilterToolBar` d'ExplorerV2) → persistance/`isDirty`. **Durci G1** : renvoie
le **même state** si condition+valeurs inchangées, pour que la synchro hub↔spoke ne boucle pas),
**`SET_AVAILABLE_COLUMNS`**, **`SET_AVAILABLE_SORTS`**, **`SET_AVAILABLE_FILTERS`** (roue admin).

- `LOAD_VIEW` **sème les deux snapshots** (chargement initial + écho serveur après save/save-as).
- `INIT_DEFAULT_VIEW` **sème les deux snapshots** avec un brouillon synthétique vide
  (`createDefaultView`, id sentinelle `DEFAULT_DRAFT_VIEW_ID`). Semé par `CurrentViewStoreProvider`
  **uniquement pour un admin** sur la vue par défaut (`isEmptyView`) → corrige la roue « attributs
  disponibles » (qui lit `view.library`), rend la vue éditable (`isDirty`/Reset) et sérialisée pour
  l'aperçu live d'ExplorerV2. « Enregistrer sous » crée une vraie vue à partir de ce brouillon.
- `SET_SHARED` écrit **symétriquement** sur `view` et `savedView` (cf. fingerprint ci-dessus).
- Les actions display/sort/filtre sont déléguées à un sous-reducer pur `viewReducer(view, action)`.
- `SET_AVAILABLE_FILTERS` sème un filtre rendu disponible avec une condition **`EQUAL`** par défaut
  (jamais `null` : `condition` est `RecordFilterCondition!` côté core ; `EQUAL`/valeur vide ne filtre rien).

### `useCurrentView()`

Expose `view`, `savedView`, `isOwner`, `canManageCurrentView`, `canManageViews`, `isDirty`,
`visibleColumns`, `invisibleColumns`, `sorts`, `pinnedSorts`, `unpinnedSorts`, `filters`,
`pinnedFilters`, `unpinnedFilters`, `availableColumnIds`, `availableSortPaths`, `availableFilterPaths`,
et les dispatchers : `setViewType`, `toggleVisibility`, `moveAttribute`, `moveSort`, `setSortOrder`,
`toggleSortPinned`, `moveFilter`, `toggleFilterPinned`, `setFilterConfig`,
`setLabel`, `setShared`, `setAvailableColumns`, `setAvailableSorts`, `setAvailableFilters`,
`resetView`, `markSaved`.

- **`isOwner`** = `view.created_by.whoAmI.id === userData.userId`.
- **`canManageViews`** = permission `manage_views` sur la bibliothèque affichée (droit « gestionnaire
  de vues », cf. plus bas).
- **`canManageCurrentView`** = `isOwner || (canManageViews && view.shared)` droit de gérer **la vue
  courante** ; l'override est restreint aux vues partagées. (Nommée `Current` pour la distinguer de
  `canManageViews`, le droit global par bibliothèque.)
- `visibleColumns` garde l'ordre de la vue ; `invisibleColumns` est trié alphabétiquement.
- `sorts` mappe `view.sorts` en `{id, order, ids, label}` ; `label` = chemin de descente joint par
  `›` (un tri mono-attribut affiche juste son libellé).
- `availableColumnIds` / `availableSortPaths` / `availableFilterPaths` = la **sélection courante de la
  roue admin** (ids des colonnes / chemins d'ids des tris / des filtres) ; `setAvailableColumns` /
  `setAvailableSorts` / `setAvailableFilters` la pilotent.
- `filters` mappe `view.filters` en `{id, condition, values, pinned, ids, label}` (clé = `getFilterId`,
  chemin joint par `/`) ; `pinnedFilters` garde l'ordre vue, `unpinnedFilters` est trié alpha — miroir
  exact des sélecteurs de tris.

---

## Onglets (`tabs/`)

| Onglet         | Statut | Notes                                                                                                                                                                                                                                                                  |
| -------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tab-display/` | ✅     | Colonnes visibles/cachées (DnD dnd-kit) + sélecteur de type de vue                                                                                                                                                                                                     |
| `tab-catalog/` | ✅     | `useViewCatalog` scinde `myViews` / `sharedViews` ; dernière vue via localStorage ; modale unsaved                                                                                                                                                                     |
| `tab-sorts/`   | ✅     | Tris réordonnables (DnD dnd-kit) + bascule asc/desc (`KitFilter`) ; ordre du tableau = priorité                                                                                                                                                                        |
| `tab-filters/` | ✅     | Filtres épinglables/réordonnables (DnD) + recherche. Les **épinglés** sont édités via `CommonFilterItem` branché sur le **store de filtres du volet** (`VoletFiltersProvider`, Spoke A, cf. ci-dessous) ; les **non-épinglés** sont en lecture seule (bouton épingle). |

> Détail tris : clé DnD = **`getSortId(sort)`** (ids du chemin joints par `/`, cf. JSDoc dans
> `store-current-view/_types.ts`) — DnD et reducer doivent s'accorder dessus. La config des
> attributs disponibles (ajout/retrait de tris) se fait via la **roue admin** (voir ci-dessous).

---

## Bridge vers ExplorerV2 (`store-current-view/viewV2ToSerializedView.ts`)

Convertit la `ViewV2` GraphQL en `SerializedView` (contrat consommé par la prop `currentView`).

- `attributesIds` : attributs display visibles, **hors** colonne d'identité (`IDENTITY_COLUMN_ID`).
- **`sort`** : `view.sorts.map(s => ({field: s.attributes.map(a => a.id).join('.'), order: s.order}))`,
  puis on **filtre les `field` vides** (un tri sans attribut n'a rien sur quoi trier). Le `field`
  est le **chemin de descente joint par `.`** — format compris par la query records (cf. core
  `getAttributesFromField`) : `campagnes.label` trie sur un attribut lié, `campagnes` seul trie sur
  l'identité de l'enregistrement lié. Un tri mono-attribut donne juste l'id de l'attribut.
- **`filters`** : les filtres utilisateur **épinglés**, dans l'ordre de la vue (= ordre toolbar), en forme
  **lean** sérialisable (`{attributes, condition, values, pinned}`). Non-épinglés exclus (comme les tris
  non épinglés). Les filtres user **retransitent par `currentView`** — la **déviation ADR-006 « filtres
  hors de currentView » est annulée** (voir `## Filtres : hub & spoke`). Les pré-filtres masqués
  `hidden:true` (ex. pré-filtre de liaison) restent injectés **séparément** par l'appelant dans
  `currentView.filters` comme filtres **pleins** et fusionnés à la requête par ExplorerV2 (jamais affichés).
- **`shortcuts`** : onglets du volet exposés en boutons-raccourcis (`display | filters | sorts |
catalog`), recopiés tels quels avec fallback `['display']` (LEAVC-892). L'ordre d'affichage est
  imposé côté ExplorerV2 (ordre canonique), pas par cette liste.
- Fragment `viewV2Fragment.graphql` récupère désormais `sorts { attributes {id label} order }` et
  `shortcuts`.

**Câblage** : `panel-explorer/useViewSettingsProps.ts` lit le store et fournit `currentView` +
les callbacks `viewSettings` à `ExplorerV2` (monté dans `PanelLibraryExplorer.tsx`).

---

## Filtres : hub & spoke (`store-current-view/VoletFiltersProvider.tsx`)

> **Déviation ADR-006 annulée** (LEAVC-810) : les filtres **utilisateur** retransitent par `currentView`
> (forme lean sérialisable), comme l'affichage et les tris. L'ancien `SharedFiltersProvider` (UN store
> `FiltersContext` monté au-dessus du volet ET de l'explorer) a été supprimé : un contexte React **ne
> traverse pas une iframe**, ce que le système de messages d'ADR-006 voulait précisément éviter.

Topologie **hub & spoke** : le `CurrentViewStore` est le **hub** (unique source de vérité : `view.filters`
lean + persistance + `isDirty`). Deux **spokes découplés** reconstruisent chacun un store `UIFilter` riche
via le hook partagé **`useControlledFilterStore`** (`@leav/ui`) et n'écrivent que du lean — **sans jamais
partager de `FiltersContext`** :

- **Spoke A — volet** (`VoletFiltersProvider`, monté dans `ViewSettingsContainer` autour de
  `PanelViewSettings`, jamais autour de l'explorer) : semé des filtres **épinglés** lean ; `onChange`
  réécrit au hub via `setFilterConfig`. `CommonFilterItem` (onglet Filtres) édite ce store.
- **Spoke B — store interne d'ExplorerV2** : semé de `currentView.filters` (lean) ; `onChange` =
  `useViewSettingsProps.onFiltersChange` qui **réconcilie l'ensemble lean** contre le hub (setFilterConfig
  pour les présents ; `toggleFilterPinned` pour un épinglé **absent** = suppression depuis la toolbar).

### Pourquoi un `VoletFiltersProvider` séparé, et pas la logique dans `CurrentViewStoreProvider` ?

Question récurrente : ce serait plus court de tout mettre dans le hub. Mais ça **ré-introduirait** les
problèmes que la topologie résout. Le `VoletFiltersProvider` ne détient **aucune information de vérité**
(les filtres vivent dans `view.filters`, dans le hub) — c'est une **projection jetable** qui lit le hub et
y réécrit. Le garder à part est délibéré :

1. **Lean vs riche.** Le hub est la source de vérité en forme **lean sérialisable** (`{attributes,
condition, values}`) — transportable à travers une iframe (le but de LEAVC-810). Le store volet est un
   `UIFilter[]` **riche** (fragments GraphQL non sérialisables, nœuds d'arbre, `userFormattedValue`). Le
   fusionner dans le hub polluerait la vérité avec de l'état dérivé non sérialisable → perte du « message-ready ».
2. **Cycle de vie / perf.** Le hub est monté en permanence (niveau `Panel`) et survit à la fermeture du
   volet. Le store volet fait du **vrai réseau** (`useViewFiltersConverter` + `useResolveTreeFilterNodes`) ;
   monté dans `ViewSettingsContainer`, il n'existe **que quand le volet est ouvert**. Dans le hub, ces
   requêtes tourneraient volet fermé, pour rien.
3. **Scope du `FiltersContext`.** Un provider enveloppe son sous-arbre. `CurrentViewStoreProvider` enveloppe
   `content` = **explorer + volet** ; y monter le `FiltersContext` du volet déborderait sur l'explorer =
   exactement l'ancien `SharedFiltersProvider` supprimé. Il doit être ancré sur le sous-arbre du volet.
4. **Symétrie hub ↔ spokes.** ExplorerV2 a **son propre** spoke (dans `@leav/ui`, demain en iframe) —
   impossible à mettre dans le hub app-studio. Traiter le volet comme l'**autre** spoke garde l'architecture
   régulière et prête pour le passage du volet derrière une frontière message. `VoletFiltersProvider` est un
   adaptateur mince entre le hook `@leav/ui` et les dispatchers `useCurrentView` du hub.

**Anti-boucle (3 garde-fous, dans `useControlledFilterStore` + le reducer)** — chaque aller-retour
hub↔spoke est no-op ou converge en un tour :

- **G1** : `SET_FILTER_CONFIG` renvoie le **même state** si condition+valeurs inchangées.
- **G2** : `setFilterConfig` n'est dispatché que sur diff (côté volet/hôte).
- **G3** : `useControlledFilterStore` est **echo-suppressed** via la projection lean « dernièrement
  synchronisée » : un seed/une adoption (hub→store) ne ré-émet pas ; seule une édition **locale** émet.
  La **réflexion des valeurs** toolbar⇄volet est portée par cette même projection (chaque store **adopte**
  une valeur externe venue du hub) — seul comportement réellement nouveau vs. l'ancien store unique.
- **Arbres** : l'édition live passe par le `TreeAttributeDropDown` (qui fournit
  `nodes`/`userNodes`/`userFormattedValue`) → requête `attribut.<libraryId>.id` + badge OK. Au
  **rechargement**, la vue ne stocke que les `recordIds` ; `useResolveTreeFilterNodes` (`@leav/ui`) les
  **résout** en `{nodeId, libraryId, label}` via `treeContent` (même query que le dropdown → cache
  partagé) pour réappliquer le filtre. Un filtre arbre seedé est **vide** (exclu de la projection lean)
  tant que la résolution n'est pas arrivée ; le reseed « upgrade » le filtre arbre quand elle arrive. Le
  merge arbre **compare les recordIds** (pas l'identité d'objet) : il préserve une sélection live de
  **même valeur**, mais **adopte** un seed résolu de **valeur différente** poussé par le hub (édition
  depuis l'autre spoke — sans cette comparaison, un arbre déjà sélectionné n'adoptait jamais la nouvelle
  valeur du volet, LEAVC-810). Les arbres **sautent l'effet ADOPT** (synchrone) et passent **uniquement**
  par ce chemin SEED + résolution. Vue **non dirty** au load (ref keyé sur la **valeur** lean).

> ⏳ **Différé** (avec le câblage iframe) : push réel `view-settings-update` hôte→iframe + émission
> `explorer-view-changed`, et lean-ification du pré-filtre `hidden`. L'architecture est déjà message-ready.

---

## Actions CRUD (`current-view-section/`)

| Action           | Mutation / dispatch                      | Condition                                                            |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Sauvegarder      | `updateViewV2`                           | `canManageCurrentView && isDirty && label non vide`                  |
| Enregistrer sous | `createViewV2` (`SaveAsViewModal`)       | ouvert à **tous** (ex-« Forker »)                                    |
| Partager         | `updateViewV2 {shared}` (`ShareControl`) | `canManageViews && canManageCurrentView` (voir plus bas)             |
| Réinitialiser    | dispatch `RESET_VIEW`                    | `isDirty` (sans requête réseau)                                      |
| Supprimer        | `deleteViewV2` (catalogue)               | `canManageCurrentView` (= owner, ou `manage_views` sur vue partagée) |

Le back rejette une modif par quelqu'un qui n'a pas le droit de gérer la vue (`USER_IS_NOT_VIEW_OWNER`) :
il applique exactement la même règle `isOwner || (manage_views && view.shared)`
(`viewV2Domain.ts`, `_canManageView`).

---

## Distinction gestionnaire de vues / utilisateur

> Tickets de référence : **LEAVC-852** (mode admin du volet) puis **LEAVC-960** (passage d'une
> détection par groupe à une **permission**).

### Détection par permission (`manage_views`, par bibliothèque)

- **`canManageViews`** = permission **`manage_views`** de type `library` sur la bibliothèque affichée,
  résolue via la query `isAllowed` (hook `store-current-view/useCanManageViews.ts`,
  `isAllowed.graphql`). Côté core, c'est une `LibraryPermissionsActions` **à vrai par défaut pour les
  admins uniquement** (override `everybody.library.manage_views = false` dans `config/default.js`) →
  comportement par défaut identique à l'ancien check « groupe admin », mais désormais configurable par
  groupe d'utilisateurs dans l'onglet Permissions de chaque bibliothèque.
- **Résolu une seule fois** par `CurrentViewStoreProvider` (qui connaît `displayedLibraryId`) puis
  exposé via `CurrentViewContext` → tous les composants du volet le lisent par `useCurrentView()`.
  `false` pendant le chargement ; le **back reste le gardien autoritaire** (re-check à chaque mutation).
- ⚠️ Historique : l'ancienne détection par permission `admin_library` (query
  `GetPermissionEditViewOnLibrary`) avait été remplacée par `useIsAdminUser()` (groupe `'1'`,
  LEAVC-852) ; ce dernier — et toute la plomberie `UserGroupsContext` — a été **supprimé** au profit
  de `manage_views` (LEAVC-960).

### ✅ Implémenté

- **`isOwner`** = `view.created_by.whoAmI.id === userData.userId` (`useCurrentView.ts`).
- **`canManageCurrentView = isOwner || (canManageViews && view.shared)`** (`useCurrentView.ts`) →
  droit de gérer **la vue courante** (renommer / sauvegarder / supprimer / (dé)partager). L'override est
  **restreint aux vues partagées** : un gestionnaire ne touche jamais la vue privée d'un autre
  utilisateur. Même règle côté back (`viewV2Domain.ts` → `_canManageView`).
- **`canShare = canManageViews && canManageCurrentView`** (`CurrentViewActions.tsx`) → si vrai, affiche
  `ShareControl` (toggle partage) ; sinon `SharedByLabel` (lecture seule, nom du créateur). Effet :
  un gestionnaire sur une vue partagée d'autrui peut la dé-partager ; un owner sans `manage_views`
  reste inchangé.
- Édition du label (`CurrentViewLabel`), bouton Sauvegarder (`CurrentViewActions`) : gated par
  `canManageCurrentView`.
- Catalogue (`useViewCatalog`) : `myViews` (`created_by.id === userId`) vs `sharedViews`
  (`shared === true` d'un autre user). Les vues perso d'autrui sont invisibles. L'action **Supprimer**
  (`useViewActions`) est visible si `isOwner || (canManageViews && view.shared)`, désactivée sur la vue
  actuellement chargée.
- **Roue « attributs disponibles »** (`manage-available-attributes/AvailableAttributesDropdown.tsx`),
  rendue **uniquement si `canManageViews`**, sur **Affichage**, **Tris** et **Filtres** :
    - « Disponible » = **appartenance à la liste de la facette** (pas de champ persisté en plus) : la
      roue édite `view.display.attributes` (colonnes) / `view.sorts` (tris) / `view.filters` (filtres)
      via les actions reducer `SET_AVAILABLE_COLUMNS` / `SET_AVAILABLE_SORTS` / `SET_AVAILABLE_FILTERS`
      (réconciliation : conserve ordre + visibilité / asc-desc / condition+valeurs+pin des entrées
      gardées, ajoute les nouvelles, retire les décochées). La facette est choisie via la prop `facet`
      (`'columns' | 'sorts' | 'filters'`), passée par `TabHeader` (`facet={tab.key}`).
    - **Affichage** : arbre **à plat** (`mode="columns"`) — attributs directs uniquement ; un lien/arbre
      est une simple entrée cochable (son label), pas de descente. Roue dans la **sous-section** « Colonnes »
      (`ColumnsSettings`), car le titre de section diffère du titre d'onglet.
    - **Tris** et **Filtres** : arbre **multi-niveaux** (`mode="nested"`) — un attribut **lien**
      est un nœud dépliable cochable (le cocher = tri sur l'identité du lien ; descendre = tri sur un
      sous-attribut, chemin `[lien, sousAttr]`). Descente **lazy** par expansion
      (`useGetViewSettingsLibraryAttributesLazyQuery`). Pour éviter un double en-tête, la roue est rendue
      dans le **`TabHeader` partagé**, à gauche du bouton épingle, et non dans une sous-section de l'onglet.
      `TabHeader` décide lui-même de l'afficher : `canManageViews && EDIT_AVAILABLE_ATTRIBUTES_IN_HEADER_TABS.includes(tab.key)`
      (constante `EDIT_AVAILABLE_ATTRIBUTES_IN_HEADER_TABS` dans `tabs/_constantes.ts` = `['sorts', 'filters']`).
    - Query : `getViewSettingsLibraryAttributes.graphql` (réutilisée pour chaque bibliothèque visitée).

### ⏳ Limites / à venir

- **Descente par attribut `tree`** dans les tris : un attribut **arbre** n'est cochable qu'à son
  niveau identité (tri sur le nœud). La descente dans les bibliothèques de l'arbre exigerait un
  segment « bibliothèque » dans le chemin (`arbre.lib.sousAttr`) que le modèle `ViewV2Sort.attributes`
  (résolu attribut par attribut) ne sait pas stocker — chantier back dédié.
- **Filtres arbre au rechargement** : restaurés via `useResolveTreeFilterNodes` (résolution des
  recordIds → nœuds par `treeContent`, cache partagé). Limite résiduelle : un recordId stocké introuvable
  dans l'arbre (nœud supprimé/inaccessible) est ignoré à la résolution. La désactivation temporaire d'un
  filtre (entonnoir barré) n'est pas stockable (`IViewV2Filter` ne porte pas de flag « désactivé ») —
  hors scope.
- **Liste utilisateur** : l'utilisateur (sans roue) ne voit que les attributs rendus disponibles par
  l'admin (= la liste de la facette) et agit dessus (œil / DnD / asc-desc / édition de valeur).

---

## Feature flag & événements

- **Feature flag** : `application.enableViewSettings` (`ApplicationRouting/schema.ts`, optionnel).
  Gate l'usage d'ExplorerV2 + volet (`Panel.tsx`, `PanelLibraryExplorer.tsx`,
  `PanelAttributeExplorer.tsx`, `useViewSettingsProps.ts`). Sinon → `Explorer` v1.
- **Événements internes** (bus `usePanelEventHandlers<AppStudioInternalEvent>` de `@leav/ui`,
  types dans `ApplicationRouting/types.ts`) :
    - `open-view-settings` : ouverture du volet (depuis le bouton/raccourci d'ExplorerV2).
    - `view-settings-select-view` : changement de vue active (depuis `TabCatalog` ou post-« Enregistrer sous »).

---

## Tests

Jest + Testing Library, `*.spec.ts(x)` colocalisés dans `__tests__/`. Le reducer est testé en
isolation (`store-current-view/__tests__/`), y compris `MOVE_SORT` / `SET_SORT_ORDER` et les actions
filtres (`MOVE_FILTER` / `TOGGLE_FILTER_PINNED` / `SET_FILTER_CONFIG` / `SET_AVAILABLE_FILTERS`).
