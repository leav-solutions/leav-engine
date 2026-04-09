# apps/sync-scan — CLAUDE.md

Outil de réconciliation ponctuelle filesystem ↔ base de données.
Compare l'état du disque avec les records ArangoDB et publie des événements
de synchronisation (CREATE, REMOVE, MOVE, UPDATE) sur RabbitMQ.

## Fonctionnement

Exécution en une passe : scan FS + scan GraphQL → algorithme de matching → publication AMQP.

**5 stratégies de matching (dans l'ordre) :**

1. Correspondance exacte (inode + nom + chemin)
2. Nom + chemin
3. Inode + nom
4. Inode + chemin
5. Non trouvé → CREATE

## Stack

-   Node.js + TypeScript
-   Apollo Client (requêtes GraphQL pour lire la base)
-   `walk` (traversal récursif du FS avec listes allow/ignore)
-   RabbitMQ / `@leav/message-broker`
-   Joi (validation de la config)

## Structure

```
src/
├── index.ts       # Orchestration : scan FS → scan DB → sync
├── scan.ts        # Scan filesystem() + database() via GraphQL
├── automate.ts    # Algorithme de matching (5 stratégies)
├── events.ts      # Publishers AMQP par type d'événement
├── utils.ts       # Groupement et comparaison
└── _types/        # Types config, FS, DB, événements
```

## Relation avec automate-scan

-   `sync-scan` — réconciliation **ponctuelle** (on-demand ou périodique)
-   `automate-scan` — surveillance **continue** (temps réel)

Les deux publient sur la même queue RabbitMQ.
