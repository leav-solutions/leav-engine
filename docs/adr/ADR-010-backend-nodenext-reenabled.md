# Système de modules TypeScript pour le backend Node : `nodenext` réactivé

Date: 10/07/2026

## Status

Accepted

## Context

[ADR-008](ADR-008-backend-module-commonjs.md) avait reverté le `module`/`moduleResolution` racine
de `nodenext` vers `CommonJS`/`node10`, après avoir cassé le boot réel d'`apps/core` (DI, migration
`000-init`, chargement de plugins). Sa Decision posait un prérequis explicite avant toute reprise :
**auditer tous les `import()` dynamiques du backend** — désenveloppement du `default` (tsc
double-wrap), résolution de dossier — car ces deux classes de bug ne se manifestent qu'à
l'exécution réelle, jamais au typecheck.

Cet audit est fait. Le backend contient **8 sites** d'`import()` dynamique :

| Site                                                                                  | Risque                                                | Traitement                                  |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `apps/core/src/depsManager.ts` (scan DI Awilix)                                       | désenveloppement `default`                            | Corrigé                                     |
| `apps/core/src/infra/db/helpers/loadMigrationFile.ts` (bloque le boot via `000-init`) | résolution dossier + désenveloppement                 | Corrigé                                     |
| `apps/core/src/pluginsLoader.ts` (résolution)                                         | résolution dossier                                    | Corrigé                                     |
| `apps/core/src/pluginsLoader.ts` (default plugin)                                     | désenveloppement — absent d'un essai précédent        | Corrigé                                     |
| `apps/core/src/pluginsLoader.ts` (`package.json`)                                     | JSON dynamique sans interop                           | Remplacé par lecture fichier + `JSON.parse` |
| `apps/core/src/infra/application/applicationRepo.ts` (`manifest.json`)                | idem                                                  | Remplacé par lecture fichier + `JSON.parse` |
| `apps/core/src/app/core/coreApp.ts` (traduction `.json`)                              | idem                                                  | Remplacé par lecture fichier + `JSON.parse` |
| `apps/core/src/utils/configureDayjs.ts`                                               | spécificateur nu, résultat jeté, try/catch            | Confirmé sûr, inchangé                      |
| `libs/config-manager/src/index.ts`                                                    | fichiers CJS écrits à la main, pas de double-wrap tsc | Confirmé sûr, inchangé                      |

`__dirname`/`__filename` (13 usages `apps/core` + 1 `mcp-runtime`) : confirmé sûr, ces fichiers
restent CommonJS (pas de `"type": "module"` dans leur `package.json` le plus proche), `nodenext` ne
change le comportement que pour les fichiers déterminés comme ESM.

Le désenveloppement `__esModule`/`default` est factorisé dans un helper partagé
(`apps/core/src/utils/helpers/isTscCjsDoubleWrap.ts`), utilisé par les 3 sites concernés
(`depsManager.ts`, `loadMigrationFile.ts`, `pluginsLoader.ts`). La résolution dossier→index est
factorisée de même (`resolveIndexFilePath.ts`, `resolveDynamicImportPath.ts`).

