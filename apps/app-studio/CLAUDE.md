# apps/app-studio — CLAUDE.md

Shell MFE (Micro-Frontend) configurable par JSON.
Orchestre l'affichage de panneaux : composants `@leav/ui` (Explorer, formulaires)
ou iframes pour du métier custom.

> **Instances connues** : `explorer-studio` (exploration générique, remplace `data-studio`)
> et `campaigns-manager` (métier campagnes) sont deux **paramétrages** de ce même shell —
> aucun code front dédié, seule leur config diffère. La config vit **en base** et se lit
> via le **MCP runtime LEAV** (`mcp__leav-runtime__graphql`), pas dans un fichier du repo.

---

## Principe

L'application elle-même ne contient pas de logique métier. Sa structure est entièrement
pilotée par une **configuration JSON** agrégée par l'endpoint `appStudioSettings` — cette
config est répartie entre les settings de l'application LEAV et ceux des bibliothèques
associées. Elle définit les workspaces, les panneaux, et leurs contenus.

---

## Structure

```
src/
├── config/                        # Providers d'initialisation (Network, Router, Auth, Theme…)
│   └── application-instance/
│       └── application-settings/  # Chargement et parsing de la config JSON
├── modules/
│   ├── ApplicationRouting/        # Shell MFE central — routing et rendu des panneaux
│   │   ├── content/               # Router de type de panneau
│   │   │   └── panel-custom/      # Panneau iframe + handlers de messages
│   │   ├── guards/                # Navigation guards (redirections, transformations d'url)
│   │   ├── router/paths.ts        # Définition des routes
│   │   ├── schema.ts              # Schéma Zod de la config JSON
│   │   ├── schemaValidators.ts    # Validations métier (unicité des IDs, etc.)
│   │   └── types.ts               # Types TypeScript inférés depuis Zod
│   ├── layout/                    # Layout racine
│   ├── activity-center/           # Centre d'activité et notifications
│   ├── information-and-history/   # Informations record et historique
│   └── thread/                    # Fils de discussion
```

---

## Configuration JSON

> Côté **Administration**, la config est répartie sur deux sources, chacune dans l'onglet **Custom config** :
>
> - **JSON de l'application** → définit les `workspaces` (points d'entrée du menu latéral) et référence les bibliothèques.
> - **JSON de chaque bibliothèque** → définit les `libraryPanels` / `recordPanels`, dans une clé par application (`applications["app-studio"]`, `applications["campaigns-manager"]`…). Une même bibliothèque peut donc avoir des panels différents selon l'application.
>
> Si la clé application **n'existe pas** dans le JSON de la bibliothèque, App-Studio applique un **comportement par défaut** : explorateur générique en libraryPanel, formulaire d'édition d'id `"edition"` en recordPanel. La config n'est nécessaire que pour surcharger ce défaut.

### Structure générale

```ts
{
  workspaces: [
    {
      id: string,
      icon: FontAwesomeIcon,
      title?: { [lang]: string },
      type: "library" | "record",
      libraryId: string,
      recordId?: string        // uniquement pour type "record"
    }
  ],
  libraries: {
    [libraryId]: {
      libraryPanels: Panel[],           // panneaux au niveau bibliothèque
      recordPanels: Panel[],            // panneaux au niveau record
      creationPanels?: CreationPanel[]  // moyens de création exposés sur le « + » (ExplorerV2)
    }
  }
}
```

### Workspaces

Point d'entrée affiché dans le menu latéral gauche. Deux types :

- **`library`** — ouvre l'explorateur de `libraryId` avec ses `libraryPanels`. Type le plus courant.
- **`record`** — ouvre directement l'entité `recordId` en `fullpage` avec ses `recordPanels` (raccourci vers un enregistrement précis, ex. le PAC de l'année en cours). `recordId` n'est requis que pour ce type.

### Types de panneaux (`PanelContent.tsx`)

| Type           | Description            | Props clés                                                                                 |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `explorer`     | Explorer `@leav/ui`    | `libraryId`, `attributeSource`, `viewId`, `explorerProps`, `actions`, `deactivateOnUnlink` |
| `editionForm`  | Formulaire d'édition   | `formId`                                                                                   |
| `creationForm` | Formulaire de création | `formId`, `attributeSource`, `isStandalone: true`                                          |
| `custom`       | Iframe métier          | `iframeSource`                                                                             |

