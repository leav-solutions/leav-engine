# Explorer — View Settings Panel Architecture

Date: 01/06/2026 — revised 22/06/2026 (LEAVC-851)

## Status

Accepted

> **Revision 22/06/2026 (LEAVC-851).** The implementation converged on a stronger model than the
> original draft: ExplorerV2 became a **pure controlled consumer** of a single serialized view, with
> app-studio as the sole source of truth. The two-prop design (`currentView` + `loadedViewId`), the
> `defaultViewSettings` mount-time read, the `APPLY_SERIALIZED_VIEW` action, and the entire legacy
> in-place view-settings path were dropped. Decisions #1–#5, Consequences and Open points below
> reflect the shipped architecture.

> **Revision 30/06/2026 (LEAVC-810) — user filters shipped through the controlled view.** User filters
> travel through `currentView.filters` in a **lean serializable form** (`SerializedFilter` =
> `{attributes, condition, values, pinned}`; a full `UIFilter` embeds non-serializable GraphQL data). No
> shared filter context (decision #2): **hub & spoke** — `CurrentViewStore` is the hub, the volet
> (`VoletFiltersProvider`) and ExplorerV2's internal store are two decoupled spokes that each rebuild a
> rich `UIFilter` store from the lean hub via the shared `useControlledFilterStore` and write back only
> lean. The #3 write-back is implemented: edits/removals flow via `onFiltersChange` (echo-suppressed),
> reconciled into the hub by `useViewSettingsProps` (`useNotifyFiltersChange` removed). Transport is still
> **native** React (messenger wiring for iframes deferred, but the lean contract is message-ready). Closes
> the "User filters in the volet" open point.

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
the shortcut buttons (and toolbar filter removal, `canRemoveFilters`) are gated by
`canManageViewSettings` — i.e. the mere **presence of the `onViewSettingsShortcutClick` callback**.
The earlier `view.enableConfigureView` flag no longer drives this: it was the gate while a legacy
in-place button still coexisted with the shortcuts; that legacy path is now removed (see #3).

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
- `view-settings-select-view` (view settings catalog → app-studio): selects a saved view by id.
  It no longer drives a `loadedViewId` prop on the Explorer; instead the `CurrentViewStoreProvider`
  (see #4) handles it, fetches the viewV2 and re-feeds the serialized result through `currentView`.

The Explorer → outside filter notification (`onFiltersChange`) **is** implemented: the
`useNotifyFiltersChange` hook fires the callback whenever the toolbar's (non-hidden) filters or
operator change. The reverse direction — app-studio writing those changes back into `currentView` —
is still a TODO (deferred ticket: user filters in the volet are WIP).

### 3. Explorer exposes generic callbacks — it does not know app-studio

The Explorer does not reference app-studio, the messenger, or the view settings panel. It exposes
optional callbacks under `defaultCallbacks.viewSettings` that app-studio wires up:

- `onViewSettingsShortcutClick({settingName, viewId})` — a shortcut click on the Explorer toolbar
  requesting the view settings panel to open on a given tab (`settingName: ViewSettingsTab`)
- `onFiltersChange` — notifies the outside world of a filter change from the Explorer toolbar
- `closeViewSettings` — lets the outside world close the panel

The presence of `onViewSettingsShortcutClick` enables the shortcut buttons (`useOpenViewSettingsV2`)
and the toolbar's filter-removal affordance. The **legacy in-place view-settings path is gone**:
`useOpenViewSettings`, the in-Explorer `SidePanel`/`useEditSettings`, the v1 `SavedViews` list and
the old `viewSettingsReducer` were deleted. There is no longer a toggle between a legacy button and
the shortcuts — only the app-studio-driven volet remains.

**Why:** the Explorer must remain usable outside the panel system (e.g. AMP). All new props and
callbacks added to Explorer **must remain optional** (`?:`); with none wired, the Explorer simply
renders no view-settings affordance.

### 4. A single controlled prop, `currentView` — ExplorerV2 is a pure consumer; app-studio owns the view

ExplorerV2 **never fetches a viewV2 itself**. It receives the whole display config + filters through
one optional controlled prop, `currentView: SerializedView`, and merges it (via `useMemo`) on top of
the only state it still owns — the _ephemeral_ state (mass selection, page size, fulltext search) and
the async-resolved `libraryId`/`entrypoint`, held by a slimmed-down `useViewSettingsReducer`. All
data queries stay skipped until `currentView` is received (`isViewReady`). This replaces the original
two-prop design:

- `loadedViewId` and its `useLoadViewById` / `useLoadView` backend-loading hooks: **removed**.
- `defaultViewSettings` (read once at mount) and `ignoreViewByDefault`: **removed**.
- the `APPLY_SERIALIZED_VIEW` reducer action: **removed** (the merge is now a plain `useMemo`, not a
  dispatch).

app-studio is the **single source of truth**. The `CurrentViewStoreProvider` — mounted once per
explorer panel in `Panel`, _above_ the conditionally-rendered volet so editing state survives the
volet closing/reopening — resolves the current viewV2 (id precedence:
`view-settings-select-view` selection → `lastUsedView` → configured `viewId`), fetches it
(`useGetViewV2Query`, `errorPolicy: 'ignore'`), and exposes it serialized via `CurrentViewContext`.
`useViewSettingsProps` reads that `serializedView` to feed `currentView`; the volet reads it via
`useCurrentView`. Conversion is the pure `viewV2ToSerializedView`.

`SerializedView` (exported as `SerializedViewV2`) is now an explicit standalone contract
(`viewId`, `viewLabels`, `viewType`, `attributesIds`, `sort`, `filters`, `filtersOperator`), no longer
derived from `IViewSettingsState` / the old `DefaultViewSettings`. Its `filters` carry **both** user
filters **and** the masked pre-filters (`hidden: true`, e.g. the link pre-filter): the Explorer applies
the masked ones to its requests (`hiddenFilters`) but excludes them from the filters UI.

**Why:** a single controlled view eliminates the dual-ownership ambiguity of the draft (Explorer
loading some views, the panel pushing others) and a class of races between the mount-time `viewId`
flow and externally-driven updates. Unsaved edits must survive the volet reopening, which requires the
source of truth to live above the volet, in app-studio — not inside the Explorer.

### 5. View settings state carried by the `explorer` panel, targeted via `explorerPanelDetails`

There is no separate "view settings panel" schema. The state lives as extra fields directly on
`baseExplorerPanelSchema` (`isViewSettingsActive`, `selectedTab`, `currentViewId`,
`targetLibraryId`). Inter-panel addressing is done with an `explorerPanelDetails`
(`{libraryId, panelType, panelId}`) payload carried by the `open-view-settings` event.

The volet operates on the library the explorer **displays** — `currentLibraryId` in the event is set
to `displayedLibraryId` (from `retrievePanelDetails`), not the owner library the panel is configured
under. For a record-panel link explorer these differ: the displayed library is the linked library
carried on the panel (`panel.libraryId`), while the owner library (`libraryId`) only locates the panel
in the config. `CurrentViewStoreProvider` additionally guards against a _foreign_ view — a resolved
viewV2 whose `library` ≠ `displayedLibraryId` is never applied and drops the Explorer to its empty
view (protects against a stale/cross-library view id carried over from another panel).

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
- The single `currentView` prop + the app-studio-owned `CurrentViewStoreProvider` are foundational
  — nothing else in this EPIC can be built without them. ExplorerV2 no longer loads any view by
  itself; data queries skip until `currentView` arrives.
- The whole feature is behind the `enableViewSettings` Application flag; with it off, app-studio
  wires no callbacks and renders no volet, and the Explorer shows no view-settings affordance (the
  legacy in-place button no longer exists).
- AMP consumers of `@leav/ui` are unaffected: all new Explorer props are optional and AMP can
  ignore them without modification.
- Injectable sub-panels (Planning/Cadrage) are explicitly **out of scope** for this version. The
  integration strategy (iframe vs. other) is not yet settled. See open points below.

## Open points

| Subject                                                    | Status                                                                                                                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature flag activation                                    | Implemented as `enableViewSettings` (Application schema); to remove at the end of the EPIC                                                                                                               |
| Admin/user permission check                                | Direct GraphQL call on `libraryId` from `PanelViewSettings` (`getPermissionEditViewOnLibrary.graphql`)                                                                                                   |
| View persistence endpoint (GraphQL or REST)                | To confirm                                                                                                                                                                                               |
| User filters in the volet / `onFiltersChange` write-back   | **Done (LEAVC-810)** — hub & spoke via `useControlledFilterStore`; lean filters in `currentView`; `onFiltersChange` reconciled into the hub. Real iframe postMessage push deferred (see 30/06 revision). |
| Multi-attribute sort & filters in `viewV2ToSerializedView` | Shipped: pinned `sort` (LEAVC-851) and pinned lean `filters` (LEAVC-810) are serialized                                                                                                                  |
| Injectable sub-panels (Planning/Cadrage)                   | Out of scope — strategy not yet settled                                                                                                                                                                  |
| AMP compatibility (not on app-studio)                      | Blocking for AMP → app-studio migration — to validate w/ Sam                                                                                                                                             |
| Shared view scope                                          | Currently global; per-group sharing planned for a later version                                                                                                                                          |