**Découverte notable durant les tests** : Vitest (via `vite-node`) ne reproduit pas fidèlement le
comportement natif de Node pour ces deux classes de bug — `vite-node` unwrap silencieusement la
convention `__esModule`/`default` de `tsc` (contrairement au `import()` natif de Node, qui pose
`default` à l'objet `module.exports` entier), et résout lui-même un import de dossier vers son
fichier index (contrairement au `import()` natif de Node, qui échoue avec
`ERR_UNSUPPORTED_DIR_IMPORT`). Un test qui observe ces comportements uniquement via un `import()`
réel d'une fixture passe **identiquement, que le fix soit présent ou non** — vérifié empiriquement
en désactivant chaque guard localement. Les fixtures concernées embarquent donc la forme
double-wrap en dur, comme donnée littérale (`exports.default = {__esModule: true, default:
<réelle valeur>}`), ce qui contourne la reconstruction propre de `vite-node` et garde les tests
dépendants du fix. La couverture Vitest ne remplace donc pas la vérification par un vrai boot —
c'est exactement ce qu'ADR-008 soulignait déjà pour `tscheck`, et ça s'applique aussi à Vitest.

Effet de bord distinct, déjà documenté par ADR-008 : le fix Mockify (`declare global` autour de
`Mockify` dans `apps/preview-generator/src/__tests__/testUtils.ts`, commit `237f56005`) avait été
défait par le commit de revert d'ADR-008 (`4d26b9d52`). Il est ré-appliqué **dans le même commit**
que la bascule du tsconfig racine — les deux changements ne sont pas indépendamment bisectables :
`declare global` est une erreur de compilation active sous `CommonJS` (`TS2669`, le fichier n'a
aucun import/export) et n'est valide qu'une fois `nodenext` actif.

`libs/utils` n'a pas d'override `module`/`moduleResolution` propre à son build CJS
(`tsconfig.base.json`) et hériterait donc silencieusement de `nodenext` — un pin explicite
`CommonJS`/`node10` est ajouté pour l'en découpler, sans changement fonctionnel. Ceci est cohérent
avec [ADR-009](ADR-009-libs-utils-esm-migration.md) (« Voie B » — coupler la migration ESM-only de
`libs/utils` à la levée du prérequis d'ADR-008) : **cette Voie B n'est pas prise ici**, `libs/utils`
reste dans son état dual CJS/ESM actuel, la décision d'ADR-009 reste entièrement ouverte.

5 autres libs (`libs/app-root-path`, `libs/config-manager`, `libs/logger`,
`libs/message-broker`, `libs/monitoring-server`) n'ont elles non plus aucun override propre et
héritent donc maintenant de `nodenext` par défaut — vérifié (rebuild forcé, sans cache
`.tsbuildinfo` périmé) : `tscheck` et tests unitaires verts pour chacune. Ce sont les mêmes libs
visées par la MR !2241 (« convert 6 backend libs to ESM », toujours ouverte à la date de ce
chantier) — son scope annoncé exclut explicitement `apps/core`/le tsconfig racine/cet audit ADR-008,
donc pas de conflit attendu, mais à garder en tête si son contenu évolue.

## Decision

Le `module`/`moduleResolution` racine repassent à `nodenext`/`nodenext`. Tous les sites cassants
identifiés par ADR-008 sont corrigés et couverts par des tests unitaires + une vérification runtime
réelle (voir Consequences). Le pattern **backend Node = `nodenext`, cibles bundler-only =
`esnext`/`bundler`, `libs/utils` = pin `CommonJS`/`node10` indépendant** devient la configuration
effective de ce repo.

## Consequences

- Vérifié par une vraie exécution (pas seulement `tscheck`) : `docker compose` en mode build
  (`dist/` compilé + `node` natif, pas `tsx`/`vite-node`) sur `apps/core` — 31 migrations exécutées
  avec succès dont `000-init` (le cas bloquant d'origine), boot DI complet sur l'arbre réel de
  `apps/core/src`, API GraphQL fonctionnelle, fallback de locale `dayjs` confirmé explicitement (pas
  seulement l'absence de crash).
- `tscheck` et suite de tests unitaires verts sur les 5 apps backend (`core`, `mcp-runtime`,
  `automate-scan`, `sync-scan`, `preview-generator`) et les 5 libs qui héritent maintenant de
  `nodenext` par défaut.
- Toute future modification touchant un `import()` dynamique du backend doit être vérifiée par un
  vrai boot, pas seulement par `tscheck` ni par Vitest — cf. la découverte `vite-node` en Context :
  les deux classes de bug (double-wrap, résolution dossier) peuvent rester invisibles aux tests
  unitaires même avec des fixtures « réalistes », si celles-ci s'appuient sur un `import()` réel
  plutôt que sur une forme injectée en dur.
- ADR-009 (`libs/utils` ESM-only) reste entièrement ouvert — ce chantier ne tranche pas entre sa
  Voie A (bundler) et sa Voie B (nodenext backend, maintenant techniquement disponible mais pas
  prise ici).
- `node10` étant déprécié depuis TS 6.0, ce n'était de toute façon pas une position tenable à long
  terme (suppression prévue en TS 7) — ce chantier lève cette dette au passage.

## Open points

| Subject                                                                                                                                     | Status                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `libs/utils` ESM-only (Voie A ou B, cf. ADR-009)                                                                                            | Non tranché, cf. ADR-009                                                                                |
| Statut de la MR !2241 (6 libs backend → ESM) à surveiller si son scope évolue vers `apps/core`/le tsconfig racine                           | À surveiller, hors scope annoncé actuellement                                                           |
| Extraire un helper partagé pour la résolution dossier→index et le désenveloppement, si de nouveaux sites `import()` dynamiques apparaissent | Fait pour les 3 sites connus (`isTscCjsDoubleWrap`, `resolveIndexFilePath`, `resolveDynamicImportPath`) |