- En **libraryPanel** : un seul panel `explorer` supporté pour le moment ; il liste toutes les entités de la bibliothèque.
- En **recordPanel** : un `explorer` liste les entités liées via `attributeSource` (attribut de liaison). Plusieurs recordPanels coexistent — l'ordre dans le tableau = l'ordre des onglets.
- `creationForm` est toujours `isStandalone` (hors onglets). En recordPanel, il n'est invoqué que si l'explorateur associé a `"create"` dans ses `defaultPrimaryActions`. Au niveau bibliothèque, des `creationPanels` déclarés (cf. ci-dessous) **remplacent** le `create` built-in de l'explorateur.

### Panels de création (`creationPanels`)

Liste **ordonnée** des moyens de création d'une bibliothèque, exposée sur le bouton `+` de
l'explorateur : 1 entrée → bouton simple, N entrées → menu déroulant dans l'ordre du tableau.
Chaque entrée ouvre son formulaire LEAV en **popup**, en création _top-level_ (navigation avec le
sentinel `newRecord` dans le slot `:recordId`). Aucun refresh à la charge d'app-studio : à la
validation, l'explorateur sous la popup détecte lui-même le record créé, via sa souscription
`recordUpdate` sur toute la bibliothèque (l'activation d'un record hors liste déclenche le
rechargement de la liste et du compteur — cf. `useExplorerData` dans `@leav/ui`).

| Paramètre | Type      | Description                                                   |
| --------- | --------- | ------------------------------------------------------------- |
| `id`      | string    | Identifiant unique (partage l'espace d'ids des autres panels) |
| `formId`  | string    | Formulaire LEAV de création à ouvrir                          |
| `name`    | `{fr,en}` | **Requis** — libellé du bouton / de l'entrée du menu          |
| `icon`    | string    | Icône FontAwesome, défaut `fa-plus`                           |

Contraintes :

- Visibilité croisée `name`/`icon` : avec **1 entrée**, le `+` est un bouton icône-seul
  (`hideFirstActionLabel`) — l'`icon` est visible mais pas le `name` ; avec **N entrées**, le menu
  n'affiche que les `name` — les `icon` des entrées ne sont pas rendues. `name` reste requis :
  il devient le libellé visible dès qu'une deuxième entrée est ajoutée.
- Sans `creationPanels`, le `create` built-in de l'explorateur est inchangé.
- Câblé sur l'explorateur de **bibliothèque** uniquement (le cas lié — explorateur d'attribut avec
  liaison au parent — reste sur le built-in ; généralisation prévue au Lot 2 du chantier
  `creationPanels`).
- La config **explorer-studio générée par le core** ne déclare pas encore de `creationPanels` (ses
  explorateurs restent sur le `create` built-in) ; adapter cette génération est une tâche à part,
  à intégrer au plan du chantier `creationPanels`.

### Paramètres communs à tous les panels

| Paramètre           | Type      | Description                                                                                                                                     |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | string    | Identifiant unique du panel dans le tableau                                                                                                     |
| `icon`              | string    | Icône FontAwesome de l'onglet                                                                                                                   |
| `name`              | `{fr,en}` | Libellé de l'onglet                                                                                                                             |
| `hideInCompactMode` | boolean   | Si `true` : panel masqué en `popup` et `slider` (mode compact). Toujours laisser ≥ 1 recordPanel sans ce flag, sinon rien à afficher en compact |
| `isStandalone`      | boolean   | Si `true` : panel hors onglets, invoqué directement (cas systématique des `creationForm`)                                                       |

### `explorerProps` (valeurs = défauts appliqués si absent)

