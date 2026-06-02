# Explorer — View Configuration Panel Architecture

Date: 01/06/2026

## Status

Accepted

## Context

Currently, when a user lands on an Explorer in a business app (e.g. Campaigns Manager), a view
is imposed via a `viewId` parameter. Access to the configuration side panel depends on the
`freezeView` flag: it is only accessible when `freezeView` is explicitly `false`. By default,
the user cannot personalize their display or manage views.

The goal is to introduce a **two-level view model**:

- **Admin level** — configures a reference view by defining available attributes for columns,
  filters, and sorts. Shares this view with all users.
- **User level** — starting from a shared view, personalizes their own display and can save to a
  **personal view**, an independent clone of the original shared view.

The view configuration panel is rendered as an **overlay** on top of the current Explorer panel
(not below it, not pushing content). It communicates in real time with the associated Explorer
panel in both directions.

## Decisions

### 1. State via search params, not a dedicated route segment

The open/closed state and the data needed by the panel (`targetPanelId`, `libraryId`, active tab)
are carried by the current URL's search params (`vcTargetPanelId`, `vcLibraryId`, `vcTab`).

**Why:** no impact on existing route matching; closing is trivial (remove the params); only one
panel open at a time is guaranteed; natural coexistence with the flap (path) and the record panel
(path). The URL is **not** intended to be shareable for this state — intentional behavior.

Special case: when the Explorer is in slider mode, opening the view config panel must first
navigate to the fullpage version of the same panel, then set the search params. This logic lives
in `useViewConfigSearchParams.openViewConfig`, not in the calling component.

### 2. Inter-panel communication via `message-to-panel`, not a shared React context or store

Communication between the Explorer and the view config panel uses the existing
`message-to-panel` infrastructure in `libs/ui/src/hooks/useIFrameMessenger/`, which works
uniformly for native React panels and iframes. App-studio acts as the broker.

**Why:** when Planning/Cadrage sub-panels (iframes) arrive, the communication protocol will not
need to change. A shared in-memory store would not work across iframes. An approach of
"re-fetch the view from the backend" was explicitly rejected: the view may be in an unsaved state,
so the serialized view must be transmitted directly in memory.

Two message types:

- `view-config-update` (viewConfig → Explorer): sends the current view as JSON on each change
- `explorer-view-changed` (Explorer → viewConfig): notifies when filters are modified directly
  from the Explorer toolbar

### 3. Explorer exposes generic callbacks — it does not know app-studio

The Explorer does not reference app-studio, the messenger, or the view config panel. It exposes
optional callbacks that app-studio wires up:

- `defaultCallbacks.viewConfig.onFiltersChange` — notifies the outside world of a filter change
  from the Explorer toolbar
- `defaultCallbacks.viewConfig.onViewConfigTabClick` — shortcut to a specific tab of the view
  config panel

**Why:** the Explorer must remain usable outside the panel system (e.g. AMP). All new props and
callbacks added to Explorer **must remain optional** (`?:`).

### 4. `currentView` controlled prop + `APPLY_SERIALIZED_VIEW` reducer action

When the view config panel sends a `view-config-update` message, app-studio updates a `currentView`
prop on the Explorer. The Explorer reacts to changes of this prop by dispatching
`APPLY_SERIALIZED_VIEW` to its internal reducer, replacing the current state without a backend
round-trip and flagging `viewModified: true`.

**Why:** `defaultViewSettings` is read only once at initialization — dynamic updates after mount
are silently ignored. A dedicated action is needed to apply an externally driven view without
conflicting with the existing `viewId`-based loading flow.

### 5. `targetPanelId` rather than `explorerPanelId`

The `viewConfig` panel schema uses `targetPanelId` (generic) instead of `explorerPanelId`.

**Why:** when injectable sub-panels (Planning/Cadrage) arrive, the view config panel will need
to target `custom` (iframe) panels too, not just `explorer` panels. The generic name avoids a
rename at that point.

## Consequences

- A `viewConfigPanelSchema` is added to the panel schema union in app-studio; it is **not** a
  routable panel type and is not rendered inside `PanelContent`.
- `PanelViewConfig` is rendered in the layout parent (the level that already manages the flap),
  conditioned on the presence of `vcTargetPanelId` + `vcLibraryId` in the URL.
- The `APPLY_SERIALIZED_VIEW` action and the `currentView` prop are foundational — nothing else
  in this EPIC can be built without them.
- AMP consumers of `@leav/ui` are unaffected: all new Explorer props are optional and AMP can
  ignore them without modification.
- The `RedirectViewConfigPanelToSlider` guard is removed — its logic moves into
  `useViewConfigSearchParams.openViewConfig`.
- Injectable sub-panels (Planning/Cadrage) are explicitly **out of scope** for this version. The
  integration strategy (iframe vs. other) is not yet settled. See open points below.

## Open points

| Subject                                     | Status                                                          |
| ------------------------------------------- | --------------------------------------------------------------- |
| Feature flag activation                     | To introduce at the start of the EPIC, removed at the end       |
| Admin/user permission check                 | Direct GraphQL call on `libraryId` from `PanelViewConfig`       |
| View persistence endpoint (GraphQL or REST) | To confirm                                                      |
| Injectable sub-panels (Planning/Cadrage)    | Out of scope — strategy not yet settled                         |
| AMP compatibility (not on app-studio)       | Blocking for AMP → app-studio migration — to validate w/ Sam    |
| Shared view scope                           | Currently global; per-group sharing planned for a later version |
