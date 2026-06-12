# libs/core-types — CLAUDE.md

`@leav/core-types` — Types TypeScript de `apps/core` publiés sur npm pour les plugins externes.

## Ce que c'est

Ce package ne contient **pas de code source** — c'est une projection des types générés
depuis `apps/core`, destinée aux **développeurs de plugins** qui étendent le core.

> ⚠️ Ce package **n'est pas utilisé dans le monorepo lui-même**. Il est uniquement
> consommé par des repos externes (plugins tiers du core).

## Publication CI (GitLab)

Publié automatiquement sur **aristid gitlab registry** (`@leav/core-types`) via GitLab CI,
déclenché par tout changement dans `apps/core/**/*` :

- **`next`** — à chaque push sur `develop`
- **`latest`** — sur les releases taguées

```bash
# Commande de génération (lancée par le CI)
yarn workspace @leav/core-types generate
```

## Problème connu : les enums ne sont pas exportés ⚠️

La commande `generate` (basée sur `build-types` du core) n'exporte pas les enums TypeScript.
Les consommateurs du package doivent **réécrire les enums manuellement** de leur côté —
ce qui est une source de désynchronisation et de maintenance coûteuse.

**Piste de résolution envisagée :** publier davantage de code du core directement
(pas uniquement les types), de façon à exposer les enums comme du code exécutable.
C'est un chantier à prioriser.

## Ne jamais modifier manuellement

Toujours régénérer via le CI ou :

```bash
yarn workspace @leav/core-types generate
```
