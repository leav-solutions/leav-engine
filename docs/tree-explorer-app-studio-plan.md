# Explorateur d'arbre « Miller columns » dans app-studio

> **Ticket :** [LEAVC-839](https://aristid.atlassian.net/browse/LEAVC-839) · **Branche :**
> `feat/LEAVC-839-tree-explorer-app-studio` · **Scope :** `apps/app-studio` (nouveau module
> `tree-explorer` + type de panneau `treeExplorer` + type de workspace `tree`) + `libs/ui` (schema
> `usePanelMessenger`).
> **Lié à :** chantier _data-studio → explorer-studio_ (suppression progressive de `data-studio`).
> **Origine :** portage de la feature `Navigation` de `data-studio` (explorateur d'arbre en colonnes,
> _Miller columns_), reconstruit sans Redux.

---

## 1. Objectif

Offrir dans app-studio un **explorateur d'arbre hiérarchique en colonnes** (navigation _Miller
columns_) : chaque colonne liste les enfants d'un nœud, cliquer descend d'un niveau. C'est le
portage de la feature `Navigation` de `data-studio`, adaptée aux conventions app-studio (state local
Context+reducer au lieu de Redux, structure de dossiers plate, i18n `tree-explorer.*`, codegen
`__generated__`).

**Principe :** un **workspace de type `tree`** ouvre directement l'explorateur d'un arbre donné
(`treeId`), en pleine page autonome — sans header de vue, sans onglets, sans volet view-settings
(contrairement aux panneaux `explorer`).

---

## 2. Architecture

### 2.1 Module `apps/app-studio/src/modules/tree-explorer/`

| Zone              | Fichiers                                                                                                                                                                                                                | Rôle                                                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Racine            | `TreeExplorer.tsx`, `NavigationView.tsx`, `_types.ts`, `utils.ts`, `constants.ts`, `index.ts`                                                                                                                           | Point d'entrée (prop `treeId`), chargement du tree + permissions (`access_tree`), rendu des colonnes. `index.ts` n'exporte que `TreeExplorer`.                                                                           |
| `store/`          | `treeExplorerReducer.ts`, `TreeExplorerStateProvider.tsx`, `TreeExplorerStateContext.ts`, `useTreeExplorerState.ts`                                                                                                     | **State local** (remplace les slices Redux `navigation` + `activeTree`) : `{path, selection}` ; actions `SET_PATH / SET_SELECTION / RESET_SELECTION / RESET` ; reset auto au changement d'arbre.                         |
| `Column/`         | `Column.tsx`, `Row.tsx`, `HeaderColumnNavigation.tsx`, `DetailNavigation.tsx`                                                                                                                                           | Une colonne = enfants paginés d'un nœud (page size `TREE_NAVIGATION_PAGE_SIZE = 20`). Ligne = `RecordCard` + sélection + badge enfants + `FloatingMenu` + previews. Header = select-all + compteur. Volet détail record. |
| `Column/actions/` | `HeaderColumnNavigationActions.tsx`, `DefaultActions.tsx`, `SelectionActions.tsx`, `AddByCreationButton.tsx`, `AddBySearchButton.tsx`, `AddSelectionButton.tsx`, `MoveSelectionButton.tsx`, `DetachSelectionButton.tsx` | Actions par colonne : add (recherche/création), move, detach, upload/create-directory (arbres `files`), edit, generate previews. Chaque bouton câble sa mutation + refresh cache + `onMessages`.                         |
| `hooks/`          | `useRefreshTreeContent.ts`, `useTreeLibraryAllowedAsChild.ts`                                                                                                                                                           | Éviction ciblée du cache Apollo (`treeNodeChildren…<treeId>`) ; calcul des libraries autorisées comme enfants (racine / sous parent, sentinelle `__all__`).                                                              |
| `graphql/`        | `getTreeForExplorer`, `getTreeLibrariesForExplorer`, `getTreeNodeChildren`, `treeEvents` (sub), `treeExplorerRecord` (fragment), `addTreeElement` / `moveTreeElement` / `removeTreeElement` (mutations)                 | 8 opérations, générées via codegen app-studio (`__generated__`).                                                                                                                                                         |

### 2.2 Câblage app-studio (bout en bout)

1. **Schema panel** — `libs/ui/src/hooks/usePanelMessenger/schema.ts` : `treeExplorerPanelSchema =
{type:'treeExplorer', treeId:string}`, ajouté à l'union `PanelSchema` (les types app-studio en
   héritent, pas de modif dans `ApplicationRouting/types.ts`).
