# Docker build

To be executed from git root path

### core

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/core.Dockerfile --tag core:local .
```

### automate-scan

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/generic.Dockerfile --build-arg APP=automate-scan --target runner --tag automate-scan:local .
```

### sync-scan

Same as automate-scan

### mcp-runtime

Same as automate-scan

### preview-generator

```
docker buildx build --platform linux/amd64 --file docker/DOCKERFILES/build/generic.Dockerfile --build-arg APP=preview-generator --target runner-preview-generator --tag preview-generator:local .
```

## Découpage en étapes : ce qu'il ne faut pas casser

Mesuré en local sur l'image `core` : **199 s avant, 149 s à froid, 72 s** quand une seule source de
front change, et **42 s** quand seule la version change (dont ~22 s d'export d'image, incompressibles).
À froid, les 4 fronts ne s'additionnent plus : le chemin critique est le plus long d'entre eux
(`admin`, 64 s) au lieu de leur somme (172 s).

Les deux Dockerfiles sont découpés en étapes pour que Docker puisse en cacher et, côté `core`, en
paralléliser une partie. Deux règles :

- **Ne jamais copier de sources avant l'étape `deps`.** C'est précisément le bug qui a été corrigé :
  `COPY apps/` et `COPY libs/` précédaient le `yarn install`, donc toute ligne de source modifiée
  réinstallait l'ensemble du monorepo. L'étape `manifests` n'extrait que les `package.json`, le
  lockfile et `.yarn/releases` ; elle est rejouée à chaque changement de source, mais **sa sortie
  est stable**, donc `deps` reste en cache.
  Elle garde aussi `apps/*/scripts/` : sans ça, `yarn install` casse sur le `postinstall`
  d'`apps/admin`.
- **Garder une étape par workspace buildable** dans `core.Dockerfile` (les 4 fronts + le core).
  BuildKit les lance en parallèle, et toucher un seul front laisse les autres en `CACHED` — y
  compris lors d'un retry après un OOM. Les fusionner reviendrait au `RUN` monolithique d'avant, où
  les 4 `vite build` s'enchaînaient en série alors que chacun re-bundle les 887 fichiers de
  `libs/ui` depuis les sources.

Le `--mount=type=cache` vise le `cacheFolder` du `.yarnrc.yml` (cache projet, `enableGlobalCache:
false`). Sans lui, chaque build retélécharge tous les paquets, le repo étant cloné à neuf en CI.
Corollaire : **ne jamais ajouter un `docker builder prune -f` sans borne** sur les runners
`docker-build`, il détruirait à la fois le cache de couches et ces cache mounts. Si la place vient à
manquer, utiliser une purge bornée (`--filter until=…` ou `--keep-storage`).

`yarn install` y tourne **sans `--immutable`**, contrairement aux jobs `lint`/`tscheck` : le
`.dockerignore` garde `test-apps/` hors du contexte, donc ses workspaces sont absents de l'arbre et
Yarn doit réécrire le lockfile (YN0028).

## Version : tamponnée dans l'image, pas dans le contexte

La version affichée par le core (query GraphQL `version`, qui lit
celle du `package.json`) et celle des `manifest.json` d'applications sont posées **dans
l'image**, par l'étape `assemble`, à partir du build-arg `VERSION_METADATA` :

```
docker buildx build … --build-arg VERSION_METADATA=develop.abc123 …
```

Chaque package **garde sa propre version** et ne reçoit qu'un suffixe de _build metadata_ semver :
`1.19.0` devient `1.19.0+develop.<short-sha>` sur `develop`, `1.19.0+mr-<slug>.<short-sha>` sur une MR. Sur un
tag, `VERSION_METADATA` est **vide** et les versions committées sont conservées telles quelles. La CI
la calcule dans le même bloc que le tag d'image (`.default_docker_build`), pour que les deux restent
cohérents.

Le résultat reste une version semver valide : tout outil qui la compare voit `1.19.0`, la metadata
étant ignorée dans l'ordre de précédence. Deux contraintes à respecter en la modifiant :

- **Un seul `+`.** Le premier `+` ouvre la metadata, dont les identifiants se séparent par des
  **points** — `1.19.0+develop+<sha>` n'est pas une version valide, `1.19.0+develop.<sha>` oui.
  L'étape de stamping retire une metadata déjà présente avant d'ajouter la sienne, pour ne pas les
  empiler.
- **Un seul mot, en `[0-9A-Za-z-.]`.** La valeur traverse une ligne `script:` repliée par YAML avant
  d'atteindre `--build-arg` : une valeur contenant un espace a fait compter deux arguments
  positionnels à buildx, qui échouait sur `'docker buildx build' requires 1 argument`.

Auparavant, un anchor `set_version` réécrivait la version de **tous** les `package.json` et
`manifest.json` du dépôt juste avant le `docker build`. Ne pas y revenir : muter le contexte de build
à chaque commit invalide toutes les couches par construction, et annule tout le bénéfice du
découpage ci-dessus. Ce déplacement est possible parce que la version n'est jamais compilée dans un
bundle — elle n'est lue qu'au runtime.