| Paramètre               | Type     | Défaut                                    | Description                                                          |
| ----------------------- | -------- | ----------------------------------------- | -------------------------------------------------------------------- |
| `showFilters`           | boolean  | `false`                                   | Panneau de filtres                                                   |
| `showSearch`            | boolean  | `false`                                   | Barre de recherche                                                   |
| `showSorts`             | boolean  | `false`                                   | Options de tri                                                       |
| `freezeView`            | boolean  | `false`                                   | Si `true` : l'utilisateur ne peut pas modifier la vue                |
| `defaultMassActions`    | string[] | `["export","editAttribute","deactivate"]` | Actions de masse sur sélection                                       |
| `defaultPrimaryActions` | string[] | `["create"]`                              | Actions du bouton « + » (tableau vide pour le désactiver)            |
| `defaultActionsForItem` | string[] | `["activate","replaceLink","remove"]`     | Actions par ligne (`replaceLink`/`remove` = explorateurs de liaison) |

### Actions sur les lignes

Définissent comment s'ouvre un record. Un seul `onRowClick: true` par explorateur (sinon comportement indéterminé) ; les autres apparaissent en boutons au survol.

| Paramètre    | Valeurs                               | Description                                 |
| ------------ | ------------------------------------- | ------------------------------------------- |
| `what`       | `"record"`                            | Cible (toujours `record` actuellement)      |
| `where`      | `"fullpage"` / `"popup"` / `"slider"` | Mode d'ouverture de l'entité                |
| `onRowClick` | boolean                               | Si `true` : déclenchée au clic sur la ligne |
| `icon`       | string                                | Icône du bouton                             |
| `label`      | `{fr,en}`                             | Libellé du bouton                           |

### Modes d'affichage des panneaux

