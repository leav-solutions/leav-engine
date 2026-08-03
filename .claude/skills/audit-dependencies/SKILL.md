---
name: audit-dependencies
description: >-
    Audit a workspace's npm dependencies: find declared-but-unused packages and
    imported-but-undeclared ones (phantom deps that only resolve through Yarn
    hoisting). Triggers when the user wants to clean up a package.json — e.g.
    "cherche les dépendances non utilisées", "est-ce que X est encore utilisé ?",
    "nettoie les deps de tel package", "audit des dépendances", "il manque des
    deps déclarées ?". Do NOT trigger for version bumps or vulnerability audits
    (that is renovate / `yarn npm audit`).
---

# Audit npm dependencies of a workspace

Two symmetrical problems, both invisible in a monorepo where Yarn hoists everything:

- **Declared but unused** — dead weight in `package.json`, and stale `@types/*` that actively
  conflict with the types the package now ships itself.
- **Imported but undeclared** (_phantom dependency_) — works locally because a sibling workspace
  hoists it, breaks as soon as the package is installed on its own: a published lib on npm, or an
  app whose Docker image only copies its own `package.json`.

The scan is the easy part. **The work is triaging false positives**, so never remove anything on the
scanner's word alone — walk the checklist below.

## 1. Scan

```bash
node .claude/skills/audit-dependencies/scan.mjs apps/core libs/ui
node .claude/skills/audit-dependencies/scan.mjs --all          # every workspace
```

Zero-dependency Node script, reports only, exits 0, writes nothing. Three sections:

- **A.** declared and never referenced → removal candidates
- **B.** referenced and declared nowhere → phantom dependencies
- **C.** (published packages only) imported by **published** code but declared only in
  `devDependencies` → missing for npm consumers

It already handles what a naive `grep "from 'x'"` gets wrong: comments are stripped, bare
side-effect imports (`import 'pkg/style.css'`) are caught, and so are CSS/LESS `@import` (with `~`),
`require()`, dynamic `import()` and `vi.mock`/`jest.mock`. For published packages the published/dev
boundary comes from the `exclude` of `tsconfig.build.json`.

## 2. Triage section A — usages invisible to an import scan

A package can be load-bearing without ever appearing in an `import`. Check each of these before
concluding it is dead:

| Invisible usage                                    | Real examples in this repo                                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plugin referenced **by name, as a string**         | `@graphql-codegen/{typescript,typescript-operations,typescript-react-apollo,typescript-graphql-request}` and the `add:` key, in every `codegen.ts` |
| Config **value** as a string                       | `happy-dom` via `environment: 'happy-dom'` in the vitest config                                                                                    |
| A tsconfig's `types` array                         | `@types/node` via `types: ["node"]`; **`vite` in `libs/ui`** via `vite/client` in `tsconfig.spec.json`                                             |
| Binary invoked from `scripts`                      | `tsx`, `prettier`, `typescript`, `tsc-alias`                                                                                                       |
| Compiled implicitly by the bundler                 | `less` — Vite compiles `.less`, the package itself is never imported                                                                               |
| `NODE_OPTIONS` / preload                           | `@opentelemetry/auto-instrumentations-node`, loaded by `docker/scripts/start-core.sh` when `OTEL_AUTO_INSTRUMENT=1`                                |
| Satisfying someone else's **peerDependency**       | `graphql` (peer of `graphql-request`, `graphql-tag`, `apollo-*`); `jsoneditor` (peer of `jsoneditor-react`)                                        |
| Types required by **another package's** `.d.ts`    | `@types/jexl`, because `jexl-extended/dist/index.d.ts` does `import {Jexl} from 'jexl'` and `jexl` ships none                                      |
| Workspace dependency consumed through an **alias** | `@leav/ui` in `apps/admin`: never imported by name, but the `_ui/*` alias compiles `libs/ui/src`, so the workspace dep is what installs its deps   |

Quick way to settle a peer question:

