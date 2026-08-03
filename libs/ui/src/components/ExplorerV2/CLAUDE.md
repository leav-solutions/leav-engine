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
  Contrairement aux tris (qui ne transitent que **pinned**), `currentView.filters` porte **tous**
  les filtres (pinned et non pinned) : un filtre non épinglé s'applique quand même à la requête
  (`requestFilters`), seule sa présence en chip toolbar est conditionnée au pin (`UIFilter` ne
  portant pas ce flag, `Explorer.tsx` calcule `pinnedFilterIds` directement depuis les
  `SerializedFilter` lean et filtre l'affichage dans `ExplorerFilters` avec).

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

Un tri n'est pas un filtre (LEAVC-588) : il n'a **plus** de gélule dans `ExplorerFilters`
(retirée, contrairement aux chips de filtres classiques qui restent affichés — pinned uniquement,
cf. plus bas). Pour compenser, "filters" et "sorts" sont chacun affichés en bouton-raccourci de la
toolbar **même absents de `shortcuts`**, dès qu'il y a une valeur active (`showFilters &&
hasActiveFilters` / `showSorts && view.sort.length > 0`) — sans changer les `shortcuts` de la vue.
Une pastille verte (`KitBadge dot color="success"`) signale cette valeur active sur le bouton,
qu'il soit un raccourci déjà configuré ou affiché dynamiquement.

Exporté sous l'alias **`SerializedViewV2`** dans l'API publique `@leav/ui` (c'est le nom que
app-studio importe). Construit par `panel-view-settings/store-current-view/viewV2ToSerializedView.ts`.

---

## Internes

| Fichier / dossier           | Rôle                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useViewSettingsReducer.ts` | Fusionne `currentView` (config display reçue) + état éphémère local (recherche, pagination, sélection de masse)                                        |
| `manage-view-settings-v2/`  | `store-view-settings/`, `useOpenViewSettingsV2.tsx`, type `ViewType`, `defaultPageSizeOptions`                                                         |
| store de filtres            | `useControlledFilterStore` (`@leav/ui`), **toujours interne**, semé depuis `currentView.filters` (lean) ; émet via `onFiltersChange` (echo-suppressed) |
| `ExplorerFilters.tsx`       | Barre de chips de filtres (pinned uniquement) — plus de chip de tri (LEAVC-588)                                                                        |
| `_queries/`                 | `useExplorerData` (records), `useExplorerCountData` (compte total)                                                                                     |
| `DataView.tsx`              | Routeur de mode d'affichage sur `viewType` : `kanban` → `kanban/KanbanView`, sinon `table/TableView`                                                   |
| `table/`                    | Mode Tableau : `TableView` + layout table-only (`TableNameCell`, `useColumnWidth`, `useTableScrollableHeight`)                                         |
| `kanban/`                   | Mode Kanban complet : rendu, pagination per-column et DnD — voir section dédiée                                                                        |
| `cells/`                    | Rendu de cellule **partagé** entre les modes (`TableCell`, `IdCard`, `TableTagGroup`) — utilisé par `table/` **et** `kanban/` (cartes)                 |
| `grouping/`                 | Regroupement partagé (`buildKanbanColumns`, `isValidGroupingAxis`, `groupFilters`, types `_types.ts`)                                                  |

---

## Mode Kanban (`kanban/`)

Plan et décisions : [`docs/explorer-kanban-plan.md`](../../../../../docs/explorer-kanban-plan.md).
Colonnes = nœuds racine de l'arbre lié à l'attribut axe (`groupByAttributeId`, dérivé du marqueur
`isGroupBy` de la vue). **Phase 1 : axe = attribut `tree` uniquement** — le picker d'app-studio filtre
via `isValidKanbanAxis` ; le prédicat général ADR-011 (`isValidGroupingAxis`, listes fermées incluses)
prendra le relais avec le lot 2 (LEAVC-1076). Métadonnées d'axe (`linked_tree`, `multiple_values`)
chargées **en amont** par `useKanbanAxisAttribute` (dans `KanbanView`) — ne pas les dériver des
records chargés (board vide).

**Deux chemins de données** :

- **Pagination par colonne** (entrypoint `library`) : `Explorer.tsx` **skip** `useExplorerData`
  (records) — mais **garde** `useExplorerCountData` (total bibliothèque pour le compteur de
  résultats / la sélection de masse) — et **appelle lui-même** `useKanbanColumnsData` (via la
  `kanbanDataSource` : filtres préparés, recherche, tris), puis passe les colonnes chargées à
  `KanbanView` en prop `kanbanColumns`. `KanbanView` est donc un **pur renderer** : plus de
  chargement de données en son sein. Ce choix (charger en amont) permet à `Explorer.tsx` d'alimenter
  la **même tuyauterie** que la vue liste — `ref.totalCount`, sélection de masse (« tout
  sélectionner »), compteur de résultats — à partir des colonnes : `totalCountFiltered` = **somme
  des `count` de colonnes** (arbres plats V1 → somme = total filtré), `allVisibleKeys` = **union des
  cartes chargées**. `useKanbanColumnsData` : `listDistinctValues` pour les compteurs (bucket `value:
null` → colonne « Sans valeur » ; ⚠️ pas de `searchQuery` sur cette query → compteurs non filtrés par
  la recherche, limitation V1), puis une page de `KANBAN_COLUMN_PAGE_SIZE` cartes **par colonne**
  (filtre d'égalité 3 segments `<attr>.<libDuNœud>.id`, helpers `grouping/groupFilters.ts`).
  « Voir plus » tant que `cards.length < count` **et** que la colonne n'est pas **épuisée**
  (`isExhausted` : une page revenue courte/vide = plus rien côté serveur, même si le `count` —
  aveugle à la recherche — prétend le contraire ; sinon bouton mort) ; offset suivant =
  `cards.length`. État pur dans
  `kanbanColumnsReducer`, colonnes montées par `assembleKanbanColumns`. Aucune carte masquée
  silencieusement (plus de cap global ni de bandeau de troncature). ⚠️ `listDistinctValues` compte **par
  nœud exact** : un record pointant un nœud non-racine n'apparaît dans aucune colonne (V1 = arbres
  plats). Le board se recharge intégralement (reset + reload, profondeur déjà chargée par colonne
  conservée) sur tout changement de vue et sur un événement `recordUpdate` **externe** (subscription) ;
  pendant cette fenêtre de reload, `isReloading` est propagé jusqu'aux colonnes (`isBoardReloading`)
  pour qu'un state essuyé (`count: 0`) affiche un loader et non « Aucun élément ».
  ⚠️ La subscription `recordUpdate` est filtrée par library : elle reçoit **aussi l'écho de nos
  propres écritures** de drag & drop. Ces échos sont **ignorés** (`selfWriteEchoTimersRef` : l'id est
  marqué par `markSelfWrite` avant l'écriture, ce qui ouvre une **fenêtre de suppression bornée** —
  `KANBAN_SELF_WRITE_ECHO_WINDOW_MS`). Une écriture pouvant émettre **0, 1 ou N** échos (delete+create
  de valeur, ré-indexation…), **tous** les échos de l'id sont avalés tant que la fenêtre est ouverte
  (pas de « consommation au premier ») ; la fenêtre **expire seule** pour qu'une vraie modif externe
  ultérieure du même record ne soit jamais avalée, et un échec d'écriture la ferme via `clearSelfWrite`.
  Sinon chaque déplacement provoquait un reset + reload complet du board (clignotement) alors que le
  move est déjà réconcilié optimistiquement. `isInitialLoading` ne vaut `true` **qu'au premier
  chargement** (`isCountsLoading && !countsData`), pour qu'un refetch de fond ne démonte pas le board.
- **Fallback `link`** : set global chargé en amont, réparti **client-side** (`grouping/buildKanbanColumns`),
  sans `kanbanColumns`.

**Drag & drop** (`dnd-kit`, ADR-001) — déplacer une carte écrit la nouvelle valeur d'axe :

- **Workflow en amont** : `useKanbanTransitions` charge une fois par board les
  `allowedDependentValues` de l'attribut (`kanbanTransitionsQuery`) ; pendant un drag,
  `getDroppableColumnIds` (gating par `nodeId`) ne rend droppables que les colonnes autorisées depuis
  le nœud courant (les autres sont grisées). La colonne « Sans valeur » n'est droppable que si la
  transition vers `null` est permise (effacement, `deleteEmpty`).
- **Écriture** : `useKanbanCardTransition` → `useExecuteSaveValueBatchMutation` (mono-valeur :
  remplacement sans `id_value` ; drag désactivé si l'axe est multivalué ou sans `edit_value`).
- **UI optimiste** : le déplacement vit dans un overlay local (`applyKanbanMoveOverlay`), conservé
  jusqu'à réconciliation (`pruneReconciledMoves`). La réconciliation dépend du chemin : per-column →
  action reducer **`cardMoved`** (cartes + compteurs restent cohérents, **pas de refetch** ; l'écho
  `recordUpdate` de cette écriture est ignoré, cf. plus haut) ; link → donnée fraîche via la
  subscription de `useExplorerData`. En cas de refus du moteur : rollback de l'overlay,
  `KitAlert.error`, et **refresh ciblé des deux colonnes impactées** uniquement (`reloadColumns`
  sur source + destination), jamais un reload complet du board.
- Le clic d'ouverture de record coexiste avec le drag via `CARD_DRAG_ACTIVATION_DISTANCE`
  (`_constants.ts`).

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

Jest + Testing Library, wrapper `TestProviders`. Voir `Explorer.test.tsx`, `cells/TableCell.test.tsx`.
