# Explorer — View Settings Panel Architecture

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

The view settings panel (`PanelViewSettings`, wrapped in app-studio by `ViewSettingsContainer`) is
rendered as an **overlay** (`KitSidePanel`) on top of the current Explorer panel (not below it, not
pushing content). It communicates in real time with the associated Explorer panel in both
directions.

## Decisions

### 1. State in the application settings context, not search params or a route segment

The open/closed state and the data needed by the panel (`isViewSettingsActive`, `selectedTab`,
`currentViewId`, `targetLibraryId`) are stored **on the panel itself** inside the in-memory
application settings (the parsed JSON config exposed by `useApplicationSettingsContext`). They are
mutated via `setApplication`, through the `updatePanelViewSettingsInApplication` helper.

`selectedTab` is typed as `ViewSettingsTab` (`display | filters | sorts | catalog`). The
whole feature is gated by an Application-level flag `enableViewSettings` (zod-optional boolean):
app-studio only wires the callbacks and renders the panel when it is `true`. On the Explorer side,
the shortcut buttons are gated by `view.enableConfigureView`.

Opening the panel goes through the inter-panel messenger (`usePanelEventHandlers`): a shortcut
click on the Explorer dispatches an `open-view-settings` event whose handler flips
`isViewSettingsActive` to `true` on the target panel. Closing (`KitSidePanel.onCloseAfterAnimation`)
resets these fields to their inactive values (`isViewSettingsActive: false`, the rest `undefined`),
via `resetViewSettings`.

**Why:** the panel state is intrinsically tied to a panel of the current config, so it lives with
the rest of the panel state rather than being duplicated in the URL. Only one panel open at a time
is naturally guaranteed; this state is **not** intended to be shareable via the URL — intentional
behavior. An earlier design carried this state in URL search params (`vcTargetPanelId`,
`vcLibraryId`, `vcTab`) with a dedicated `useViewConfigSearchParams` hook; this was dropped in
favor of the application-settings context.

### 2. Inter-panel communication via `message-to-panel`, not a shared React context or store

Communication between the Explorer and the view settings panel uses the existing
`message-to-panel` infrastructure in `libs/ui/src/hooks/usePanelMessenger/`, which works
uniformly for native React panels and iframes. App-studio acts as the broker. The messenger
registers handlers per event type as a `Set`, so several panels can subscribe to the same event
type concurrently.

**Why:** when Planning/Cadrage sub-panels (iframes) arrive, the communication protocol will not
need to change. A shared in-memory store would not work across iframes. An approach of
"re-fetch the view from the backend" was explicitly rejected: the view may be in an unsaved state,
so the serialized view must be transmitted directly in memory.

App-studio-internal event types (`AppStudioInternalEvent`, dispatched via the messenger):

- `open-view-settings` (Explorer → view settings panel): a shortcut click opens the panel on the
  target tab; carries `selectedTab`, `currentViewId`, `currentLibraryId` and `explorerPanelDetails`
- `view-settings-select-view` (view settings catalog → Explorer): selects a saved view by id,
  driving the Explorer's `loadedViewId`

Notifying the panel of a filter change from the Explorer toolbar (`onFiltersChange`) is wired as a
callback but the dispatch is still a TODO.

### 3. Explorer exposes generic callbacks — it does not know app-studio

The Explorer does not reference app-studio, the messenger, or the view settings panel. It exposes
optional callbacks under `defaultCallbacks.viewSettings` that app-studio wires up:

- `onViewSettingsShortcutClick({settingName, viewId})` — a shortcut click on the Explorer toolbar
  requesting the view settings panel to open on a given tab (`settingName: ViewSettingsTab`)
- `onFiltersChange` — notifies the outside world of a filter change from the Explorer toolbar
- `closeViewSettings` — lets the outside world close the panel

The presence of `onViewSettingsShortcutClick` is what toggles the Explorer between its legacy
in-place view settings button and the new shortcut buttons (`useOpenViewSettingsV2`).

**Why:** the Explorer must remain usable outside the panel system (e.g. AMP). All new props and
callbacks added to Explorer **must remain optional** (`?:`).

### 4. Controlled props to drive the Explorer after mount: `currentView` + `loadedViewId`

`defaultViewSettings` is read only once at initialization — dynamic updates after mount are
silently ignored. Two optional controlled props let an external panel drive the Explorer after
mount, each for a different need:

- `currentView` (serialized, in-memory view) + the `APPLY_SERIALIZED_VIEW` reducer action: applies
  an externally driven, possibly unsaved view, replacing the current state **without** a backend
  round-trip. Foundational for the live view settings editing flow.
