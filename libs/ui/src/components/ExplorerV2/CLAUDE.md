# ExplorerV2 — CLAUDE.md

Tableau interactif de records d'une Library, version **contrôlée**. Fork allégé de
[`Explorer` (v1)](../Explorer/CLAUDE.md), destiné à le remplacer : `index.ts` porte le TODO
« renommer `ExplorerV2` → `Explorer` une fois ViewV2 intégré et le v1 supprimé ».

> Décisions d'architecture : voir **ADR-006** (`docs/adr/ADR-006-explorer-views-settings-volet.md`).
> Ce document ne les réplique pas, il décrit l'implémentation côté composant.

---

## Principe : consommateur contrôlé pur

ExplorerV2 ne possède **aucune** config de vue persistée et n'embarque **aucun** volet de
configuration. La vue lui est fournie par **app-studio** (source de vérité) via l'unique prop
`currentView`. Différences concrètes avec v1 :

- **Pas de `manage-view-settings/`** legacy, pas de `SidePanel`, pas de `list-saved-views/`,
  pas de `useLoadView` : `index.ts` n'exporte que `ExplorerV2` + le type `SerializedViewV2`.
  Le seul système de vue est `manage-view-settings-v2/`.
- **Plus de `defaultViewSettings`** : remplacé par `currentView`. Les data queries
  (`useExplorerData`) restent **skippées tant que `currentView` n'est pas reçu**.
- Le volet vit dans app-studio (`panel-view-settings/`) ; ExplorerV2 ne fait qu'**émettre des
  intentions** (`onViewSettingsShortcutClick`, `onFiltersChange`) et **consommer** la vue.
- **Pas de contexte à fournir** : contrairement à v1 (qui requiert `EditSettingsContextProvider`
  pour le volet interne), ExplorerV2 se monte directement — aucun wrapper de contexte requis
  côté consommateur.

---

## Props principales (`IExplorerProps`)

| Prop                                                                     | Rôle                                                                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `entrypoint`                                                             | Cible : `library` / `link` / `tree` (obligatoire)                                       |
| `currentView?: SerializedView`                                           | **Vue contrôlée** (display + filtres, y c. pré-filtres masqués). app-studio la fournit. |
| `defaultCallbacks.viewSettings`                                          | `onViewSettingsShortcutClick`, `onFiltersChange`, `closeViewSettings`                   |
| `defaultPrimaryActions` / `defaultMassActions` / `defaultActionsForItem` | Mêmes valeurs que v1                                                                    |
| Flags                                                                    | `showFilters`, `showSorts`, `showSearch`, `showTitle`, `noPagination`, `selectionMode`… |

Ref `IExplorerRef` : `createAction`, `linkAction`, `totalCount`.

### `SerializedView` (`_types.ts`) — contrat avec app-studio

```ts
type SerializedView = {
    viewId?: string | null;
    viewLabels?: Record<string, string>;
    viewType?: ViewType;
    attributesIds?: string[];
    sort?: Array<{field: string; order: SortOrder}>; // l'ordre du tableau = priorité de tri
    filters?: UIFilter[]; // user filters + pré-filtres masqués hidden:true
    filtersOperator?: 'AND' | 'OR';
};
```

Exporté sous l'alias **`SerializedViewV2`** dans l'API publique `@leav/ui` (c'est le nom que
app-studio importe). Construit par `panel-view-settings/store-current-view/viewV2ToSerializedView.ts`.

---

## Internes

| Fichier / dossier             | Rôle                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `useViewSettingsReducer.ts`   | Fusionne `currentView` (config display reçue) + état éphémère local (recherche, pagination, sélection de masse)           |
| `manage-view-settings-v2/`    | `store-view-settings/`, `useOpenViewSettingsV2.tsx`, type `ViewType`, `defaultPageSizeOptions`                            |
| `useNotifyFiltersChange.ts`   | Émet `onFiltersChange` vers app-studio, **mais bloque l'émission initiale** pour éviter un faux état « dirty » côté volet |
| `ExplorerFiltersAndSorts.tsx` | Barre filtres + tris                                                                                                      |
| `_queries/`                   | `useExplorerData` (records), `useExplorerCountData` (compte total)                                                        |

**Pré-filtres `hidden:true`** : injectés par le parent dans `currentView.filters` (ex. le
pré-filtre de liaison de `PanelAttributeExplorer`). Ils sont **appliqués aux requêtes mais
exclus de l'UI**.

---

## Câblage avec app-studio (vue d'ensemble)

```
panel-view-settings (store-current-view) ──viewV2ToSerializedView()──▶ SerializedView
        │                                                                     │
        └─ CurrentViewStoreProvider (source de vérité)                        ▼
panel-explorer/useViewSettingsProps.ts ──── currentView ───▶ <ExplorerV2 currentView=… />
                                            onFiltersChange ◀── useNotifyFiltersChange
```

Côté app-studio, c'est `panel-explorer/PanelLibraryExplorer.tsx` qui monte `ExplorerV2` (ou le
`Explorer` v1 selon le feature flag `enableViewSettings`).

---

## Tests

Jest + Testing Library, wrapper `TestProviders`. Voir `Explorer.test.tsx`,
`useNotifyFiltersChange.test.tsx`, `TableCell.test.tsx`.