```bash
node -e "console.log(JSON.stringify(require('./node_modules/<pkg>/package.json').peerDependencies))"
```

## 3. Triage section B — do not declare these

- **Import only present in a comment.** `apps/admin` carries ~109 fully commented-out legacy test
  files; the scanner strips comments, but always eyeball the reported line before adding a package.
  `enzyme` in particular must never be reinstated — it does not support React 18.
- **Packages owned by `aristid-ds`** — `antd`, `@fortawesome/*`, `classnames`, `lodash`,
  `react-modal`. Deliberately left undeclared in `libs/ui` and `apps/admin`: the design system is
  distributed as a **commit pin**, so pinning its packages here would couple us to its version, and
  a second copy of `antd` in a consumer bundle breaks theming (it carries React context).
  This is a documented decision, not an oversight — see `libs/ui/CLAUDE.md`.

## 4. Traps to hunt actively (the scanner cannot see them)

- **Stale `@types/X`** when `X` now ships its own typings. Compare:
    ```bash
    node -e "const p=require('./node_modules/<pkg>/package.json');console.log(p.version,p.types||p.typings||'no own types')"
    ```
    `@types/styled-components@4` sat next to `styled-components@6` in `apps/admin`; removing it also
    freed a whole transitive `@types/react-native` tree.
- **Types-only packages** have no `main`, so `require.resolve` fails by design — that is not a
  missing dependency. Verify with TypeScript instead: `tsc --traceResolution`. Example:
  `@graphql-typed-document-node/core`.
- **Production images install per workspace, not per monorepo.**
  `docker/DOCKERFILES/build/generic.Dockerfile` (every service except the core) runs
  `yarn workspaces focus $APP` then `yarn workspaces focus $APP --production`, which installs **only
  what the target workspace declares** plus its `workspace:` libs — never the hoisted tree. So a
  phantom dependency is simply absent from the image (`MODULE_NOT_FOUND` at boot) even though local
  dev was fine, and anything needed at runtime must sit in `dependencies`, not `devDependencies`.
  `docker compose up` does not exercise this, since it mounts the whole monorepo.
- **Section C caveat**: a `.d.ts` under `src/` counts as published code for the scanner, but `tsc`
  does not re-emit declaration inputs, so it never reaches `dist/`. That is why
  `@total-typescript/ts-reset` shows up in section C for `libs/ui` while `devDependencies` is the
  correct placement. Check whether the file actually lands in `dist/`.

## 5. Verify a removal

Order matters — take the baseline **before** touching anything, otherwise a pre-existing failure
looks like a regression:

```bash
(cd <pkg> && yarn run tscheck && yarn test)        # baseline
# ... edit package.json ...
yarn install                                       # regenerates yarn.lock
(cd <pkg> && yarn run tscheck && yarn test)        # compare to baseline
```

- Watch the `yarn install` output: `YN0002 doesn't provide <x>` tells you a peer you just broke, and
  `YN0085` lists what actually left the lockfile.
- **Any change touching `libs/ui` must be validated by a front build**, not just unit tests:
  `(cd apps/admin && yarn build)` and `(cd apps/app-studio && yarn build)`. Both compile
  `libs/ui`'s **sources** through the `_ui/*` alias, and a broken bundle is invisible to the test
  suites.
- Backend services: boot them (`docker compose --profile automate up -d`) and look for
  `MODULE_NOT_FOUND`. Force `yarn install` inside the container first, otherwise its `node_modules`
  volume still holds the packages you just removed and the check proves nothing.
- Watch out for a stale `dist/` from an earlier `vite build`: it makes `tsc -b` fail with `TS6305`.
  `yarn clean` in the package fixes it — it is an artifact, not a type error.
- Flaky tests exist here (`libs/ui` has one): re-run before calling a single failure a regression.

## 6. Report

Group findings as: removed / added (phantom) / **deliberately kept, with the reason**. That last
group is the useful one — it is what stops the next audit from re-litigating the same packages.
