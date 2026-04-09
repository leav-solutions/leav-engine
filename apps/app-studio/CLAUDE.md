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
│   │   ├── content/               # Dispatcher de type de panneau
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

### Types de panneaux (`PanelContent.tsx`)

| Type           | Description            | Props clés                           |
| -------------- | ---------------------- | ------------------------------------ |
| `explorer`     | Explorer `@leav/ui`    | `viewId`, `explorerProps`, `actions` |
| `editionForm`  | Formulaire d'édition   | `formId`                             |
| `creationForm` | Formulaire de création | `formId`                             |
| `custom`       | Iframe métier          | `iframeSource`                       |

### Modes d'affichage des panneaux

-   `undefined` → premier niveau de navigation — implicitement `fullpage` (il faut toujours un panneau pleine page pour afficher quelque chose à l'écran)
-   `fullpage` → affichage pleine page explicite, ex. ouverture d'un PAC depuis la liste des PACs
-   `slider` → panneau latéral glissant
-   `popup` → modal dialog
-   Flap panels → panneaux latéraux via `flapRecordId/flapLibraryId/flapPanelId`

---

## Communication avec les iframes (MFE)

Les panneaux `custom` (iframes) communiquent via `useIFrameMessengerClient` (`@leav/ui` — `libs/ui/src/hooks/useIFrameMessengerClient/`). Ce hook est destiné aux apps tierces intégrées via iframe ; il n'est pas utilisé dans ce repo.

Handlers disponibles (`panel-custom/message-handlers/`) :

-   `onNavigateToPanel` — naviguer vers un panneau configuré
-   `onOpenFlapPanel` / `onCloseFlapPanel` — ouvrir/fermer un panneau latéral
-   `onClosePanel` — fermer le panneau courant
-   `onGetPanelConfig` — récupérer la config JSON du panneau
-   `onAlert` / `onNotification` / `onModalConfirm` — UI notifications
-   Synchronisation de langue entre frames

---

## Routing

URL pattern : `/:workspaceId/:panelId/:recordId?/:where?/:recordPanelId?`

-   `where` : `slider` ou `popup` pour les panneaux secondaires
-   Flap : `.../flap/:flapRecordId/:flapLibraryId/:flapPanelId`
-   `retrievePanelDetails()` — utilitaire pour retrouver un panneau par ID dans la config

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

-   Framework : Jest + Testing Library
-   Fichiers : `*.spec.tsx` / `*.spec.ts` colocalisés dans `__tests__/`
-   Génération des types GraphQL : `graphql-codegen` (même pattern que `libs/ui`)
