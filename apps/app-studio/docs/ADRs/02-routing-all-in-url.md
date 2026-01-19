# ARDs

## Move from Query Params to Full URL-based Routing

### Context

After implementing the initial routing solution using query parameters (see [ADR 01](./01-routing-query-params.md)), we
encountered several limitations:

-   Query parameters make the URL harder to parse and understand at a glance
-   The navigation structure is not clearly represented in the URL
-   Deep linking to specific states becomes complex

### Needs

We need to give data to panels (such as the selected record) while maintaining:

-   A clear, hierarchical URL structure
-   Full shareability via URL
-   Proper browser history navigation
-   Deep linking capabilities
-   A generic and recursive pattern that works for any depth of navigation

### The Triptych Pattern

#### Structure

We adopt a **triptych pattern** that repeats recursively in the URL: `/:recordId/:where/:recordPanelId`

Each triptych represents:

1. **recordId**: The identifier of the current record being viewed
2. **where**: A semantic location/context indicator (e.g., "fullpage", "popup", "slider")
3. **recordPanelId**: The panel ID being displayed for this record

#### Example URLs

-   `/123/fullpage/basicInfo` - View record 123's with basicInfo panel in fullpage
-   `/123/fullpage/basicInfo/456/fullpage/properties` - View record 456's properties panel in fullpage
-   `/123/fullpage/basicInfo/456/popup/properties` - View record 456's properties panel in popup and view bellow record
    123's basicInfo panel

### Recursive Nature

The pattern is **fully recursive and generic**:

-   Each triptych can be followed by another triptych
-   Nesting depth is browser URL length limitation

```
/:recordId/:where/:panelId
  ↳ /:childRecordId/:where/:childPanelId
      ↳ /:grandchildRecordId/:where/:grandchildPanelId
          ↳ ... (continues recursively)
```

### Decision

We will use the **triptych pattern** `/:recordId/:where/:recordPanelId` repeated recursively in the URL.
