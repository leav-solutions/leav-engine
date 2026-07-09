# Plan d'implémentation — Mode d'affichage Kanban (Explorer générique)

> **Statut :** proposition à discuter en équipe · **Scope :** `@leav/ui` `ExplorerV2` + `apps/core` (modèle ViewV2) +
> `apps/app-studio` (volet view-settings)
> **Lié à :** ADR-001 (DnD = `dnd-kit`), ADR-006 (volet view-settings, `currentView` contrôlé)
> **Origine :** besoin Offers Manager (vue Kanban des UB par statut) — mais la feature est **générique**, elle bénéficie
> à toutes les apps consommant l'Explorer.

---

## 1. Objectif

Ajouter à l'Explorer un **mode d'affichage Kanban** : les enregistrements sont présentés en
**colonnes**, chaque colonne correspondant à **une valeur d'un attribut « axe »** choisi dans la
vue. **Déplacer une carte** d'une colonne à l'autre **écrit la nouvelle valeur** de cet attribut
sur l'enregistrement.

Exemple Offers Manager : axe = attribut `statut` (arbre à 6 nœuds) → 6 colonnes
(_En enrichissement, En attente de validation, Brief validé, En négociation, Offres reçues,
Validée_). Glisser une UB de « En négociation » vers « Validée » écrit la valeur de statut.

**Principe directeur — c'est générique :** il n'y a aucun « statut » codé en dur. Les colonnes
sont **les valeurs possibles de l'attribut axe**. Avec un autre attribut, on obtient d'autres
colonnes. L'axe est un **paramètre de la vue**, au même titre que les colonnes affichées ou le tri.

---

## 2. Vocabulaire

| Terme                                      | Définition                                                                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mode d'affichage / displayMode**         | `viewType` de la vue : aujourd'hui `cards \| list \| timeline`. On ajoute `kanban`.                                                                                              |
| **Attribut axe (kanban column attribute)** | L'attribut dont **les valeurs deviennent les colonnes**. Phase 1 : attribut de type `tree`.                                                                                      |
| **Colonne Kanban**                         | Une valeur possible de l'attribut axe (ex. un nœud de l'arbre).                                                                                                                  |
| **Carte**                                  | Un enregistrement, rendu de façon compacte dans la colonne correspondant à sa valeur d'axe.                                                                                      |
| **Transition**                             | Le passage d'une carte d'une colonne à une autre = écriture de la nouvelle valeur d'axe, **soumise aux règles de workflow LEAV** (permissions contextuelles / dependent values). |

---

## 3. État actuel (constat)

- **Le `viewType` n'a aujourd'hui AUCUN effet de rendu.** Il est stocké dans le state
  (`viewSettingsInitialState.ts:23` → `viewType: ViewV2Types.list`) mais `DataView.tsx` rend
  **toujours** une `KitTable`, quel que soit le type. Il n'existe donc **pas** de mécanisme de
  dispatch de displayMode : c'est la première brique à créer.
- L'enum `ViewV2Types` (`libs/ui/src/_gqlTypes/index.ts:1205-1209`) ne contient que
  `cards | list | timeline` — **pas de `kanban`**.
- Le modèle `ViewV2Display` (GraphQL, `_gqlTypes/index.ts:1180-1184` : `ViewV2DisplayInput {type, attributes}`)
  ne porte **aucun champ** pour mémoriser l'attribut axe → à ajouter côté `apps/core`.
- Le sélecteur de mode d'affichage côté app-studio
  (`apps/app-studio/.../tabs/tab-display/DisplayModeSelector.tsx:1-34`) est un **placeholder**
  (tuiles table/list/mosaic, les deux dernières désactivées).
- `dnd-kit` est **déjà** une dépendance (`libs/ui/package.json` : `@dnd-kit/core@6.3.1`,
  `@dnd-kit/sortable@8.0.0`, `@dnd-kit/utilities@3.2.2`) et déjà utilisé comme pattern dans
  `Explorer/manage-view-settings/sort-items/` (v1). Rien à installer.
