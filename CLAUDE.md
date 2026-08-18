# LEAV Engine — CLAUDE.md

## Qu'est-ce que LEAV ?

**LEAV** (Libraries, Entities, Attributes, Values) est un framework NoCode/LowCode de gestion
de données à schéma dynamique, multi-modèle (tabulaire, EAV, relationnel).

Principe fondamental : **la structure des données n'est pas connue à l'avance**. Le modèle métier
se définit à l'exécution — pas de migration DDL pour faire évoluer un schéma de données. LEAV
s'adapte à n'importe quel domaine métier (stocks, CRM, dossiers fiscaux, réservations…) sans
redéveloppement applicatif. L'engine lui-même, en revanche, évolue : ses structures internes
(ex. `raw_values` → `payload`) font l'objet de migrations lors des mises à jour.

Les quatre briques : **Library** (le méta-modèle, qui porte aussi les relations inter-Library),
**Entity** (une instance), **Attribute** (une propriété, éventuellement de type `link` ou `tree`),
**Value** (la valeur d'un Attribute pour une Entity).

> 📖 **Le méta-modèle en détail** — pattern LEAV, 4 comportements de bibliothèque, 5 types
> d'attributs, nuances de liaisons, arbres, vocabulaire de l'app Administration et liens vers la
> doc utilisateur : [`docs/leav-data-model.md`](docs/leav-data-model.md).
> À lire avant de modéliser des données ou de toucher aux domaines `attribute` / `library` / `tree`.

---

## Stack technique

| Couche          | Technologie     |
| --------------- | --------------- |
| Langage         | TypeScript      |
| Runtime         | Node.js         |
| Frontend        | React           |
| API             | GraphQL         |
| Base de données | ArangoDB        |
| Message broker  | RabbitMQ        |
| Cache           | Redis           |
| Monorepo        | Yarn Workspaces |

### Infra locale (dev)

- **Docker / Docker Compose** pour orchestrer les services
- **Traefik** comme reverse proxy local

### Infra production

- **Kubernetes (K8s)** — Docker est conservé pour les images, mais plus de Docker Compose ni de Traefik
- **Keycloak + OIDC** pour l'authentification (remplace l'app `login` locale)

Les packages internes utilisent le préfixe `@leav/`.

### Design System — aristid-ds

- Composants React préfixés `Kit` (`KitButton`, `KitTable`…), interfaces `IKit`
- Wrapping d'Ant Design 5 avec theming par tokens — utiliser `useKitTheme()` pour accéder au thème
- Ne jamais importer depuis `antd/lib` — utiliser `antd` ou `antd/es`
- Distribué en commit-pin (pas de semver stable) dans `@leav/ui`, `app-studio`, `admin`
- Migration en cours dans `apps/admin` : `semantic-ui-react` → `aristid-ds`. Ne pas utiliser `semantic-ui-react` dans du nouveau code.

---

## Structure du monorepo

```
leav-engine/
├── apps/                  # Applications autonomes
│   ├── admin/             # Configuration d'une instance LEAV : permissions, libraries,
│   │                      # attributs, etc. Inclut une feature history (remplace Kibana interne).
│   │                      # Stack alignée avec app-studio (React, Apollo, aristid-ds).
│   │                      # Migration en cours de semantic-ui-react → aristid-ds.
│   ├── app-studio/        # Shell MFE configurable via JSON
│   │                      # Décrit l'enchaînement de panneaux : composants @leav/ui (Explorer, etc.)
│   │                      # ou iframes pour du métier custom
│   ├── automate-scan/     # Surveillance FS en temps réel → événements RabbitMQ
│   ├── core/              # API GraphQL principale (port 4001) — tourne aussi en mode
│   │                      # indexationManager, tasksManager, filesManager, logsCollector
│   ├── mcp-runtime/       # Serveur MCP (Model Context Protocol) — expose les outils LEAV
│   │                      # aux agents IA (graphql, rest à venir, trpc à venir).
│   │                      # Stateless, conçu pour K8s. Auth par apiKey utilisateur.
│   ├── login/             # ⚠️ Local uniquement — en prod : Keycloak + OIDC
│   ├── portal/            # Listing générique des applications disponibles
│   │                      # Ne pas y toucher : le vrai portail métier est AMP (repo séparé, hors leav-engine)
│   ├── preview-generator/ # Génération de previews
│   └── sync-scan/         # Synchronisation / scan de fichiers
└── libs/                  # Code partagé entre les apps, préfixe @leav/
    ├── config-manager/    # Gestion de la configuration
    ├── logger/            # Logger partagé
    ├── message-broker/    # Abstraction RabbitMQ
    ├── monitoring-server/ # Serveur de monitoring
    ├── providers/         # Providers partagés (React context, etc.)
    ├── types/             # Types TypeScript partagés entre toutes les apps
    ├── ui/                # @leav/ui — Composants React partagés (Explorer, RecordEdition…)
    │                      # Publié sur npm, consommé par app-studio et les apps tierces LEAV
    └── utils/             # Fonctions utilitaires partagées
test-apps/                 # Tests d'intégration globaux — testent l'application dans sa globalité
```

