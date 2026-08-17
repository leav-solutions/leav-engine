# apps/core — CLAUDE.md

API GraphQL principale de LEAV (port 4001).
Implémente l'intégralité du modèle LEAV : Libraries, Entities, Attributes, Values.

---

## Modes Docker

L'image `core` est réutilisée pour plusieurs services selon la variable `CORE_MODE` :

| Service Docker         | `CORE_MODE`           | Rôle                                              |
| ---------------------- | --------------------- | ------------------------------------------------- |
| `core`                 | `server`              | API GraphQL principale (port 4001)                |
| `indexation-manager`   | `indexationManager`   | Indexation full-text                              |
| `tasks-manager-master` | `tasksManager:master` | Orchestrateur de tâches async                     |
| `tasks-manager-worker` | `tasksManager:worker` | Exécuteur de tâches async                         |
| `files-manager`        | `filesManager`        | Gestion des fichiers (profil `automate`)          |
| `logs-collector`       | `logsCollector`       | Collecte des logs → Elasticsearch (profil `logs`) |

---

## Architecture en couches

```
GraphQL Apps  (resolvers, schéma)
      ↓
Domain Layer  (règles métier, agrégation)
      ↓
Infra Layer   (repos, accès base de données)
      ↓
ArangoDB
```

```
src/
├── app/          # Couche GraphQL — schéma + resolvers par domaine
│   └── core/     # Un sous-dossier par domaine (libraryApp, recordApp, attributeApp…)
├── domain/       # Logique métier (28+ modules)
├── infra/        # Persistance (repos ArangoDB, cache Redis, message broker)
├── _types/       # Types TypeScript partagés (40+ fichiers)
├── _constants/   # Constantes
├── errors/       # Classes d'erreurs custom
├── locales/      # Traductions i18n (EN, FR)
└── __tests__/    # Tests unitaires, intégration, e2e
```

---

## Schéma GraphQL dynamique

⚠️ Le schéma GraphQL n'est **pas statique** — il est **généré dynamiquement** à l'exécution.

- `src/app/graphql/graphqlApp.ts` assemble le schéma en agrégeant les modules
- Chaque domaine expose `getGraphQLSchema()` → `{typeDefs: string, resolvers: object}`
- Des champs GraphQL sont générés par Library (ex: `libraries_query`, `products_mutation`)
- Signature standard d'un resolver : `(parent, args, ctx: IQueryInfos) => Promise<T>`

---

## Injection de dépendances (Awilix)

- `src/depsManager.ts` — container DI
- Convention-based : scanne les dossiers `app/`, `domain/`, `infra/`, `interface/`, `utils/`
- Nommage en dot-notation : `core.domain.library`, `core.app.core.record`
- Toutes les dépendances sont injectées via destructuration dans les factory functions

---

## Configuration (`src/_types/config.ts` + `src/config.ts`)

Toute nouvelle clé de config vit dans **deux fichiers qui doivent rester synchronisés** :

- `src/_types/config.ts` — le type TypeScript (`IConfig` et ses sous-interfaces)
- `src/config.ts` — le schéma **Joi** (`validateConfig`) qui valide la config au boot

⚠️ **Ajouter un champ dans l'un sans l'autre casse le démarrage du core** : un champ ajouté
uniquement au type TS n'est jamais validé (silencieux, mais incohérent) ; un champ requis
uniquement dans le schéma Joi mais absent du type TS fait échouer `validateConfig()` au démarrage
dès que `apps/core/config/default.js` ne le fournit pas. Toujours modifier les deux fichiers dans
le même changement.

---

## Modèle de données LEAV

### Library (`src/domain/library/`, `src/_types/library.ts`)

Méta-modèle d'une collection. Définit les attributs disponibles, les règles d'accès,
l'identité visuelle des records. Le schéma est une donnée comme les autres.

**`behavior`** : `STANDARD | DIRECTORIES | FILES | JOIN`

### Record (`src/domain/record/`, `src/_types/record.ts`)

Instance de donnée dans une Library. Possède un `id`, des timestamps, un flag `active`
(soft delete), et des valeurs dynamiques par attribut.

### Attribute (`src/domain/attribute/`, `src/_types/attribute.ts`)

Cinq types d'attributs :

| Type            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `SIMPLE`        | Valeur scalaire (text, number, date, boolean…)        |
| `SIMPLE_LINK`   | Référence vers un record d'une autre Library          |
| `ADVANCED`      | Donnée structurée avec champs embarqués               |
| `ADVANCED_LINK` | Référence avec propriétés supplémentaires sur le lien |
| `TREE`          | Référence vers un nœud d'une Library arborescente     |

Propriétés notables : `multiple_values`, `versionable`, `actions_list` (valeurs calculées),
`metadata_fields`, `values_list`, `permissions_conf`.

Repos d'infra spécifiques par type : `attributeSimpleRepo`, `attributeSimpleLinkRepo`,
`attributeAdvancedRepo`, `attributeAdvancedLinkRepo`, `attributeTreeRepo`.

### Value (`src/domain/value/`, `src/_types/value.ts`)

