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
**`SET_AVAILABLE_COLUMNS`**, **`SET_AVAILABLE_SORTS`** (roue admin).

- `LOAD_VIEW` **sème les deux snapshots** (chargement initial + écho serveur après save/save-as).
- `INIT_DEFAULT_VIEW` **sème les deux snapshots** avec un brouillon synthétique vide
  (`createDefaultView`, id sentinelle `DEFAULT_DRAFT_VIEW_ID`). Semé par `CurrentViewStoreProvider`
  **uniquement pour un admin** sur la vue par défaut (`isEmptyView`) → corrige la roue « attributs
  disponibles » (qui lit `view.library`), rend la vue éditable (`isDirty`/Reset) et sérialisée pour
  l'aperçu live d'ExplorerV2. « Enregistrer sous » crée une vraie vue à partir de ce brouillon.
- `SET_SHARED` écrit **symétriquement** sur `view` et `savedView` (cf. fingerprint ci-dessus).
- Les actions display/sort sont déléguées à un sous-reducer pur `viewReducer(view, action)`.

### `useCurrentView()`

Expose `view`, `savedView`, `isOwner`, `canManageCurrentView`, `canManageViews`, `isDirty`,
`visibleColumns`, `invisibleColumns`, `sorts`, `availableColumnIds`, `availableSortPaths`, et les
dispatchers : `setViewType`, `toggleVisibility`, `moveAttribute`, `moveSort`, `setSortOrder`,
`setLabel`, `setShared`, `setAvailableColumns`, `setAvailableSorts`, `resetView`, `markSaved`.

- **`isOwner`** = `view.created_by.whoAmI.id === userData.userId`.
- **`canManageViews`** = permission `manage_views` sur la bibliothèque affichée (droit « gestionnaire
  de vues », cf. plus bas).
- **`canManageCurrentView`** = `isOwner || (canManageViews && view.shared)` droit de gérer **la vue
  courante** ; l'override est restreint aux vues partagées. (Nommée `Current` pour la distinguer de
  `canManageViews`, le droit global par bibliothèque.)
- `visibleColumns` garde l'ordre de la vue ; `invisibleColumns` est trié alphabétiquement.
- `sorts` mappe `view.sorts` en `{id, order, ids, label}` ; `label` = chemin de descente joint par
  `›` (un tri mono-attribut affiche juste son libellé).
- `availableColumnIds` / `availableSortPaths` = la **sélection courante de la roue admin** (ids des
  colonnes / chemins d'ids des tris) ; `setAvailableColumns` / `setAvailableSorts` la pilotent.

---

## Onglets (`tabs/`)

| Onglet           | Statut | Notes                                                                                              |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `tab-display/`   | ✅     | Colonnes visibles/cachées (DnD dnd-kit) + sélecteur de type de vue                                 |
| `tab-catalog/`   | ✅     | `useViewCatalog` scinde `myViews` / `sharedViews` ; dernière vue via localStorage ; modale unsaved |
| `tab-sorts/`     | ✅     | Tris réordonnables (DnD dnd-kit) + bascule asc/desc (`KitFilter`) ; ordre du tableau = priorité    |
| `TabFilters.tsx` | ⏳     | Placeholder WIP                                                                                    |

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
- `filters` : **vide ici** (user filters = ticket à venir). Les pré-filtres masqués `hidden:true`
  ne sont **pas** ajoutés ici — ils sont injectés par l'appelant dans `currentView.filters`.
- **`shortcuts`** : onglets du volet exposés en boutons-raccourcis (`display | filters | sorts |
catalog`), recopiés tels quels avec fallback `['display']` (LEAVC-892). L'ordre d'affichage est
  imposé côté ExplorerV2 (ordre canonique), pas par cette liste.
- Fragment `viewV2Fragment.graphql` récupère désormais `sorts { attributes {id label} order }` et
  `shortcuts`.

**Câblage** : `panel-explorer/useViewSettingsProps.ts` lit le store et fournit `currentView` +
les callbacks `viewSettings` à `ExplorerV2` (monté dans `PanelLibraryExplorer.tsx`).

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
  rendue **uniquement si `canManageViews`**, sur **Affichage** et **Tris** :
    - « Disponible » = **appartenance à la liste de la facette** (pas de champ persisté en plus) : la
      roue édite `view.display.attributes` (colonnes) / `view.sorts` (tris) via les actions reducer
      `SET_AVAILABLE_COLUMNS` / `SET_AVAILABLE_SORTS` (réconciliation : conserve ordre + visibilité /
      asc-desc des entrées gardées, ajoute les nouvelles, retire les décochées).
    - **Affichage** : arbre **à plat** (`mode="columns"`) — attributs directs uniquement ; un lien/arbre
      est une simple entrée cochable (son label), pas de descente. Roue dans la **sous-section** « Colonnes »
      (`ColumnsSettings`), car le titre de section diffère du titre d'onglet.
    - **Tris** (et plus tard **Filtres**) : arbre **multi-niveaux** (`mode="sorts"`) — un attribut **lien**
      est un nœud dépliable cochable (le cocher = tri sur l'identité du lien ; descendre = tri sur un
      sous-attribut, chemin `[lien, sousAttr]`). Descente **lazy** par expansion
      (`useGetViewSettingsLibraryAttributesLazyQuery`). Pour éviter un double en-tête, la roue est rendue
      dans le **`TabHeader` partagé**, à gauche du bouton épingle, et non dans une sous-section de l'onglet.
      `TabHeader` décide lui-même de l'afficher : `canManageViews && EDIT_AVAILABLE_ATTRIBUTES_IN_HEADER_TABS.includes(tab.key)`
      (constante dans `tabs/_constantes.ts` ; `['sorts']` aujourd'hui, `filters` à ajouter quand l'onglet sera câblé).
    - Query : `getViewSettingsLibraryAttributes.graphql` (réutilisée pour chaque bibliothèque visitée).

### ⏳ Limites / à venir

- **Descente par attribut `tree`** dans les tris : un attribut **arbre** n'est cochable qu'à son
  niveau identité (tri sur le nœud). La descente dans les bibliothèques de l'arbre exigerait un
  segment « bibliothèque » dans le chemin (`arbre.lib.sousAttr`) que le modèle `ViewV2Sort.attributes`
  (résolu attribut par attribut) ne sait pas stocker — chantier back dédié.
- **Onglet Filtres** : la roue n'y est pas encore branchée (placeholder ; sera fait avec l'onglet Filtres).
- **Liste utilisateur** : l'utilisateur (sans roue) ne voit que les attributs rendus disponibles par
  l'admin (= la liste de la facette) et agit dessus (œil / DnD / asc-desc).

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
isolation (`store-current-view/__tests__/`), y compris `MOVE_SORT` / `SET_SORT_ORDER`.
