# LEAV Engine — CLAUDE.md

## Qu'est-ce que LEAV ?

**LEAV** (Libraries, Entities, Attributes, Values) est un framework NoCode/LowCode de gestion
de données à schéma dynamique.

Principe fondamental : **la structure des données n'est pas connue à l'avance**.
Le modèle métier se définit à l'exécution — l'utilisateur n'a pas besoin d'écrire de migration
DDL pour faire évoluer son schéma de données. En revanche, l'engine lui-même évolue : ses
structures internes (ex. `raw_values` → `payload`) font l'objet de migrations lors des mises à
jour. LEAV s'adapte à n'importe quel domaine métier (stocks, CRM, dossiers fiscaux, réservations…)
sans redéveloppement applicatif.

Il est **multi-modèle** :

- modèle tabulaire (colonnes classiques)
- modèle EAV (Entity-Attribute-Value) pour les données multivaluées
- modèle relationnel pour les liens entre entités

### Le pattern LEAV

C'est une extension du pattern classique **EAV (Entity-Attribute-Value)** :

- **Library** — le méta-modèle : définit ce qu'est une Entity, quels Attributs elle peut avoir,
  leurs types, leurs règles de validation. Le schéma est lui-même une donnée gérée par le système.
  La Library est aussi ce qui introduit les **relations entre éléments** : un Attribute peut être
  de type "liaison" (`link`) et pointer vers des Entities d'une autre Library. C'est ce qui élève
  LEAV au-dessus d'un EAV basique — le graphe de données est modélisable sans migration de schéma.
- **Entity** — une instance de donnée (ex : un produit, une personne, une session)
- **Attribute** — une propriété d'une Entity (ex : couleur, poids, durée). Deux types de liaisons
  permettent d'exprimer des relations inter-Library :
    - **`link`** — lien simple vers une Library classique (collection plate d'Entities)
    - **`tree`** — lien avancé vers une Library arborescente : c'est un type de Library à part
      entière dont les Entities sont organisées en hiérarchie de nœuds, avec ses propres règles de
      gestion. Permet de modéliser taxonomies, structures organisationnelles, workflows, etc.
- **Value** — la valeur concrète d'un Attribute pour une Entity donnée

### Modélisation côté Administration (vocabulaire admin/utilisateur)

Le paramétrage structurel se fait dans l'app **Administration** (back-office LEAV). Le vocabulaire
exposé aux administrateurs y est plus fin que les noms techniques `link`/`tree` ci-dessus. Utile à
connaître pour relier le code aux écrans et à la doc utilisateur.

**Les 4 comportements de bibliothèque** (`behavior`) :

| Comportement  | Usage                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| `standard`    | Comportement de base — grande majorité des cas                                             |
| `files`       | À la création, upload d'un fichier + sélection de l'emplacement dans l'arbre des fichiers  |
| `directories` | Même logique que `files`, pour les dossiers                                                |
| `join`        | **Bibliothèque jointure** — matérialise une relation N-N comme un objet métier manipulable |

**Les 5 types d'attributs** :

| Type        | Cardinalité   | Usage typique                                                                                       |
| ----------- | ------------- | --------------------------------------------------------------------------------------------------- |
| Simple      | Mono          | Valeur au format texte, numérique, booléen, date, période, couleur, texte enrichi, étendu           |
| Avancé      | Mono ou multi | Valeur avec versioning (axe contextuel), traduction ou métadonnées                                  |
| Lien simple | Mono          | Clé étrangère (FK) directe vers une entité d'une autre bibliothèque, sans donnée portée sur le lien |
| Lien avancé | Mono ou multi | Relation vers une autre bibliothèque, peut porter des données sur le lien (collection edge)         |
| Arbre       | Mono ou multi | Référence à un nœud d'un arbre                                                                      |

> Le choix du type est **définitif**. Simple vs Avancé est un contrat fonctionnel (UX + features),
> pas une question de perf. Préférer **Arbre** dès qu'on anticipe un besoin de permissions
> contextuelles ou de formulaires conditionnels, même si les valeurs sont une liste fermée.

**Nuances de liaisons** :

- **Lien simple** → mono, FK directe, pas de donnée sur le lien.
- **Lien avancé** → peut être multivalué, peut pointer vers une bibliothèque de comportement `join`.
- **Liaison inverse** → vue de la relation dans l'autre sens. Pas un type autonome, pas de donnée stockée à ce niveau.
- **Bibliothèque jointure (`join`)** → traite une relation N-N comme un objet métier (ex : la **SIC** matérialise la relation Élément de structure ↔ Catégorie marché dans Campaigns Manager). Le comportement `join` est une propriété de la bibliothèque _cible_, pas du lien qui pointe vers elle.
- **Liaison directe** (vs avancée) → modélise une bibliothèque _dépendante/fille_ dont les entités n'existent pas sans leur entité père (ex : adresses d'un contact). Supprimer le père supprime réellement les entités liées ; on ne « détache » pas, on supprime. À l'inverse, supprimer une liaison _avancée_ supprime le lien, pas l'entité liée.

