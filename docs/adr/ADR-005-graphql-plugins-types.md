# GraphQL Plugin Types in Generated Files

Date: 08/01/2026

## Status

Accepted

## Context

LEAV development is done in conjunction with **xstream**, an external application that extends
the core with custom GraphQL plugins. Because the `core` GraphQL schema includes xstream plugin
types when running locally, those types are pulled in when running `graphql-codegen` to generate
the `_gqlTypes/index.ts` files across all frontends and e2e tests.

This raises the question of whether plugin-specific types should be excluded from the generated
type files in the LEAV repository.

## Decision

Plugin-specific types **may remain** in the generated `_gqlTypes/index.ts` files. Excluding them
is not required.

Two reasons drive this decision:

1. **Not technically feasible without side effects** — The only way to exclude plugin types from
   codegen output would be to explicitly disable those plugins in the `core` configuration. This
   would affect the running environment, not just type generation, and is therefore not acceptable.

2. **Not relevant to reviews** — The `_gqlTypes/index.ts` files are auto-generated and should not
   be manually reviewed in merge requests. They are marked as `linguist-generated=true` in
   `.gitattributes` so GitLab collapses them by default in MR diffs.

## Consequences

-   `_gqlTypes/index.ts` files may contain types specific to external plugins (e.g., xstream).
    This is expected and acceptable.
-   Reviewers should not flag the presence of plugin-specific types in generated files.
-   The `.gitattributes` entry (`linguist-generated=true`) on `_gqlTypes/index.ts` files is a
    prerequisite for this approach to remain low-noise in MR diffs.
