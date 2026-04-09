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

-   modèle tabulaire (colonnes classiques)
-   modèle EAV (Entity-Attribute-Value) pour les données multivaluées
-   modèle relationnel pour les liens entre entités

### Le pattern LEAV

C'est une extension du pattern classique **EAV (Entity-Attribute-Value)** :

-   **Library** — le méta-modèle : définit ce qu'est une Entity, quels Attributs elle peut avoir,
    leurs types, leurs règles de validation. Le schéma est lui-même une donnée gérée par le système.
    La Library est aussi ce qui introduit les **relations entre éléments** : un Attribute peut être
    de type "liaison" (`link`) et pointer vers des Entities d'une autre Library. C'est ce qui élève
    LEAV au-dessus d'un EAV basique — le graphe de données est modélisable sans migration de schéma.
-   **Entity** — une instance de donnée (ex : un produit, une personne, une session)
-   **Attribute** — une propriété d'une Entity (ex : couleur, poids, durée). Deux types de liaisons
    permettent d'exprimer des relations inter-Library :
    -   **`link`** — lien simple vers une Library classique (collection plate d'Entities)
    -   **`tree`** — lien avancé vers une Library arborescente : c'est un type de Library à part
        entière dont les Entities sont organisées en hiérarchie de nœuds, avec ses propres règles de
        gestion. Permet de modéliser taxonomies, structures organisationnelles, workflows, etc.
-   **Value** — la valeur concrète d'un Attribute pour une Entity donnée

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

-   **Docker / Docker Compose** pour orchestrer les services
-   **Traefik** comme reverse proxy local

### Infra production

-   **Kubernetes (K8s)** — Docker est conservé pour les images, mais plus de Docker Compose ni de Traefik
-   **Keycloak + OIDC** pour l'authentification (remplace l'app `login` locale)

Les packages internes utilisent le préfixe `@leav/`.

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
│   ├── data-studio/       # ⚠️ DÉPRÉCIÉ — remplacé par app-studio. Ne pas y ajouter de code.
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

> ⚠️ **Ne pas investir dans `data-studio`** — toute nouvelle feature UI va dans `app-studio`.
>
> ⚠️ **`login`** n'existe qu'en local. En production : **Keycloak via OIDC**.
>
> ℹ️ **`portal`** : ne pas y toucher, il liste les apps de façon générique. Le vrai portail
> métier est **AMP**, une app dans un repo séparé (non générique, hors de ce repo).

Chaque app dans `apps/`, peut avoir son propre `CLAUDE.md` avec ses spécificités.

---

## Principes architecturaux clés

-   **Schéma = donnée** : la définition du modèle (Library) est stockée et gérée comme n'importe
    quelle autre donnée. Pas de migration DDL pour changer de schéma.
-   **API GraphQL générique** : les resolvers sont générés dynamiquement en fonction de la Library,
    pas écrits à la main pour chaque type de données.
-   **ArangoDB comme socle** : le choix d'un graph-document store est intentionnel — les relations
    entre entités sont des first-class citizens, ce qui évite les jointures EAV catastrophiques
    des SGBDR classiques.
-   **Découplage par messages** : RabbitMQ assure la communication asynchrone entre les apps.

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

## Ce qu'il faut savoir avant de modifier du code

-   [ ] À compléter : patterns de gestion des permissions
-   [ ] À compléter : gestion des versions de valeurs (versioning)
-   [ ] À compléter : pièges connus / zones sensibles

---

## Décisions d'architecture (ADR)

Les ADR sont dans [`docs/adr/`](docs/adr). À consulter avant de proposer une lib ou une approche sur les sujets couverts.

| ADR                                                              | Décision                                                                                                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-001 — Drag & drop](docs/adr/ADR-001-dnd.md)                 | Utiliser **`dnd-kit`** pour tout nouveau code DnD. Ne pas utiliser `react-beautiful-dnd` (non maintenu) ni `react-dnd`. La migration de l'existant n'est pas prioritaire. |
| [ADR-002 — Tests E2E forms](docs/adr/ADR-002-tests-e2e-forms.md) | Tests E2E dans ce repo (`test-apps/`), stack **Playwright**, pattern **PageObjectModel**. Déclenchement quotidien + manuel en CI.                                         |
| [ADR-003 — Documentation](docs/adr/ADR-003-documentation.md)     | La doc technique vit dans `docs/` (proche du code), en Markdown. Confluence = process/métier uniquement. Mise à jour obligatoire dans la même MR que le code.             |

---

_Ce fichier est la source de vérité pour Claude Code sur ce projet.
Les apps ont chacune leur propre `CLAUDE.md` pour les détails spécifiques._
