# apps/login — CLAUDE.md

> ⚠️ **Local uniquement** — En production, l'authentification est gérée par **Keycloak via OIDC**.
> Cette app n'existe qu'en environnement de développement local sans OIDC configuré.

UI d'authentification locale : formulaire de login, mot de passe oublié, réinitialisation.

## Stack

-   React + Vite + TypeScript
-   Apollo Client (GraphQL), React Router
-   styled-components, aristid-ds
-   i18next

## Build

Le build est déployé directement dans `apps/core/applications/login/`.
