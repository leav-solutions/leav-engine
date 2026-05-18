# Plan — Panneau de gestion des vues de l'Explorer

## EPIC JIRA

### Problématique & objectifs

Actuellement, lorsqu'un utilisateur arrive sur un explorateur dans une application métier
(ex : Campaigns Manager), une vue lui est imposée via un id de vue passé en paramètre.
L'accès au side panel de configuration dépend du flag `freezeView` : il n'est accessible que si
`freezeView` est explicitement à `false` (cf. `mapperToCommonExplorerProps.tsx` —
`enableConfigureView: isBoolean(freezeView) ? !freezeView : false`). Par défaut (absence du flag
ou `freezeView: true`), l'utilisateur ne peut pas personnaliser son affichage ni gérer ses vues.

L'objectif est d'introduire un **modèle de vues à deux niveaux** :

- **Niveau administrateur** — configure une vue de référence en définissant les attributs
  disponibles pour les colonnes, les filtres et les tris. Il partage cette vue avec tous les
  utilisateurs.
- **Niveau utilisateur** — à partir d'une vue partagée, personnalise son propre affichage
  (colonnes visibles, filtres épinglés, tris) et peut sauvegarder dans une **vue personnelle**,
  clone indépendant de la vue partagée d'origine.

### Structure du side panel (4 onglets)

| Onglet        | Rôle                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Affichage** | Mode d'affichage, attributs disponibles pour les colonnes, colonnes visibles                                |
| **Filtres**   | Attributs disponibles pour les filtres, ajout de filtres, épinglage dans la FilterToolBar, réordonnancement |
| **Tris**      | Attributs disponibles pour le tri, ajout de tris, réordonnancement                                          |
| **Catalogue** | Liste des vues disponibles (personnelles + partagées), CRUD vues personnelles, partage                      |

### Comportements clés

- Une vue partagée n'est modifiable que par son créateur.
- Quand un utilisateur personnalise une vue partagée et la sauvegarde, il crée un **clone
  indépendant**. Toute modification ultérieure de la vue partagée n'impacte pas ses vues
  personnelles.
- Si l'Explorer est appelé **sans id de vue** → fallback : une seule colonne "carte d'identité",
  aucun filtre. Un utilisateur sans droits admin n'a accès à aucun attribut pour configurer sa vue.
- Si l'Explorer est appelé **avec un id de vue partagée** → cette vue s'affiche telle quelle.
- Périmètre de partage actuel : **global** (tout le monde). Partage par groupes d'utilisateurs
  prévu dans une version ultérieure.

### Découpage EPIC (à affiner avec les devs)

1. ~~R&D — format de stockage (filtres avec valeurs + rétrocompatibilité)~~ **✓ fait** — nouvel endpoint
2. Feature flag — activation
3. Entrypoints vers le side panel — bouton principal + raccourcis par onglet (nouveau)
4. Gestion des vues — affichage de la vue courante, sélection, sauvegarde, renommage, suppression,
   partage
5. Gestion des attributs en mode tableau — disponibles, visibles, épinglés
6. Gestion des attributs en mode timeline / double timeline — **hors scope Core**, pris en charge
   par squad PAC
7. Gestion des attributs pour les filtres — disponibles, visibles, épinglés, avec valeurs
8. Gestion des attributs pour les tris — disponibles, visibles, épinglés
9. Suppression du feature flag

---

## Contexte architectural (conversations d'équipe)

> **Scope de ce plan** : périmètre front uniquement, dans `apps/app-studio/` et `libs/ui/`.
> Le format de stockage est acté (R&D terminée) — la persistance passe par un **nouvel endpoint**,
> distinct de l'endpoint de vue existant.

Créer un nouveau type de panneau dans app-studio qui héberge la configuration des vues de
l'Explorer. Ce panneau est forcé en mode slider (il ne pousse pas le contenu, non redimensionnable)
et doit communiquer en temps réel avec le panneau Explorer associé dans les deux sens.

**Communication inter-panneaux — contrainte centrale :**

