# Plan — Panels de création dans app-studio

> **Statut : proposition, revue #1 intégrée (Philippe / Jules).**
> Ce document décrit une **vision cible** et un **découpage en lots**. Les décisions prises
> sont marquées ✅ ; les points restant à trancher sont marqués ❓.

## 1. Contexte & problème

Aujourd'hui, la **création** d'un enregistrement depuis un explorateur est **gérée intégralement
par le composant Explorer** : app-studio ne lui transmet rien. Le bouton primaire `create`
(built-in) ouvre une **modale bespoke** (`EditRecordModal`, `record=null`) avec un unique
`creationFormId` tiré de `explorerProps.creationFormId`.

Conséquences / limites :

- **Un seul moyen de créer** par explorateur. Impossible d'exposer, par configuration, **plusieurs
  formulaires de création** (ex. « Créer une UB simple » vs « Créer une UB à partir d'un modèle »).
- **Aucune notion de "panel de création"** côté config app-studio. Le type de panel `creationForm`
  existe (rendu par `PanelCreationForm` → `EditRecordPage`) mais **n'est aujourd'hui pas utilisé
  comme cible d'une action de création** depuis l'explorateur : il ne sert que pour la création
  d'un enregistrement **lié** (navigation avec le `recordId` parent + `attributeSource`).
- **Pas de cible iframe** : un moyen de création est forcément un formulaire LEAV.
- **Pas d'invocation externe** : un panel custom (iframe métier, ex. xstream) ne peut pas déclencher
  proprement l'ouverture d'un panel de création.
- **Pré-remplissage limité** : le mécanisme existe (voir §3) mais n'est ni exposé en config, ni
  branché sur la modale de façon fiable.

## 2. Objectif / vision cible

Introduire une **notion de premier ordre « `creationPanels` »** dans app-studio, au même rang que
`libraryPanels` et `recordPanels` (et, à terme, `editionPanels` — cf. §5, extension future
suggérée par Philippe) :

1. Une **liste ordonnée de `creationPanels`** par bibliothèque. Chaque entrée porte **soit un
   formulaire LEAV (`formId`), soit une iframe (`iframeSource`)** — un même type de panel de
   création supporte les deux formats. **L'ordre de la liste = l'ordre des boutons de création.**
2. L'explorateur **expose ces `creationPanels` en boutons de création** (le `+` déroulant existe
   déjà : 1 entrée → bouton simple, N entrées → menu déroulant).
3. **Invocable depuis plusieurs sources** : les primary actions de l'explorateur **et** un panel
   custom (iframe) via le messenger (`openCreationPanel`).
4. **Pré-remplissage à l'ouverture** : passer des `{attribut: valeurs}` initiaux.
   Cas métier moteur (xstream) : créer une **UB** sous une **catégorie / marché / thématique** doit
   **pré-remplir les champs de liaison correspondants**.

## 3. État des lieux — ce qui existe déjà (et qu'on réutilise)

| Brique                                                                              | Où                                                                                                                | Réutilisable pour                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Bouton multi-actions primaires (`+` déroulant `KitDropDown`)                        | `ExplorerV2/actions-primary/usePrimaryActions.tsx`                                                                | Exposer N moyens de création                          |
| Prop `primaryActions?: IPrimaryAction[]` (callback arbitraire)                      | `ExplorerV2/Explorer.tsx`                                                                                         | Injecter les actions custom sans toucher au composant |
| Type de panel `creationForm` + `PanelCreationForm` (form LEAV via `EditRecordPage`) | `ApplicationRouting/content/panel-creation-form/`                                                                 | Base du panel de création (à étendre : + iframe)      |
| Type de panel `custom` (iframe)                                                     | `ApplicationRouting/content/panel-custom/`                                                                        | Format « iframe » d'un panel de création              |
| **Sentinel `NEW_RECORD_ID = 'newRecord'`** + header « nouvel enregistrement »       | `libs/ui/src/constants.ts:89`, `ApplicationRouting/header/id-card/RecordIdCard.tsx:34`                            | Ouvrir une création **top-level** par navigation      |
| **Pré-remplissage** `formInitialValues` (JSON `{attributeId: [payload]}`)           | `RecordEdition/EditRecordPage/getInitialRecordValues.ts` — consommé par `EditRecordPage` **et** `EditRecordModal` | Seed du formulaire à l'ouverture                      |
| Transport `formInitialValues` en query param par le messenger                       | `panel-custom/message-handlers/useNavigateToPanel.ts` (`INIIAL_VALUES_QUERY_PARAMS`, ligne 73)                    | Invocation pré-remplie depuis une iframe              |
| Callback cross-frame IoC `onClose` (pattern proxy-stub)                             | `usePanelMessenger/`                                                                                              | Modèle pour un futur `onCreated`                      |