- Le chemin d'écriture d'une valeur existe : `useExecuteSaveValueBatchMutation`
  (`RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation.ts:13-60`,
  `saveValues(record, values, version?, deleteEmpty?)`), déjà réutilisé par les actions
  d'item/masse (`actions-item/useEditStatusItemAction.tsx`, `actions-mass/useEditAttributeMassAction.tsx`).
- Les valeurs possibles d'un attribut `tree` se récupèrent via `treeNodeChildren`
  (`libs/ui/src/_queries/trees/treeNodeChildrenQuery.ts:4-50`, hook `useTreeNodeChildrenQuery`).

---

## 4. Périmètre

### Phase 1 (cible de ce plan)

- `viewType = kanban` rendu réellement (création du dispatch de displayMode).
- Axe **limité aux attributs de type `tree`** (cas statut/workflow — le besoin immédiat).
- Colonnes = nœuds de l'arbre lié à l'attribut axe ; **colonne « Sans valeur »** pour les records non renseignés.
- **DnD** d'une carte entre colonnes → écriture de la valeur. **Le workflow est respecté en amont** : un déplacement
  vers une colonne non autorisée depuis la valeur courante est **interdit** (zone de drop désactivée), pas seulement
  rejeté après coup. Source = les **dépendances de l'attribut** (`allowedDependentValues`), comme l'édition en masse.
- Carte : rendu compact réutilisant le rendu d'attributs existant (identité du record + quelques attributs configurés).
- Persistance de l'axe dans la vue via la **liste d'attributs déjà existante** (marqueur générique `isGroupBy` sur un
  attribut, pas de réglage kanban-spécifique).
- Sélecteur de mode + sélecteur d'attribut axe dans le volet app-studio.

### Hors phase 1 (itérations suivantes)

- Axe sur **lien vers une LOV** (collection plate) ou **`boolean`**.
- **Réordonnancement** intra-colonne (priorité) si un attribut d'ordre est défini.
- WIP limits / agrégats par colonne (somme d'un attribut numérique).

---

## 5. Design technique

### 5.1 Modèle de données / API (`apps/core`)

1. **Ajouter `kanban` à `ViewV2Types`** (enum côté core, puis régénération des `_gqlTypes`).
2. **Réutiliser la liste d'attributs existante — PAS de champ kanban-spécifique.** Le modèle a déjà
   `ViewV2Display { type, attributes: [ViewV2DisplayAttributeInput] }` avec
   `ViewV2DisplayAttributeInput { attributeId, visible }` (`_gqlTypes/index.ts:1175-1184`). Cette liste est **la** liste
   d'attributs de la vue, partagée par tous les modes d'affichage (table = colonnes, kanban = axe + champs de carte,
   futur mosaic = champs de tuile). L'axe du Kanban est **l'un de ces attributs, désigné** — pas une nouvelle notion.

- **Désignation = un marqueur générique, mode-agnostique** sur l'entrée d'attribut : étendre
  `ViewV2DisplayAttributeInput` d'un booléen optionnel **`isGroupBy`**. Un attribut peut ainsi être marqué «
  axe de regroupement » sans qu'on invente un concept « kanban ». C'est le **même** champ qui servira au regroupement
  de table (lot G1) et à tout mode futur ayant besoin d'un axe. → résout §9-Q1.
- L'attribut axe peut être `visible: false` (on l'utilise comme colonnes, on ne le répète pas en champ de carte) tout
  en restant dans la liste : aucune structure parallèle.
- Seul ajout de schéma : le champ `isGroupBy` sur `ViewV2DisplayAttributeInput` (+ régénération `_gqlTypes`). `ViewV2Types`
  gagne `kanban`.

### 5.2 Contrat Explorer (`libs/ui`)

3. **`ViewV2Types`** régénéré → `kanban` disponible ; `ViewType` (`viewSettingsReducer.ts:8`) suit automatiquement (
   alias).
4. **`SerializedView`** (`ExplorerV2/_types.ts:77-86`) : exposer au runtime l'id de l'attribut axe via un champ
   générique **`groupByAttributeId?: string`** (dérivé de l'attribut marqué `isGroupBy` dans la liste — c'est un **id présent
   dans `attributesIds`**, pas un attribut arbitraire). Nommage volontairement non « kanban » : réutilisable par le
   grouping (G1) et les autres modes.
