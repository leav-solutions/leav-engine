# apps/admin — CLAUDE.md

Interface d'administration d'une instance LEAV : gestion des libraries, attributs,
permissions, arbres, vues, profils de versioning.
Inclut une feature **history** pour consulter l'historique des actions (remplace Kibana interne).

> Un effort de mise à jour a été fait : les versions React, Apollo, GraphQL, Vite et TypeScript
> sont alignées avec `app-studio`. La migration vers `aristid-ds` est en cours —
> `semantic-ui-react` coexiste encore avec le design system le temps de la transition.

## Stack

- React + Vite + TypeScript
- Apollo Client + GraphQL
- Redux + Redux Toolkit (state management)
- `aristid-ds` (design system cible) + `semantic-ui-react` (migration en cours)
- Formik (formulaires), react-dnd (drag & drop)
- i18next, Jest

## Structure

> ⚠️ **Toute nouvelle fonctionnalité va dans `modules/`** — c'est la seule destination pour du nouveau code.
> Les autres dossiers (`components/`, `hooks/`, `queries/`, etc.) sont du code existant et ne doivent pas recevoir de nouvelles features.

```
src/
├── modules/       # ✅ Cible pour toutes les nouvelles features (history, navigation-menu, routes…)
├── components/    # Shell applicatif legacy (ApolloHandler, App, Navigation…)
├── hooks/         # Hooks custom legacy
├── queries/       # Opérations GraphQL legacy
├── reduxStore/    # Slices Redux + store legacy
├── context/       # Providers React legacy
├── _gqlTypes/     # Types GraphQL générés — ne pas modifier
├── config/        # Initialisation du router
└── utils/         # Utilitaires
```

## Build

```bash
yarn build:install  # Build vers apps/core/applications/admin/
```
