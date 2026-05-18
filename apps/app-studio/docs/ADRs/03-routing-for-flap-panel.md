# ARDs

## Routing for Flap Panel

### Context

With the triptych pattern `/:recordId/:where/:recordPanelId` established in [ADR 02](./02-routing-all-in-url.md), we need to handle a special UI component: the **flap panel**.

A flap is a lateral side panel that displays contextual information (such as comments or record history) about the current record. It opens by shifting the current panel, without replacing it.

### The Problem

If we tried to extend the triptych pattern directly for the flap, we would face ambiguity:

```
/:recordId/:where/:recordPanelId/:flapRecordId/:flapLibraryId/:flapPanelId
                                  ↑ Ambiguous! Is this a new triptych level or flap data?
```

The router cannot distinguish between:

- A new level of navigation (next triptych: `/:recordId/:where/:recordPanelId`)
- Flap-specific parameters (`/:flapRecordId/:flapLibraryId/:flapPanelId`)

This ambiguity would cause routing conflicts, as the router would match `:flapRecordId` as a new `:recordId` parameter.

### Decision

We introduce a **literal discriminant** `"flap"` before the flap parameters:

```
/:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId
                                  ↑
                              Discriminant prevents ambiguity
```

#### Pattern Structure

The complete pattern with flap becomes:

```
:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId/*
```

Where:

- **flap**: Literal string that acts as a discriminant
- **flapRecordId**: The ID of the record displayed in the flap
- **flapLibraryId**: The library of the record (needed for context)
- **flapPanelId**: The specific flap panel to display (e.g., "comments", "history")

#### Example URLs

```
/123/fullpage/basicInfo/flap/123/products/comments
└─ View record 123's basicInfo panel with comments flap open

/123/fullpage/basicInfo/456/popup/properties/flap/456/info-history
└─ View record 456's properties panel in popup with history flap open
```

### Benefits

1. **Unambiguous routing**: The literal "flap" string clearly separates flap parameters from triptych parameters
2. **Router ordering**: In the route definitions, `recordWherePanelWithFlap` can be matched before `recordWherePanel` without conflicts
3. **Semantic clarity**: The URL explicitly shows that a flap is open

### Implementation Notes

- The `recordWherePanelWithFlap` route **must** be defined before `recordWherePanel` in the router configuration to ensure proper matching
- The flap can be opened on any level of the triptych hierarchy
- The flap pattern does not support recursion (you cannot open a flap within a flap)
