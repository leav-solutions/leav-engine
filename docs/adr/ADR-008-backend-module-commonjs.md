# Système de modules TypeScript pour le backend Node : CommonJS, migration ESM différée

Date: 09/07/2026

## Status

Superseded by [ADR-010](ADR-010-backend-nodenext-reenabled.md)

## Context

Le chantier de montée TypeScript 5.9.3 → 6.0.3 (branche `chore/deps/typescript-6.x`) avait basculé le
`module`/`moduleResolution` racine sur `nodenext`/`nodenext`, hérité par défaut par tout le backend
Node (`apps/core`, `apps/mcp-runtime`, `apps/automate-scan`, `apps/sync-scan`,
`apps/preview-generator`, `libs/config-manager`, `libs/message-broker`,
`libs/monitoring-server`, `libs/e2e-test-utils`, `libs/logger`).

Ce changement, en apparence anodin, modifie silencieusement la façon dont `tsc` compile
`await import(...)` **dynamique** :

- Sous `module: CommonJS` (ce que le repo utilisait avant ce chantier), `tsc` downlevel-transforme un
  `import()` dynamique en `Promise.resolve(path).then(s => __importStar(require(s)))` — un vrai
  `require()` synchrone sous le capot, passé par le helper d'interop `__importStar` de TypeScript.
  Ce mécanisme comprend nativement la convention `__esModule`/`default` que `tsc` émet pour ses
  propres besoins d'interop, **et** résout les imports de dossier vers leur `index.ts`/`index.js`
  (comportement CommonJS standard).
- Sous `module: nodenext`, `tsc` préserve l'`import()` **natif** de Node au lieu de le
  downlevel-transformer. Ce natif ne fait ni l'un ni l'autre : (1) il pose l'export `default` du
  module importé à la valeur **entière** de `module.exports` CJS (`{__esModule, default: <vraie
valeur>, ...}`), pas à la vraie valeur — la convention `__esModule`/`default` de `tsc` n'existe que
  pour son propre helper `__importDefault`, pas pour le loader ESM natif de Node ; (2) il ne résout
  **pas** un chemin de dossier vers son `index` (`ERR_UNSUPPORTED_DIR_IMPORT`), contrairement à
  `require()`.

Concrètement, ce changement a cassé au boot réel du conteneur Docker `core` (jamais démarré
automatiquement en CI — cf. le job `e2e-playwright`/`build-docker-core`, manuel et
`allow_failure` sur les MR — d'où la découverte tardive, en validation manuelle de cette branche) :

- `apps/core/src/depsManager.ts` — le conteneur d'injection de dépendances Awilix enregistrait
  l'export par défaut (systématiquement double-enveloppé) de chaque module scanné comme une valeur
  brute plutôt que comme une factory, cassant l'intégralité du DI du core au premier appel
  (`utils.fileExists is not a function`).
- `apps/core/src/infra/db/helpers/loadMigrationFile.ts` — la migration `000-init` (un dossier, pas un
  fichier plat comme les autres) plantait avec `ERR_UNSUPPORTED_DIR_IMPORT`.
- `apps/core/src/pluginsLoader.ts` — même défaut sur le chargement de plugins (dossier), latent car
  aucun plugin n'était configuré dans l'environnement de test.

Effet de bord distinct (même cause racine, autre symptôme) : `apps/preview-generator/src/__tests__/testUtils.ts`
déclarait `type Mockify<T> = ...` en haut de fichier sans import/export, en s'appuyant sur le fait
qu'un tel fichier est un « script global » (ses déclarations fuient dans le scope global). Sous
`nodenext`, TypeScript traite désormais ce fichier comme un module à portée de fichier (fidèle à la
vraie sémantique par-fichier de Node), donc le type ne fuitait plus.

Risque non borné à ce stade : d'autres `import()` dynamiques existent dans le backend
(`apps/core/src/app/core/coreApp.ts`, `apps/core/src/infra/application/applicationRepo.ts`,
`apps/core/src/utils/configureDayjs.ts`...) et n'ont pas encore été individuellement vérifiés.

## Options

1. **Corriger chaque point d'appel au fil des découvertes** (whack-a-mole)
    - Pros :
        - Permet d'avancer vers un backend ESM-natif dès maintenant.
    - Cons :
        - Surface totale inconnue — chaque nouveau boot manuel du conteneur (rarement exécuté en CI)
          risque de révéler un nouveau cas, y compris en production.
        - Deux classes de bug distinctes à traquer (enveloppement du `default`, résolution de
          dossier), chacune silencieuse tant qu'elle n'est pas exercée à l'exécution — `tscheck` ne
          les détecte pas, seul un vrai boot le fait.
2. **Revenir à `module: CommonJS`/`moduleResolution: node10` pour le backend, différer la migration
   ESM à un chantier dédié**
    - Pros :
        - Restaure exactement le comportement de TS 5.9.3, déjà validé en production, sans nouvelle
          classe de bug à chasser.
        - Un seul point de bascule (`tsconfig.json` racine — vérifié par `grep`, aucun autre fichier
          ne référence `nodenext` explicitement).
    - Cons :
        - `node10` est déprécié depuis TS 6.0 (nécessite `ignoreDeprecations: "6.0"`), suppression
          prévue en TS 7 — ce n'est pas une solution permanente.
        - Diffère la modernisation du backend vers un vrai système de modules ESM.

## Decision

Option 2. Le `module`/`moduleResolution` racine repassent à `CommonJS`/`node10` (+
`ignoreDeprecations: "6.0"`). Les paquets consommés par un bundler (les 5 apps front `admin`,
`app-studio`, `data-studio`, `login`, `portal`, `libs/ui`, le build ESM de `libs/utils`) gardent leur
surcharge `module: esnext` + `moduleResolution: bundler` propre à chaque `tsconfig.build.json`,
totalement indépendante du défaut racine — ce chantier ne les concerne pas.

La distinction **backend Node = `CommonJS`/`node10`, cibles bundler-only = `esnext`/`bundler`** devient
le pattern explicite et intentionnel de ce repo, à documenter comme tel plutôt que comme un résidu de
migration inachevée.

Les correctifs défensifs déjà écrits pour les 3 points d'appel cassés (désenveloppement du `default`
CJS dans `depsManager.ts`, résolution de dossier + désenveloppement dans `loadMigrationFile.ts`,
résolution de dossier dans `pluginsLoader.ts`) sont laissés de côté (stash), à reprendre tels quels
dans une MR séparée le jour où la migration ESM différée est effectivement lancée — inutiles et sans
effet une fois revenu à `CommonJS`.