> ⚠️ **`login`** n'existe qu'en local. En production : **Keycloak via OIDC**.
>
> ℹ️ **`portal`** : ne pas y toucher, il liste les apps de façon générique. Le vrai portail
> métier est **AMP**, une app dans un repo séparé (non générique, hors de ce repo).

Chaque app dans `apps/`, peut avoir son propre `CLAUDE.md` avec ses spécificités.

---

## Principes architecturaux clés

- **Schéma = donnée** : la définition du modèle (Library) est stockée et gérée comme n'importe
  quelle autre donnée. Pas de migration DDL pour changer de schéma.
- **API GraphQL générique** : les resolvers sont générés dynamiquement en fonction de la Library,
  pas écrits à la main pour chaque type de données.
- **ArangoDB comme socle** : le choix d'un graph-document store est intentionnel — les relations
  entre entités sont des first-class citizens, ce qui évite les jointures EAV catastrophiques
  des SGBDR classiques.
- **Découplage par messages** : RabbitMQ assure la communication asynchrone entre les apps.

---

## URLs locales (Traefik)

| Service           | URL                                                                               |
| ----------------- | --------------------------------------------------------------------------------- |
| API GraphQL       | `http://core.leav.localhost/graphql`                                              |
| Admin             | `http://core.leav.localhost/app/admin` ou `http://admin.leav.localhost`           |
| App Studio        | `http://core.leav.localhost/app/app-studio` ou `http://app-studio.leav.localhost` |
| Portal            | `http://core.leav.localhost/app/portal` ou `http://portal.leav.localhost`         |
| Login             | `http://core.leav.localhost/app/login` ou `http://login.leav.localhost`           |
| ArangoDB UI       | `http://arango.leav.localhost`                                                    |
| RabbitMQ UI       | `http://rabbitmq.leav.localhost`                                                  |
| Traefik dashboard | `http://traefik.leav.localhost`                                                   |
| MCP Runtime       | `http://mcp.leav.localhost`                                                       |
| Redis Commander   | `http://redis.leav.localhost` (profil `debug`)                                    |
| Kibana            | `http://kibana.leav.localhost` (profil `logs`)                                    |
| Mailpit           | `http://mailpit.leav.localhost` (profil `mail`)                                   |

---

## Commandes essentielles

```bash
# Installation
yarn install

# Lancer l'environnement local complet
docker compose -f docker/docker-compose.yml up -d

# Profils optionnels (à combiner)
docker compose -f docker/docker-compose.yml --profile logs up -d      # logs (Elasticsearch)
docker compose -f docker/docker-compose.yml --profile debug up -d     # redis-commander, kibana
docker compose -f docker/docker-compose.yml --profile automate up -d  # automate-scan, sync-scan, preview-generator

# Tests unitaires (en local, hors container)
yarn test

# Tests E2E (dans le container core)
docker exec -i $(docker container ls -aqf "name=core") yarn run test:e2e
```

> 🔐 **`TLS: server certificate not trusted` au build ou `SELF_SIGNED_CERT_IN_CHAIN` côté Node** :
> proxy d'inspection HTTPS d'entreprise. Diagnostic, correctifs et pièges (secret de build inerte
> en CI, `NODE_EXTRA_CA_CERTS`) dans
> [`docs/troubleshooting/tls-interception.md`](docs/troubleshooting/tls-interception.md).
> Cette page explique aussi pourquoi les contextes de build de la stack locale pointent sur
> `docker/DOCKERFILES/<APP>/` — à ne pas « corriger ».

