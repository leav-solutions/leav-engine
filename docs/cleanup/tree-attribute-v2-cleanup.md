# Cleanup — Attribut Arbre V2 (epic LEAVC-996)

Date de rédaction : 27/07/2026 — rédigé dans la MR de livraison de l'epic.
Ticket de suivi : [LEAVC-1077](https://aristid.atlassian.net/browse/LEAVC-1077).

## Pourquoi ce document

L'epic LEAVC-996 (« Attribut Arbre : configuration du comportement de sélection ») a livré deux
composants **dupliqués en V2** plutôt que modifiés, derrière deux feature flags, pour ne pas
régresser les consommateurs existants (`@leav/ui` est publié et consommé par xStream et AMP) :

| Élément                      | V1 conservée                            | V2 livrée                      |
| ---------------------------- | --------------------------------------- | ------------------------------ |
| Champ de formulaire (arbre)  | `uiElements/TreeField/`                 | `uiElements/TreeFieldV2/`      |
| Modale de sélection de nœuds | `TreeField/manage-tree-node-selection/` | `components/SelectTreeNodeV2/` |
| Contenu de sélection         | `components/SelectTreeNode/`            | `components/SelectTreeNodeV2/` |

> ℹ️ `TreeNodeTitleV2` a **deux consommateurs** : la modale (`SelectTreeNodeV2`, via `titleRender` de
> `KitTree`) **et** le champ (`TreeFieldV2`, via le `title` des nœuds de `treeData`). Deux couplages à
> ne pas casser au renommage :
>
> - le champ dissocie le libellé du sélecteur du rendu du nœud avec `treeNodeLabelProp="label"`, sinon
>   les boutons de sélection groupée remontent dans les tags ;
> - les boutons de sélection groupée sont révélés **par CSS** (`TreeNodeTitleV2.module.css`), sur un
>   `:hover` de la ligne d'antd (`.ant-tree-node-content-wrapper` / `.ant-select-tree-node-content-wrapper`),
>   et le `span` de titre est étiré via `:has`. Un `onMouseEnter` React ne marche pas : le DS met
>   `display: flex` sur la ligne, donc le titre n'est large que du texte. Les tests ne peuvent pas
>   couvrir ce survol (CSS stubbé par Vitest) — ils vérifient le contrat DOM (les boutons sont dans la
>   ligne de leur nœud).

Cette duplication est **temporaire par construction**. Ce document est la checklist ordonnée pour la
résorber : supprimer les flags, supprimer la V1, renommer la V2 en nom canonique (plus besoin du
suffixe `V2`).

**Quand l'exécuter** : 1 à 2 semaines après la livraison de l'epic, une fois les deux flags activés
en recette **et** en production sans régression signalée.

> ⚠️ Ce cleanup touche des composants **exportés publiquement** par `@leav/ui`
> (`SelectTreeNode`, `SelectTreeNodeModal`). Il implique donc une coordination avec xStream et AMP
> (voir [Étape 8](#étape-8--exports-publics-dist-et-coordination-aval)) et ne peut pas être fait
> « en silence ».

---

## Ce qui reste (à ne PAS supprimer)

Pour éviter toute confusion : l'essentiel de l'epic est **définitif**. Seuls les flags et la V1
partent.

| Périmètre                                                                                           | Statut    |
| --------------------------------------------------------------------------------------------------- | --------- |
| `tree_selection_conf` côté core (types, schéma GraphQL, validation, erreurs, i18n)                  | définitif |
| Onglet admin `Affichage` (`apps/admin/src/modules/attribute-display/`)                              | définitif |
| Socle `libs/ui/src/hooks/useTreeSelection/`                                                         | définitif |
| Composants V2 (renommés — voir [Étape 7](#étape-7--renommages-v2--nom-canonique))                   | définitif |
| Fragments GraphQL `tree_selection_conf` (`recordFormAttributeFragment`, `attributeDetailsFragment`) | définitif |
| Clés i18n `select_descendants` / `unselect_descendants` (`libs/ui/src/locales/*/shared.json`)       | définitif |

---

## Étape 0 — Prérequis, avant de toucher au code

- [ ] Les deux flags (`enableTreeAttributeV2Form`, `enableTreeAttributeV2Modal`) sont à `true` en
      production depuis au moins une semaine, sans régression ouverte sur l'epic.
- [ ] Recenser les instances LEAV et leurs valeurs de `globalSettings.settings` (les clés seront
      retirées à l'[Étape 9](#étape-9--retirer-les-clés-de-flag-des-instances), **après** le déploiement du code).
- [ ] Prévenir les équipes xStream et AMP du renommage des exports publics.

---

## Étape 1 — Retirer l'aiguillage par flag

L'ordre importe : on rend d'abord la V2 inconditionnelle, on supprime ensuite la V1. Tant que
l'aiguillage existe, supprimer la V1 casse la compilation.

- [ ] `libs/ui/src/components/RecordEdition/EditRecordContent/uiElements/index.tsx` — remettre
      `[FormFieldTypes.TREE]` sur le champ arbre directement (la V2 renommée), plus de
      `TreeFieldSwitch`.
- [ ] Supprimer `libs/ui/src/components/RecordEdition/EditRecordContent/uiElements/TreeFieldSwitch.tsx`
      et `TreeFieldSwitch.test.tsx`. Ce fichier porte aussi le garde-fou anti-flip (`loading` →
      ne rend rien tant que les flags ne sont pas résolus, pour éviter un démontage V1→V2 au premier
      chargement) : il part avec le fichier, rien à migrer ailleurs.
- [ ] `…/TreeField/manage-tree-node-selection/useManageTreeNodeSelection.tsx` — supprimer le ternaire
      `ModalComponent` (`isModalV2Enabled ? SelectTreeNodeModalV2 : SelectTreeNodeModal`), l'appel à
      `useTreeAttributeV2Flags` et l'import du hook. ⚠️ Ce fichier disparaît de toute façon à
      l'[Étape 4](#étape-4--supprimer-le-champ-de-formulaire-v1-et-sa-modale) : si la V1 est supprimée dans la même MR, il n'y a rien à
      corriger ici, seulement à supprimer.
- [ ] `…/useManageTreeNodeSelection.test.tsx` — supprimer les cas de test des 4 combinaisons de flags.
- [ ] `apps/admin/src/modules/attribute-display/AttributeDisplayTab.tsx` — la section
      **Form** devient inconditionnelle : supprimer la garde `{(isFormV2Enabled || isModalV2Enabled) && …}`
      et l'appel à `useTreeAttributeV2Flags`. La section **Explorer** ne dépend pas des flags, elle ne
      bouge pas.
- [ ] `AttributeDisplayTab.test.tsx` — supprimer le cas « les deux flags off → section Form
      absente » et l'option `formV2Enabled` du helper de rendu.

> ℹ️ `EditAttributeTabs.tsx` n'a plus rien à corriger ici : l'onglet est déjà conditionné au seul
> `attribute.type === AttributeType.tree` (les flags ne gouvernent plus que la section Form du volet).

## Étape 2 — Supprimer les flags eux-mêmes

- [ ] `libs/utils/src/constants.ts` — supprimer `ENABLE_TREE_ATTRIBUTE_V2_FORM`,
      `ENABLE_TREE_ATTRIBUTE_V2_MODAL` et leur bloc de commentaire (qui référence ce document).
- [ ] Supprimer `libs/ui/src/hooks/useTreeAttributeV2Flags/` en entier :
      `useTreeAttributeV2Flags.ts`, `useTreeAttributeV2Flags.test.tsx`, `index.ts` et
      `_queries/globalSettingsFlagsQuery.graphql`.
- [ ] `libs/ui/src/hooks/index.ts` — retirer `export {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';`.
- [ ] Supprimer `apps/admin/src/modules/attribute-display/useTreeAttributeV2Flags.ts` et
      `useTreeAttributeV2Flags.test.tsx` ; retirer son export de
      `apps/admin/src/modules/attribute-display/index.ts`.
- [ ] `yarn graphql-generate` dans `libs/ui` — `useGlobalSettingsFlagsQuery` doit disparaître de
      `libs/ui/src/_gqlTypes/index.ts`. **Ne jamais éditer ce fichier à la main.**
- [ ] Vérifier qu'aucune référence ne subsiste :
      `grep -rn "ENABLE_TREE_ATTRIBUTE_V2\|useTreeAttributeV2Flags\|GlobalSettingsFlags" libs apps --include="*.ts" --include="*.tsx"`
      (hors `dist/`, qui n'est pas versionné).

## Étape 3 — Migrer les 3 consommateurs internes de la modale V1

Hors périmètre de l'epic, ils doivent être migrés **avant** de pouvoir supprimer
`SelectTreeNodeModal` V1. La V2 est un surensemble de props de la V1 : la migration est en principe
un changement d'import, plus l'ajout éventuel de paramètres de sélection.

- [ ] `libs/ui/src/components/Explorer/link-item/LinkModal.tsx`
- [ ] `libs/ui/src/components/ExplorerV2/link-item/LinkModal.tsx`
- [ ] `libs/ui/src/components/RecordEdition/EditRecordContent/uiElements/LinkField/tag/link-record/useLinkRecord.tsx`
      (+ `useLinkRecord.test.tsx`)

⚠️ Point d'attention : la V1 forçait `multiple` et désactivait la racine en dur
(`disabledNodes.concat(attribute.linked_tree.id)`). La V2 ne le fait plus — la racine est gouvernée
par `selectableNodes`. Ces trois appelants doivent donc passer explicitement `multiple` et le
`selectableNodes` voulu pour conserver leur comportement actuel.

## Étape 4 — Supprimer le champ de formulaire V1 et sa modale

Le dossier `uiElements/TreeField/` est **auto-contenu** (aucun de ses sous-composants n'est importé
depuis l'extérieur) : il part en bloc.

- [ ] Supprimer `libs/ui/src/components/RecordEdition/EditRecordContent/uiElements/TreeField/` :
    - `TreeField.tsx`, `TreeField.test.tsx`, `index.ts`
    - `display-tree-node/` (`TreeFieldWrapper.tsx`, `TreeNodeItem.tsx`, `TreeNodeList.tsx` + tests)
    - `manage-tree-node-selection/` (`SelectTreeNodeModal.tsx`, `useManageTreeNodeSelection.tsx` + test)
- [ ] `libs/ui/src/components/RecordEdition/index.ts` — la ligne
      `export {SelectTreeNodeModal} from './EditRecordContent/uiElements/TreeField/manage-tree-node-selection/SelectTreeNodeModal';`
      doit pointer vers la modale V2 renommée (voir [Étape 7](#étape-7--renommages-v2--nom-canonique)), pas être supprimée : c'est un
      export public.

## Étape 5 — Supprimer le contenu de sélection V1 (`SelectTreeNode`)

Un consommateur applicatif et deux dépendances « transverses » à traiter d'abord.

- [ ] Migrer `libs/ui/src/components/manage-files/shared/DestinationStep/DestinationStep.tsx` vers la
      V2 (paramètre `selectableLibraries`, présent en V2 pour la parité). Depuis LEAVC-1090, c'est le
      **seul** point de montage de `SelectTreeNode` pour les deux modales de fichiers, qui passent
      aussi `showNodeTypeIcon` — vérifier que la V2 le supporte. Les `vi.mock` de
      `UploadFiles.test.tsx` et `CreateDirectory.test.tsx` ciblent toujours
      `_ui/components/SelectTreeNode`.
- [ ] ⚠️ **`_queries/treeDataQuery.graphql` est partagé** : il vit dans
      `components/SelectTreeNode/_queries/` mais son hook généré `useTreeDataQueryQuery` est utilisé
      par le socle V2 (`hooks/useTreeSelection/useTreeSelectionNodes.ts`) et par
      `Filters/filter-items/CommonFilterItem.test.tsx`. **Le déplacer** dans
      `hooks/useTreeSelection/_queries/` avant de supprimer le dossier, puis `yarn graphql-generate`.
- [ ] ⚠️ **`_types.ts` est partagé** : `ITreeMapElement` est importé par
      `Filters/filter-items/filter-type/BooleanAttributeDropdown.tsx`. Deux options : migrer ce
      composant sur `ITreeSelectionNode` (`hooks/useTreeSelection/_types.ts`) — préférable — ou
      déplacer le type. Ne pas laisser un import orphelin sur un dossier supprimé.
- [ ] Supprimer alors `libs/ui/src/components/SelectTreeNode/` : `SelectTreeNode.tsx`,
      `SelectTreeNode.test.tsx`, `SelectTreeNodeContent.tsx`, `SelectTreeNodeContentSkeleton.tsx`,
      `TreeNodeTitle.tsx`, `_queries/treeContentDataQuery.ts`, `_types.ts`, `index.ts`.
- [ ] `libs/ui/src/components/index.ts` — supprimer `export * from './SelectTreeNode';`.

## Étape 6 — `SelectTreeNodeModalOld` (VersionTree)

Troisième implémentation historique, indépendante des flags mais dans le même périmètre
fonctionnel : à traiter dans la foulée pour ne pas laisser deux modales de sélection d'arbre.

- [ ] Migrer `libs/ui/src/components/ValuesVersionConfigurator/VersionTree/VersionTree.tsx` vers la
      modale V2 (+ `ValuesVersionConfigurator.test.tsx`).
- [ ] Supprimer `libs/ui/src/components/SelectTreeNodeModalOld/` (composant, test, `index.ts`) et son
      `export * from './SelectTreeNodeModalOld';` dans `components/index.ts`.

> Si cette étape s'avère plus lourde que prévu (le sélecteur de version a ses propres contraintes),
> elle peut être sortie dans un ticket dédié — mais **pas** différée indéfiniment : c'est le seul
> reste de sélection d'arbre hors V2.

## Étape 7 — Renommages `V2` → nom canonique

À faire **après** la suppression de la V1, sinon collision de noms. Un `git mv` par fichier, puis un
renommage des symboles.

**`libs/ui/src/components/SelectTreeNodeV2/` → `libs/ui/src/components/SelectTreeNode/`**

| Avant                                                   | Après                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `SelectTreeNodeV2.tsx`                                  | `SelectTreeNode.tsx`                                               |
| `SelectTreeNodeModalV2.tsx`                             | `SelectTreeNodeModal.tsx`                                          |
| `TreeNodeTitleV2.tsx`                                   | `TreeNodeTitle.tsx`                                                |
| `TreeNodeTitleV2.module.css`                            | `treeNodeTitle.module.css` (camelCase, cf. convention CSS Modules) |
| `SelectTreeNodeV2` / `ISelectTreeNodeV2Props`           | `SelectTreeNode` / `ISelectTreeNodeProps`                          |
| `SelectTreeNodeModalV2` / `ISelectTreeNodeModalV2Props` | `SelectTreeNodeModal` / `ISelectTreeNodeModalProps`                |
| `SelectTreeNodeModalV2Attribute`                        | `SelectTreeNodeModalAttribute`                                     |
| `SelectTreeNodeModalV2BackendValue`                     | `SelectTreeNodeModalBackendValue`                                  |
| `TreeNodeTitleV2` / `ITreeNodeTitleV2Props`             | `TreeNodeTitle` / `ITreeNodeTitleProps`                            |

**`…/uiElements/TreeFieldV2/` → `…/uiElements/TreeField/`**

| Avant                              | Après                              |
| ---------------------------------- | ---------------------------------- |
| `TreeFieldV2.tsx`                  | `TreeField.tsx`                    |
| `TreeFieldV2.test.tsx`             | `TreeField.test.tsx`               |
| `TreeFieldV2.module.css`           | `treeField.module.css` (camelCase) |
| `TreeFieldV2` / `TreeFieldV2Props` | `TreeField` / `TreeFieldProps`     |
| `useTreeFieldValues.ts`            | inchangé (déjà sans suffixe)       |

- [ ] Renommer les `describe(...)` des tests (`'SelectTreeNodeModalV2'`, `'TreeFieldV2'`, …).
- [ ] Nettoyer les commentaires qui parlent de « V2 of `SelectTreeNode` », « V2 of `TreeField` »,
      « rendered instead of it when the `enableTreeAttributeV2Form` flag is on » (en-têtes de
      `SelectTreeNodeV2.tsx` et `TreeFieldV2.tsx`).
- [ ] Vérification finale : `grep -rn "V2" libs/ui/src/components/SelectTreeNode libs/ui/src/components/RecordEdition/EditRecordContent/uiElements/TreeField`
      ne doit plus rien renvoyer (attention à ne pas confondre avec `ExplorerV2`, hors sujet).

## Étape 8 — Exports publics, `dist` et coordination aval

- [ ] `libs/ui/src/components/index.ts` — remplacer
      `export {SelectTreeNodeV2} from './SelectTreeNodeV2'; // TODO: rename …` par
      `export * from './SelectTreeNode';` (et supprimer le TODO, qui référence ce cleanup).
- [ ] `libs/ui/src/components/RecordEdition/index.ts` — `SelectTreeNodeModal` réexporté depuis le
      nouveau chemin.
- [ ] Rebuilder `libs/utils` puis `libs/ui` (les `dist/` sont ignorés par git — rien à commiter, mais
      le build local est nécessaire pour l'overlay de vérification xStream ci-dessous).
- [ ] xStream : `front-amont-cadrage` consomme `SelectTreeNode` V1 depuis `@leav/ui`. Le nom d'export
      est conservé mais **le comportement change** (plus de racine désactivée en dur, `multiple` non
      forcé) : vérifier le panneau de gestion des catégories avec l'overlay du `dist` dans les
      `node_modules` de xstream, et ouvrir la MR côté xStream si un paramètre doit être passé
      explicitement.
- [ ] AMP : même vérification si l'app consomme la modale ou le champ arbre.

## Étape 9 — Retirer les clés de flag des instances

**Après** déploiement du code (avant, les instances retomberaient en V1).

- [ ] Pour chaque instance : Admin → Général → Configuration personnalisée → retirer
      `enableTreeAttributeV2Form` et `enableTreeAttributeV2Modal` du JSON.
- [ ] ⚠️ `saveGlobalSettings` remplace **tout** le sous-objet `settings`
      (`apps/core/src/infra/globalSettings/globalSettingsRepo.ts`, `mergeObjects: false`) : éditer le
      JSON existant, ne pas l'écraser.

## Étape 10 — Vérification

- [ ] `yarn test` vert dans `libs/ui`, `apps/admin`, `apps/core`.
- [ ] `grep -rn "TreeFieldSwitch\|SelectTreeNodeModalOld\|enableTreeAttributeV2" libs apps` → aucun
      résultat hors `docs/`.
- [ ] CI : déclencher manuellement `build-docker-core [amd64]`, **attendre sa fin**, puis
      `e2e-playwright` (MR touchant `libs/ui/**`).
- [ ] Manuel sur la stack locale : formulaire arbre (mono, multi, suppression), modale de sélection
      depuis un champ liaison (`LinkModal`), `UploadFiles` / `CreateDirectory`, sélecteur de version.
- [ ] Retirer la ligne « Cleanup attribut Arbre V2 » de la section « Chantiers en cours et à venir »
      du `CLAUDE.md` racine.
- [ ] Supprimer ce document, ou le remplacer par une ligne dans le changelog / la doc de l'epic une
      fois toutes les cases cochées.

---

## Reformulations Jira à faire au passage

Les intitulés de deux tickets de l'epic ne décrivent plus ce qui a été livré :

- **LEAVC-962** : « affichage en Select pour les arbres plats » → « champ de formulaire V2 sur
  `KitTreeSelect` » (le cas plat n'est qu'un sous-cas, il n'y a aucun code dédié).
- **LEAVC-1030** : mentionner **deux** flags indépendants (formulaire et modale), pas un seul.