- Config panel → Explorer : envoie la vue courante en JSON à chaque changement via un Store avec
  subscribe
- Explorer → Config panel : notifie quand les filtres/tris sont modifiés directement depuis la
  barre de l'Explorer

L'approche "récupère la vue depuis le backend" est **rejetée** : la vue peut être dans un état
non-sauvegardé → la vue sérialisée doit être transmise directement en mémoire.

Les apps custom (Planning, Cadrage) ont besoin d'injecter des options supplémentaires dans ce
panneau — la notion de sous-panneaux injectables est à traiter dans une itération ultérieure.

---

## Fichiers à créer / modifier

### 1. Nouveau type de panneau dans le schéma Zod

**`libs/ui/src/hooks/useIFrameMessenger/schema.ts`** — ajouter `viewConfigPanelSchema` et
l'inclure dans `PanelSchema`

```ts
export const viewConfigPanelSchema = z.object({
    type: z.literal('viewConfig'),
    targetPanelId: PanelIdSchema,
});
```

> `targetPanelId` est intentionnellement générique — aujourd'hui il pointe vers un panneau
> `explorer`, mais quand la notion de sous-panneaux reviendra il devra aussi pouvoir pointer vers
> un panneau `custom` (iframe).
>
> Contrainte : le mode `slider` est forcé dans `PanelContent.tsx`, pas dans le schéma.
>
> ⚠️ Sous-panneaux injectables (Planning/Cadrage) : non inclus dans cette version — la stratégie
> d'intégration (iframe vs autre) n'est pas encore arrêtée. À revoir quand ce besoin remonte.

---

### 2. Communication inter-panneaux via `useIFrameMessenger`

Pas de React context / store partagé en mémoire. La communication repose sur l'infrastructure
`message-to-panel` déjà en place dans `libs/ui/src/hooks/useIFrameMessenger/`, qui fonctionne
indifféremment pour des panneaux natifs React et des iframes. App-studio sert de broker.

Ce choix est structurant : quand les sous-panneaux Planning/Cadrage (iframes) arriveront, le
protocole de communication n'aura pas à changer.

**Modifications dans `libs/ui/src/hooks/useIFrameMessenger/` :**

`SerializedView` est défini dans `libs/ui/src/components/Explorer/_types.ts` (alias de
`DefaultViewSettings`).

**`types.ts`** — nouveaux types de messages, handlers et types de registre :

```ts
// __targetPanelId ajouté à IMessageBase pour le routage same-window
export interface IMessageBase {
    __frameId?: string;
    __targetPanelId?: string;
}

export type ViewConfigUpdateMessage = IMessageBase & {
    type: 'view-config-update';
    data: { targetPanelId: string; serializedView: SerializedView };
};

export type ExplorerViewChangedMessage = IMessageBase & {
    type: 'explorer-view-changed';
    data: { serializedView: SerializedView };
};

// Dans IUseIFrameMessengerOptions.handlers :
onExplorerViewChanged?: (data: ExplorerViewChangedMessage['data']) => void;
onViewConfigUpdate?: (data: ViewConfigUpdateMessage['data']) => void;

// Types de registre
export type RegisterNativePanelHandlers = (panelId: string, handlers) => UnregisterHandlers;
export type DispatchToNativePanel = (panelId: string, message: Message) => void;
```

`ExplorerViewChangedMessage` → union `MessageToParent` ; `ViewConfigUpdateMessage` → union
`MessageFromParent`.

**`useIFrameMessengerContext.tsx`** — second registre dans `IFrameMessengerProvider` :

```ts
const nativePanelHandlersMap = useRef(new Map<string, handlers>());
```

Dans `onMessageReceived` : si `senderWindow === window`, route par `message.__targetPanelId`
vers `nativePanelHandlersMap`. Expose `registerNativePanelHandlers` et `dispatchToNativePanel`
(via `window.postMessage` same-window) dans le contexte.

**`useNativePanelMessengerHandlers.ts`** (nouveau) — symétrique de `useIFrameMessengerHandlers`
pour les panels React natifs :

```ts
useNativePanelMessengerHandlers(panelId: string, handlers) → { dispatch }
```

