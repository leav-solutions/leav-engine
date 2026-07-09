# Explorer (v1) — CLAUDE.md

Tableau interactif de records d'une Library : colonnes configurables, filtres, tris,
vues sauvegardées, actions primaires / par ligne / en masse, sélection, pagination.

> ⚠️ **Statut : legacy en transition.** Ce composant sera remplacé par
> [`ExplorerV2`](../ExplorerV2/CLAUDE.md) (qui sera renommé `Explorer` une fois la migration
> ViewV2 terminée). **Pour tout nouveau développement de vues,
> cibler ExplorerV2.** Ce dossier n'est documenté que pour les modifications de maintenance.

---

## Explorer v1 vs ExplorerV2 — le point à comprendre en premier

`Explorer/` et `ExplorerV2/` sont **deux dossiers quasi jumeaux** : ExplorerV2 est un fork
allégé de v1. Le **mode réel de v1 est non contrôlé** (`defaultViewSettings`). v1 expose certes
une prop `currentView` dans sa signature, mais elle est **inutilisée / code mort** (voir plus
bas) — la vraie distinction porte sur **ce que chacun embarque** :

|                            | **Explorer (v1)**                                                              | **ExplorerV2**                                                      |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Volet de configuration     | **Intégré** (`manage-view-settings/`, `SidePanel` rendu en portal)             | **Aucun** — externalisé dans app-studio (cf. ADR-006)               |
| Chargement des vues        | **Lui-même** (`useViewSettingsReducer` + `useLoadView` + `list-saved-views/`)  | **Jamais** — reçoit `currentView` en prop                           |
| API compound               | `Explorer.SettingsSidePanel`, `useEditSettings`, `EditSettingsContextProvider` | Aucune (index exporte juste `ExplorerV2` + type `SerializedViewV2`) |
| Mode principal             | **Non contrôlé** via `defaultViewSettings`                                     | **Contrôlé pur** via `currentView`                                  |
| `manage-view-settings-v2/` | Présent mais **vestige inerte** (superseded par ExplorerV2)                    | Présent (seul système de vue)                                       |

> ⚠️ **Vestiges de migration à nettoyer (code mort).** v1 porte des restes du prototypage du
> volet de config _dans_ v1 (commits LEAVC-807/850), **avant** que `ExplorerV2` ne soit forké :
> la prop `currentView` (déstructurée mais jamais utilisée dans le corps) et le câblage
> `manage-view-settings-v2/` (`useOpenViewSettingsV2`). Dans le chemin v1 réel d'app-studio
> (`PanelLibraryExplorer` branche `else`, flag OFF) **aucun callback `viewSettings` n'est passé**,
> donc ces raccourcis sont **inertes**. Ce ne sont **pas** un hybride volontaire : c'est du code
> mort, candidat au nettoyage (ticket de cleanup à créer). Le mode réellement utilisé de v1 reste
> le mode **non contrôlé** (`defaultViewSettings` + `SidePanel` interne).

---

## Consommateurs

- **`apps/app-studio`** — `panel-explorer/PanelLibraryExplorer.tsx` et `PanelAttributeExplorer.tsx`
  **basculent entre `Explorer` (v1) et `ExplorerV2`** selon le feature flag `enableViewSettings`.
  Les deux fichiers portent un TODO « à supprimer quand ExplorerV2 sera renommé Explorer ».
- **API publique `@leav/ui`** — `Explorer` est exporté et consommé par **AMP** et **xStream**.
  Toute rupture d'API ici impacte ces repos externes.

---

## Props (`IExplorerProps`)

| Prop                           | Rôle                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `entrypoint`                   | Cible : `library` / `link` / `tree` (obligatoire)                                                                              |
| `defaultViewSettings`          | **Mode v1 (non contrôlé)** : `viewId`, `attributesIds`, `sort`, `filters`, `filtersOperator`, `enableConfigureView`            |
| `currentView?: SerializedView` | ⚠️ **Inutilisé en v1 (code mort)** — vestige de migration, voir l'encadré ci-dessus                                            |
| `defaultPrimaryActions`        | `'create'`                                                                                                                     |
| `defaultMassActions`           | `'deactivate' \| 'export' \| 'editAttribute' \| 'generatePreviews'`                                                            |
| `defaultActionsForItem`        | `'replaceLink' \| 'remove' \| 'activate'`                                                                                      |
| `defaultCallbacks`             | Callbacks `item` / `primary` / `mass` / `viewSettings`                                                                         |
| Flags d'affichage              | `showFilters`, `showSorts`, `showSearch`, `showTitle`, `noPagination`, `selectionMode`, `disableSelection`, `hideTableHeader`… |

