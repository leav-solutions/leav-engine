# libs/app-root-path — CLAUDE.md

`@leav/app-root-path` — Résolution du chemin racine de l'application.

## Ce que c'est

Wrapper minimal qui retourne `APP_ROOT_PATH` si la variable d'environnement est définie,
sinon utilise le paquet npm `app-root-path`. Permet de surcharger le chemin racine
en environnement containerisé.

## Export

```ts
import {appRootPath} from '@leav/app-root-path';

const root = appRootPath(); // string
```