5. **State du reducer** (`manage-view-settings-v2/store-view-settings/viewSettingsReducer.ts`) :

- ajouter `groupByAttributeId?: string` à `IViewSettingsState` (27-42) ;
- ajouter une action `SET_GROUP_BY_ATTRIBUTE` (10-16) + son reducer pur (77-97) ;
- merger ce champ depuis `currentView` comme les autres (consommateur contrôlé, ADR-006).

### 5.3 Rendu — dispatch de displayMode (`libs/ui/src/components/ExplorerV2/`)

6. **Créer le dispatch** : `DataView.tsx` reçoit déjà tout le nécessaire (records, schéma d'attributs, sélection,
   pagination). Au lieu de rendre directement `KitTable`, router sur `view.viewType` :

- `list` / `cards` / `timeline` → rendu table actuel (inchangé) ;
- `kanban` → nouveau composant `&lt;KanbanView /&gt;`.
- _Implémentation :_ extraire le rendu table actuel dans `&lt;TableView /&gt;` (refactor sans changement de
  comportement) et faire de `DataView` un simple routeur. Garde l'API de `DataView` stable pour les consommateurs.

7. **`KanbanView`** (nouveau dossier `ExplorerV2/kanban/`) :

- **Colonnes** : charge les valeurs de l'attribut axe. Pour un `tree`, `useTreeNodeChildrenQuery` sur le nœud racine
  de l'arbre lié à l'attribut → liste ordonnée des nœuds = colonnes. **Libellé et couleur de colonne = `whoAmI`
  du nœud** (`whoAmI.label` / `whoAmI.color`), pas de palette par défaut.
- **Colonne « Sans valeur »** : **toujours en première position**, mais **rendue uniquement s'il existe au moins un
  enregistrement sans valeur** d'axe (sinon masquée).
- **Répartition des cartes** : grouper `dataGroupedFilteredSorted` côté client par la valeur de l'attribut axe (
  `item.propertiesById[axisAttributeId]`).
- **Compteur par colonne** : taille du groupe (cohérent avec le préfiltre courant). Badge + pastille de la couleur
  du nœud.
- **Carte** : `KitIdCard` (identité du record) + N attributs configurés (réutiliser les renderers de `TableCell` ;
  pour un attribut `%` afficher une progress bar — dépend du lot B2 « affichage % », non bloquant : fallback texte).
- **Pagination par colonne** : chaque colonne affiche ses **10 premières cartes** + un bouton **« Voir plus »** en
  **fin de colonne** quand il en reste (cf. §7 — `recordsGroups` pour le `count`, `records` par colonne pour les
  cartes). Pas de limite globale, pas de bandeau de troncature.
- **Scroll horizontal du header** : en mode **Kanban uniquement**, le header de l'explorateur défile horizontalement
  (les colonnes peuvent dépasser la largeur visible) — comportement propre au Kanban, à ne pas appliquer aux autres
  modes d'affichage.

8. **DnD (`dnd-kit`, ADR-001)** : `DndContext` au niveau `KanbanView`, chaque colonne = zone droppable, chaque carte =
   draggable (pattern existant `sort-items/SortItems.tsx` + `useSortable`). Pendant le drag, **seules les colonnes
   autorisées** depuis la valeur courante de la carte sont droppables (§5.4) — les autres sont **désactivées
   visuellement**. Au `onDragEnd` sur une colonne autorisée :

- calcul de la valeur cible (la colonne de drop) ;
- **UI optimiste** : déplacer la carte immédiatement ;
- appel d'écriture (§5.4) ; **rollback** + toast d'erreur si échec (filet de sécurité).

### 5.4 Écriture de la transition

9. **Réutiliser `useExecuteSaveValueBatchMutation`** :
   `saveValues(record, [{attribute: axisAttributeId, value: &lt;treeNodeId cible&gt;}], version, deleteEmpty)`. C'est
   exactement le mécanisme des actions item/masse existantes (`useEditStatusItemAction`, `useEditAttributeMassAction`).
