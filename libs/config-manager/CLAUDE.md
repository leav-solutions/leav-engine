# libs/config-manager — CLAUDE.md

`@leav/config-manager` — Chargement et fusion de configuration par environnement.

## Ce que c'est

Charge des fichiers de config JS et les fusionne en profondeur dans l'ordre :
`default.js` → `{env}.js` → `local.js` (sauf si `CONFIG_IGNORE_LOCAL=true`).

## Exports clés

| Export                  | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `loadConfig()`          | Charge et fusionne la config selon l'environnement courant |
| `envToBool(val)`        | Convertit une variable d'env en `boolean`                  |
| `envToNumber(val)`      | Convertit une variable d'env en `number`                   |
| `envToStringArray(val)` | Convertit une variable d'env en `string[]`                 |

## Usage

```ts
import {loadConfig} from '@leav/config-manager';

const config = await loadConfig();
```
