# apps/app-studio — CLAUDE.md

Shell MFE (Micro-Frontend) configurable par JSON.
Orchestre l'affichage de panneaux : composants `@leav/ui` (Explorer, formulaires)
ou iframes pour du métier custom.

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
      libraryPanels: Panel[],  // panneaux au niveau bibliothèque
      recordPanels: Panel[]    // panneaux au niveau record
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
- `creationForm` est toujours `isStandalone` (hors onglets) et n'est invoqué que si l'explorateur associé a `"create"` dans ses `defaultPrimaryActions`.

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

---

## Comportements de bibliothèque et config panels

Le comportement d'une bibliothèque (configuré dans Admin LEAV) influe sur la façon dont on la configure dans app-studio :

- **Standard** — config classique : `libraryPanels` + `recordPanels`, workspace `type: "library"`.
- **Jointure** — rarement un workspace dédié ; généralement exposée via un panneau `explorer` d'une autre bibliothèque. Ses records portent deux clés étrangères (FK) implicites vers les deux bibliothèques reliées. Modifier une jointure = modifier la relation, pas l'entité elle-même.
- **Fichier / Dossier** — workspace classique. L'Explorer liste les nœuds de l'arbre à plat (pas de vue arborescente pour le moment).

Les **attributs de type `tree`** référencent un nœud d'un arbre configuré dans Admin. Ils apparaissent dans les filtres de l'Explorer et les formulaires comme une sélection hiérarchique.

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

## Tests

- Framework : Jest + Testing Library
- Fichiers : `*.spec.tsx` / `*.spec.ts` colocalisés dans `__tests__/`
- Génération des types GraphQL : `graphql-codegen` (même pattern que `libs/ui`)
