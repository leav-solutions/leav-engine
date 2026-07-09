# Migration ESM-only de `libs/utils` : bloquée sans bundler, différée

Date: 09/07/2026

## Status

Accepted

## Context

`libs/utils` (`@leav/utils`) est la seule lib du monorepo avec un build dual : CJS
(`tsconfig.json` → `dist/cjs`) et ESM (`tsconfig.esm.json` → `dist/esm`), exposés via des
`exports` conditionnels dans `package.json`. Dans la continuité du nettoyage TypeScript 6.x, l'idée
était de simplifier ce package en ESM uniquement.

Un essai a été fait sur la branche `chore/deps/typescript-6.x` : repositionner
`libs/utils/tsconfig.json` en config ESM unique (`module: esnext`, `moduleResolution: bundler`,
`outDir: dist`), fusionner `tsconfig.esm.json` dedans, passer `package.json` en `"type": "module"`
avec un `exports` unique (`./dist/index.js`), sans toucher aux fichiers de `src`.

Ceci a révélé un blocage concret, vérifié empiriquement (pas juste une hypothèse de lecture de
code) : le `dist/index.js` généré contient des imports relatifs sans extension
(`export * from './constants'`, tel qu'écrit dans `src/index.ts`). Un test direct avec Node,
en dehors de tout framework de test :

```
node -e "require('./dist/index.js')"
node --input-type=module -e "import('./dist/index.js')"
```

échoue immédiatement dans les deux cas :

```
Cannot find module '.../libs/utils/dist/constants' imported from '.../libs/utils/dist/index.js'
```

C'est le même fichier et le même mécanisme (`require()`) que celui réellement utilisé en
production par les 4 apps backend qui dépendent de `@leav/utils` : `apps/core`,
`apps/sync-scan`, `apps/automate-scan`, `apps/preview-generator` — elles compilent leur propre
source en CommonJS (`tsc`) et font `require('@leav/utils')` au runtime sur ce build compilé.
Tous les autres consommateurs du monorepo (Vitest partout, Vite pour `apps/admin`/`apps/app-studio`/
`apps/portal`, `tsx` en dev pour `apps/core`) résolvent `@leav/utils` via un alias qui pointe
directement sur `libs/utils/src`, en ignorant totalement `dist`/`exports` — ils ne sont donc pas
concernés par ce blocage, mais ne peuvent pas non plus servir à le valider.

Pourquoi on ne peut pas simplement ajouter les extensions `.js` manquantes dans
`libs/utils/src` pour corriger le dist : le `tsconfig.json` racine mappe `@leav/*` vers
`./libs/*/src` (`paths`) avec `moduleResolution: node10`. Tous les consommateurs (dont
`apps/core`) type-checkent donc les fichiers de `libs/utils/src` directement, sous cette
résolution `node10` — qui ne fait pas le remapping `.js` → `.ts` (contrairement à
`node16`/`nodenext`). Ajouter des extensions dans `src` casserait le `tscheck` de tous les
consommateurs.

Pourquoi on ne peut pas non plus laisser `tsc -b` reconstruire `libs/utils` automatiquement une
fois le build changé : 9 fichiers du monorepo (`apps/core`, `apps/sync-scan`,
`apps/automate-scan`, `apps/preview-generator`, `apps/admin`, `apps/app-studio`, `apps/portal`,
`apps/login`, `libs/ui` — leurs `tsconfig.build.json`/`tsconfig.json`) référencent
`libs/utils/tsconfig.json` dans leur `references`. `tsc -b` reconstruit automatiquement ce
projet référencé en side-effect, avec un simple `tsc`. Si l'outil de build de `libs/utils`
change (bundler) sans retirer ces références, le premier rebuild déclenché par un consommateur
régénérerait un `dist` cassé avec du `tsc` nu, écrasant silencieusement le bon build.

Ce chantier est distinct de `docs/adr/ADR-008-backend-module-commonjs.md` (différer la migration
ESM du backend dans son ensemble) mais lui est lié : voir l'option « Voie B » ci-dessous.

## Options

1. **Scope réduit, sans nouvel outil** (essayé sur cette branche)
    - Pros :
        - Aucun nouvel outillage, changement confiné à `libs/utils/package.json` et `tsconfig.json`.
    - Cons :
        - Ne fonctionne pas : le `dist` produit reste au format « bundler-only » (imports relatifs
          sans extension), non chargeable par le `require()`/`import()` réel de Node — vérifié
          empiriquement, pas seulement déduit.
2. **Voie A — bundler (`tsup`/esbuild), indépendante d'ADR-008**
    - Pros :
        - Permet de traiter `libs/utils` dès maintenant, sans attendre une migration backend plus
          large.
        - Le bundler inline les imports relatifs internes, contournant le besoin d'extensions
          explicites dans `src` — aucun changement de `src` requis.
    - Cons :
        - Introduit un outil de build supplémentaire, spécifique à cette lib (aucune autre lib du
          monorepo n'en a besoin).
        - Nécessite de retirer `libs/utils/tsconfig.json` des `references` des 9 fichiers listés
          en Context, et d'ajouter un step de build explicite de `@leav/utils` avant le build de
          l'app consommatrice dans `docker/DOCKERFILES/build/core.Dockerfile`,
          `generic.Dockerfile`, `prebuild.Dockerfile`, et dans le template CI `.build_npm`
          (`.gitlab-ci.yml`, job `build-npm-leav-ui`) — sans quoi `tsc -b` continuerait de
          régénérer un dist cassé en side-effect.
        - Doit être vérifié par un vrai build + boot de `apps/core` (pas seulement `tscheck`),
          dans l'esprit d'ADR-008.
3. **Voie B — coupler à la migration backend `nodenext` différée par ADR-008**
    - Pros :
        - Pas de bundler : une fois le prérequis d'ADR-008 levé (« auditer tous les `import()`
          dynamiques du backend avant de retenter `nodenext` ») et le `tsconfig.json` racine
          repassé en `module`/`moduleResolution: nodenext`, le `tscheck` de tous les consommateurs
          bascule aussi en résolution `nodenext` (via le même mécanisme de `paths` qui pose
          problème aujourd'hui). Ajouter les extensions `.js` dans `libs/utils/src` devient alors
          possible sans rien casser, et un simple `tsc` produit un ESM réellement chargeable par
          Node.
        - Plus cohérent à terme : pas d'outillage de build spécifique à une seule lib.
    - Cons :
        - Pas déclenchable indépendamment — dépend entièrement de l'avancement du chantier backend
          d'ADR-008, qui n'a pas de ticket ouvert à ce jour.

## Decision

On diffère la migration ESM-only de `libs/utils`. `libs/utils` reste dans son état actuel (build
dual CJS/ESM inchangé) — tous les fichiers modifiés pendant l'essai ont été rétablis
(`git checkout`).

Cet ADR documente les deux voies de reprise identifiées (Voie A — bundler, autonome ; Voie B —
couplée à ADR-008) pour ne pas reperdre cette investigation, sans trancher entre elles : le choix
dépendra du contexte au moment de la reprise (urgence de simplifier `libs/utils` seule vs.
avancement du chantier backend `nodenext`).

## Consequences

- `libs/utils` continue à publier un dist dual CJS/ESM, avec `exports` conditionnels, tel qu'avant
  cet essai — aucune régression, aucun changement fonctionnel.
- Toute future tentative de passer `libs/utils` en ESM-only avec un simple `tsc` sans lever l'un
  des deux blocages documentés (bundler, ou migration `nodenext` du backend) reproduira le même
  échec silencieux — silencieux au sens où `tscheck` ne le détecte pas, seul un chargement réel du
  fichier compilé (`require()`/`import()` ou un vrai boot d'`apps/core`) le révèle.
- La Voie A (bundler) et la Voie B (backend `nodenext`) ne sont pas cumulables par erreur : si la
  Voie A est prise, retirer aussi les 9 références `tsc -b` (sinon rebuild cassé en side-effect).
  Si la Voie B est prise à la place, il n'y a pas besoin de bundler ni de toucher aux références.

## Open points

| Subject                                                                                                                       | Status                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Voie A — introduire un bundler pour `libs/utils`, retirer les 9 références `tsc -b`, adapter 3 Dockerfiles + `.gitlab-ci.yml` | Non démarré, pas de ticket ouvert                           |
| Voie B — migration `nodenext` du backend (cf. Open points d'ADR-008)                                                          | Non démarrée, prérequis à l'audit des `import()` dynamiques |
| Choix entre Voie A et Voie B                                                                                                  | Non tranché — dépendra du contexte au moment de la reprise  |
