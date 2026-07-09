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
  intentions** (`onViewSettingsShortcutClick`) et **consommer** la vue.
- **Filtres = vue contrôlée** (ADR-006 / LEAVC-810) : les filtres utilisateur transitent par
  `currentView.filters` (forme **lean** sérialisable), comme l'affichage et les tris. ExplorerV2 a
  **toujours** son **store interne** (`useControlledFilterStore`, `@leav/ui`), semé depuis
  `currentView.filters` ; **plus de détection « ambiant »** ni de `FiltersContext` partagé avec le volet.
  Native et iframe se comportent donc identiquement. Les éditions/suppressions remontent à l'hôte via
  `defaultCallbacks.viewSettings.onFiltersChange` (**echo-suppressed** : un seed/une valeur poussée par
  l'hôte ne re-déclenche pas l'émission). Les pré-filtres masqués `hidden:true` restent des filtres
  **pleins** (non lean) et sont fusionnés à la requête sans passer par le store.

---

## Props principales (`IExplorerProps`)

| Prop                                                                     | Rôle                                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `entrypoint`                                                             | Cible : `library` / `link` / `tree` (obligatoire)                                                      |
| `currentView?: SerializedView`                                           | **Vue contrôlée** : display + filtres user **lean** + pré-filtres masqués `hidden` (pleins).           |
| `defaultCallbacks.viewSettings`                                          | `onViewSettingsShortcutClick`, `closeViewSettings`, `onFiltersChange` (édition/suppression de filtres) |
| `defaultPrimaryActions` / `defaultMassActions` / `defaultActionsForItem` | Mêmes valeurs que v1                                                                                   |
| Flags                                                                    | `showFilters`, `showSorts`, `showSearch`, `showTitle`, `noPagination`, `selectionMode`…                |

Ref `IExplorerRef` : `createAction`, `linkAction`, `totalCount`.

### `SerializedView` (`_types.ts`) — contrat avec app-studio

```ts
type SerializedView = {
    viewId?: string | null;
    viewLabels?: Record<string, string>;
    viewType?: ViewType;
    attributesIds?: string[];
    sort?: Array<{field: string; order: SortOrder}>; // l'ordre du tableau = priorité de tri
    filters?: Array<SerializedFilter | HiddenFullFilter>; // filtres user lean + pré-filtres masqués (pleins), discriminés par `hidden`
    filtersOperator?: 'AND' | 'OR';
    shortcuts?: ViewSettingsShortcuts[]; // onglets du volet exposés en boutons-raccourcis
    displaySettings?: Record<string, unknown>; // config d'affichage OPAQUE d'un panel custom (ex. timeline planning), non interprétée par ExplorerV2 ; round-trip hôte↔iframe + persistée dans view.display.settings (LEAVC-924)
};

// SerializedFilter (lean, sérialisable) = {attributes:[{id,label?}], condition, values, pinned?}
// HiddenFullFilter = UIFilter & {hidden:true} (pré-filtre masqué, consommé tel quel, jamais lean-ifié)
```

**Raccourcis (`shortcuts`)** : liste des onglets du volet (`catalog | display | filters | sorts`)
exposés en boutons dans la toolbar. `useOpenViewSettingsV2` rend un bouton par entrée, **toujours
dans l'ordre canonique** `catalog → display → filters → sorts` (l'ordre stocké ne fait que filtrer,
pas ordonner). Fallback `['display']` si la liste est vide (l'API garantit déjà ce défaut à la
création — cf. champ `shortcuts` de `ViewV2`, LEAVC-892). Lecture seule pour l'instant ; l'édition
viendra dans un ticket ultérieur.

Exporté sous l'alias **`SerializedViewV2`** dans l'API publique `@leav/ui` (c'est le nom que
app-studio importe). Construit par `panel-view-settings/store-current-view/viewV2ToSerializedView.ts`.

---

## Internes

| Fichier / dossier             | Rôle                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useViewSettingsReducer.ts`   | Fusionne `currentView` (config display reçue) + état éphémère local (recherche, pagination, sélection de masse)                                        |
| `manage-view-settings-v2/`    | `store-view-settings/`, `useOpenViewSettingsV2.tsx`, type `ViewType`, `defaultPageSizeOptions`                                                         |
| store de filtres              | `useControlledFilterStore` (`@leav/ui`), **toujours interne**, semé depuis `currentView.filters` (lean) ; émet via `onFiltersChange` (echo-suppressed) |
| `ExplorerFiltersAndSorts.tsx` | Barre filtres + tris                                                                                                                                   |
| `_queries/`                   | `useExplorerData` (records), `useExplorerCountData` (compte total)                                                                                     |

**Pré-filtres `hidden:true`** : injectés par le parent dans `currentView.filters` (ex. le
pré-filtre de liaison de `PanelAttributeExplorer`). Ils restent des filtres **pleins** (`HiddenFullFilter`),
ne vont **pas** dans le store éditable, mais sont **fusionnés à la requête**
(`requestFilters = [...hiddenFilters, ...storeFilters]`) et **exclus de l'UI**.

---

## Câblage avec app-studio (vue d'ensemble)

```
CurrentViewStoreProvider (HUB : view.filters lean, persistance + isDirty)
        │  viewV2ToSerializedView()                          ▲ onFiltersChange (édition/suppression toolbar)
        ▼                                                    │  setFilterConfig / toggleFilterPinned (réconciliation)
SerializedView.filters (lean) ──useViewSettingsProps──▶ <ExplorerV2/>  → store interne (Spoke B, useControlledFilterStore)
        │                                                       (FiltersToolBar + requête records)
        └─ ViewSettingsContainer → VoletFiltersProvider (Spoke A) → store interne du volet (CommonFilterItem)
```

Deux **spokes découplés** (volet, ExplorerV2) reconstruisent chacun un store `UIFilter` riche depuis le
même hub lean et n'écrivent que du lean ; **aucun `FiltersContext` partagé** entre eux (→ message-ready
pour l'iframe). Côté app-studio, `panel-explorer/PanelLibraryExplorer.tsx` monte `ExplorerV2` (ou le
`Explorer` v1 selon le feature flag `enableViewSettings`).

---

## Tests

Jest + Testing Library, wrapper `TestProviders`. Voir `Explorer.test.tsx`, `TableCell.test.tsx`.
