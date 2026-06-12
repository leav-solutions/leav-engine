import {globSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

export const graphqlSchemaGuideToolName = 'graphql_schema_guide' as const;

export const graphqlSchemaGuideToolDescription =
    'Returns a static cookbook of the LEAV core GraphQL API: the common queries and mutations ' +
    '(read libraries, records and views; create records, attributes and libraries; save values) ' +
    'with ready-to-use examples, variables and the key enums. ' +
    'Call this FIRST, before writing any GraphQL. It replaces schema introspection (__schema / __type) ' +
    'for the generic part of the API, which is identical on every LEAV instance. ' +
    "Only a library's own attributes are dynamic — discover those with the libraries/attributes " +
    'queries documented here, never with introspection.';

// The tool takes no input: the cookbook is static and identical for every caller. An empty
// inputSchema tells the MCP SDK to expose a tool with no arguments.
export const graphqlSchemaGuideInputSchema = {};

// The guide content lives in Markdown files under apps/mcp-runtime/guides/ (the app root, not src/
// or dist/), so it can be edited as plain Markdown and enriched simply by dropping new .md files in
// — no code change needed. They are organised in sub-folders: common/ holds protocol-agnostic LEAV
// concepts shared by every tool guide, and one folder per tool (graphql/, later trpc/, rest/) holds
// the syntax specific to that API. The directory is shipped into the Docker image as-is (see the
// rsync include in docker/DOCKERFILES/build/generic.Dockerfile); nothing transits through dist/.
// guides/ sits two levels above this file in every context — src/tools/ in dev (tsx) and tests
// (vitest), dist/tools/ in production — so __dirname/../../guides resolves correctly each time.
// When the core schema changes (apps/core/src/app/core/**/*App.ts), update the .md files to match.
const guidesRoot = join(__dirname, '..', '..', 'guides');

// Read once at module load (not per request). Globs every .md of each sub-folder (filename order
// within a folder, recursing if a folder branches), folders concatenated in the order passed. Each
// file becomes its own MCP text block (one block = one doc). Prefix files with 01-, 02-… to control
// ordering inside a folder. A future tRPC/REST guide reuses common/ via e.g. loadGuides('common', 'trpc').
const loadGuides = (...subDirs: string[]): string[] =>
    subDirs.flatMap(subDir => {
        const dir = join(guidesRoot, subDir);
        return globSync('**/*.md', {cwd: dir})
            .sort()
            .map(file => readFileSync(join(dir, file), 'utf-8'));
    });

export const graphqlSchemaGuideContents = loadGuides('common', 'graphql');

// No coreUrl needed: the handler returns static content. Plain async function (not a factory like
// createGraphqlHandler) because there is nothing to inject.
export const schemaGuideHandler = async () => ({
    content: graphqlSchemaGuideContents.map(text => ({type: 'text' as const, text})),
});