Union `IStandardValue | ILinkValue | ITreeValue`. Porte le `payload` (valeur concrète,
record lié, ou nœud d'arbre), le `id_value`, la `version`, et les `metadata`.

---

## Constantes des entités système (libraries, attributs, arbres)

LEAV est à schéma dynamique : les applications créent leurs propres libraries/attributs/arbres à
l'exécution. Mais le core en crée **un socle d'office au démarrage** (via les migrations) : `users`,
`users_groups`, `files`, `files_directories`, `statuses`, `status_types`, `discussion_threads`,
`discussion_comments`, leurs attributs et leurs arbres.

**Règle : ne jamais écrire en dur l'identifiant d'une library/attribut/arbre système.** Utiliser les
enums centralisés dans [`src/_constants/`](src/_constants/) :

| Fichier                                                     | Enum / const                                                                                                                                                                                    | Usage                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`systemLibraries.ts`](src/_constants/systemLibraries.ts)   | `SystemLibraries`                                                                                                                                                                               | ids des libraries système                  |
| [`systemTrees.ts`](src/_constants/systemTrees.ts)           | `SystemTrees`                                                                                                                                                                                   | ids des arbres système                     |
| [`systemAttributes.ts`](src/_constants/systemAttributes.ts) | `CommonAttributes`, `UsersAttributes`, `UsersGroupsAttributes`, `FilesAttributes`, `StatusesAttributes`, `StatusTypesAttributes`, `DiscussionThreadsAttributes`, `DiscussionCommentsAttributes` | ids des attributs, **un enum par library** |
| [`systemRecords.ts`](src/_constants/systemRecords.ts)       | `adminUserId`, `systemUserId`, `adminsGroupId`, `filesAdminsGroupId`                                                                                                                            | ids de records bien connus                 |
| `systemAttributes.ts`                                       | `BASE_ATTRIBUTES`, `PREVIEWS_ATTRIBUTE_SUFFIX`, `PREVIEWS_STATUS_ATTRIBUTE_SUFFIX`, `STATUS_TYPES_DEFAULT_VALUES`                                                                               | agrégats/données dérivés                   |

### Conventions

- **Ce sont des enums string** : `SystemLibraries.USERS` vaut `'users'`. Un membre d'enum string est
  assignable à `string`, donc on l'utilise **comme valeur** sans cast là où une `string` est attendue
  (args GraphQL, AQL, filtres…).
- **Ne jamais typer un champ id en enum.** `IRecord.library`, `IValue.attribute`, les args GraphQL…
  restent `string` (une app tierce peut référencer ses propres ids). Les enums sont une commodité de
  référence aux entités système du core, pas une contrainte de type.
- **Un enum d'attributs par library système** (même vide, ex. `UsersGroupsAttributes`) pour garder la
  structure homogène et prête à accueillir de futurs attributs.
- **Dans un template `aql\`\``** : injecter la valeur via `${SystemLibraries.X}` (bind param), jamais en
  référence nue (qui serait interprétée comme une expression AQL). En JS pur, la référence nue suffit.
- **Attention aux faux positifs** : un littéral `'files'`/`'id'`/`'login'` n'est pas toujours une entité
  système (nom de champ d'erreur, endpoint d'app `login`, id de record générique…). Ne remplacer que les
  références qui désignent réellement la library/attribut/arbre système.
- Exception connue : les attributs de base `'previews'` / `'previews_status'` restent en littéraux (pas
  d'enum dédié ; valeur identique aux suffixes `PREVIEWS_*_ATTRIBUTE_SUFFIX`).
- Les noms préfixés des attributs preview par library se construisent avec
  `getPreviewsAttributeName(libraryId)` / `getPreviewsStatusAttributeName(libraryId)`
  ([`src/utils/helpers/getPreviewsAttributes.ts`](src/utils/helpers/getPreviewsAttributes.ts)).

> ⚠️ Ces constantes font de fait partie de la **surface d'API consommée par les plugins** (xstream
> importe `@leav/core/_constants/...`). Tout renommage/déplacement est un changement cassant à
> propager côté plugins.

---

## Permissions

Modèle à trois niveaux : Admin → Library → Record.

- Héritage depuis les nœuds parents dans les arbres
- Permissions par attribut (lecture/écriture)
- Chaque fonction reçoit `ctx: IQueryInfos` (user, session, permissions)
- Logique centralisée dans `src/domain/permission/`

---

## Architecture événementielle

- RabbitMQ pour les événements asynchrones
- `IEventsManagerDomain` publie les événements domaine (CREATE, UPDATE, DELETE, UNLINK…)
- Découple le core des effets de bord (notifications, indexation, tâches)

---

## Export SDO — fonctions d'export

`src/domain/sdo/` exporte une bibliothèque en SDO à partir d'une config déclarative
(`globalSettings.settings.sdo.mapping`). Quand cette config ne suffit pas, une `exportFunction` produit
la valeur d'un chemin SDO (avec `exportFunctionConfig` pour sa config d'instance), un
`extendSDOFunction` post-traite tout le SDO déjà construit, et
`additionalAttributeTriggers` / `additionalLibraryTriggers` couvrent le déclenchement.

