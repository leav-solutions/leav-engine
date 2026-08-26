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

| Fichier / dossier           | Rôle                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useViewSettingsReducer.ts` | Fusionne `currentView` (config display reçue) + état éphémère local (recherche, pagination, sélection de masse)                                                                                                                                                                                                                                                      |
| `manage-view-settings-v2/`  | `store-view-settings/`, `useOpenViewSettingsV2.tsx`, type `ViewType`, `defaultPageSizeOptions`                                                                                                                                                                                                                                                                       |
| store de filtres            | `useControlledFilterStore` (`@leav/ui`), **toujours interne**, semé depuis `currentView.filters` (lean) ; émet via `onFiltersChange` (echo-suppressed)                                                                                                                                                                                                               |
| `ExplorerFilters.tsx`       | Barre de chips de filtres (pinned uniquement) — plus de chip de tri (LEAVC-588)                                                                                                                                                                                                                                                                                      |
| `_queries/`                 | `useExplorerData` (records — **données uniquement**, plus aucune métadonnée d'attribut), `useExplorerCountData` (compte total), `useExplorerLibraryMetadata` (library + **tous** ses attributs, label déjà localisé, chargés une fois en amont dans `Explorer.tsx` et redescendus en props — voir ci-dessous ; dérive aussi `libraryColorConfigById`, voir plus bas) |
| `DataView.tsx`              | Routeur de mode d'affichage sur `viewType` : `kanban` → `kanban/KanbanView`, sinon `table/TableView`                                                                                                                                                                                                                                                                 |
| `table/`                    | Mode Tableau : `TableView` + layout table-only (`TableNameCell`, `useColumnWidth`, `useTableScrollableHeight`)                                                                                                                                                                                                                                                       |
| `kanban/`                   | Mode Kanban complet : rendu, pagination per-column et DnD — voir section dédiée                                                                                                                                                                                                                                                                                      |
| `cells/`                    | Rendu de cellule **partagé** entre les modes (`TableCell`, `IdCard`, `TableTagGroup`) — utilisé par `table/` **et** `kanban/` (cartes)                                                                                                                                                                                                                               |
| `grouping/`                 | Regroupement partagé (`buildKanbanColumns`, `isValidGroupingAxis`, `groupFilters`, types `_types.ts`)                                                                                                                                                                                                                                                                |
| `column-split/`             | Dépliage d'une colonne du mode tableau en une sous-colonne par valeur possible (LEAVC-1073/1074/1075) — voir section dédiée                                                                                                                                                                                                                                          |

> ⚠️ `cells/IdCard.tsx`, `cells/TableCell.tsx` et `table/TableNameCell.tsx` sont des **copies** de
> leurs homologues v1 (`Explorer/IdCard.tsx`, `Explorer/TableCell.tsx`, `Explorer/TableNameCell.tsx`)
> — `IdCard.tsx` est byte-identique, les deux autres ne diffèrent que par le type des propriétés
> d'attribut consommé (`CellAttributeProperties` local ici vs `AttributePropertiesFragment` direct
> en v1). Ce n'est documenté nulle part ailleurs : une correction générique touchant leur rendu est
> normalement à porter dans les deux dossiers (vérifier avec `diff -rq`), comme pour
> `actions-mass/edit-attribute/` — sauf décision explicite de ne pas la porter en v1 (cf. juste
> en dessous).

### Réserver l'espace couleur de l'`IdCard` uniquement si la Library le configure (LEAVC-1133)

`IdCard` ne rend le bandeau couleur (`.card-color`) que si `hasColorConfigured` (prop, défaut
`true`) est vrai — sinon, sans valeur de couleur, aucun bandeau n'est rendu (pas d'espace réservé).
Sans cette info, on ne peut pas distinguer « la Library n'a pas d'attribut couleur configuré » de
« l'attribut est configuré mais vide pour ce record » : `whoAmI.color` (résolu côté serveur) est
`null` dans les deux cas, d'où le besoin de la config de la Library elle-même
(`recordIdentityConf.color`).

`libraryColorConfigById` (`useExplorerLibraryMetadata`) est un lookup `libraryId → boolean` qui
couvre **plusieurs** Libraries, pas seulement celle de l'entrypoint — un `IdCard` peut afficher un
record de la Library ciblée par un attribut `link` (`linked_library`), ou de n'importe laquelle des
Libraries liées à l'arbre d'un attribut `tree` (`linked_tree.libraries`, potentiellement plusieurs
par colonne). Les trois sont résolues en **un seul aller-retour réseau** (`ExplorerV2LibraryMetadata`
étendue, pas de query en cascade) : `linked_library`/`linked_tree.libraries.library` sont des champs
`Library` à part entière côté schéma, non filtrés par le `$libraryId` de la query racine — voir les
resolvers `attributeApp.ts`/`treeApp.ts` côté `apps/core` si le doute revient. Chaque site d'appel
d'`IdCard` (nom, cellule `link`, cellule `tree`) résout sa propre entrée du lookup via
`whoAmI.library.id` et retombe sur `true` (réserve l'espace) si l'id est absent de la map.

> ⚠️ `actions-mass/edit-attribute/` **n'est plus une copie intégrale** de son homologue v1 :
> `useMassEditableAttributes.tsx` (dérivation pure depuis `attributesProperties`, sans requête) et
> `_types.ts` (`MassEditableAttribute.label: string`, `dependencies[].label` supprimé) ont
> divergé — le reste du dossier (modales, mapping `saveValueBulk`…) reste identique. La sémantique
> du mapping `saveValueBulk` (`after: null` **vide** la valeur, « ne pas changer » = entrée omise,
> d'où la sentinelle `DO_NOT_CHANGE`) est documentée dans
> [`Explorer/CLAUDE.md`](../Explorer/CLAUDE.md#édition-en-masse--la-sémantique-de-after-dans-savevaluebulk).

### Densité du tableau (format S) — où se règle quoi

| Ce qu'on veut régler               | Où                                                                   |
| ---------------------------------- | -------------------------------------------------------------------- |
| Hauteur de ligne (corps)           | `tableRowHeight` dans `table/TableView.tsx` (`min-height` du styled) |
| Hauteur de l'en-tête               | prop `headerLineSize` de `KitTable` (`'s'` → 48px, `'m'` → 56px)     |
| Hauteur du scroll du corps         | `headerTableHeight` dans `table/useTableScrollableHeight.ts`         |
| Hauteur des boutons d'action ligne | prop `size` des `KitButton` de `table/TableNameCell.tsx`             |
| Gabarit de l'IdCard de ligne       | prop `size` du `KitIdCard` de `cells/IdCard.tsx`                     |

> ⚠️ **Poser `height` sur `.ant-table-thead > tr > th` depuis le styled component ne sert à rien** :
> la règle du DS, qui descend de `._kit-table_… .ant-table-wrapper` jusqu'au `th`, gagne toujours en
> spécificité. L'en-tête se règle **uniquement** par `headerLineSize`. Corollaire : `headerTableHeight`
> (calcul de la hauteur scrollable) doit être tenu à la main en miroir du token DS correspondant —
> rien ne les relie. Une colonne dépliée ajoute une deuxième ligne d'en-tête mais **ne change pas**
> cette hauteur totale : les deux lignes se partagent les 48 px (voir plus bas).

Le `height` posé par le DS sur un `th` est un **plancher**, pas un plafond : un libellé de colonne
qui passe sur plusieurs lignes fait grandir la ligne d'en-tête au lieu d'être rogné.

Depuis le passage de l'explorateur en S (LEAVC-1135), la prop publique `useSmallHeaderSize` ne pilote
plus la taille de l'en-tête (toujours `'s'`) mais seulement l'`ellipsis` des colonnes.

> ⚠️ **Le conteneur de la cellule « nom » doit rester block-level** (`display: flex`, pas
> `inline-flex`). Une boîte inline se pose sur la baseline de la cellule ; quand l'IdCard porte une
> barre de couleur, sa baseline tombe sur son bord bas et le `line-height: 22px` de la cellule ajoute
> son demi-interligne **sous** la boîte — la ligne mesurait alors 49,19px au lieu de 48 et décalait
> toutes les colonnes par rapport à l'en-tête. Le symptôme n'apparaît que sur les records qui ont une
> couleur, et il était masqué tant que le plancher valait 56px.

---

## Affichage cellules en badge compteur (LEAVC-1119)

Une colonne de liaison ou d'arbre **multivaluée** affichée en badge compteur
(`multi_link_display_option` / `multi_tree_display_option` = `badge_qty`) n'a besoin que d'un
`valuesCount` côté serveur, jamais des valeurs (identité complète des entités liées, `whoAmI`
compris). `splitBadgeColumns` (`_queries/splitBadgeColumns.ts`) répartit les `attributeIds` d'une
vue entre `dataAttributeIds` (sélection `properties`, valeurs complètes) et `badgeAttributeIds`
(sélection aliasée `badgeProperties`, `{attributeId, valuesCount}` seul).

- **Calcul pur, pas de requête dédiée** : le split dérive uniquement d'`attributesProperties`, déjà
  chargé en amont par `useExplorerLibraryMetadata` (voir ci-dessus)
- **`metadataLoading` gate désormais la requête records** (`useExplorerData`, en plus de
  `isViewReady`/`isFiltersSeeded`) : le split dépend d'`attributesProperties`, donc la requête
  records doit rester skippée tant qu'il n'est pas connu — sinon elle partirait une première fois
  avec la liste non découpée (chargeant exactement les identités que le split évite), puis
  repartirait une fois le split résolu. Skip-puis-tire, jamais tire-puis-retire.
- **`propertiesById` et `valuesCountById` sont disjoints** (`IItemData`, `_types.ts`) : un attribut
  compté n'a **pas** d'entrée dans `propertiesById` (le serveur n'a jamais envoyé ses valeurs).
  `TableView`/`KanbanCardContent` passent `values={item.propertiesById[id] ?? emptyValues}` (une
  constante de module, pour garder une référence stable) et `valuesCount={item.valuesCountById[id]}`.
- **L'axe de regroupement kanban n'est jamais compté**, même s'il est configuré en `badge_qty` :
  `splitBadgeColumns` l'exclut explicitement du côté badge, parce que `buildKanbanColumns` lit sa
  valeur dans `propertiesById` pour répartir les cartes — un axe compté casserait le regroupement.
- Le mono-valué ignore `badge_qty` (le prédicat `isCountOnlyColumn` exige `multiple_values`) : il
  reste sur le rendu IdCard, qui a besoin de l'identité complète.

Le contrat de synchronisation de `useKanbanColumnsData` (per-column pagination) inclut
`badgeAttributeIds` au même titre que `attributeIds` : les deux voyagent dans `IKanbanDataSource`
et dans les variables de la requête par colonne.

---

## Édition en masse d'attribut (`actions-mass/edit-attribute/`)

> ⚠️ **Copie intégrale de son homologue v1, sauf deux fichiers** : `useMassEditableAttributes.tsx`
> (dérivation pure depuis `attributesProperties`, sans requête serveur ni `libraryId`) et `_types.ts`
> (`MassEditableAttribute.label` en `string` déjà localisé, `dependencies[].label` supprimé —
> jamais lu). Toute correction hors de ces deux fichiers est à porter dans les deux dossiers
> (vérifier avec `diff -rq`).

### La sémantique de `after` dans `saveValueBulk`

Le mapping envoyé au serveur ne connaît que deux gestes, et l'un des deux **ne s'exprime pas** :

- `after: <nodeId>` remplace la valeur, `after: null` **vide** la valeur (→ `valueDomain.deleteValue`) ;
- « ne pas changer » se dit en **omettant l'entrée du mapping**, jamais par une valeur d'`after`.

D'où la sentinelle front `DO_NOT_CHANGE` (`edit-attribute/_types.ts`), volontairement distincte de
`null` : c'est leur confusion qui avait rendu l'option « Ne pas changer » destructrice (LEAVC-1105).

Le **vidage en masse n'est volontairement pas offert** par l'UI depuis ce correctif : aucune option
du sélecteur ne produit `after: null`. Ce n'est pas une régression à « restaurer » — il faudra une
option explicitement nommée, et de préférence conditionnée à l'autorisation de transition vers
`null` du workflow (`allowedDependentValues` accepte un `nodeId` nul, mais
`useTreeNodesCandidates.tsx` l'écarte aujourd'hui).

---

## Mode Kanban (`kanban/`)

Plan et décisions : [`docs/explorer-kanban-plan.md`](../../../../../docs/explorer-kanban-plan.md).
Colonnes = nœuds racine de l'arbre lié à l'attribut axe (`groupByAttributeId`, dérivé du marqueur
`isGroupBy` de la vue). **Phase 1 : axe = attribut `tree` uniquement** — le picker d'app-studio filtre
via `isValidKanbanAxis` ; le prédicat général ADR-011 (`isValidGroupingAxis`, listes fermées incluses)
prendra le relais avec le lot 2 (LEAVC-1076). Les métadonnées d'attribut (dont celles de l'axe —
`linked_tree`, `multiple_values`) ne viennent **jamais** des records : elles sont lues dans
`attributesProperties`, chargé en amont par `useExplorerLibraryMetadata` (`Explorer.tsx`) et
redescendu en prop à `KanbanView` — donc disponibles même quand le board n'a encore aucune carte.

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

## Dépliage de colonne (`column-split/`)

En mode `list` (`table/TableView`), une colonne d'attribut à **liste de valeurs fermée** (LEAVC-1073) ou
de type **arbre à un seul niveau** (LEAVC-1074) peut être **dépliée** en une sous-colonne par valeur
possible ; chaque cellule porte une case à cocher (ou un bouton radio) qui lit/écrit la présence de cette
valeur sur l'enregistrement de la ligne.

**Deux sources d'options, un seul point d'entrée.** `useColumnSplitSources(attributs dépliables)` rend, par
id d'attribut, ses sous-colonnes **ou** la raison pour laquelle il n'en a pas (`IColumnSplitSource`, dont
l'`unavailableReasonKey` est une clé i18n de `_constants.ts` — jamais une chaîne traduite, pour que la
résolution reste pure) :

| Type d'attribut | Source des options                                           | Chargement                                  |
| --------------- | ------------------------------------------------------------ | ------------------------------------------- |
| standard / lien | `valuesList` du fragment `ExplorerV2AttributeProperties`     | déjà là (`getColumnSplitOptions`, **pure**) |
| arbre           | les **nœuds racine** de `linked_tree` (`TREE_NODE_CHILDREN`) | une requête par arbre distinct              |

Les champs `column_split_enabled`, `required`, `permissions.edit_value` **et** `valuesList` sont portés par
`_queries/libraryMetadataQuery.graphql`, jouée une seule fois en amont pour toute la Library : pour les
listes de valeurs, **aucune requête par attribut** au dépliage, donc aucun état de chargement à gérer.

> ⚠️ Ne pas sortir ces champs dans une requête dédiée pour alléger la requête de métadonnées : celle-ci
> tourne **une fois par Library**, là où une requête par attribut — ou un retour dans la requête de
> **records**, rejouée à chaque page — multiplierait les allers-retours.

**Pourquoi les arbres échappent à la règle** : les nœuds ne sont pas dans les métadonnées d'attribut, et
`splitAttributeIds` est de longueur variable — appeler `useTreeNodeChildrenQuery` une fois par arbre
violerait les règles des hooks. D'où le **fan-out impératif `apolloClient.query`** dans
`useColumnSplitSources`, exactement le pattern de `kanban/useKanbanColumnsData` pour ses pages de colonne.
**Ne pas** contourner ça par un composant-pont par colonne dépliée qui remonterait le résultat de son
hook. Le fan-out est indexé par **id d'arbre**, pas par attribut : deux attributs sur le même arbre
partagent un seul fetch, `cache-first`.

> ⚠️ Les arbres sont requêtés pour toute colonne dépliable **affichée**, dépliée ou non — pas seulement au
> dépliage. La platitude d'un arbre n'est connue que de ses nœuds, et le bouton doit être désactivé
> **avant** le clic : autrement le premier clic ne ferait visiblement rien, puis désactiverait le bouton
> après coup, avec un repli automatique et un `KitAlert.info` pour l'expliquer. Le coût est d'une requête de
> nœuds racine par colonne arbre dépliable affichée — un paramètre que l'admin active attribut par attribut,
> donc 0 à 2 en pratique.

**Un arbre n'est dépliable que s'il est plat** : dès qu'**un** nœud racine a des enfants,
`mapTreeNodesToSplitSource` déclare tout l'attribut indépliable (`unavailable_multi_level_tree`) plutôt que
de déplier sur les racines en perdant leurs descendants. Les arbres à plusieurs niveaux sont hors périmètre
du lot 1 d'édition grille.

⚠️ **La clé d'une option d'arbre est l'id du NŒUD, jamais celui de son enregistrement** : un même
enregistrement peut être rattaché à plusieurs nœuds, et le nœud est à la fois ce que porte la valeur d'un
record (`treePayload.id`) et ce que `saveValueBatch` attend à l'écriture. Le kanban, lui, apparie ses
cartes sur `treePayload.record.id` (`grouping/buildKanbanColumns.ts`) — uniquement parce que son fragment
est antérieur à l'ajout de ce `id`.

`isColumnSplittable(attribute)` = uniquement `column_split_enabled` (LEAVC-1075) — **pas**
`isValidGroupingAxis` (ADR-011), même si `values_list` est maintenant disponible : le lot 1 (core) garantit
déjà que le flag n'est vrai que sur un attribut éligible, et re-dériver l'éligibilité côté front
n'ajouterait qu'une seconde source de vérité divergeable. Quand un attribut flaggé n'a finalement rien à
déplier — liste vidée ou ouverte après coup, arbre à plusieurs niveaux, nœuds racine non chargés —
`TableView` **désactive** le bouton avec la raison en tooltip au lieu de le masquer ; une colonne déjà
dépliée retombe alors sur sa colonne simple. Un `IColumnSplitSource` à `options: []` **sans** raison est
l'état transitoire « nœuds en vol » : le bouton y reste actif, et le groupe apparaît de lui-même à
l'arrivée des nœuds.

**État éphémère, non persisté** (décision D6) : `splitAttributeIds: string[]` vit dans
`viewSettingsReducer` à côté de `fulltextSearch`/`massSelection` — survit à la pagination/au
tri/au filtre, disparaît au changement d'entrypoint (`RESET`) ou au démontage du composant.

**Overlay optimiste** (décision D1) : `useOptimisticSplitValues` tient un `Map<recordId, {[attributeId]:
string[]}>` des clés d'option ATTENDUES pendant qu'une écriture est en vol. Aucun `refetch()` manuel après
une écriture : `useWatchLibraryRecordUpdates` (voir `_queries/useExplorerData.ts`) rafraîchit
l'enregistrement touché en place, et un effet de réconciliation supprime l'entrée d'overlay dès que la
donnée fraîche confirme l'écriture qu'elle porte. Le rollback d'une écriture refusée n'est que la
suppression de cette même entrée — on retombe alors sur la donnée serveur, jamais modifiée.

⚠️ **L'overlay est fusionné DANS la donnée, pas lu à côté.** Le hook ne rend pas un accesseur mais
`items` : la liste des enregistrements, avec `optimisticSplitKeys` posé sur les **seules** lignes
touchées (une copie de l'item ; les autres gardent leur identité). C'est `items` qui alimente le
`dataSource` de la table, et la lecture se fait par la fonction pure `getSelectedKeys(item, attribute)`.
Raison : `shouldCellUpdate` ne voit **que** `(record, prevRecord)` — un overlay vivant à côté de la donnée
y est structurellement invisible, ce qui obligeait à forcer `true` (voir juste en dessous). **Ne pas
« re-simplifier »** en ressortant l'overlay de l'item : ça reviendrait à redessiner toutes les cellules de
toutes les colonnes dépliées à chaque clic.

> ⚠️ L'ensemble ATTENDU doit rester réconciliable : décocher une valeur d'un attribut **multivalué** ne
> retire que **cette** clé (`selectedKeys.filter(...)`), jamais l'ensemble entier. Un attendu `[]` face à
> une donnée serveur qui porte encore les autres valeurs ne réconcilie jamais — l'entrée d'overlay reste
> collée et fait apparaître la ligne comme vide indéfiniment.

**`shouldCellUpdate` des sous-colonnes compare vraiment** — `propertiesById[id]` **et**
`optimisticSplitKeys?.[id]`, les deux portés par l'item (voir ci-dessus). Un clic ne redessine donc que les
cellules dépliées de **sa** ligne. Deux choses à savoir avant d'y toucher :

- `shouldCellUpdate` pilote directement le `useMemo` qui appelle `render()`
  (`@rc-component/table`, `Cell/useCellRender.js`) : quand il rend `false`, `render()` n'est pas rappelé et
  l'élément précédent est réutilisé. Il **court-circuite** le `mark` interne d'antd — c'est lui qui décide,
  seul. Corollaire : un mémo React sur `ColumnSplitCell` serait redondant.
- **Un flag de niveau colonne y est structurellement invisible** : `isEditionDisabled` est identique sur
  `record` et `prevRecord`, donc son basculement ne peut pas être détecté depuis la comparaison. D'où le
  `hasEditionDisabledChanged` calculé dans `TableView` (ref + effet, l'effet ne tournant qu'**après** le
  commit qui a consommé le flag) et passé à `buildSplitColumnGroup` : il force une passe de mise à jour
  des cellules, **dans les deux sens**. Sans lui, sortir de la sélection de masse laissait les cases
  grisées. Même piège pour tout futur flag de colonne.

⚠️ **Corollaire : une cellule de split ne résout aucune dépendance elle-même.** `saveValues`
(`useSaveValueBatchMutation`) et `t` sont résolus **une fois** dans `TableView` et descendent en props
jusqu'à `ColumnSplitCell` via `buildSplitColumnGroup` ; `toggleSplitValue` est une **fonction pure**, pas un
hook. Les appeler depuis la cellule instanciait une mutation Apollo par cellule (lignes × sous-colonnes).
Ne pas « re-simplifier » en re-hookant la cellule.

⚠️ **Le fragment `PropertyValue` reste un jumeau byte-identique de celui d'`Explorer/_queries/`**
(cf. [`libs/ui/CLAUDE.md`](../../../CLAUDE.md#graphql--pattern)) : les deux champs ajoutés pour ce lot —
`id_value` (retirer UNE valeur d'un attribut multivalué) et `treePayload.id` (le nodeId, lot 3) — ont donc
été répercutés à l'identique dans `Explorer/_queries/explorerQuery.graphql`, bien que v1 ne les consomme
pas. Les métadonnées d'attribut, elles, n'ont plus de jumeau : v2 n'a plus de fragment
`AttributeProperties` dans sa requête de records.

### Le rendu de l'en-tête imbriqué n'est pas porté par le DS

`KitTable` ne sait styler qu'**une** ligne d'en-tête : ses règles de bordure et d'arrondi sur les `th`
sont écrites en `:first-of-type` / `:last-of-type`, qui **repartent à zéro à chaque `<tr>`**. Un groupe de
colonnes ajoute une seconde ligne, donc le DS dessine **deux boîtes arrondies empilées** au lieu d'un
cadre. `columnSplit.module.css` neutralise le bord bas (et ses arrondis) de la ligne de groupe et le bord
haut de la ligne de valeurs pour retrouver un cadre unique — exactement ce que fait la table de cadrage
(`xstream/apps/fronts/front-amont-cadrage/src/modules/table/Table.css`, qui documente sur place pourquoi
elle ne remonte pas ça dans le DS : son imbrication à 3 niveaux n'est pas généralisable). Le cas à 2
niveaux, lui, le serait : **si le DS finit par gérer l'en-tête imbriqué, ces règles-ci disparaissent.**

Trois pièges à ne pas « re-simplifier » :

- **La typo du libellé d'attribut est posée explicitement** (`size` + `weight` sur le
  `KitTypography.Text` de `ColumnSplitHeader`) : `KitTypography` applique sa propre police, il n'hérite
  donc **pas** du gras que le DS met sur un `th`. Sans `weight="bold"`, le libellé est plus clair que
  celui des colonnes voisines (dont le titre est une simple chaîne). Niveaux repris de cadrage :
  attribut = 14 px gras, valeur = 12 px normal.
- **`KitTypography.Text` + `ellipsis` booléen**, et non `AdvancedText` + `ellipsis={{tooltip}}` : seul le
  premier passe par le `useEllipsisTooltip` du DS, qui n'affiche le tooltip que si le texte **déborde
  vraiment**. Le `description` d'un `KitIdCard` utilise le même hook, d'où la cohérence entre l'en-tête
  d'attribut et celui d'une sous-colonne.
- **Dans le corps, le cadre du groupe est un `box-shadow: inset`, pas une bordure** : au survol d'une
  ligne, le DS recolore en couleur primaire la bordure de **tout** `.ant-table-cell` — avec `!important`
  et une chaîne de sélecteurs qu'aucune classe locale ne surclasse — et un `td` porte cette classe. Une
  bordure passerait donc au bleu avec la ligne ; un `box-shadow` est ignoré par cette règle.
- **`isLastColumn`** (passé à `buildSplitColumnGroup`) décide qui dessine le bord droit du groupe :
  dernière colonne du tableau → **personne**, le bord (et son arrondi) est déjà celui du tableau, et
  y superposer le nôtre traçait un trait droit en travers du coin arrondi. Ailleurs → la dernière
  sous-colonne, et l'arrondi que le DS pose sur le `:last-of-type` de la 2ᵉ ligne est neutralisé
  puisqu'il tomberait en plein milieu du tableau.

**Les deux lignes tiennent dans les 48 px** d'un en-tête normal (comme cadrage) : le DS pose un
plancher de 48 px sur **chaque** `th`, donc chacune est épinglée à la moitié — le vrai plancher étant
le bouton de repli (24 px). Il faut aplatir tout ce que le DS et le styled de `TableView` ajoutent
autour du contenu (marges internes, `min-height`, padding vertical — ce dernier en **triplant la
classe**, seul moyen de dépasser le `!important` du styled) : `height` sur un `th` est un plancher,
pas un plafond. Bénéfice indirect : la hauteur scrollable du corps (`useTableScrollableHeight`) reste
juste, sans avoir à connaître le nombre de lignes d'en-tête.

L'espace de 8 px que le DS insère entre l'en-tête et le corps (`thead::after`) est **supprimé** dans
le styled de `TableView` — pour tout le tableau, pas seulement les colonnes dépliées : il coupait le
cadre du groupe en deux.

**Les en-têtes.** Un seul composant, `ColumnSplitHeader`, sert les **deux** états d'une colonne dépliable
(libellé + bouton de dépliage / libellé de groupe + bouton de repli) : ils ne diffèrent que par l'icône,
la clé i18n et `disabled`, et l'action est **un unique toggle**
(`ViewSettingsActionTypes.TOGGLE_ATTRIBUTE_COLUMN_SPLIT`) — les deux points d'appel de `TableView`
passaient déjà le même callback. Découper selon le rendu plutôt que selon l'état donnait deux composants
jumeaux et deux classes CSS listées ensemble dans chacune de leurs règles.

**L'en-tête d'une sous-colonne est un `KitIdCard`** (`ColumnSplitValueHeader`), pas une pastille maison :
il fournit la barre de couleur fine du DS (`.card-color`, 3 px arrondie) et, via `description` **et non**
`title`, la typo 12 px regular voulue pour cette ligne (`title` est gras et d'un cran au-dessus — c'est le
niveau de l'en-tête de groupe). L'ellipse et son tooltip viennent avec. Précédent dans le module :
`actions-mass/edit-attribute/TreeNodeRemap.tsx` rend déjà un nœud d'arbre ainsi.

> ⚠️ Deux pièges du `KitIdCard` ici :
>
> - **Seule sa classe racine est hashée** (`_kit-id-card_3vw8m_1`, issue d'un CSS module) ; ses enfants
>   (`.card-color`, `.card-info`, `.kit-id-card-description`) sont émis **globaux**. Pour le contraindre,
>   passer par sa prop `className` — un sélecteur `:global(.kit-id-card)` ne matcherait rien.
> - **La barre n'existe que si `color` est défini**, et le DS ne réserve la colonne de grille que dans ce
>   cas. Une option sans couleur au milieu d'options colorées reçoit donc `transparent` plutôt que rien,
>   sinon son libellé démarrerait 3 px + gap à gauche de celui de ses voisines (même astuce que
>   `cells/IdCard.tsx`).

**Cardinalité de la cellule** (`ColumnSplitCell`) : `multiple_values` → case à cocher classique ;
mono **non requis** → case à cocher **exclusive** (cocher B remplace A en une seule écriture, décision
D2 — le moteur gère le remplacement d'une valeur monovaluée tout seul) ; mono **requis** → bouton radio,
pas de décochage.

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
