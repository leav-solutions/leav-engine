# usePanelMessenger — CLAUDE.md

Système de communication bidirectionnelle entre `app-studio` (hôte) et ses panels —
panels natifs React (`nativePanelHandlersMap`) comme panels iframe (`handlersMap`).
Repose sur `window.postMessage` avec une enveloppe marquée `__fromIframeMessenger`.

Le détail (types de messages, mécanisme de callbacks cross-frame, encodage) se lit
dans le code de ce dossier. Pour les décisions d'architecture côté view config panel,
voir `docs/adr/ADR-006-explorer-views-config-panel.md`.

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
