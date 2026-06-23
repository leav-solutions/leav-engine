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
`TOGGLE_VISIBILITY`, `MOVE_ATTRIBUTE`, **`MOVE_SORT`**, **`SET_SORT_ORDER`**.

- `LOAD_VIEW` **sème les deux snapshots** (chargement initial + écho serveur après save/fork).
- `SET_SHARED` écrit **symétriquement** sur `view` et `savedView` (cf. fingerprint ci-dessus).
- Les actions display/sort sont déléguées à un sous-reducer pur `viewReducer(view, action)`.

### `useCurrentView()`

Expose `view`, `savedView`, `isOwner`, `isDirty`, `visibleColumns`, `invisibleColumns`,
`sorts`, et les dispatchers : `setViewType`, `toggleVisibility`, `moveAttribute`, `moveSort`,
`setSortOrder`, `setLabel`, `setShared`, `resetView`, `markSaved`.

- **`isOwner`** = `view.created_by.whoAmI.id === userData.userId`.
- `visibleColumns` garde l'ordre de la vue ; `invisibleColumns` est trié alphabétiquement.
- `sorts` mappe `view.sorts` en `{id, order, ids, label}` ; `label` = libellé du **dernier**
  attribut du chemin (la descente d'attribut-lien n'est pas encore supportée → un tri cible un
  seul attribut).

---

## Onglets (`tabs/`)

| Onglet           | Statut | Notes                                                                                              |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `tab-display/`   | ✅     | Colonnes visibles/cachées (DnD dnd-kit) + sélecteur de type de vue                                 |
| `tab-catalog/`   | ✅     | `useViewCatalog` scinde `myViews` / `sharedViews` ; dernière vue via localStorage ; modale unsaved |
| `tab-sorts/`     | ✅     | Tris réordonnables (DnD dnd-kit) + bascule asc/desc (`KitFilter`) ; ordre du tableau = priorité    |
| `TabFilters.tsx` | ⏳     | Placeholder WIP                                                                                    |

> Détail tris : clé DnD = **`getSortId(sort)`** (ids du chemin joints par `/`, cf. JSDoc dans
> `store-current-view/_types.ts`) — DnD et reducer doivent s'accorder dessus. TODO LEAVC-809 :
> config des attributs disponibles + ajout/retrait de tris.

---

## Bridge vers ExplorerV2 (`store-current-view/viewV2ToSerializedView.ts`)

Convertit la `ViewV2` GraphQL en `SerializedView` (contrat consommé par la prop `currentView`).

- `attributesIds` : attributs display visibles, **hors** colonne d'identité (`IDENTITY_COLUMN_ID`).
- **`sort`** : `view.sorts.map(s => ({field: s.attributes.at(-1)?.id, order: s.order}))`, puis
  on **filtre les `field` undefined** (un tri sans attribut n'a rien sur quoi trier). Dernier
  attribut du chemin uniquement.
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

| Action        | Mutation / dispatch                      | Condition                                     |
| ------------- | ---------------------------------------- | --------------------------------------------- |
| Sauvegarder   | `updateViewV2`                           | `isOwner && isDirty && label non vide`        |
| Forker        | `createViewV2` (`ForkViewModal`)         | ouvert à **tous**                             |
| Partager      | `updateViewV2 {shared}` (`ShareControl`) | `isOwner && canEditAdminView` (voir plus bas) |
| Réinitialiser | dispatch `RESET_VIEW`                    | `isDirty` (sans requête réseau)               |
| Supprimer     | —                                        | **TODO LEAVC-934** (bouton désactivé)         |

Le back rejette une modif par un non-propriétaire (`USER_IS_NOT_VIEW_OWNER`).

---

## Distinction admin / utilisateur

> **Important** : ne pas confondre ce qui existe avec ce qui est planifié.
> Ticket de référence : **LEAVC-852** (encore en backlog au moment de l'écriture).

### ✅ Implémenté aujourd'hui

- **`canEditAdminView`** = permission `admin_library` de la bibliothèque
  (`PanelViewSettings.tsx`, query `GetPermissionEditViewOnLibrary`). Propagée en prop aux onglets.
- **`isOwner`** = `view.created_by.whoAmI.id === userData.userId` (`useCurrentView.ts`).
- **`canShare = isOwner && canEditAdminView`** (`CurrentViewActions.tsx`) → si vrai, affiche
  `ShareControl` (toggle partage) ; sinon `SharedByLabel` (lecture seule, nom du créateur).
- Édition du label, bouton Sauvegarder, bouton Supprimer : gated par `isOwner`.
- Catalogue (`useViewCatalog`) : `myViews` (`created_by.id === userId`) vs `sharedViews`
  (`shared === true` d'un autre user). Les vues perso d'autrui sont invisibles.

### ⏳ Planifié — LEAVC-852 (pas encore codé)

- **Backend** : exposer les **groupes** de l'utilisateur connecté (sans requête supplémentaire)
  → enrichir le **contexte utilisateur** front → détecter le **profil admin** par groupe.
- **Roue dentée « attributs disponibles »** par onglet (Affichage / Filtres / Tris) : **visible
  admin seulement**. L'admin coche les attributs rendus disponibles aux utilisateurs.
- **Liste d'attributs** : l'admin voit **tous** les attributs de la bibliothèque ; l'utilisateur
  ne voit que ceux **rendus disponibles** (les actions épingle / œil / DnD sont restreintes en
  conséquence).
- Toggle de partage visible **uniquement** pour un profil admin (même s'il est propriétaire).
- Un filtre **caché** (pré-filtrage posé par app-studio) ne doit **pas** être sauvegardé dans la vue.
- État actuel du code : les onglets reçoivent `canEditAdminView` en prop mais **ne l'exploitent
  pas encore** (TODO, ex. commentaire `// TODO (admin)` dans `TabSorts.tsx`).

---

## Feature flag & événements

- **Feature flag** : `application.enableViewSettings` (`ApplicationRouting/schema.ts`, optionnel).
  Gate l'usage d'ExplorerV2 + volet (`Panel.tsx`, `PanelLibraryExplorer.tsx`,
  `PanelAttributeExplorer.tsx`, `useViewSettingsProps.ts`). Sinon → `Explorer` v1.
- **Événements internes** (bus `usePanelEventHandlers<AppStudioInternalEvent>` de `@leav/ui`,
  types dans `ApplicationRouting/types.ts`) :
    - `open-view-settings` : ouverture du volet (depuis le bouton/raccourci d'ExplorerV2).
    - `view-settings-select-view` : changement de vue active (depuis `TabCatalog` ou post-fork).

---

## Tests

Jest + Testing Library, `*.spec.ts(x)` colocalisés dans `__tests__/`. Le reducer est testé en
isolation (`store-current-view/__tests__/`), y compris `MOVE_SORT` / `SET_SORT_ORDER`.
