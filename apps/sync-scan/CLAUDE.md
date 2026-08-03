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

- Node.js + TypeScript
- Apollo Client (requêtes GraphQL pour lire la base)
- `walk` (traversal récursif du FS avec listes allow/ignore)
- RabbitMQ via `@leav/message-broker` (`createAmqpConnection`) — publication résiliente
  (reconnexion automatique) ; job one-shot, donc attente bornée (30s) au démarrage puis échec
  explicite si le broker est injoignable, plutôt qu'une attente indéfinie
- Joi (validation de la config)

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

## Tests

```bash
# Unitaires (en local)
yarn workspace sync-scan run test

# E2E (nécessite un RabbitMQ joignable — depuis le container automate-scan, qui monte le workspace)
docker exec -ti -w /app/apps/sync-scan docker-automate-scan-1 yarn run test:e2e
```

Les e2e ([`src/__tests__/e2e/`](src/__tests__/e2e/)) publient de vrais événements via `automate()` et
les relisent sur une queue dédiée (`config/test.js` : exchange `leav_core_test_sync_scan`, queue
`files_events_test_sync_scan` — utilisés **uniquement** par ces tests).

Deux invariants à préserver en touchant à ce fichier de test :

- **La topologie de test doit être en place avant la première publication.** Elle est déclarée dans le
  `setup` du canal consommateur (exchange + queue + bind, l'exchange inclus pour ne pas dépendre du
  canal producteur), et `purgeQueue()` en `beforeEach` sert de **barrière** (il attend le premier
  connect du canal) autant que de nettoyage. Sans cette barrière, les événements partent sur un
  exchange sans binding et sont jetés silencieusement → 20 s de timeout. Invisible en local (la queue
  `durable` survit d'un run à l'autre), systématique en CI où le service RabbitMQ est neuf.
- **Les assertions restent hors du handler `consume`** (`collectMessages(n)` collecte, le test
  asserte) et chaque consumer est annulé en `finally` — sinon un test en échec laisse un consumer qui
  vole les messages des suivants (round-robin RabbitMQ) et fait tomber toute la suite en cascade.

Pour reproduire les conditions CI en local, supprimer la topologie de test avant le run :

```bash
curl -s -u guest:guest -X DELETE http://rabbitmq.leav.localhost/api/queues/%2F/files_events_test_sync_scan
curl -s -u guest:guest -X DELETE http://rabbitmq.leav.localhost/api/exchanges/%2F/leav_core_test_sync_scan
```

## Relation avec automate-scan

- `sync-scan` — réconciliation **ponctuelle** (on-demand ou périodique)
- `automate-scan` — surveillance **continue** (temps réel)

Les deux publient sur la même queue RabbitMQ.

---

## Dépendances à usage non évident

`graphql` n'est **jamais importé directement** mais doit rester déclaré : il satisfait la
`peerDependency` des `apollo-client` / `apollo-cache-inmemory` / `apollo-link-http` et de
`graphql-tag`, tous utilisés par [`src/scan.ts`](src/scan.ts). Yarn émet d'ailleurs un warning de
peer (la version 16 dépasse le range `^14 || ^15` des `apollo-*`) : c'est préexistant et connu, le
retirer laisserait ces packages sans aucun `graphql`.

Auditer avec le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).