2. **Schema workspace** — `ApplicationRouting/schema.ts` : 3ᵉ membre de l'union `WorkspaceSchema` :
   `{type:'tree', treeId:string}` (à côté de `library` / `record`).
3. **Panel implicite** — `utils/treeWorkspacePanel.ts` : un workspace `tree` n'a pas de liste de
   panels configurable ; il génère UN panel `isStandalone:true` de type `treeExplorer`, avec l'id
   déterministe `getTreeWorkspacePanelId(wsId) = "${wsId}--tree-explorer"`.
4. **Résolution** — `utils/retrievePanelDetails.ts` : `PanelLocation.libraryId`/`panelType` élargis à
   `| null` ; `buildPanelIndex` indexe le panel implicite (`libraryId:null, panelType:null`).
5. **Redirection** — `guards/RedirectToFirstPanel.tsx` : `workspace.type === 'tree'` → `panelId =
getTreeWorkspacePanelId(workspace.id)`.
6. **Routing** — `content/PanelContent.tsx` : `panel.type === 'treeExplorer'` → `<PanelTreeExplorer
treeId={panel.treeId} />` (`content/panel-tree-explorer/PanelTreeExplorer.tsx`, wrapper mince).
7. **Plein page** — `ApplicationRouting/Panel.tsx` : `isTreeExplorerPanel` retire header/onglets/volet
   de vue (affichage autonome).
8. **i18n** — bloc `tree-explorer.*` (fr + en).

**Flux :** workspace `tree` (JSON app) → `RedirectToFirstPanel` (id déterministe) →
`retrievePanelDetails` (index à la volée) → `PanelContent` → `PanelTreeExplorer` → `TreeExplorer`.

---

## 3. Écart avec l'original data-studio

- **Porté :** toute la logique Miller-columns (colonnes / lignes / header / détail / actions
  add-search-création / selection / move / detach), pagination, subscriptions (tree events + record
  updates), permissions, upload/create-directory/previews pour arbres `files`.
- **Adapté :** Redux → Context+reducer local ; dossiers profonds → structure plate ; namespace i18n
  `navigation.*` → `tree-explorer.*` ; codegen data-studio → app-studio. `Navigation.tsx`
  (`isTreeInApp`, `WorkspacePanels.TREE`, bandeau `setInfoBase`, `activePanel`, `useActiveTree`,
  `ApplicationContext`) **abandonné** — `TreeExplorer.tsx` se limite au chargement + permissions.
- **Non régressé :** `classified_in` et `order` étaient **déjà** des stubs `feature_not_available`
  dans data-studio ; ils le restent. Aucun drag-and-drop dans l'original ni ici.

---

## 4. État des tests

Présents (tous verts) : `treeExplorerReducer` (4), `TreeExplorer` (2), `treeWorkspacePanel` (3),
`retrievePanelDetails.tree` (1). Aucun `.skip` / `.only`.

**Trou de couverture :** aucun test sur la couche `Column/` (Column, Row, les 5 boutons d'action) ni
sur les hooks (`useRefreshTreeContent`, `useTreeLibraryAllowedAsChild`). data-studio avait
`Navigation.test.tsx` + `Row.test.tsx` — non portés.

---

## 5. Suites (hors périmètre de cette MR)

| #   | Sujet                          | Détail                                                                                                                                                                                                                |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Couverture tests `Column/`** | Ajouter tests `Column`, `Row`, boutons d'action, hooks (`useRefreshTreeContent`, `useTreeLibraryAllowedAsChild`) — au moins parité avec `Row.test.tsx` de data-studio. Cas passants, `describe` avant implémentation. |
| 2   | **Validation E2E pagination**  | Le refetch manuel au changement de page a été retiré (Apollo refetch déjà sur changement de `pagination.offset`). Valider en E2E que la navigation entre pages reste correcte.                                        |
| 3   | **`classified_in` / `order`**  | Toujours des stubs `feature_not_available` (déjà le cas dans data-studio). À implémenter si le besoin métier le justifie.                                                                                             |

> **CI :** cette MR touche `libs/ui` (`usePanelMessenger/schema.ts`, bundlé dans tous les fronts) →
> déclencher **`e2e-playwright`** (manuel + `allow_failure`), après `build-docker-core [amd64]`.