**Cas différent, PAS un no-op** : le `declare global` ajouté autour de `Mockify`
(`preview-generator/src/__tests__/testUtils.ts`) redevient une **erreur active** sous `CommonJS`
(`TS2669: Augmentations for the global scope can only be directly nested in external modules or
ambient module declarations`) — `declare global` exige que le fichier soit un module, ce qu'il n'est
plus sous `CommonJS` (ce fichier n'a toujours aucun import/export, donc redevient un script global
classique, où `Mockify` fuite déjà naturellement sans wrapper). Ce fichier doit être remis à son état
d'avant ce fix (`type Mockify<T> = ...` sans `declare global`) — **pas encore fait**, cf. Open points.

## Consequences

- Le backend reste sur la sémantique `require()` classique, bien connue et déjà éprouvée en
  production — aucune nouvelle classe de bug ESM/CJS introduite par ce chantier de montée TS6.
- Toute future migration complète du backend vers un `module` ESM-natif (`nodenext`/`node16`) devra
  **d'abord auditer tous les `import()` dynamiques du backend** — imports de dossier, forme du
  `default` réellement reçu à l'exécution — avant de re-basculer le compilerOption. Changer
  simplement `module` en espérant que `tscheck` suffise à valider ne suffit pas : ces deux classes de
  bug ne se manifestent qu'à l'exécution réelle, jamais au typecheck.
- `node10` étant déprécié en TS 6.0 et supprimé en TS 7, ce report a une échéance : la migration ESM
  du backend redeviendra une contrainte dure (pas juste une amélioration facultative) au moment de la
  montée vers TS 7.
- Les 3 fix défensifs mis de côté (`depsManager.ts`, `loadMigrationFile.ts`, `pluginsLoader.ts`) sont
  stashés, pas perdus, à reprendre dans la future MR ESM.
- Le fix `Mockify` (`declare global`) doit être défait pour que `tscheck` de `preview-generator`
  repasse au vert sous `CommonJS` — cf. Open points.

## Open points

| Subject                                                                                                                                                           | Status                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Migration ESM complète du backend Node (`nodenext`/`node16`)                                                                                                      | Différée — pas de ticket ouvert                  |
| Audit exhaustif des `import()` dynamiques du backend avant de retenter `nodenext`                                                                                 | Prérequis, non commencé                          |
| Suppression de `moduleResolution: node10` en TS 7                                                                                                                 | Échéance à surveiller, force la migration        |
| Vérifier au prochain boot réel si l'interop `import()` de fichiers `.json` (manifests, traductions) pose aussi souci                                              | Non vérifié, hors scope de ce fix                |
| Défaire le `declare global` de `Mockify` (`preview-generator/src/__tests__/testUtils.ts`) — `tscheck` cassé (`TS2669`) sous `CommonJS` tant que ce n'est pas fait | À faire, bloque `tscheck` de `preview-generator` |