10. **Respect du workflow = interdiction EN AMONT (phase 1), via les dépendances d'attribut.** Le workflow d'un attribut
    `tree` est porté par ses **dependent values** (`permissions_conf_dependent_values`) : pour une valeur courante
    donnée, seules certaines valeurs cibles sont autorisées. Le Kanban **doit lire ces transitions autorisées** et \*
    \*désactiver les colonnes non atteignables\*\* depuis la valeur courante d'une carte — un déplacement interdit n'est
    pas tentable.

- **Source à réutiliser = exactement le mécanisme de l'édition en masse** : `useTreeAttributeRemappingQuery` (hook
  `useTreeNodesCandidates`, `actions-mass/edit-attribute/useTreeNodesCandidates.tsx`) renvoie, **par nœud courant**,
  son champ **`allowedDependentValues`** (liste des nœuds cibles permis ; `null` = pas de dépendance ⇒ toutes les
  colonnes autorisées). C'est la même donnée qui pilote le mapping autorisé de l'édition en masse.
- **Mapping pour le Kanban :** la colonne source d'une carte = sa valeur courante de nœud ; les colonnes de drop
  autorisées = `allowedDependentValues(nœud courant)`. Les colonnes hors de cet ensemble sont **non-droppables**.
- Les **permissions contextuelles** (un user n'a pas le droit de faire telle transition) restent appliquées par le
  moteur à l'écriture → le **rollback + toast** (point 8) reste le filet de sécurité, mais le cas nominal interdit
  déjà visuellement les transitions non prévues par le workflow.
- _Réf. métier xstream (même logique côté consommateur) :_ `front-amont-cadrage` `useCampaignsStatusWorkflows` filtre
  les statuts atteignables via `dependentValuesPermissionFilter` — confirme que c'est bien le contrat à suivre.

### 5.5 Volet view-settings (`apps/app-studio/.../panel-view-settings/`)

11. **`DisplayModeSelector.tsx`** : remplacer le placeholder par un vrai sélecteur incluant `kanban` ; émettre l'action
    `SET_VIEW_TYPE` du `currentViewReducer`.
12. **Désignation de l'axe** : quand `viewType === kanban`, permettre de marquer **un attribut déjà dans la liste
    d'affichage** (parmi les attributs **éligibles** — phase 1 : type `tree`) comme axe (`isGroupBy`). Pas de picker sur tous
    les attributs : on désigne parmi les colonnes déjà présentes. Action sur `currentViewReducer` (étendre
    `ICurrentViewState`/`ICurrentViewAction`, `store-current-view/_types.ts`).

    > **À traiter — distinction admin / non-admin (comme pour les colonnes, les tris et les filtres).** La
    > désignation des **axes possibles** doit passer par la **roue « attributs disponibles »**
    > (`AvailableAttributesDropdown`, rendue **uniquement si `canManageViews`** — cf.
    > `panel-view-settings/CLAUDE.md`), exactement comme la roue existe déjà sur les **trois facettes**
    > (Affichage/**colonnes**, **Tris**, **Filtres**). Modèle à respecter : le **gestionnaire de vues**
    > décide de l'axe et/ou de la **liste des axes rendus disponibles** ; l'**utilisateur classique** sans
    > le droit ne fait que **consommer** la vue (il choisit son axe parmi ceux rendus disponibles, il ne les
    > édite pas). Aujourd'hui `KanbanAxisSelector` est affiché **sans condition de permission** → à gater sur
    > `canManageViews` (ou à restreindre à une sélection rendue disponible par l'admin) **avant PR-3**.

13. **`viewV2ToSerializedView.ts:22-35`** : dériver `SerializedView.groupByAttributeId` = l'`attributeId` de l'entrée
    `display.attributes` marquée `isGroupBy` axe.
14. **Fragment GraphQL** `viewV2Fragment.graphql:18-26` : ajouter `isGroupBy` dans `display { attributes { ... } }`.

---

## 6. Découpage en étapes (PR)

Chaque étape est livrable/reviewable indépendamment.

> **Ordre choisi : la configuration d'abord, l'affichage ensuite.** On rend d'abord une vue
> Kanban **configurable et persistable** depuis le volet ; l'Explorer continue de la rendre en
> table tant que l'affichage (PR-2) n'est pas livré. L'affichage n'est pas la priorité immédiate.

| PR       | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Zone                                        | Dépend de |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------- |
| **PR-1** | **Config dans le volet (priorité).** Modèle : `kanban` dans `ViewV2Types` + champ `isGroupBy` sur `ViewV2DisplayAttributeInput` (core + `_gqlTypes`) + state/reducer + `SerializedView.groupByAttributeId`. Volet app-studio : `DisplayModeSelector` réel (incl. `kanban`) + désignation de l'axe parmi les colonnes + mapping `viewV2ToSerializedView` + `isGroupBy` dans le fragment. **Résultat visible :** on configure et on **sauvegarde** une vue Kanban (axe inclus) depuis le volet — rendue en table en attendant PR-2. | `apps/core` + `libs/ui` + `apps/app-studio` | —         |
| **PR-2** | **Affichage.** Refactor `DataView` en routeur sur `viewType` (extraction `TableView`, 3 types existants → table, sans régression) **+** `KanbanView` (colonnes depuis `treeNodeChildren`, répartition + compteurs, carte compacte, lecture seule, pas de DnD) **+ pagination par colonne** (10 cartes + « Voir plus » en fin de colonne, via `recordsGroups`/`records`, cf. §7) **+ scroll horizontal du header** (Kanban only). Le refactor arrive avec la vue qu'il rend possible, jamais livré seul.                           | `libs/ui` ExplorerV2                        | PR-1      |
| **PR-3** | DnD `dnd-kit` + **colonnes autorisées en amont** (`allowedDependentValues` via le mécanisme de l'édition en masse) + écriture `useExecuteSaveValueBatchMutation` + optimistic/rollback.                                                                                                                                                                                                                                                                                                                                           | `libs/ui` ExplorerV2                        | PR-2      |

> **i18n :** pas d'étape dédiée — les clés `explorer.kanban.*` sont ajoutées **au fil de l'eau dans
> chaque PR** qui crée de l'UI (PR-1 pour le volet, PR-2/PR-3 pour le rendu/DnD). Cf. §8.
>
> **Tests :** pas de tests d'intégration jest sur le Kanban. Le drag&drop se teste en **E2E
> Playwright** (`test-apps/e2e-playwright`, ADR-002, PageObjectModel), comme le drag&drop de
> `planning-e2e-tests` côté xstream. Ce chantier E2E étant déjà en cours, on **n'écrit pour l'instant
> que les descriptions de scénarios en TODO** (voir §8) — à implémenter quand le socle E2E aura avancé.
>
> **PR-1 = config pilotable depuis le volet** (modèle + volet ensemble, résultat utilisable tout de suite, pas un schéma livré à vide) ; PR-2 = rendu du Kanban (lecture seule) ; PR-3 = interactivité (DnD + workflow). i18n inline dans chaque PR, E2E laissé en TODO.

---

## 7. Point dur : pagination

`useExplorerData` charge les records **paginés serveur** (`explorerQuery.graphql:30-64`,
`pagination: RecordsPagination` offset/limit). Un Kanban groupe **tout** le jeu filtré, pas une
page → en l'état, on ne verrait grouper que la page courante.

**Décision : pagination _par colonne_ (10 cartes par colonne, pas 10 au total).** Chaque colonne
charge ses **10 premières cartes** ; dès qu'une colonne a **plus** de records que ceux affichés, un
bouton **« Voir plus »** est rendu **en fin de colonne** pour charger la suite. Il n'y a **pas de
limite globale** sur l'ensemble du jeu et **pas de bandeau de troncature** : le message
« N cartes non affichées, affinez les filtres » est **supprimé** — chaque colonne se pagine
indépendamment, aucune carte n'est masquée silencieusement.

C'est exactement le contrat du backend de regroupement déjà livré (cf.
[`explorer-grouping-core.md`](explorer-grouping-core.md), « 10 puis voir plus » par groupe) :
`recordsGroups` fournit **la liste des colonnes + le `count` par colonne**, puis `records` (filtre de
la vue **+ égalité d'axe de la colonne**, pagination propre) charge les cartes d'une colonne. Le
compteur de colonne = ce `count` (cohérent avec le préfiltre courant), donc « Voir plus » disparaît
quand toutes les cartes de la colonne sont chargées.

---

## 8. i18n & tests

### i18n — au fil de l'eau (pas d'étape finale)

Les clés `explorer.kanban.*` sont ajoutées **dans la PR qui crée le composant correspondant** :
PR-1 (libellés du volet : mode « Kanban », « Attribut de colonne »), PR-2 (titre, « Sans valeur »,
« Voir plus »), PR-3 (messages d'erreur de transition). Fichiers
`libs/ui/src/locales/{en,fr}/shared.json` ; accès via `useSharedTranslation()` (jamais
`useTranslation()` — app-studio ne charge que le namespace `translations`).

### Tests — E2E Playwright (laissés en TODO pour l'instant)

**Pas de tests d'intégration jest sur le Kanban.** Le drag&drop (et le rendu) se testent en **E2E
Playwright** dans `test-apps/e2e-playwright` (ADR-002, PageObjectModel — dossiers `pages/` +
`components/`), à l'image du drag&drop de `planning-e2e-tests` côté xstream. Le socle E2E étant
**déjà un chantier en cours**, on ne pose ici que les **descriptions de scénarios (TODO)**, à
implémenter plus tard — éventuellement à revisiter quand le socle aura avancé. Cas **passants**
uniquement (pas d'edge cases), `describe` rédigés avant l'implémentation :

```
TODO E2E (test-apps/e2e-playwright) — Kanban
- describe "Vue Kanban — rendu"
  - affiche une colonne par valeur de l'attribut axe (+ colonne « Sans valeur »)
  - place chaque carte dans la colonne correspondant à sa valeur courante
  - affiche le compteur par colonne
- describe "Vue Kanban — déplacement (workflow)"
  - glisser une carte vers une colonne autorisée écrit la nouvelle valeur (carte déplacée, persistée)
  - une colonne non autorisée depuis la valeur courante n'est pas une cible de drop valide
- describe "Vue Kanban — configuration via le volet"
  - choisir le mode Kanban + désigner l'axe persiste la vue (rechargement → vue Kanban)
```

> Un Page Object `KanbanPage`/`KanbanColumn` sera à ajouter sous `test-apps/e2e-playwright/pages`
> (ou `components/`) le moment venu, en suivant le pattern existant.

---

## 9. Décisions actées

1. **Désignation de l'axe :** pas de champ kanban-spécifique. On réutilise la liste
   `display.attributes` existante + un marqueur **`isGroupBy`** (booléen) sur l'entrée d'attribut
   (`ViewV2DisplayAttributeInput`), exposé au runtime via un `groupByAttributeId` générique
   (partagé avec le regroupement G1). **Un seul** attribut axe à la fois (pas de multi-axes).
   _Reste à confirmer côté core uniquement la mise en œuvre schéma._
2. **Éligibilité de l'attribut axe :** phase 1 = `tree` seulement ; link→LOV puis `boolean` en phase 2.
3. **Colonne « Sans valeur » :** **toujours en première colonne**, mais **affichée uniquement s'il
   existe des enregistrements sans valeur** (sinon masquée).
4. **Couleur de colonne :** issue de la **carte d'identité du nœud** de l'arbre de regroupement
   (`whoAmI.color` du nœud), pas de palette par défaut. Idem pour le libellé de colonne (`whoAmI.label`).
5. **Pagination _par colonne_** (§7) : **10 cartes par colonne** (pas 10 au total) + bouton **« Voir
   plus »** en fin de colonne quand il en reste. Pas de limite globale, **pas de bandeau de troncature**.

---

## 10. Annexe — points d'intégration (file:line)

| Sujet                                 | Fichier                                                                                                  | Repère                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Enum types de vue                     | `libs/ui/src/_gqlTypes/index.ts`                                                                         | 1205-1209 `ViewV2Types`                                                                                                  |
| Display GraphQL                       | `libs/ui/src/_gqlTypes/index.ts`                                                                         | 1175-1184 `ViewV2DisplayAttributeInput {attributeId, visible}` (+ `isGroupBy`) ; `ViewV2DisplayInput {type, attributes}` |
| Contrat vue Explorer                  | `libs/ui/src/components/ExplorerV2/_types.ts`                                                            | 77-86 `SerializedView`                                                                                                   |
| Record (carte)                        | `libs/ui/src/components/ExplorerV2/_types.ts`                                                            | 26-41 `IItemData` (`propertiesById`)                                                                                     |
| State initial                         | `…/ExplorerV2/manage-view-settings-v2/store-view-settings/viewSettingsInitialState.ts`                   | 23 `viewType`                                                                                                            |
| Reducer / actions                     | `…/store-view-settings/viewSettingsReducer.ts`                                                           | 8 `ViewType`, 10-16 actions, 27-42 state, 77-97 reducers                                                                 |
| Rendu (à router)                      | `libs/ui/src/components/ExplorerV2/DataView.tsx`                                                         | rend toujours `KitTable` ; props `IDataViewProps` 77-100                                                                 |
| Chargement données                    | `…/ExplorerV2/_queries/useExplorerData.ts`                                                               | 30-65 `IExplorerData`                                                                                                    |
| Query records                         | `…/ExplorerV2/_queries/explorerQuery.graphql`                                                            | 30-64 pagination/filters/sort                                                                                            |
| Pagination                            | `…/ExplorerV2/usePagination.tsx`                                                                         | 5-26                                                                                                                     |
| Écriture valeur                       | `…/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation.ts`                            | 13-60 `saveValues`                                                                                                       |
| Modèle action statut                  | `…/ExplorerV2/actions-item/useEditStatusItemAction.tsx`                                                  | 33-47                                                                                                                    |
| Modèle édition masse (tree)           | `…/ExplorerV2/actions-mass/useEditAttributeMassAction.tsx`                                               | 20+                                                                                                                      |
| **Transitions autorisées (workflow)** | `…/ExplorerV2/actions-mass/edit-attribute/useTreeNodesCandidates.tsx`                                    | `useTreeAttributeRemappingQuery` → `allowedDependentValues` par nœud                                                     |
| Valeurs courantes de dépendance       | `…/ExplorerV2/actions-mass/edit-attribute/useDependencyValues.tsx`                                       | `useValuesOccurrencesForDependencyQuery`                                                                                 |
| Réf. métier workflow (xstream)        | `xstream front-amont-cadrage` `useCampaignsStatusWorkflows`                                              | `dependentValuesPermissionFilter`                                                                                        |
| Valeurs d'un arbre (colonnes)         | `libs/ui/src/_queries/trees/treeNodeChildrenQuery.ts`                                                    | 4-50 `useTreeNodeChildrenQuery`                                                                                          |
| Sélecteur de mode (placeholder)       | `apps/app-studio/.../panel-view-settings/tabs/tab-display/DisplayModeSelector.tsx`                       | 1-34                                                                                                                     |
| Reducer vue app-studio                | `apps/app-studio/.../store-current-view/currentViewReducer.ts`                                           | `SET_VIEW_TYPE`                                                                                                          |
| Conversion vue→Explorer               | `apps/app-studio/.../store-current-view/viewV2ToSerializedView.ts`                                       | 22-35                                                                                                                    |
| Fragment vue                          | `apps/app-studio/.../store-current-view/viewV2Fragment.graphql`                                          | 18-26 `display`                                                                                                          |
| DnD (pattern + deps)                  | `libs/ui/src/components/Explorer/manage-view-settings/sort-items/SortItems.tsx` ; `libs/ui/package.json` | `@dnd-kit/*`                                                                                                             |
| i18n                                  | `libs/ui/src/locales/{en,fr}/shared.json`                                                                | clés `explorer.kanban.*`                                                                                                 |
| Tests (stratégie spyOn)               | `libs/ui/src/components/ExplorerV2/Explorer.test.tsx`                                                    | 1-5 (note), exemple `spyOn`                                                                                              |
| ADR DnD                               | `docs/adr/ADR-001-dnd.md`                                                                                | `dnd-kit`                                                                                                                |
| ADR volet view-settings               | `docs/adr/ADR-006-explorer-views-settings-volet.md`                                                      | `currentView` contrôlé                                                                                                   |
