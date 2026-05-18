# apps/portal — CLAUDE.md

> ⚠️ **Ne pas modifier** — Ce portail est générique et liste les apps LEAV disponibles.
> Le vrai portail métier est **AMP**, dans un repo séparé (hors leav-engine).

Affiche la liste des applications LEAV auxquelles l'utilisateur a accès,
avec recherche/filtrage et gestion de la langue. Filtre automatiquement
les apps `portal` et `login` de l'affichage.

## Stack

- React + Vite + TypeScript
- Apollo Client + GraphQL codegen, graphql-ws (subscriptions)
- React Router, styled-components, Ant Design, aristid-ds
- i18next

## Build

Le build est déployé directement dans `apps/core/applications/portal/`.
