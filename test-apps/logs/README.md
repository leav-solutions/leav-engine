# Test de logs

Test d'intégration du pipeline de logs de `core` : écriture (RabbitMQ →
`logs-collector` → Elasticsearch), puis lecture via la query GraphQL `logs`
(filtres, pagination, tri).

## Lancer les tests en local

Ces tests ne sont **pas joués en CI** — à exécuter manuellement contre un
stack Docker local.

Démarrer le stack avec le profil `logs` (ajoute `logs-collector` et
`elasticsearch` au stack de base — sans eux la query `logs` ne retourne
rien) :

```shell
cd ../../docker
docker compose --profile logs up -d
```

Puis, depuis `test-apps/logs` :

```shell
yarn start
```

Config par défaut (`config/default.js`, surchargeable via variables d'env) :

- `CORE_URL` (défaut `http://core.leav.localhost`)
- `AUTH_login` / `AUTH_PASSWORD` (défaut `admin`/`admin`)

## Régénérer le SDK GraphQL

Les requêtes sont définies dans `src/Logs.graphql` et compilées en SDK typé
(`src/_gqlTypes/index.ts`) via `graphql-codegen`. Avec le stack local
démarré, après une modification du fichier `.graphql` (ou du schéma core) :

```shell
yarn graphql-generate
```

Nécessite un fichier `apolloApiKey.js` local (non versionné, copier
`apolloApiKey.js.example`) contenant une clé d'API valide, utilisée
uniquement pour l'introspection du schéma. L'authentification des tests
eux-mêmes reste `/auth/authenticate` (login/password), voir
`src/helpers/graphqlClient.ts`.