> ⚠️ Pas de `yarn build` global — chaque app/lib se build individuellement depuis son dossier.
>
> **Aucun `dist/` n'est commité** : `.gitignore` couvre `apps/*/dist` et `libs/*/dist`. En local, les
> apps ne consomment pas le `dist` des libs mais leurs **sources**, via les alias de
> [`vite-config-common.mjs`](vite-config-common.mjs) (`@leav/ui`, `_ui/*` → `libs/ui/src`) — donc
> `tscheck` et les tests passent sans build préalable. En CI, ce sont les jobs `build-npm-leav-*` qui
> buildent et publient les libs. Un `yarn build` local ne sert qu'à vérifier le bundle.

> 🎭 **e2e front** : le job CI `e2e-playwright` est `manual` + `allow_failure` en MR (donc jamais
> lancé automatiquement, et son échec n'apparaît pas dans le vert du pipeline). **Le déclencher
> manuellement dès qu'une MR touche le front** : `libs/ui/**` (runtime _ou_ build/tsconfig — bundlé
> dans tous les fronts), un front `apps/*`, la config de build/bundle front, ou `yarn.lock`. Le
> piège classique est la MR qui paraît « test-only » ou « build-only » : c'est justement là que le
> bundle peut casser sans qu'aucun test unitaire ne le voie.
>
> ⛓️ Avant de lancer `e2e-playwright`, il faut d'abord lancer **et attendre** le job
> `build-docker-core [amd64]` : c'est l'image qu'il produit qui sert à exécuter les tests e2e. Un
> job ne pouvant pas en déclencher un autre en CI, cet enchaînement est **manuel** : on lance
> `build-docker-core [amd64]`, on attend sa fin, puis on lance `e2e-playwright`.

---

## Gestion des dépendances

Yarn Workspaces **hoiste** tout à la racine, ce qui masque deux problèmes symétriques :

- une dépendance **déclarée mais inutilisée** (poids mort, et pour les `@types/*` un risque de types
  périmés qui entrent en conflit avec ceux que le package embarque désormais lui-même) ;
- une dépendance **importée mais non déclarée** (_phantom dependency_) : ça marche en local parce
  qu'un workspace voisin la hoiste, et ça casse dès que le package est installé seul — une lib
  publiée sur npm, ou une app dont l'image Docker ne copie que son propre `package.json`.

> 🔎 Pour auditer un workspace, utiliser le skill **`audit-dependencies`**
> ([`.claude/skills/audit-dependencies/`](.claude/skills/audit-dependencies/)). Son `SKILL.md`
> contient la checklist des **usages non visibles d'un scan d'imports** — c'est là que se joue
> l'essentiel du tri, et c'est ce qui évite de supprimer une dépendance load-bearing.

### Pourquoi une phantom dependency casse en prod mais pas en local

En local, tout est hoisté à la racine : un package importé sans être déclaré se résout quand même,
parce qu'un workspace voisin l'a tiré. Les images Docker, elles, ne fonctionnent pas comme ça.
[`docker/DOCKERFILES/build/generic.Dockerfile`](docker/DOCKERFILES/build/generic.Dockerfile) — qui
build **tous les services sauf le core** (`automate-scan`, `sync-scan`, `mcp-runtime`,
`preview-generator`) — installe les dépendances avec :

```dockerfile
RUN yarn workspaces focus $APP               # build : deps de CE workspace uniquement
RUN yarn workspaces focus $APP --production  # runtime : idem, sans les devDependencies
```

`yarn workspaces focus` n'installe que ce que **le workspace ciblé déclare** (plus ses libs
`workspace:` liées), pas l'arbre hoisté du monorepo. D'où deux conséquences :

- une **phantom dependency** est purement absente de l'image → `MODULE_NOT_FOUND` au démarrage, alors
  que tout passait en local ;
- `--production` retire les `devDependencies` → tout ce qui est nécessaire **au runtime** doit être en
  `dependencies`, jamais en `devDependencies`.

