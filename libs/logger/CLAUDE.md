# libs/logger — CLAUDE.md

`@leav/logger` — Logger partagé entre toutes les apps backend.

## Ce que c'est

Wrapper autour de **Winston** exposant un singleton `logger` préconfiguré
et des formateurs d'erreurs/stack trace.

## Exports clés

| Export                    | Description                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `logger`                  | Instance singleton Winston (error, warn, info, verbose, debug, silly) |
| `ILogger`                 | Interface du logger                                                   |
| `configureLogger(config)` | Reconfigure le logger au démarrage                                    |
| `ILoggerConfig`           | Type de configuration                                                 |
| `catchErrorFormatter()`   | Formate les logs d'erreur avec call stack                             |
| `addLocationInfoInLog()`  | Ajoute `fichier:ligne` dans les logs                                  |
| `LoggerCallStack`         | Utilitaire de traitement des stacks d'erreur                          |

## Usage

```ts
import {logger} from '@leav/logger';

logger.info('message');
logger.error('something went wrong', {error});
```
