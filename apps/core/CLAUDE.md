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