Corollaire pour tester : `docker compose up` ne prouve rien sur ce point, puisque le compose monte le
monorepo entier. Il faut soit builder l'image, soit forcer un `yarn install` dans le conteneur pour
que son arbre reflète les `package.json` modifiés.

> 🐳 Avant de toucher à un Dockerfile de `docker/DOCKERFILES/build/`, lire
> [`docker/DOCKERFILES/build/README.md`](docker/DOCKERFILES/build/README.md). Ces fichiers sont
> découpés en étapes pour le cache et le parallélisme : ne jamais copier de sources avant l'étape
> `deps`, garder une étape par workspace buildable, et ne pas remettre le tamponnage de version dans
> le contexte de build.

### Deux règles à connaître avant de toucher un `package.json`

- **« Déclaré » ≠ « utilisé », et « importé » ≠ « déclaré ».** Un package peut être indispensable
  sans apparaître dans un seul `import` : nom de plugin passé en chaîne (`codegen.ts`), valeur de
  config (`environment: 'happy-dom'`), `types` d'un tsconfig, binaire appelé depuis `scripts`,
  préchargement par `NODE_OPTIONS`, ou simple satisfaction de la `peerDependency` d'un autre package.
- **Les packages appartenant à `aristid-ds`** (`antd`, `@fortawesome/*`, `classnames`, `lodash`,
  `react-modal`) sont **volontairement non déclarés** dans `libs/ui` et `apps/admin`. Le design system
  est distribué en **commit-pin** : les pinner créerait un couplage de version avec lui, et une
  seconde copie d'`antd` dans un bundle consommateur casse le theming (contexte React). C'est une
  décision assumée, pas un oubli — cf. [`libs/ui/CLAUDE.md`](libs/ui/CLAUDE.md).

---

## Conventions de code

Voir [`CODING_GUIDELINES.md`](CODING_GUIDELINES.md) — source de vérité pour toutes les conventions : nommage, tests, types, frontend, GraphQL, styles.

---

## ⚠️ Documentation — à faire systématiquement

**Avant de conclure toute tâche ayant modifié du code, de la config ou des tests, tu DOIS vérifier
l'impact documentaire et le traiter dans la même tâche.** Ce n'est pas optionnel et ça ne se
délègue pas à une MR ultérieure (cf. [ADR-003](docs/adr/ADR-003-documentation.md)).

Deux questions à se poser, dans cet ordre :

1. **Documentation impactée** — une doc existante devient-elle fausse, incomplète ou trompeuse ?
   Passer en revue : `docs/` (y compris les ADR et les checklists de `docs/cleanup/`), le
   `CLAUDE.md` racine, le `CLAUDE.md` du ou des workspaces touchés, les `CLAUDE.md` locaux d'un
   dossier modifié, les `README.md`, et `CODING_GUIDELINES.md` si une convention change.
   → Corriger immédiatement.
2. **Information à ajouter** — la tâche a-t-elle produit un savoir qui n'est déductible ni du code
   ni de l'historique git ? Typiquement : un piège non évident, une raison derrière un choix
   surprenant, une contrainte d'infra ou de build, une décision d'archi structurante (→ nouvel ADR
   selon le template de [`docs/adr/ADR.md`](docs/adr/ADR.md)), une commande ou un enchaînement CI
   non documenté.
   → L'écrire au bon endroit : le plus proche possible du code concerné.

Règles d'application :

- **Le doute se lève, il ne se garde pas** : si l'impact documentaire est incertain, aller vérifier
  le fichier candidat plutôt que de supposer qu'il est à jour.
- **Pas de doc creuse** : ne rien ajouter qui paraphrase le code, redise un diff ou raconte
  l'historique de la tâche. Si rien n'est impacté et qu'il n'y a rien de non-évident à consigner,
  ne rien écrire.
- **Commit séparé** avec le type conventionnel `docs`, dans la même MR que le code.
- **Le dire explicitement** en fin de tâche : soit ce qui a été mis à jour ou ajouté, soit qu'il
  n'y avait rien à documenter. Ne jamais laisser cette vérification silencieuse.

---

## Chantiers en cours et à venir

### Planifiés