Ref `IExplorerRef` : `createAction`, `linkAction`, `totalCount` (nombre de records filtrés).

**API compound** (exposée via `index.ts`) :

```tsx
Explorer.EditSettingsContextProvider; // provider du volet de config
Explorer.useEditSettings; // état/ouverture du volet
Explorer.SettingsSidePanel; // composant volet (à monter là où on veut, rendu en portal)
```

---

## Gestion d'état — le point sensible

Explorer v1 **possède** son état de vue. Trois briques :

1. **`useViewSettingsReducer(entrypoint, defaultViewSettings, ignoreViewByDefault)`**
   → `{loading, view, dispatch, error}`. `view: IViewSettingsState` (viewType, attributesIds,
   sort, pageSize, `enableConfigureView`…). Actions : `RESET`, `ADD_ATTRIBUTE`,
   `REMOVE_ATTRIBUTE`, `CHANGE_VIEW_TYPE`, `ADD_SORT`, `SET_SELECTED_KEYS`, `LOAD_VIEW`…
2. **Deux contextes** : `ViewSettingsContext` (`{view, dispatch}`) et `FiltersContext`
   (`useFiltersReducer` — filtres + pré-filtres masqués `hidden:true`).
3. **Hydratation asynchrone** : charge les vues de la library (`useGetViewsList`) → résout
   `viewId` (ou la dernière vue ajoutée si `ignoreViewByDefault` ≠ true, voir `useLoadView`)
   → charge la méta des attributs → `dispatch(RESET)` une fois tout prêt
   (`loading === false`).

**État éphémère NON persisté dans la vue** : sélection de masse (constante `MASS_SELECTION_ALL`
pour « tout sélectionner »), pagination courante, recherche fulltext.

`enableConfigureView` (porté par `view`) gate l'affichage des boutons de configuration de la
vue dans la toolbar (filtres, raccourcis `useOpenViewSettingsV2`, bouton volet `useOpenViewSettings`).

---

## Sous-features (un dossier ≈ une feature)

| Dossier / fichier                                                           | Rôle                                                                                                                   |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `actions-primary/`                                                          | Boutons « Créer » (`useCreatePrimaryAction`) et « Lier » (`useLinkPrimaryAction`)                                      |
| `actions-item/`                                                             | Actions par ligne : `useEditStatusItemAction` (activer/désactiver), `useReplaceItemAction` (remplacer lien)            |
| `actions-mass/`                                                             | Actions en masse ; `edit-attribute/` = édition d'attribut `tree` avec dépendances                                      |
| `manage-view-settings/`                                                     | **Volet de config legacy** : `configure-display/`, `filter-items/`, `sort-items/`, `save-view/`, `open-view-settings/` |
| `manage-view-settings-v2/`                                                  | Raccourcis v2 greffés (`useOpenViewSettingsV2`) pour la transition                                                     |
| `list-saved-views/`                                                         | Dropdown des vues sauvegardées                                                                                         |
| `link-item/`                                                                | Ajout/remplacement de liens en masse                                                                                   |
| `DataView.tsx`                                                              | Rendu du tableau (wrapper `KitTable`)                                                                                  |
| `ExplorerToolbar.tsx` / `ExplorerTitle.tsx` / `ExplorerFiltersAndSorts.tsx` | Header, titre, barre filtres+tris                                                                                      |

---

## GraphQL (`_queries/`)

- `useExplorerData` (records + méta attributs, `explorerQuery.graphql`) — `skip` tant que les
  view settings ne sont pas prêts.
- `useGetViewsList` (vues de la library), `useExplorerAttributes` (méta attributs),
  `useExplorerCountData` (compte total, distinct du compte filtré).
- `useExecuteUpdateViewMutation` (sauvegarde de vue, `updateViewMutation.graphql`).
- Subscription `useGetRecordUpdatesSubscription` (MAJ temps réel des records).

> Pattern `@leav/ui` : écrire l'opération dans `_queries/` proche de l'usage, puis
> `yarn graphql-generate`. **Ne jamais éditer `_gqlTypes/index.ts` à la main.**

---

## Tests

Jest + Testing Library, wrapper obligatoire `TestProviders` (`src/_tests/TestProviders.tsx`).
Fichiers colocalisés (`*.test.tsx`).
