# Release "en un clic" depuis la CI

Date: 24/08/2026

## Status

Accepted

## Context

Le process de release était jusqu'ici manuel : bump de version dans tous les `package.json`/
`manifest.json` du monorepo (version en lockstep sur tout le repo), branche `make-release-X.Y.Z`,
MR, merge dans `develop`, puis pose du tag `X.Y.Z` à la main sur le commit de merge. Ce tag
déclenche déjà `build-npm-leav-*` (publication npm, dist-tag `latest`) et `build-docker-*`
(images `:X.Y.Z` + `:latest`) — cette partie ne change pas.

Le mécanisme ci-dessous a d'abord été prototypé et validé par un run réel dans le repo POC
[`poc-release`](https://gitlab.aristid.com/dev/leav/pocs/poc-release) (bump, MR auto-mergée, tag,
déclenchement du pipeline de tag) avant d'être porté ici, avec les noms de branche/commit déjà en
usage dans l'historique de ce repo.

## Decision

Deux jobs CI, stage `release` (après `post-build-test`) :

- **`release`** (manuel, sur `develop`) : calcule la nouvelle version avec
  `npm version "$RELEASE_BUMP" --no-git-tag-version --no-workspaces-update` (`RELEASE_BUMP` :
  `minor` par défaut, `major`/`patch` en override), la propage à tous les `package.json` et
  `manifest.json` du repo, commit `chore: release X.Y.Z` sur une branche `make-release-X.Y.Z`, et
  pousse cette branche avec les push-options GitLab pour créer une MR vers `develop` et l'auto-
  merger (`merge_request.create`, `.auto_merge`, `.remove_source_branch`). Ne pose PAS le tag.
- **`auto-tag`** (automatique, à chaque push sur `develop`) : idempotent — si le tag de la version
  courante existe déjà, ne fait rien. Sinon crée le tag `X.Y.Z` (sans préfixe `v`, comme
  l'historique existant) et le pousse. Un push via `CI_JOB_TOKEN` ne déclenche pas de pipeline sur
  ce nouveau tag (protection anti-récursion GitLab) : le job déclenche donc explicitement le
  pipeline du tag via l'API `POST /projects/:id/trigger/pipeline`, avec retry/backoff (le ref
  fraîchement poussé peut ne pas être immédiatement résolvable côté API).

Une MR de release (branche `make-release-*`) exclut tous les jobs de lint/tests/build via une
ancre partagée `.no_release_branch_rule` (préfixée dans `check_ci_rules` et dans chaque job
`*-unit-tests`/`integration-test-*`) : un bump de version pur ne peut pas les casser, et un job
`release-gate` minimal (toujours vert) suffit à satisfaire l'auto-merge.

Authentification : uniquement `CI_JOB_TOKEN` (`git remote set-url origin
https://gitlab-ci-token:${CI_JOB_TOKEN}@...`), pas de PAT à gérer.

## Consequences

- **Prérequis GitLab, à faire une fois par un Maintainer/Owner du projet, hors code** :
    1. Settings → CI/CD → Job token permissions → activer "Allow Git push requests to your
       project repository" (sinon `CI_JOB_TOKEN` ne peut pas pousser de branche/tag).
    2. Settings → CI/CD → Pipeline trigger tokens → créer un trigger token, l'ajouter en variable
       CI/CD `RELEASE_TRIGGER_TOKEN` (Protected + Masked).
- Le job `release` doit être déclenché par une personne **Maintainer/Owner** : `CI_JOB_TOKEN`
  hérite des droits de la personne qui lance le pipeline, et il faut pouvoir merger sur `develop`
  (branche protégée) et, si les tags sont protégés, pouvoir en créer un.
- `develop` reste toujours à la dernière version **publiée** (pas de "version n+1") : la release
  EST le bump, pas une préparation en amont.
- Toute évolution future de ce mécanisme (nouvelle règle, nouveau job, changement de convention)
  doit d'abord être prototypée et validée par un run réel dans `poc-release`, avant d'être portée
  ici — c'est le bac à sable de référence pour ce système.

## Sources

- [`poc-release`](https://gitlab.aristid.com/dev/leav/pocs/poc-release) (`.gitlab-ci.yml`,
  `docs/npm-publishing.md`) — mécanisme prototypé et validé par un run réel avant portage ici.