- **Restructuration de `@leav/ui`** — maintenant que `data-studio` est supprimé, nettoyer et restructurer la lib pour mettre en avant les composants publics : `Explorer`, composants de formulaire, composants de filtres.
- **AMP → instance `app-studio`** — objectif long terme de faire d'AMP une instance de `app-studio` (comme `explorer-studio`). `app-studio` devra être enrichi pour couvrir les besoins d'AMP. Permettra un nouveau cycle de nettoyage de `@leav/ui`.
- **DX plugins `core`** — simplifier le développement des plugins core pour les consommateurs externes. Situation actuelle : imports incorrects dans `xstream/apps/plugins/`, nécessite un `git sparse-checkout` ; AMP utilise `core` via image Docker. Chantier porté par l'équipe core (Sébastien / Jérémy).
- **Migration TypeScript `strict`** — `tsconfig.json` a `strict: true` mais court-circuité par 6 overrides (`strictNullChecks: false`, `noImplicitAny: false`, etc.). À activer progressivement, app par app — jamais en une seule PR globale.
- **Cleanup attribut Arbre V2** (LEAVC-1077) — supprimer les feature flags `enableTreeAttributeV2Form` / `enableTreeAttributeV2Modal`, la V1 du champ arbre et de la modale de sélection, et retirer le suffixe `V2` des composants. Checklist ordonnée : [`docs/cleanup/tree-attribute-v2-cleanup.md`](docs/cleanup/tree-attribute-v2-cleanup.md).

---

## Ce qu'il faut savoir avant de modifier du code

- [ ] À compléter : patterns de gestion des permissions
- [ ] À compléter : gestion des versions de valeurs (versioning)
- [ ] À compléter : pièges connus / zones sensibles

---

## Décisions d'architecture (ADR)

Les ADR sont dans [`docs/adr/`](docs/adr). À consulter avant de proposer une lib ou une approche sur les sujets couverts.

> ✍️ Pour **écrire un nouvel ADR**, suivre le template de [`docs/adr/ADR.md`](docs/adr/ADR.md) (section `## Format`) et ajouter une ligne au _Decisions log_ de ce même fichier. Ne pas s'inspirer d'un ADR existant comme modèle : le format de référence est dans `ADR.md`.

| ADR                                                                                         | Décision                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-001 — Drag & drop](docs/adr/ADR-001-dnd.md)                                            | Utiliser **`dnd-kit`** pour tout nouveau code DnD. Ne pas utiliser `react-beautiful-dnd` (non maintenu) ni `react-dnd`. La migration de l'existant n'est pas prioritaire.                                                                                                                                                                                             |
| [ADR-002 — Tests E2E forms](docs/adr/ADR-002-tests-e2e-forms.md)                            | Tests E2E dans ce repo (`test-apps/`), stack **Playwright**, pattern **PageObjectModel**. Déclenchement quotidien + manuel en CI.                                                                                                                                                                                                                                     |
| [ADR-003 — Documentation](docs/adr/ADR-003-documentation.md)                                | La doc technique vit dans `docs/` (proche du code), en Markdown. Confluence = process/métier uniquement. Mise à jour obligatoire dans la même MR que le code.                                                                                                                                                                                                         |
| [ADR-004 — Plugins realtime](docs/adr/ADR-004-plugins-realtime-computed-data.md)            | Les plugins exposent leurs données calculées via une **API tRPC**. Queries pour la lecture, mutations pour les actions, subscriptions pour le temps réel.                                                                                                                                                                                                             |
| [ADR-005 — Types GraphQL générés](docs/adr/ADR-005-graphql-plugins-types.md)                | Les types de plugins externes (xstream) peuvent rester dans les fichiers `_gqlTypes/index.ts` générés. Fichiers marqués `linguist-generated` dans `.gitattributes`.                                                                                                                                                                                                   |
| [ADR-006 — Explorer view settings panel](docs/adr/ADR-006-explorer-views-settings-volet.md) | État dans le contexte application-settings (pas en search params), feature flag `enableViewSettings`, communication inter-panneaux via `message-to-panel` (`usePanelMessenger`), Explorer agnostique d'app-studio. ExplorerV2 est un **consommateur contrôlé pur** via l'unique prop `currentView` ; app-studio est la source de vérité (`CurrentViewStoreProvider`). |

---

_Ce fichier est la source de vérité pour Claude Code sur ce projet.
Les apps ont chacune leur propre `CLAUDE.md` pour les détails spécifiques._
