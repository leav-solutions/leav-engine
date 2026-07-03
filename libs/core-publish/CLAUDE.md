# libs/core-publish — CLAUDE.md

`@leav/core-publish` — Code Javascript et déclaration TypeScript de `apps/core` et des `libs/*` publiés sur le registre npm GitLab pour les plugins externes.

> ⚠️ Ce package **n'est pas utilisé dans le monorepo lui-même**. Il est uniquement
> consommé par des repos externes (plugins tiers du core).

## Publication CI (GitLab)

Publié automatiquement sur le **registre npm GitLab** (`@leav/core-publish`), comme les autres libs
`@leav/*` — job `build-npm-leav-core-publish` dans [.gitlab-ci.yml](../../.gitlab-ci.yml) :

- **`next`** — version `X.Y.Z-<sha>`, à chaque push sur `develop` ;
- **`latest`** — version `X.Y.Z`, sur les releases taguées ;
- **`mr-<slug>`** — snapshot manuel dans les pipelines de MR.

Déclenché par un changement dans **`apps/core/**/\*`** uniquement (`PATH_CHANGES`). Bien que le paquet
embarque aussi le code de `libs/\*`, ce périmètre est **volontaire** : en pratique ces libs ne changent
pas sans toucher `apps/core` (`libs/types` est une projection d'`apps/core`).

```bash
# Génère le contenu publiable (lancé par le CI) : compile apps/core (tsconfig.publish.json) vers
# dist-publish, déplace le résultat dans le paquet, puis régénère les dependencies (sync-deps).
yarn workspace @leav/core-publish generate
```

## Usage dans les plugins

- Pour le **build et les tests uniquement** — à mettre en `devDependencies`, jamais en dépendance de prod.
- Dans le `tsconfig` (`paths`) :

```js
        // simulate leav core modules
        "paths": {
            "@leav/core/*": ["./node_modules/@leav/core-publish/apps/core/src/*"],
            "@leav/utils": ["./node_modules/@leav/core-publish/libs/utils/src/index"],
            "@leav/logger": ["./node_modules/@leav/core-publish/libs/logger/src/index"]
        }
```

- In your code

```ts
import {type ILogger} from '@leav/logger';
import {AttributeCondition, Operator, type IRecord} from '@leav/core/_types/record';
import {EventAction, type IDbEvent, type IDbPayload} from '@leav/utils';
```

- Vitest config

```js
    resolve: {
        alias: [
            {
                // temporary while plugins still develop/test/build in leav src
                find: /^@leav\/core\/(.+)/,
                replacement: `./node_modules/@leav/core-publish/apps/core/src/$1`,
            },
            {
                find: /^@leav\/(.+)/,
                replacement: `./node_modules/@leav/core-publish/libs/$1/src`,
            },
        ],
    },
```

## Script `sync-deps`

Le paquet embarque le code compilé d'`apps/core` et des libs internes ; son `package.json` doit donc
déclarer **toutes les dépendances runtime** dont ce code a besoin chez le consommateur.

[`scripts/sync-deps.js`](scripts/sync-deps.js) régénère le champ `dependencies` automatiquement :

- source de vérité = les `workspaceDependencies` de Yarn (`yarn workspaces list --json --verbose`),
  parcourues en DFS depuis `apps/core` — **pas de liste en dur** (ajouter une lib consommée par
  `apps/core` est pris en compte automatiquement) ;
- les paquets internes `@leav/*` visités sont **exclus** : chez le consommateur ils sont résolus via
  les alias de chemins TypeScript (cf. `paths`/`alias` ci-dessus), pas comme dépendances npm.

Lancé par `yarn sync-deps`, et automatiquement à la fin de `generate` (donc au build CI de publication).

## Pourquoi un gros paquet avec les libs ?

Il est possible de publier le core et les libs indépendamment. Cependant il faut alors répondre aux problématiques évoquées dans [la doc npm-publishing du POC poc-release](https://gitlab.aristid.com/dev/leav/pocs/poc-release/-/blob/develop/docs/npm-publishing.md) (pin des deps `workspace:` au publish). N'étant pour le moment pas convaincu par la solution proposée, il est plus rapide de débloquer le sujet des plugins xstream dans le yarn workspace ([LEAVC-812](https://aristid.atlassian.net/browse/LEAVC-812)) en s'inspirant de feu `@leav/core-types` (un seul gros paquet embarquant les libs).
