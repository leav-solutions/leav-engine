# apps/automate-scan — CLAUDE.md

Daemon de surveillance du système de fichiers en temps réel.
Détecte les changements (CREATE, UPDATE, REMOVE, MOVE) et publie des événements sur RabbitMQ.

## Fonctionnement

Surveille en continu un répertoire racine configurable via **chokidar**.
Utilise Redis pour stocker les mappings inode→chemin (détection des MOVE).
Publie les événements AMQP avec : type, inode, chemins avant/après, timestamp, hash, rootKey.

## Stack

- Node.js + TypeScript
- chokidar (surveillance fichiers, polling configurable)
- Redis (cache inode→path)
- RabbitMQ / `@leav/message-broker` (publication événements)
- `@leav/monitoring-server` (health check)

## Structure

```
src/
├── index.ts              # Point d'entrée
├── setupWatcher/         # Initialisation watcher + Redis + RabbitMQ
├── watch/
│   ├── watch.ts          # Logique de surveillance (debouncing)
│   └── events.ts         # Handlers par type d'événement
├── redis/                # Client Redis
└── rabbitmq/             # Publisher AMQP
```

## Relation avec sync-scan

- `automate-scan` — surveillance **continue** (tourne en permanence)
- `sync-scan` — réconciliation **ponctuelle** (synchronise l'état FS ↔ base de données)

Les deux publient sur la même queue RabbitMQ.
