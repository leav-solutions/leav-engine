---
name: run-explorer-studio
description: >-
    Launch a headless browser against the locally-running LEAV stack to see
    explorer-studio rendering and screenshot it. Triggers when the user wants
    to visually check a panel, view, or UI state in the real running front —
    e.g. "ouvre le panel X et screenshote", "montre-moi le rendu de
    explorer-studio", "va voir l'interface sur telle URL", "à quoi ça
    ressemble en vrai ?". Do NOT trigger for unit tests, or when the stack
    is not running.
---

# Run explorer-studio and screenshot it

**explorer-studio** is a configured instance of app-studio (the generic shell
MFE). Do not confuse with `app-studio` itself — in local dev that URL points to
the campaign-manager app, which is a different product.

Use this to observe the **real running front** and produce screenshots — not
the test suite. The developer runs and manages the LEAV stack themselves
(Docker Compose + Traefik); **do not** `docker ps`, `docker compose up`, or
`curl` the `*.leav.localhost` URLs to check the stack. Trust that it's up and
drive the browser straight away. If a page genuinely fails to load, tell the
user — they'll check the stack.

## Prerequisites

- The stack is running and reachable at `http://core.leav.localhost`.
- The skill is **self-contained**: it has its own `package.json` with `playwright`
  and its own `node_modules`. Before the first run, install its deps:
    ```bash
    (cd .claude/skills/run-explorer-studio && yarn install)
    ```
    If `node_modules/playwright` is already present, skip this step.
    No dependency on the repo root's yarn workspace.
- The Playwright-managed Chromium build is **not** installed, so the driver
  launches the **system Google Chrome** via `channel: 'chrome'`. Keep that.

## How to drive it

Always run from the **repo root** (so the skill's `node_modules` resolves correctly).

**Ask the user which library/workspace to open** if not already clear from context —
do not invent a URL. If the user doesn't know the library id, use the MCP tool
`mcp__leav-runtime__graphql` to list available libraries:

```graphql
{
    libraries {
        list {
            id
            label
        }
    }
}
```

Then propose the matching id(s) and let the user confirm before navigating.
Use `http://core.leav.localhost/app/explorer-studio/` (last-visited workspace)
only as a last resort when no library is needed.

```bash
node .claude/skills/run-explorer-studio/drive.mjs \
  --url "http://core.leav.localhost/app/explorer-studio/<workspace>/<library>" \
  --out tmp/leav-shot.png
```

Then `Read` the PNG to look at it. A blank/login frame means a failed launch
or expired session — re-run (the driver re-logs in automatically).

### Options

| Flag              | Purpose                                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--url`           | Target URL (required).                                                                                                                                                                                            |
| `--click`         | Exact aria-label of a toolbar button to click before shot.                                                                                                                                                        |
| `--clip`          | `x,y,w,h` to crop to one panel for legible detail.                                                                                                                                                                |
| `--out`           | Screenshot path (default `tmp/leav-shot.png`).                                                                                                                                                                    |
| `--wait`          | SPA hydrate wait in ms (default 6000; bump for slow loads).                                                                                                                                                       |
| `--inspect`       | CSS selector — dump computed layout styles (display/flex/min-max-width/overflow/text…) + bounding box for up to 10 matches. For debugging layout/overflow where a screenshot shows the symptom but not the cause. |
| `--inspect-chain` | With `--inspect`, also walk each match's ancestors up to `<body>` — finds which box fails to constrain width.                                                                                                     |

### Debugging a layout/overflow bug

When a screenshot shows clipping/overflow but not _why_, dump the computed box model
instead of guessing. Example — find why a sort chip overflows its panel:

```bash
node .claude/skills/run-explorer-studio/drive.mjs \
  --url "http://core.leav.localhost/app/app-studio/maps-management/map-list" \
  --click "Tris" --inspect "button._kit-filter_w4vo0_1" --inspect-chain \
  --out tmp/leav-shot.png
```

The `--inspect-chain` output reveals intermediate wrappers a component library inserts
(e.g. Ant's `span.ant-dropdown-trigger`) that are the real flex item to constrain —
not the element you put your class on.

## Auth

The driver logs in with the local dev credentials **admin / admin** through
the LEAV `login` app, then saves the session to `/tmp/leav-state.json` and
reuses it on later runs (no re-login). Delete that file to force a fresh login.

## Explorer view-settings panel

The Explorer toolbar exposes four buttons that open the view-config panel
(`PanelViewSettings`) on a given tab — pass the `aria-label` to `--click`:

- `Affichage` → `TabDisplay`
- `Filtres` → `TabFilters`
- `Tris` → `TabSorts`
- `Catalogue` → `TabCatalog`

Example — open the panel on the Catalogue tab and crop to the right panel:

```bash
node .claude/skills/run-explorer-studio/drive.mjs \
  --url "http://core.leav.localhost/app/explorer-studio/<workspace>/<library>" \
  --click "Catalogue" --clip "1095,60,505,760" --out tmp/leav-panel.png
```

## Gotchas that recur

- **Run from repo root.** From `/tmp`, the ESM import of `playwright` fails
  with `ERR_MODULE_NOT_FOUND`.
- **System Chrome, not Playwright Chromium.** `chromium.launch()` without
  `channel: 'chrome'` fails (`Executable doesn't exist … chromium-XXXX`).
- **Legibility.** `Read` downscales screenshots; for fine text in a side
  panel, `--clip` to that panel rather than reading the full page.
- **Console errors at first paint** are usually the pre-login 401/500s from
  the auth redirect; harmless once `FINAL_URL` is the target, not `/app/login`.
- **Controlled inputs.** Set values via Playwright `fill`, never `el.value =`,
  or React's onChange won't fire.