**Les arbres** : structure hiérarchique parent-enfant (racine unique, pas de cycle). Spécificité LEAV :
chaque nœud est lié à une entité d'une bibliothèque, une même entité peut être liée à plusieurs nœuds,
et les nœuds d'un même arbre peuvent provenir de bibliothèques différentes. Les arbres servent aussi de
listes de valeurs configurables et de support aux **permissions contextuelles**, aux **formulaires
conditionnels** et au **versionning de valeurs**. Côté API GraphQL, on parcourt un arbre via
`treeContent`, ou via la valeur d'un attribut de type `tree`.

> 📖 Doc utilisateur (Confluence) :
>
> - [Choisir le type d'un attribut](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743519867)
> - [Choisir le bon sens d'une liaison](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743913050)
> - [Créer une liaison bidirectionnelle](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743257764)
> - [Trame de formation LEAV — PO/PM](https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2233204749)

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
│   ├── data-studio/       # ⚠️ SUPPRESSION EN COURS — remplacé par une instance app-studio nommée explorer-studio. Ne pas y ajouter de code.
│   ├── login/             # ⚠️ Local uniquement — en prod : Keycloak + OIDC
│   ├── portal/            # Listing générique des applications disponibles
│   │                      # Ne pas y toucher : le vrai portail métier est AMP (repo séparé, hors leav-engine)
│   ├── preview-generator/ # Génération de previews
│   └── sync-scan/         # Synchronisation / scan de fichiers
└── libs/                  # Code partagé entre les apps, préfixe @leav/
    ├── app-root-path/     # Résolution du chemin racine de l'app
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

> ⚠️ Pas de `yarn build` global — chaque app/lib se build individuellement depuis son dossier.
> Les libs doivent être buildées et leur dossier `dist/` commité pour être consommées par les autres apps.

---

## Conventions de code

Voir [`CODING_GUIDELINES.md`](CODING_GUIDELINES.md) — source de vérité pour toutes les conventions : nommage, tests, types, frontend, GraphQL, styles.

---

## Chantiers en cours et à venir

### En cours

- **Suppression de `data-studio`** — remplacement progressif par `explorer-studio`, une instance de `app-studio`. Ne pas ajouter de code dans `data-studio`.

### Planifiés

- **Restructuration de `@leav/ui`** — une fois `data-studio` supprimé, nettoyer et restructurer la lib pour mettre en avant les composants publics : `Explorer`, composants de formulaire, composants de filtres. Ce chantier est bloqué par la suppression complète de `data-studio`.
- **AMP → instance `app-studio`** — objectif long terme de faire d'AMP une instance de `app-studio` (comme `explorer-studio`). `app-studio` devra être enrichi pour couvrir les besoins d'AMP. Permettra un nouveau cycle de nettoyage de `@leav/ui`.
- **DX plugins `core`** — simplifier le développement des plugins core pour les consommateurs externes. Situation actuelle : imports incorrects dans `xstream/apps/plugins/`, nécessite un `git sparse-checkout` ; AMP utilise `core` via image Docker. Chantier porté par l'équipe core (Sébastien / Jérémy).
- **Migration TypeScript `strict`** — `tsconfig.json` a `strict: true` mais court-circuité par 6 overrides (`strictNullChecks: false`, `noImplicitAny: false`, etc.). À activer progressivement, app par app — jamais en une seule PR globale.

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
