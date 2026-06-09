# E2e test utils

`@leav/e2e-test-utils` — helpers partagés pour les tests e2e (clients GraphQL, config, setup Playwright).

## Config

`baseConfig` expose `baseUrl` et `testApiKey` pour cibler le core à tester.

## GraphQL client

Clients pour interagir avec le core LEAV :

- Créer / supprimer des records : `importDataJson`, `deleteAndPurgeLibrariesRecords`
- Récupérer / attendre une tâche : `getTask`, `waitForTaskCompletion`

## Playwright setup

`setupCryptoRandomUUIDPolyfill` : polyfill de `crypto.randomUUID`, car gitlab-ci ne tourne ni sur localhost ni en https.
À appeler dans chaque fichier de test : `setupCryptoRandomUUIDPolyfill(test)`.
