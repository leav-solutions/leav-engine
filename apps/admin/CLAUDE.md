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

> Le **shell applicatif** lui-même migre progressivement de `components/` vers `modules/`.
> Le **header** en est le premier exemple : il vit désormais dans `modules/layout/` (`Header`),
> `modules/switch-language/` (`LanguageSelector`, un `KitSelect` calqué sur app-studio) et
> `modules/applications-switcher/` (bouton + `KitDropDown` de changement d'application), en
> remplacement de l'ancien header `semantic-ui-react` supprimé de `components/app/`. Il s'aligne sur
> le `KitHeader` d'`apps/app-studio` (`modules/layout/RootHeader.tsx`).

```
src/
├── modules/       # ✅ Cible pour toutes les nouvelles features + shell migré (layout, history, navigation-menu, routes…)
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

---

## Dépendances à usage non évident

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non importées par leur nom, mais indispensables

| Package                    | Pourquoi                                                                                                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@leav/ui`                 | **Jamais importé sous ce nom** : le code passe par l'alias `_ui/*` (défini dans [`vite-config-common.mjs`](../../vite-config-common.mjs) et `vitest.config.ts`), qui pointe vers `libs/ui/src`. La dépendance workspace reste ce qui garantit l'installation des deps de `libs/ui`. |
| `fomantic-ui-less`         | Import **nu** (`import 'fomantic-ui-less/semantic.less'` dans `src/index.tsx`, sans `from`) + `@import` dans `src/semantic-ui/theme.config` + `scripts/fixSemanticUiCss.js` (postinstall).                                                                                          |
| `less`                     | Vite compile les `.less`, le package n'est jamais importé.                                                                                                                                                                                                                          |
| `@graphql-codegen/add`     | Le plugin `add:` est une **clé de config** dans [`codegen.ts`](codegen.ts), invisible à un scan d'imports.                                                                                                                                                                          |
| `vite-plugin-dynamic-base` | Importé par [`vite.config.js`](vite.config.js) uniquement.                                                                                                                                                                                                                          |
| `graphql`, `jsoneditor`    | Satisfont les `peerDependencies` de `@apollo/client`/`graphql-ws` et de `jsoneditor-react`.                                                                                                                                                                                         |
| `happy-dom`                | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne).                                                                                                                                                                                                                        |

### Non déclarées à dessein

`antd` (imports de type uniquement) et `@fortawesome/*` sont importés sans être déclarés : ce sont des
dépendances d'`aristid-ds`, distribué en commit-pin. Les pinner ici créerait un couplage de version
avec le design system — cf. [`libs/ui/CLAUDE.md`](../../libs/ui/CLAUDE.md).

### ⚠️ ~109 fichiers de test entièrement commentés

Une grande partie des `*.test.tsx` de `components/` est **intégralement en commentaires** (héritage
`enzyme` + `react-test-renderer`, incompatibles React 18). Deux conséquences :

- un scan d'imports naïf les lit et réclame `enzyme`, `react-router-dom-v5`, `react-sortable-tree`
  ou `react-test-renderer` comme dépendances manquantes — **ne pas les déclarer** ;
- inversement, `react-test-renderer` et `@types/react-test-renderer` sont encore déclarés alors
  qu'ils ne servent plus qu'à ce code mort : candidats au retrait.

La suppression de ces fichiers est un chantier à part (rien ne les exécute : `vitest` les compte
comme « skipped »).
