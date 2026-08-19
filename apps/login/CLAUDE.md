# apps/login — CLAUDE.md

> ⚠️ **Local uniquement** — En production, l'authentification est gérée par **Keycloak via OIDC**.
> Cette app n'existe qu'en environnement de développement local sans OIDC configuré.

UI d'authentification locale : formulaire de login, mot de passe oublié, réinitialisation.

## Stack

- React + Vite + TypeScript
- React Router, styled-components, aristid-ds
- i18next
- Apollo Client : **jamais importé directement**, il est fourni pour `@leav/ui` (voir plus bas)

## Build

Le build est déployé directement dans `apps/core/applications/login/`.

---

## Dépendances à usage non évident

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non importées par leur nom, mais indispensables

| Package                                    | Pourquoi                                                                                                                                                                                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@apollo/client`                           | **Zéro import dans `src/`** : c'est une `peerDependency` de `@leav/ui` (`>=3.8.1`), que login consomme (`useLoginChecker`, `ErrorDisplay`, `Loading`, `useAppLang`). C'est l'app qui doit fournir le peer.                                          |
| `graphql`                                  | Satisfait la `peerDependency` de `@apollo/client`.                                                                                                                                                                                                  |
| `@vitejs/plugin-react`, `vite-plugin-svgr` | Importés par [`vite-config-common.mjs`](../../vite-config-common.mjs) **à la racine**, pas par le `vite.config.mjs` de l'app — qui n'en consomme que `commonConfig()`. La racine ne les déclare pas, donc chaque app front doit le faire elle-même. |
| `happy-dom`                                | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne, pas import).                                                                                                                                                                            |
| `typescript`                               | Binaire `tsc` du script `tscheck`.                                                                                                                                                                                                                  |
| `@types/node`                              | `vitest.config.ts` importe `path`, `vite.config.js` utilise `__dirname`/`process.env`. Absent du `types` de `tsconfig.spec.json` (`["vitest/globals"]`), donc chargé via `tsconfig.build.json` qui n'a pas de `types` (→ tous les `@types/*`).      |

### Non déclarées à dessein

`antd` est importé sans être déclaré : c'est une dépendance d'`aristid-ds`, distribué en commit-pin.
La pinner ici créerait un couplage de version avec le design system — cf.
[`libs/ui/CLAUDE.md`](../../libs/ui/CLAUDE.md).

### ⚠️ `@testing-library/dom` non fourni

`yarn install` signale `login doesn't provide @testing-library/dom, requested by
@testing-library/user-event`. Le déclarer serait un faux remède : `@testing-library/react@14.3.1`
embarque sa **propre** copie de `@testing-library/dom@^9`, et déclarer la 10.x ferait cohabiter deux
versions entre `render` et `user-event`. La correction est de monter `@testing-library/react` en 16.x
(comme `portal`), qui attend `@testing-library/dom` en peer — chantier distinct.
