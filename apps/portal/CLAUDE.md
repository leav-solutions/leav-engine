# apps/portal — CLAUDE.md

> ⚠️ **Ne pas modifier** — Ce portail est générique et liste les apps LEAV disponibles.
> Le vrai portail métier est **AMP**, dans un repo séparé (hors leav-engine).

Affiche la liste des applications LEAV auxquelles l'utilisateur a accès,
avec recherche/filtrage et gestion de la langue. Filtre automatiquement
les apps `portal` et `login` de l'affichage.

## Stack

- React + Vite + TypeScript
- Apollo Client + GraphQL codegen, graphql-ws (subscriptions)
- styled-components, Ant Design, aristid-ds
- i18next
- React Router : **jamais importé** par l'app, il n'est là que pour `@leav/ui` (voir plus bas)

## Build

Le build est déployé directement dans `apps/core/applications/portal/`.

---

## Dépendances à usage non évident

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non importées par leur nom, mais indispensables

| Package                                                                       | Pourquoi                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react-router-dom`                                                            | **Zéro import dans `src/`** : c'est une `peerDependency` de `@leav/ui` (`^6.22.0`). C'est l'app qui doit fournir le peer.                                                                                                                        |
| `graphql`                                                                     | Satisfait les `peerDependencies` de `@apollo/client`, `graphql-ws` et des plugins codegen.                                                                                                                                                       |
| `@graphql-codegen/{typescript,typescript-operations,typescript-react-apollo}` | Référencés par **nom de plugin** (chaînes) dans [`codegen.ts`](codegen.ts).                                                                                                                                                                      |
| `@graphql-codegen/add`                                                        | Encore plus discret : le plugin est une **clé de config** (`{add: {content: …}}`) dans [`codegen.ts`](codegen.ts). Le cli résout le nom `add` en `@graphql-codegen/add`, un package à part entière.                                              |
| `@testing-library/dom`                                                        | `peerDependency` de `@testing-library/react@16` — contrairement à la v14 (utilisée par `login` et `libs/ui`) qui l'embarque en `dependencies`.                                                                                                   |
| `@vitejs/plugin-react`, `vite-plugin-svgr`                                    | Importés par [`vite-config-common.js`](../../vite-config-common.js) **à la racine**, pas par le `vite.config.js` de l'app — qui n'en consomme que `commonConfig()`. La racine ne les déclare pas, donc chaque app front doit le faire elle-même. |
| `happy-dom`                                                                   | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne, pas import).                                                                                                                                                                         |
| `typescript`                                                                  | Binaire `tsc` du script `tscheck`.                                                                                                                                                                                                               |
| `@types/node`                                                                 | `vitest.config.ts` importe `path`, `vite.config.js` utilise `process.env`. Absent du `types` de `tsconfig.spec.json` (`["vitest/globals"]`), donc chargé via `tsconfig.build.json` qui n'a pas de `types` (→ tous les `@types/*`).               |

### Non déclarées à dessein

`antd` et les `@fortawesome/*` sont importés sans être déclarés : ce sont des dépendances
d'`aristid-ds`, distribué en commit-pin. Les pinner ici créerait un couplage de version avec le design
system — cf. [`libs/ui/CLAUDE.md`](../../libs/ui/CLAUDE.md).

> ℹ️ `@apollo/link-error` a été retiré : le code importe `onError` depuis `@apollo/client/link/error`,
> qui fait partie d'`@apollo/client`. Le package standalone (une beta de 2019) n'a jamais été chargé.