Enregistre les handlers au montage, nettoyage à l'unmount. Retourne `dispatch(targetPanelId, message)`.

**Principe fondamental : l'Explorer ne connaît pas app-studio.**
Il expose des callbacks génériques. C'est app-studio qui les branche sur le dispatcher du
messenger. Le composant Explorer doit rester utilisable hors de ce système de panneaux.

> ⚠️ **Rétrocompatibilité AMP** : AMP consomme `Explorer` depuis `@leav/ui` sans passer par le
> système de messenger d'app-studio. Toutes les nouvelles props/callbacks ajoutés à `Explorer` > **doivent rester optionnels** (`?:`). AMP ignorera ces callbacks sans modification de son côté.

**Flux Explorer → viewConfig :**
Depuis la barre de l'Explorer, l'utilisateur peut modifier uniquement les **filtres** — pas les
tris (les tris ne sont modifiables que depuis le panneau viewConfig).

L'Explorer expose un callback générique pour notifier d'un changement de filtres, dans
`defaultCallbacks.viewConfig` :

- `defaultCallbacks.viewConfig.onFiltersChange?: (payload: FiltersChangePayload) => void`
  avec `FiltersChangePayload = { filters: UIFilter[]; filtersOperator: 'AND' | 'OR' }`

App-studio branche ce callback sur le dispatcher `explorer-view-changed`. `PanelViewConfig`
reçoit la notification via le messenger.

**Flux viewConfig → Explorer :**
`PanelViewConfig` dispatche un `view-config-update` via le messenger → app-studio reçoit le
message et met à jour une prop de l'Explorer (ex. `currentView`) pour lui appliquer la vue.

