# useIFrameMessengerClient — CLAUDE.md

Côté client du système PanelMessenger (l'hôte est dans `../usePanelMessenger/`).
Le détail des messages et du mécanisme de callbacks cross-frame se lit dans le code.

## Rôle

Ce dossier contient le **côté client** du système PanelMessenger — l'API destinée aux
applications tierces chargées dans les iframes de `app-studio` (xStream cadrage, xStream planning, etc.).

| Fichier                             | Export                          | Rôle                                                            |
| ----------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `IFrameMessengerClientProvider.tsx` | `IFrameMessengerClientProvider` | Provider racine — gère le handshake `register`/`is-registered`  |
| `useIFrameMessengerClient.ts`       | `useIFrameMessengerClient`      | Hook consommateur — expose `showAlert`, `navigateToPanel`, etc. |
| `iFrameMessengerClientContext.tsx`  | `IFrameMessengerClientContext`  | Contexte React — partagé entre Provider et hook consommateur    |