Le registre des `exportFunction` a **deux alimentations** : les fonctions **natives** du core
(`NATIVE_SDO_EXPORT_FUNCTIONS`, dans [`src/domain/sdo/export/exportFunctions/`](src/domain/sdo/export/exportFunctions/)),
utilisables par simple déclaration dans le mapping — leurs noms sont réservés — et celles qu'un plugin
enregistre via `registerSDOExportMappingFunctions`. **Regarder le catalogue natif avant d'écrire un
plugin.**

Une `exportFunction` reçoit le record complet : elle peut produire un **bloc entier** tout en gardant
son chemin SDO déclaré dans le mapping. Une telle entrée **omet `leavAttributeId`**, ce qui la rend au
passage invisible pour l'import.

> ⚠️ Trois pièges qui coûtent du temps :
>
> - un attribut lu par une fonction d'export n'est mappé à **aucun** chemin SDO, donc `hasSDOAttribute`
>   filtre son événement et **aucun export n'est émis** → `additionalAttributeTriggers` ;
> - une fonction d'export reçoit `values`, les valeurs **brutes** de l'attribut — déclarer un
>   `exportFunction` court-circuite la conversion en uuid. Ce n'est pas ce que le mapping générique
>   exporterait ;
> - porter un `exportFunction` ne rend **pas** une entrée non importable : le core ne le déduit pas, une
>   fonction pouvant produire une valeur réimportable. Une entrée dont la fonction change la forme de la
>   valeur doit déclarer `skipImport: true` sur une bibliothèque `importEnable`.

→ Contrat complet, catalogue natif, pièges et exemples : [`docs/sdo-export-functions.md`](../../docs/sdo-export-functions.md).

---

## Migrations DB

Fichiers `NNN-*.ts` dans [`src/infra/db/migrations/`](src/infra/db/migrations/), joués une fois via le
registre `core_db_migrations` (au boot / commande `dbMigrate`). Factory DI standard exportant par
défaut une fonction qui retourne un `IMigration` (`{run(ctx)}`) — cf. modèle
[`026-removeDataStudioApplication.ts`](src/infra/db/migrations/026-removeDataStudioApplication.ts).

> ⚠️ **Ne jamais colocaliser de fichier de test dans `migrations/`.** Le loader
> (`_filterMigrationFile` dans [`dbUtils.ts`](src/infra/db/dbUtils.ts)) n'exclut que `.map` et
> `.d.ts` : **tout autre fichier** du dossier (dont un `.spec.ts`) est chargé et exécuté comme une
> migration, ce qui plante au runtime (`ReferenceError: describe is not defined`). Écrire le test
> d'une migration **ailleurs** (ex. `src/__tests__/`), ou tester la logique via un helper extrait
> hors du dossier `migrations/`.

> ℹ️ Re-jouabilité : une migration n'est jouée qu'une fois (entrée dans `core_db_migrations`). Pour
> la rejouer en prod, les ops suppriment/éditent manuellement l'entrée puis relancent le core — donc
> le `run()` doit rester **auto-idempotent** (ex. purger avant de recréer).

---

## Tests

```bash
# Unitaires (en local)
yarn test

# Intégration (dans le container)
docker exec -i $(docker container ls -aqf "name=core") yarn run test:integration

# E2E API (dans le container)
docker exec -i $(docker container ls -aqf "name=core") yarn run test:e2e:api
```

- Tests unitaires : `*.spec.ts` colocalisés avec la source
- Tests intégration/e2e : `src/__tests__/`
- Ajoute les variables d’environnement LOG_SILENT=0 LOG_LEVEL=silly pour avoir plus d'info de debug.

---

## Dépendances à usage non évident

Ces packages n'apparaissent dans **aucun `import`** du core et paraissent donc inutilisés, alors
qu'ils sont indispensables. À vérifier avant tout nettoyage de `package.json` (cf. le skill
[`audit-dependencies`](../../.claude/skills/audit-dependencies/)) :

| Package                                                                              | Pourquoi il est indispensable                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@opentelemetry/auto-instrumentations-node`                                          | Chargé par `NODE_OPTIONS="--import @opentelemetry/auto-instrumentations-node/register"` dans [`docker/scripts/start-core.sh`](../../docker/scripts/start-core.sh), quand `OTEL_AUTO_INSTRUMENT=1`. Seul `@opentelemetry/api` est réellement importé (`_metrics.ts`). |
| `@graphql-codegen/{add,typescript,typescript-operations,typescript-graphql-request}` | Référencés par **nom de plugin** (chaînes de caractères) dans [`codegen.ts`](codegen.ts), y compris la clé `add:`.                                                                                                                                                   |
| `tsx`, `prettier`, `typescript`                                                      | Invoqués depuis les `scripts` du `package.json`.                                                                                                                                                                                                                     |

> Le parsing HTTP passe par `express.json()` / `express.urlencoded()`
> ([`server.ts`](src/interface/server.ts)), **pas** par `body-parser` — ne pas le réintroduire.