**Raccourcis vers un onglet du panneau :**
L'Explorer expose un callback `defaultCallbacks.viewConfig.onViewConfigTabClick?: (tab: ViewConfigTab) => void`
pour les boutons de raccourci dans sa barre (ex. clic sur l'icône filtre → ouvre directement
l'onglet Filtres du panneau viewConfig). App-studio branche ce callback sur la navigation vers
le panneau slider avec le bon onglet actif. L'Explorer ne sait pas ce qui se passe derrière.

---

### 3. Guard — `RedirectViewConfigPanelToSlider`

**`apps/app-studio/src/modules/ApplicationRouting/guards/RedirectViewConfigPanelToSlider.tsx`**

Même pattern que `RedirectCreationFormPanelToPopup` : si un panneau `viewConfig` est accédé
sans `where=slider`, le guard redirige vers l'URL correcte avant le rendu.

```tsx
const shouldRedirectToSlider = currentPanel.type === 'viewConfig' && where !== 'slider';
```

Le composant `PanelViewConfig` n'a donc pas à imposer quoi que ce soit au niveau layout — le
routing garantit qu'il est toujours rendu dans un slider.

---

### 4. Composant principal

**`apps/app-studio/src/modules/ApplicationRouting/content/panel-view-config/PanelViewConfig.tsx`**

- Reçoit `onViewChanged` en prop (callback fourni par app-studio, branché sur le dispatcher
  `explorer-view-changed`)
- 4 onglets : Affichage, Filtres, Tris, Catalogue
- Bouton de sauvegarde : persiste la vue via le nouvel endpoint

Structure interne :

```
panel-view-config/
├── PanelViewConfig.tsx
├── tabs/
│   ├── TabDisplay.tsx          # mode d'affichage + attributs disponibles + colonnes visibles
│   ├── TabFilters.tsx          # attributs disponibles, ajout filtres, épinglage, ordre
│   ├── TabSorts.tsx            # attributs disponibles, ajout tris, ordre
│   └── TabViews.tsx            # CRUD vues + partage
└── __tests__/
    └── PanelViewConfig.spec.tsx
```

---

### 5. Intégration dans le router de panneaux

**`apps/app-studio/src/modules/ApplicationRouting/content/PanelContent.tsx`**

```tsx
if (panel.type === 'viewConfig') {
    return <PanelViewConfig targetPanelId={panel.targetPanelId} />;
}
```

---

### 6. Nouvelles props de l'Explorer (`libs/ui`)

**Dans `libs/ui/src/components/Explorer/`** (composant existant)

L'Explorer expose des callbacks génériques — il ne connaît pas app-studio ni le messenger.

**`SerializedView` — définition du type :**

```ts
// Dans libs/ui/src/components/Explorer/_types.ts
export type SerializedView = DefaultViewSettings;
```

Alias de `DefaultViewSettings` (`Partial<IViewSettingsState>`) — couvre filtres, tris, colonnes,
viewType. Le type alias donne du sens au contrat sans dupliquer la définition.

**Problème de priorité identifié dans le code :**

`defaultViewSettings` est lu **une seule fois** à l'initialisation dans `useViewSettingsReducer`
(dans un `useEffect` sur `[attributesLoading, viewsLoading, libraryId]` — pas dans les deps).
Une mise à jour dynamique de cette prop est silencieusement ignorée après le montage.

De plus, `hydratedSettings` est construit ainsi :

```ts
{ ...viewProps, ...defaultViewSettings }  // defaultViewSettings écrase viewId chargé
```

Si un `viewId` est présent ET qu'on envoie une `SerializedView` dynamique, il y a un conflit
latent : le `viewId` reste dans l'état alors que la vue a été modifiée hors sauvegarde.

**Solution à implémenter :**

Ajouter une nouvelle action au reducer `viewSettingsReducer` :

```ts
{
    type: 'APPLY_SERIALIZED_VIEW';
    payload: SerializedView;
}
```

Qui remplace l'état courant sans round-trip backend et positionne `viewModified: true`
(vue dans un état non-sauvegardé). L'Explorer expose ensuite :

```ts
// Prop contrôlée — quand elle change, l'Explorer dispatche APPLY_SERIALIZED_VIEW
currentView?: SerializedView;

// Dans defaultCallbacks.viewConfig :
defaultCallbacks?: {
    viewConfig?: {
        // Notifie l'extérieur d'un changement de filtres depuis la barre de l'Explorer
        onFiltersChange?: (payload: FiltersChangePayload) => void;
        // Raccourci vers un onglet du panneau viewConfig
        onViewConfigTabClick?: (tab: ViewConfigTab) => void;
    };
};
```

App-studio branche `defaultCallbacks.viewConfig.onFiltersChange` sur le dispatcher
`explorer-view-changed`, `defaultCallbacks.viewConfig.onViewConfigTabClick` sur la navigation
vers le slider au bon onglet, et met à jour `currentView` quand un `view-config-update` arrive
via le messenger.

---

## Extensibilité — sous-panneaux injectables (Planning / Cadrage)

> ⚠️ **Hors scope de cette version.** La stratégie d'intégration (iframe ? autre ?) n'est pas
> encore arrêtée.

Quand ce chantier reviendra, points d'attention :

- Le `viewConfig` devra pouvoir cibler un panneau `custom` (iframe) en plus d'un `explorer` —
  d'où le choix de `targetPanelId` plutôt que `explorerPanelId` dès maintenant.
- Les sous-panneaux (iframes) utiliseront le même protocole `message-to-panel` — pas de
  changement architectural, juste de nouveaux types de messages.
- Le flux de sauvegarde devra orchestrer : persistance des données custom (BFF) puis persistance
  de la vue LEAV générique via le nouvel endpoint.

---

## Flux de sauvegarde (version sans sous-panneaux)

Au clic sur "Sauvegarder" dans `PanelViewConfig` :

```
1. app-studio persiste la vue sérialisée via le nouvel endpoint (GraphQL ou REST — à confirmer)
```

---

## Points ouverts / Risques

| Sujet                                                                       | Statut                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Sérialisation de la vue courante de l'Explorer en mémoire                   | À vérifier dans `manage-view-settings/`                         |
| Feature flag d'activation                                                   | À introduire dès le début, supprimé en fin d'EPIC               |
| Chargement des vues custom (agrégation vue LEAV + données BFF + prefs user) | Gros sujet backend, hors scope de cette MR                      |
| Persistance des options custom (localStorage → backend)                     | Implique un endpoint BFF côté Planning/Cadrage                  |
| Compatibilité AMP (pas sur app-studio)                                      | Bloquant pour la migration AMP → app-studio, à valider avec Sam |
| Timeout des acquittements de sauvegarde des sous-panneaux                   | Décision de comportement à prendre                              |
| Gestion attributs mode timeline / double timeline                           | Hors scope Core — squad PAC                                     |

---

## Ce qui est explicitement hors scope

- La partie backend d'agrégation des vues (générique + custom + prefs user) — chantier séparé
- La migration AMP vers app-studio — sujet parallèle bloqué sur cette décision
- Gestion des attributs en mode timeline / double timeline — squad PAC
- Partage des vues par groupes d'utilisateurs — version ultérieure
- Le renommage/suppression de l'existant dans `manage-view-settings/` de l'Explorer

---

## Ordre d'implémentation (front uniquement)

**`libs/ui` — fondations (débloquent tout le reste)**

1. **`SerializedView`** — type alias dans `Explorer/_types.ts` + action `APPLY_SERIALIZED_VIEW`
   dans `viewSettingsReducer`. Foundational : sans ça, rien d'autre ne peut avancer.
2. **Nouveaux types de messages** (`ViewConfigUpdateMessage`, `ExplorerViewChangedMessage`) dans
   `useIFrameMessenger/types.ts`
3. **Props Explorer** — `onFiltersChange`, `onRequestOpenViewConfigTab` (émission)
4. **Prop `currentView`** — prop contrôlée qui dispatche `APPLY_SERIALIZED_VIEW` (réception)

**`apps/app-studio` — infrastructure du panneau**

5. **Feature flag** — `enableViewConfig: z.boolean().optional()` dans `ApplicationSchema`
6. **Schéma Zod + types** (`viewConfigPanelSchema`)
7. **Guard `RedirectViewConfigPanelToSlider`**
8. **Shell `PanelViewConfig`** — structure + 4 onglets vides + intégration dans `PanelContent`
9. **Câblage messenger** — `onFiltersChange` → `explorer-view-changed` ; `view-config-update` →
   `currentView` ; `onRequestOpenViewConfigTab` → navigation slider

**`apps/app-studio` — contenu des onglets**

10. **Distinction admin / utilisateur** — les `groupsId` sont déjà encodés dans le JWT access
    token (cf. `IAccessTokenPayload` dans `apps/core/src/app/auth/authApp.ts`) et disponibles
    dans `ctx.groupsId` côté resolver. Le groupe admin a l'id `'1'` (`adminsGroupId` dans
    `apps/core/src/_constants/users.ts`). Il suffit de les exposer côté GraphQL :
    - Étendre la query `me` dans `core` pour retourner `groupsId: [String]` (depuis `ctx`,
      sans requête DB supplémentaire)
    - Étendre `getUserIdentity.graphql` (app-studio) pour récupérer ce champ
    - Mettre à jour `IUserContextData` (`libs/ui`) pour inclure `groupsId: string[]`
    - Créer un hook `useIsViewConfigAdmin` dans `PanelViewConfig` :
      `ctx.groupsId.includes('1')`

    C'est un prérequis pour tous les onglets : les sections "attributs disponibles"
    ne sont visibles qu'en mode admin.

11. **Onglet Catalogue** — CRUD vues personnelles, affichage vue courante, sélection ; distinction
    admin (peut partager) / utilisateur (peut cloner)
12. **Onglet Affichage** — section admin : configurer les attributs disponibles ; section user :
    choisir les colonnes visibles parmi les disponibles
13. **Onglet Filtres** — section admin : configurer les attributs disponibles ; section user :
    ajouter des filtres parmi les disponibles, épingler dans la FilterToolBar
14. **Onglet Tris** — section admin : configurer les attributs disponibles ; section user :
    ajouter des tris parmi les disponibles
15. **Flux de sauvegarde** — persistance via le nouvel endpoint
16. **Suppression du feature flag**