- `loadedViewId` (saved view id) + the `useLoadViewById` hook: drives the Explorer to a **saved**
  view by id (via `useLoadView`, a backend load). Used by the catalog tab. Semantics: `undefined`
  = parent does not drive (internal `SavedViews` UI keeps control), `null` = load the default view,
  `'X'` = load saved view `X`; no-ops while bootstrapping or when already on that view.

**Why:** a dedicated action/prop is needed to apply an externally driven view without conflicting
with the existing `viewId`-based loading flow read at mount.

### 5. View settings state carried by the `explorer` panel, targeted via `explorerPanelDetails`

There is no separate "view settings panel" schema. The state lives as extra fields directly on
`baseExplorerPanelSchema` (`isViewSettingsActive`, `selectedTab`, `currentViewId`,
`targetLibraryId`). Inter-panel addressing is done with an `explorerPanelDetails`
(`{libraryId, panelType, panelId}`) payload carried by the `open-view-settings` event.

**Why:** an earlier design made the volet a distinct panel addressed by a generic `targetPanelId`,
anticipating that injectable sub-panels (Planning/Cadrage) would let the volet target `custom`
(iframe) panels too. That was dropped: folding the state onto the `explorer` panel is simpler and
matches the current scope, where the volet only ever drives an explorer. The naming is therefore
explorer-specific on purpose. Extending the volet to `custom` panels would require revisiting this
choice — see open points (injectable sub-panels are out of scope for this version).

> The `targetPanelId` field still present in the schema (`ItemActionsSchema`) is unrelated: it
> addresses the record panel opened by a row-click action.

## Consequences

- The view settings state lives as extra fields on the existing `explorer` panel schema in
  app-studio (`isViewSettingsActive`, `selectedTab`, `currentViewId`, `targetLibraryId`); it is
  **not** a separate routable panel type and is not rendered inside `PanelContent`.
- `ViewSettingsContainer` (wrapping `PanelViewSettings`) is rendered by `Panel` when the resolved
  `explorer` panel has `isViewSettingsActive === true` **and** the panel is in the foreground
  (`!hasChildPanel && !isPanelInSlider`). Opening a child panel (a record in a `popup`, `slider` or
  `fullpage` — a deeper route match) **closes the volet for good**: `Panel` resets that panel's
  view-settings state in the application context, rather than only hiding it. This keeps the volet
  strictly scoped to the foreground explorer — no stale volet showing another library, no zombie
  state reappearing when the child closes; re-opening is explicit. A `flap` is not a child panel and
  is handled asymmetrically: opening the volet while a flap is **already** open keeps both (the volet
  floats on top of the flap), but opening a flap **while the volet is open** closes the volet (same
  reset). The asymmetry — driven by the flap _opening_ transition, not its presence — avoids a UI
  shift in the flap-then-volet direction. This reset logic lives in the `useViewSettingsAutoClose`
  hook, which uses `useLayoutEffect` (not `useEffect`): the reset runs after DOM mutations but
  before the browser paints, so when a flap opens over an active volet the volet is removed from the
  shared `extraRight` portal before the two can flash on the same frame.
- Positioning: the volet is a **floating** `KitSidePanel` (hover overlay) — it never shifts the panel
  content. When the explorer is hosted in a `popup`/`fullpage` modal it is portaled into the modal's
  `extraRight` zone so it overlays within the modal; at the first navigation level it renders inline.
  When a `flap` is also open, both are shown and the volet floats on top of the (docked) flap.
- The `APPLY_SERIALIZED_VIEW` action and the `currentView` / `loadedViewId` props are foundational
  — nothing else in this EPIC can be built without them.
- The whole feature is behind the `enableViewSettings` Application flag; with it off, app-studio
  wires no callbacks and the Explorer keeps its legacy view settings button.
- AMP consumers of `@leav/ui` are unaffected: all new Explorer props are optional and AMP can
  ignore them without modification.
- Injectable sub-panels (Planning/Cadrage) are explicitly **out of scope** for this version. The
  integration strategy (iframe vs. other) is not yet settled. See open points below.

## Open points

| Subject                                     | Status                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Feature flag activation                     | Implemented as `enableViewSettings` (Application schema); to remove at the end of the EPIC             |
| Admin/user permission check                 | Direct GraphQL call on `libraryId` from `PanelViewSettings` (`getPermissionEditViewOnLibrary.graphql`) |
| View persistence endpoint (GraphQL or REST) | To confirm                                                                                             |
| Injectable sub-panels (Planning/Cadrage)    | Out of scope — strategy not yet settled                                                                |
| AMP compatibility (not on app-studio)       | Blocking for AMP → app-studio migration — to validate w/ Sam                                           |
| Shared view scope                           | Currently global; per-group sharing planned for a later version                                        |