> Autrement dit : **le pré-remplissage d'un formulaire LEAV via navigation est déjà techniquement
> possible aujourd'hui**, et **la création top-level par navigation ne nécessite pas de refonte du
> router** grâce au sentinel `NEW_RECORD_ID`. L'essentiel du travail est la **notion de config
> `creationPanels`**, le **format iframe** du panel de création, et le **retour de création**.

## 4. Décisions prises (revue #1)

- ✅ **Q1 — Ouverture unifiée par NAVIGATION (option A).** On ne conserve pas la modale bespoke
  comme mécanisme parallèle. Toute ouverture d'un panel de création passe par la **navigation**,
  pour form LEAV **comme** pour iframe, en création **top-level comme liée**.
    - **Pas de refonte du router** (retour Philippe, ligne 67) : la création top-level (sans parent)
      navigue avec le **sentinel `NEW_RECORD_ID`** dans le slot `:recordId` — mécanisme déjà supporté
      (le header `RecordIdCard` rend « nouvel enregistrement » pour cette valeur). Reste à **vérifier
      les guards** (`RedirectCreationFormPanelToPopup`, `retrievePanelDetails`) sur ce cas → petit
      spike en tête de Lot 0, plus un chantier routing.
- ✅ **Q2 — `creationPanels` en premier ordre** (retours Jules + Philippe, ligne 76). On introduit
  un groupe `creationPanels` (à côté de `libraryPanels`/`recordPanels`). Un panel de création
  supporte **`formId` OU `iframeSource`**. La liste, **ordonnée**, définit les boutons de création.
- ✅ **Q3 — Valeurs initiales : format simple** `{attributeId: [payload]}` (ligne 79). On
  n'anticipe pas versioning/metadata ; on étendra plus tard si besoin.
- ✅ **Q4 — Propriété de la création : c'est la cible qui crée** (base Philippe, ligne 81).
    - **Format iframe → l'iframe gère sa propre création** (elle fait l'écriture métier) et **rend
      l'id créé** à l'hôte via un callback `onCreated(recordId)`. app-studio ne fait que
      router/afficher, puis **referme + rafraîchit** la liste.
    - **Format form LEAV → la création reste gérée par LEAV** (`EditRecordPage` fait le
      `createRecord`), comportement actuel conservé.
- ✅ **Q5 — Invocation messenger : `openCreationPanel`** (ligne 84) encapsulant `navigate-to-panel`
  (transport déjà en place : queryParams + `formInitialValues`).
- ✅ **Coexistence avec le `create` built-in** (ligne 86) : désactivable via les props de
  l'Explorer → quand des `creationPanels` sont déclarés, on **désactive le built-in** `create`.
- ✅ **Rollout : ExplorerV2 uniquement** (ligne 88), instances `enableViewSettings: true`.
- ✅ **Dépréciation `EditRecordModal` sur ce périmètre : oui, sans supprimer** (ligne 91). Précision
  Philippe : **encore utilisé par AMP (via Explorer v1)** et potentiellement ailleurs → on
  **déprécie** (marquage + doc) mais on **ne retire pas** tant que v1 vit.

## 5. Questions ouvertes / à préciser à l'implémentation

- ❓ **Granularité d'exposition.** Les `creationPanels` sont-ils **tous** exposés par l'explorateur
  dans l'ordre de la liste (proposition Jules), ou veut-on pouvoir en **sélectionner/ordonner un
  sous-ensemble** par panel explorer ? → _Reco : v1 = tous, dans l'ordre ; affiner plus tard._
- ❓ **Contrat exact `onCreated`.** Payload (`recordId` seul, ou `whoAmI` complet ?), et
  comportement hôte après création iframe (refermer systématiquement ? toujours rafraîchir la liste
  courante ?). → détail de Lot 3.
- ❓ **`editionPanels`** (idée Philippe, ligne 76) : symétrie `creationPanels`/`editionPanels`.
  **Hors scope** de ce chantier, noté comme extension future cohérente.

## 6. Découpage en lots

### Lot 0 — Spike routing création top-level via `NEW_RECORD_ID` _(prérequis, dé-risqué)_

- Vérifier/adapter l'ouverture d'un panel de création **sans parent** en passant `NEW_RECORD_ID`
  dans `:recordId` (guards `RedirectCreationFormPanelToPopup`, `retrievePanelDetails`, header).
- Nettoyer les TODO `useNavigateToPanel.ts:52` / `getWithFallback:109` si pertinents.
- Tests routing (top-level + lié, popup/slider/fullpage).
- **Livrable indépendant**, débloque les autres lots. Risque revu à la baisse (sentinel existant).

### Lot 1 — Groupe de config `creationPanels` + boutons de création de l'explorateur (format form LEAV)

- **Schéma** (`usePanelMessenger/schema.ts`) : groupe `creationPanels` par bibliothèque ; entrée =
  panel de création avec `formId` (label, icône, `where`).
