# usePanelMessenger — CLAUDE.md

Système de communication bidirectionnelle entre `app-studio` (hôte) et ses panels —
panels natifs React (`nativePanelHandlersMap`) comme panels iframe (`handlersMap`).
Repose sur `window.postMessage` avec une enveloppe marquée `__fromIframeMessenger`.

Le détail (types de messages, mécanisme de callbacks cross-frame, encodage) se lit
dans le code de ce dossier. Pour les décisions d'architecture côté view config panel,
voir `docs/adr/ADR-006-explorer-views-settings-volet.md`.

> ⚠️ **Piège `SerializedView`** : il existe **deux** types de ce nom. `types.ts` importe celui
> d'**`ExplorerV2/_types`** (forme **lean sérialisable**, exporté publiquement sous l'alias
> `SerializedViewV2`, produit par `viewV2ToSerializedView`) — c'est lui que transportent les messages
> `view-settings-update` / `update-view` (message-ready cross-iframe). **Ne pas** confondre avec le
> `SerializedView` d'`Explorer/_types` (v1, `DefaultViewSettings` avec `filters: UIFilter[]` **riche,
> non sérialisable**). Toute évolution du contrat de vue transporté doit viser le type **V2**.

## Fichiers clés

| Fichier                      | Export                    | Rôle                                                                   |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `PanelMessengerProvider.tsx` | `PanelMessengerProvider`  | Singleton Provider — 1 seul `addEventListener` pour toute l'app        |
| `usePanelIFrameHandlers.ts`  | `usePanelIFrameHandlers`  | Hook per-iframe pour `PanelCustom` — enregistre les handlers protocole |
| `usePanelEventHandlers.ts`   | `usePanelEventHandlers`   | Bus d'événements interne — subscribe + dispatch entre composants hôte  |
| `usePanelMessenger.ts`       | `usePanelMessenger`       | Hook interne du Provider — gère le `addEventListener` global           |
| `messageHandlers.ts`         | —                         | Encode/décode les messages postMessage                                 |
| `panelMessengerContext.ts`   | `PanelMessengerContext`   | Contexte React partagé entre Provider et hooks                         |
| `types.ts`                   | `InternalEventMessage`, … | Types TypeScript du système                                            |
| `schema.ts`                  | `creationPanelSchema`     | Schéma Zod de validation des messages de création                      |

## Pattern : callbacks cross-frame (RPC callback-proxy)

`postMessage` ne transporte que du JSON — **on ne peut pas passer une fonction** d'une frame à
l'autre. Le messenger contourne ça avec un **RPC à callbacks marshalés** (alias _remote callback_ /
_proxy-stub_) :

1. **Émetteur (iframe)** — `storeCallbacks` (`messageHandlers.ts`) détecte les props de type
   fonction dans le `data` d'un message, les **garde localement** dans un `callbacksStore` (keyé par
   un `id`), et envoie seulement leurs noms dans `overrides` (le _handle_).
2. **Récepteur (hôte)** — `setCallbacks` reconstruit chaque callback comme un **proxy/stub** : un
   appel du proxy émet un message `on-call-callback` (path = `${id}.${key}`) vers la frame d'origine.
3. **Retour (iframe)** — `getCallback` retrouve la vraie fonction dans le `callbacksStore` et
   **l'exécute**.

Messages qui utilisent ce mécanisme : `modal-confirm`, `alert`, `notification`, `get-url`,
`get-panel-config`, et **`navigate-to-panel`** (voir ci-dessous).

### `navigateToPanel({onClose})` — lifecycle hook en inversion de contrôle

`navigate-to-panel` porte un callback optionnel `onClose`.
**Contrat** : l'hôte appelle `onClose` quand le panel ouvert par cette navigation est **fermé par
l'utilisateur** (croix / ESC / overlay). C'est un **lifecycle hook IoC** : l'ouvreur
fournit le comportement, l'hôte décide quand l'exécuter.

> Pour ajouter un nouveau callback cross-frame : déclarer la prop fonction dans le type du message,
> s'assurer que la méthode exposée passe par `storeCallbacks`, et que le case récepteur wrappe avec
> `setCallbacks`. Pour un callback différé (invoqué après coup par l'hôte), prévoir un relais type
> registre corrélé comme `panelCloseCallbacks`.
