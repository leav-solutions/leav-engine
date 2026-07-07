import {z} from 'zod';
import {buildCoreGraphqlUrl} from '../coreClient';

export const graphqlQueryToolName = 'graphql_query' as const;
export const graphqlMutationToolName = 'graphql_mutation' as const;

// Both descriptions point to the graphql_schema_guide tool and forbid introspection: the generic
// LEAV API is static and fully documented there, so introspecting __schema only wastes context.
export const graphqlQueryToolDescription =
    'Execute a read-only GraphQL query against the LEAV instance. Use this for fetching data. ' +
    'Before writing a query, call the graphql_schema_guide tool to get the available operations and ' +
    'examples. Do NOT introspect the schema (__schema / __type): the generic API is static and the ' +
    'guide already covers it.';

export const graphqlMutationToolDescription =
    'Execute a GraphQL mutation against the LEAV instance. ' +
    'Before writing a mutation, call the graphql_schema_guide tool for the available operations and ' +
    'examples. Do NOT introspect the schema (__schema / __type): the generic API is static and the ' +
    'guide already covers it. ' +
    'IMPORTANT: always show the user the full mutation and variables, and ask for explicit confirmation before calling this tool.';

// Zod schema used by McpServer.registerTool() to validate inputs and generate the JSON Schema
// exposed to the AI agent. Each field description is shown to the agent as documentation.
// The apiKey is NOT an input: it is authenticated per HTTP request via the Authorization header
// (see src/auth/apiKeyAuth.ts) and injected into the handler below, so the agent never handles it.
export const graphqlInputSchema = {
    query: z.string().describe('GraphQL query or mutation to execute'),
    variables: z.record(z.string(), z.unknown()).optional().describe('Query variables'),
};

export type GraphqlToolInput = {
    query: string;
    variables?: Record<string, unknown>;
};

// Factory instead of a plain function so coreUrl (from env, at startup) and apiKey (from the
// authenticated request, per call) can be injected. Every action stays scoped to the user's own
// LEAV permissions — the same key they use in the UI — giving full traceability, no shared service account.
// This also makes the handler trivially testable: pass any URL/key in the test, no process.env mocking.
export const createGraphqlHandler =
    (coreUrl: string, apiKey: string) =>
    async ({query, variables}: GraphqlToolInput) => {
        const response = await fetch(buildCoreGraphqlUrl(coreUrl, apiKey), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // variables is omitted from the body when undefined (JSON.stringify drops undefined values)
            body: JSON.stringify({query, variables}),
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Remove extensions from the response to avoid leaking internal info
        // and reduce the size of the response. The agent doesn't need this info.
        delete data.extensions;

        // MCP tool handlers must return { content: ContentBlock[] }.
        // 'text' as const is required: without it TypeScript widens the type to string,
        // which is incompatible with the SDK's discriminated union.
        return {
            content: [{type: 'text' as const, text: JSON.stringify(data, null, 2)}],
        };
    };