- `undefined` → premier niveau de navigation — implicitement `fullpage` (il faut toujours un panneau pleine page pour afficher quelque chose à l'écran)
- `fullpage` → affichage pleine page explicite, ex. ouverture d'un PAC depuis la liste des PACs
- `slider` → panneau latéral glissant
- `popup` → modal dialog
- Flap panels → panneaux latéraux via `flapRecordId/flapLibraryId/flapPanelId`

> 📖 Doc utilisateur/admin (Confluence) : [App-Studio — Workspaces & Panels](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1963884553), [Définir les panels d'une bibliothèque](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1964769283), [Gérer l'affichage en mode compact](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1964670997).

### Plein écran (toggle runtime)

Étend un panneau à tout l'écran. À ne pas confondre avec les modes d'affichage ci-dessus, qui sont figés dans la config JSON.

- **Bouton** `FullscreenToggleButton` (`header/action-button/`) affiché dans l'en-tête des panneaux
  selon `showFullscreenButton` (déjà en plein écran, ou aucun panneau en plein écran et pas de
  remplacement par un panneau `fullpage`). Câblage dans [`Panel.tsx`](src/modules/ApplicationRouting/Panel.tsx).
- **Plein écran « CSS », pas l'API Fullscreen native.** L'API native place uniquement le sous-arbre
  dans le top layer → les portails montés sur `document.body` (dropdowns/tooltips/modales du design
  system, portails de l'Explorer) deviennent invisibles/non cliquables. On bascule donc une classe
  CSS (`position: fixed`) sur le panneau. Voir le commentaire de [`useFullscreen.ts`](src/hooks/useFullscreen.ts).
- **État global** via `useFullscreen` (store `useSyncExternalStore`, hors React) : retient l'**id du
  panneau** en plein écran. Le panneau reste plein écran quand un panneau enfant s'ouvre par-dessus.
- **Sticky à la navigation** : naviguer vers un **autre** panneau `fullpage` de premier plan transfère
  le plein écran ; les overlays `slider`/`popup`/flap se superposent sans le rompre.
- **Un seul niveau de plein écran** : le bouton _entrer_ n'apparaît que si **aucun** panneau n'est en
  plein écran (`fullscreenPanelId === null`) ; un overlay (`popup`/`slider`) ouvert par-dessus un panneau
  déjà en plein écran ne propose donc pas son propre toggle. Seul le panneau en plein écran garde son
  bouton _sortir_. Voir `showFullscreenButton` dans [`Panel.tsx`](src/modules/ApplicationRouting/Panel.tsx).
- **Sortie** : bouton toggle ou touche **Échap**.
- **Alerte `FullscreenAlert`** affichée une seule fois par utilisateur ; l'état de fermeture est
  persisté dans `localStorage['fullscreenAlertDismissed']` [`useFullscreenAlertDismissal.ts`](src/hooks/useFullscreenAlertDismissal.ts).

---

## Comportements de bibliothèque et config panels

Le comportement d'une bibliothèque (configuré dans Admin LEAV) influe sur la façon dont on la configure dans app-studio :

- **Standard** — config classique : `libraryPanels` + `recordPanels`, workspace `type: "library"`.
- **Jointure** — rarement un workspace dédié ; généralement exposée via un panneau `explorer` d'une autre bibliothèque. Ses records portent deux clés étrangères (FK) implicites vers les deux bibliothèques reliées. Modifier une jointure = modifier la relation, pas l'entité elle-même.
- **Fichier / Dossier** — workspace classique. L'Explorer liste les nœuds de l'arbre à plat (pas de vue arborescente pour le moment).

Les **attributs de type `tree`** référencent un nœud d'un arbre configuré dans Admin. Ils apparaissent dans les filtres de l'Explorer et les formulaires comme une sélection hiérarchique.

---

## Vues V2 — ExplorerV2 + volet de configuration

Système de configuration de vues (épic LEAVC-762), derrière le **feature flag** `application.enableViewSettings` (`ApplicationRouting/schema.ts`). Quand il est actif, les panneaux `explorer` utilisent **`ExplorerV2`** (`@leav/ui`) au lieu de l'`Explorer` v1.

- **app-studio est la source de vérité de la vue.** `CurrentViewStoreProvider`
  (`content/panel-view-settings/store-current-view/`) est monté **au-dessus du volet** dans
  `ApplicationRouting/Panel.tsx` → l'état de vue survit à la fermeture/réouverture du volet.
- Le volet (`content/panel-view-settings/`) édite la vue ; `panel-explorer/useViewSettingsProps.ts`
  convertit cet état en `SerializedView` et le passe à `ExplorerV2` via la prop **contrôlée**
  `currentView`. ExplorerV2 ne charge jamais de vue lui-même.
- `PanelLibraryExplorer.tsx` / `PanelAttributeExplorer.tsx` **basculent** entre `Explorer` v1 et
  `ExplorerV2` selon le flag (TODO : suppression de v1 une fois la migration terminée).
- Communication inter-panneaux via `usePanelEventHandlers` (`@leav/ui`) : événements internes
  `set-panel-view-settings` et `view-settings-select-view` (types dans `ApplicationRouting/types.ts`).
  ⚠️ Le type de l'event interne `set-panel-view-settings` **ne doit pas** coïncider avec un type de
  message cross-frame (ici le message iframe `open-view-settings`) : le bus interne et le bus
  cross-frame partagent le même `window.postMessage`, et un message dont le type figure dans le
  registre interne est capté directement par ce dernier (cf. `usePanelMessenger.ts`, branche `default`).
- **Le volet monte aussi sur un panel `custom`** (iframe métier, ex. planning), pas seulement
  l'`explorer` (LEAVC-924) : si le panel `custom` déclare `viewId` + `viewLibraryId` (library dont les
  vues sont montrées — champ **statique**, à préférer au `targetLibraryId` runtime qui est reset à la
  fermeture du volet), il pilote le volet générique via des messages cross-frame
  (`open-view-settings`, `update-view`, push
  `view-settings-update`) et voit son onglet Affichage délégué à une iframe dont l'URL
  (`displayViewSettingsIframeSource`) est **injectée dynamiquement** via le message `open-view-settings`
  (l'app custom seule connaît ses params de route), et non lue dans une config statique.
  La vue porte alors une **`origin`** (= panelId, `null` pour l'explorer) qui **scope le catalogue** par
  kind. Détails dans `panel-view-settings/CLAUDE.md` (§ Panels custom & origine).
- **Volet accessible en `slider`** (LEAVC-1089). `PanelContainer` rend une div hôte, sœur DOM du
  `KitSidePanel` du slider, passée à `Panel` via un render-prop (`children(sliderVoletHostElement)`,
  `Panel` étant le seul enfant de `PanelContainer`) ; `Panel` y portale le volet au lieu de le rendre
  inline (sinon il serait clippé par le contenu scrollable du slider). Le volet **recouvre** toujours
  le slider (comme en popup/fullpage), **quel que soit le niveau** — décision produit : pas de
  décalage du slider, même au 1er niveau. Voir ADR-006 (§ Positioning) pour le détail.

> 📖 Détails (architecture d'état, onglets, distinction admin/utilisateur, tris) :
> [`panel-view-settings/CLAUDE.md`](src/modules/ApplicationRouting/content/panel-view-settings/CLAUDE.md).
> Décisions d'architecture : **ADR-006** (`docs/adr/ADR-006-explorer-views-settings-volet.md`).

---

## Communication avec les iframes (MFE)

Les panneaux `custom` (iframes) communiquent via `useIFrameMessengerClient` (`@leav/ui` — `libs/ui/src/hooks/useIFrameMessengerClient/`). Ce hook est destiné aux apps tierces intégrées via iframe ; il n'est pas utilisé dans ce repo.

Handlers disponibles (`panel-custom/message-handlers/`) :

- `onNavigateToPanel` — naviguer vers un panneau configuré
- `onOpenFlapPanel` / `onCloseFlapPanel` — ouvrir/fermer un panneau latéral
- `onClosePanel` — fermer le panneau courant
- `onGetPanelConfig` — récupérer la config JSON du panneau
- `onAlert` / `onNotification` / `onModalConfirm` — UI notifications
- Synchronisation de langue entre frames

---

## Routing

URL pattern : `/:workspaceId/:panelId/:recordId?/:where?/:recordPanelId?`

- `where` : `slider` ou `popup` pour les panneaux secondaires
- Flap : `.../flap/:flapRecordId/:flapLibraryId/:flapPanelId`
- `retrievePanelDetails()` — utilitaire pour retrouver un panneau par ID dans la config

### Convention `useParams()`

Toujours destructurer les params dans l'ordre de l'URL, même si certains ne sont pas utilisés.
S'arrêter au dernier param utile pour le composant.

```ts
// ✅ composant qui n'a besoin que de panelId — on s'arrête là
const {workspaceId, panelId} = useParams();

// ✅ composant qui a besoin de where — on inclut tout jusqu'à where
const {workspaceId, panelId, recordId, where} = useParams();

// ❌ on ne saute pas un param intermédiaire
const {workspaceId, where} = useParams();
```

Ordre complet : `workspaceId` → `panelId` → `recordId` → `where` → `recordPanelId`
→ `flapRecordId` → `flapLibraryId` → `flapPanelId`

---

## Ordre d'initialisation

```
InitNetwork → InitTranslation → InitUser → InitTheme
→ InitNotificationsSubscription → InitRouting
→ InitApplicationSettingProvider   ← charge + valide la config JSON
→ InitDocumentTitle → GuardAccess
→ InitLayout → InitApplicationRouter  ← rendu des panneaux
```

---

## Analytics (Matomo)

Le tracking est **opt-in par instance** via le flag `enableMatomoTracking` de la config `appStudioSettings`
(schéma `ApplicationRouting/schema.ts`). Un **même déploiement** app-studio sert les instances génériques
(`explorer-studio`, `app-studio`) **et** campaigns-manager (routes `/app/…` distinctes, cf.
`docker-compose.yml`), avec le même `index.html`/env Matomo — c'est donc ce flag de config, **pas
l'endpoint d'URL**, qui empêche l'usage générique d'être tracké dans le site Matomo de campaigns-manager.
`InitApplicationSettingProvider` appelle `matomo.setTrackingEnabled(config.enableMatomoTracking ?? false)`
au chargement des settings ; `matomo.push` no-op tant que c'est `false` (défaut). Les événements sont
poussés dans `window._paq`.

> ⚠️ `matomo.setUserRole` (dim 1, portée Visit) est appelé dans `InitUser`, **avant** le chargement des
> settings — il peut donc partir avant que le flag soit posé et être ignoré (compromis accepté).

**Dimensions personnalisées de portée Action** (reconstruites à chaque événement, `services/analytics/resolveActionDimensions.ts`) :
Page type (2, catégorie déduite de `panel.type`), Panel Name (3, `panel.name` localisé, repli sur `panel.id`),
In Comparaison Mode (4, `'false'` pour les panels génériques).

> ⚠️ **Piège Matomo JS** : `setCustomDimension(id, val)` est **persitant** sur le tracker — la valeur est
> renvoyée sur **tous** les hits suivants jusqu'à `deleteCustomDimension(id)` ou rechargement de page. La
> portée « Action » côté serveur ne réinitialise PAS la valeur côté JS. `matomo.trackEvent` fixe donc les
> dimensions avant le hit **puis les supprime juste après** (`deleteCustomDimension`), pour qu'elles ne
> fuient pas sur un événement ultérieur (ex. un événement de navigation qui ne doit porter aucune dimension
> d'action). Ne jamais les fixer au montage.

- **Panels génériques** (explorer/editionForm/…) : `matomo.trackInteractionEvent(action, panel, lang)` fixe les
  3 dimensions puis émet. Points d'émission : `useViewSettingsProps` (filtre appliqué/réinitialisé, export —
  **ExplorerV2 uniquement**, le hook renvoie `{}` quand `enableViewSettings` est off) et `ToggleFlapButton`
  (ouverture du panel de commentaires / flap `thread`).
- **Panels iframe `custom`** : xStream possède ses dimensions et les envoie dans le postMessage `matomo-track` ;
  `trackMatomoEvent.ts` les transmet verbatim. app-studio n'ajoute rien.
- **Événements de navigation** (`trackNavigationEvent` : workspace/onglet/historique) ne portent aucune
  dimension d'action, par décision.

> ⚠️ Limite connue : l'Explorer **v1** (flag off) ne track ni filtre ni export (aucun callback consommateur
> exposé) ; différé jusqu'au retrait de v1.

---

## Tests

- Framework : **Vitest** + Testing Library (migré de Jest, LEAVC-826)
- Fichiers : `*.spec.tsx` / `*.spec.ts` (majorité) et quelques `*.test.tsx`, colocalisés dans `__tests__/`
- Setup (`tests/setupTests.ts`) : `expect.extend` de jest-dom + mocks i18n (`useSharedTranslation` renvoie les clés ; `react-i18next` renvoie `clé|valeur`) → les tests assertent sur des clés stables
- `tsconfig` en solution config (`tsconfig.build.json` + `tsconfig.spec.json`) ; `tscheck` = `tsc -b tsconfig.json`
- Génération des types GraphQL : `graphql-codegen` (même pattern que `libs/ui`)

---

## Dépendances à usage non évident

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non importées par leur nom, mais indispensables

| Package                                                                       | Pourquoi                                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `@graphql-codegen/{typescript,typescript-operations,typescript-react-apollo}` | Référencés par **nom de plugin** (chaînes) dans [`src/config/graphQL/codegen.ts`](src/config/graphQL/codegen.ts) |
| `graphql`                                                                     | Satisfait les `peerDependencies` de `@apollo/client`, `graphql-ws` et des plugins codegen                        |
| `happy-dom`                                                                   | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne, pas import)                                          |
| `@types/node`                                                                 | Présent dans les `types` de `tsconfig.spec.json`                                                                 |
| `vite`, `lightningcss`, `browserslist`                                        | Réellement importés par [`vite.config.js`](vite.config.js) (`browserslistToTargets`, `browserslist`)             |

### Non déclarées à dessein

`antd`, `@ant-design/icons` et les `@fortawesome/*` sont importés sans être déclarés, ainsi que
`react-modal` (dans `tests/setupTests.ts`). Ce sont des dépendances d'`aristid-ds`, distribué en
commit-pin : les pinner ici créerait un couplage de version avec le design system — cf.
[`libs/ui/CLAUDE.md`](../../libs/ui/CLAUDE.md).

> ℹ️ `styled-components` n'est **pas** déclaré ici alors que le bundle en contient : il n'est importé
> que par les sources de `libs/ui`, qui le déclare en `dependencies`. App-studio, lui, est passé aux
> CSS Modules.
