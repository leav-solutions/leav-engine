# Architecture Decision Record

**/!\ All decisions below are specific to this repo.**

## Format

Each ADR lives in its own `ADR-XXX-<slug>.md` file and follows the structure below.
Sections marked _(optional)_ are added only when relevant.

```markdown
# <Decision title>

Date: dd/mm/yyyy

## Status

Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context

What is the problem, the forces at play, the constraints? Why do we need to decide now?

## Options _(optional)_

When choosing between libraries/approaches, list each one with Pros/Cons.

1. [Option A](https://…)
    - Pros:
        - …
    - Cons:
        - …

## Decision

The decision taken, in active voice ("We'll use…", "We store…"). Explain the rationale.

## Consequences

What becomes true, constrained, or required once this decision is applied —
positive and negative. The most valuable section to re-read months later.

## Sources _(optional)_

Links backing the decision (issues, benchmarks, docs).

## Open points _(optional)_

For decisions taken mid-EPIC, a table of subjects still to settle.

| Subject | Status |
| ------- | ------ |
| …       | …      |
```

## Decisions log

| #   | Title                                                                                     | Status   |
| --- | ----------------------------------------------------------------------------------------- | -------- |
| 001 | [Drag and drop library](ADR-001-dnd.md)                                                   | Accepted |
| 002 | [E2E forms test](ADR-002-tests-e2e-forms.md)                                              | Accepted |
| 003 | [Documentation](ADR-003-documentation.md)                                                 | Accepted |
| 004 | [Plugins real-time computed data architecture](ADR-004-plugins-realtime-computed-data.md) | Accepted |
| 005 | [GraphQL plugin types in generated files](ADR-005-graphql-plugins-types.md)               | Accepted |
| 006 | [Explorer view configuration panel architecture](ADR-006-explorer-views-config-panel.md)  | Accepted |