- **Validateur** (`schemaValidators.ts`) : cohérence des entrées.
- **Mapper** (`panel-explorer/mapperToCreationActions.tsx`, calqué sur `mapperToItemActions.tsx`) :
  `creationPanels` → `IPrimaryAction[]` dont le `callback` **navigue** vers le panel de création
  (top-level via `NEW_RECORD_ID`, cf. Lot 0).
- **Câblage** `PanelLibraryExplorer` / `PanelAttributeExplorer` : passer `primaryActions`,
  **désactiver le built-in `create`** quand des `creationPanels` existent.
- Tests (schéma, mapper, rendu `+` simple vs déroulant).

### Lot 2 — Pré-remplissage (form LEAV) exposé en config + cas lié généralisé

- `initialValues` par entrée `creationPanel`, transmis via `formInitialValues`.
- Généraliser le linking parent (aujourd'hui `attributeSource` + `previousRecordId` dans
  `PanelCreationForm`) : une entrée peut **pré-lier** à un parent **et/ou** pré-remplir des attributs.
- Tests de seed (liens `link`/`tree`).

### Lot 3 — Format **iframe** d'un panel de création (la cible gère la création)

- Un `creationPanel` peut porter `iframeSource` au lieu de `formId`.
- Forwarder les `initialValues` dans l'iframe (query param sur `iframeSource` / postMessage).
- Callback cross-frame **`onCreated(recordId)`** (pattern proxy-stub, cf. `onClose`) : **l'iframe
  crée**, rend l'id → l'hôte **referme + rafraîchit**.
- Tests messenger.

### Lot 4 — Invocation depuis un panel custom (messenger)

- Méthode `openCreationPanel({target, initialValues, onCreated})` encapsulant `navigate-to-panel`.
- Types + handler + doc d'intégration (xstream).
- Tests.

### Lot 5 — Documentation & finition

- MàJ `CLAUDE.md` (`apps/app-studio`, `ExplorerV2`, `usePanelMessenger`).
- **Marquer `EditRecordModal` déprécié** sur le chemin création (sans retrait — encore utilisé par
  AMP via Explorer v1).
- Pointeurs Confluence (App-Studio Workspaces & Panels).
- ADR si la décision « unification par navigation » mérite d'être tracée.
- e2e Playwright (`test-apps/`) : scénario « 2 moyens de création + pré-remplissage ».

## 7. Points de vigilance

- **Guards routing sur `NEW_RECORD_ID`** (Lot 0) : valider tôt que le sentinel traverse bien les
  redirections/guards pour la création top-level. Risque principal, mais dé-risqué par l'existant.
- **`@leav/ui` est publié** (AMP, xstream) : toute évolution de `IPrimaryAction` / du schéma / du
  messenger impacte l'API publique — versionner et documenter.
- **Permissions** : une action de création doit respecter `create_record` sur la library cible
  (le built-in le fait via `useExplorerLibraryDetailsQuery`). Ne pas régresser.
- **e2e front** : dès qu'on touche `libs/ui/**` ou la config de bundle, déclencher manuellement
  `build-docker-core [amd64]` puis `e2e-playwright` (cf. `CLAUDE.md`).
- **Feature flag** : cible ExplorerV2 (`enableViewSettings`) — pas de régression sur v1 (dont AMP).

## 8. Annexe — fichiers concernés (repères)

| Sujet                                   | Fichier                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Schéma panels + actions (Zod)           | `libs/ui/src/hooks/usePanelMessenger/schema.ts`                                                                                |
| Bouton primaire multi-actions           | `libs/ui/src/components/ExplorerV2/actions-primary/usePrimaryActions.tsx`                                                      |
| Création built-in (modale, à déprécier) | `libs/ui/src/components/ExplorerV2/actions-primary/useCreatePrimaryAction.tsx`                                                 |
| Sentinel nouvel enregistrement          | `libs/ui/src/constants.ts` (`NEW_RECORD_ID`), `ApplicationRouting/header/id-card/RecordIdCard.tsx`                             |
| Pré-remplissage form                    | `libs/ui/src/components/RecordEdition/EditRecordPage/getInitialRecordValues.ts`                                                |
| Panel de création (form LEAV)           | `apps/app-studio/src/modules/ApplicationRouting/content/panel-creation-form/PanelCreationForm.tsx`                             |
| Navigation inter-panneaux / messenger   | `apps/app-studio/src/modules/ApplicationRouting/content/panel-custom/message-handlers/useNavigateToPanel.ts`                   |
| Routes                                  | `apps/app-studio/src/modules/ApplicationRouting/router/paths.ts`                                                               |
| Mapper item actions (modèle)            | `apps/app-studio/src/modules/ApplicationRouting/content/panel-explorer/mapperToItemActions.tsx`                                |
| Câblage explorer                        | `apps/app-studio/src/modules/ApplicationRouting/content/panel-explorer/PanelLibraryExplorer.tsx`, `PanelAttributeExplorer.tsx` |
