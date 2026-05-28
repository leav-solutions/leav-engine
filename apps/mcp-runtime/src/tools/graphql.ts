import {z} from 'zod';

export const graphqlQueryToolName = 'graphql_query' as const;
export const graphqlMutationToolName = 'graphql_mutation' as const;

export const graphqlQueryToolDescription =
    'Execute a read-only GraphQL query against the LEAV instance. Use this for fetching data.';

export const graphqlMutationToolDescription =
    'Execute a GraphQL mutation against the LEAV instance. ' +
    'IMPORTANT: always show the user the full mutation and variables, and ask for explicit confirmation before calling this tool.';

// Zod schema used by McpServer.registerTool() to validate inputs and generate the JSON Schema
// exposed to the AI agent. Each field description is shown to the agent as documentation.
export const graphqlInputSchema = {
    query: z.string().describe('GraphQL query or mutation to execute'),
    variables: z.record(z.string(), z.unknown()).optional().describe('Query variables'),
    // apiKey is an input (not an env var) so each user's requests are scoped to their own
    // LEAV permissions — the same key they use in the LEAV UI. This also gives full
    // traceability: every action taken by the agent is attributed to the user, not a
    // shared service account.
    apiKey: z.string().describe('LEAV API key for authentication and permission scoping'),
};

export type GraphqlToolInput = {
    query: string;
    variables?: Record<string, unknown>;
    apiKey: string;
};

// Factory instead of a plain function so coreUrl can be injected at startup
// (read from env in index.ts) rather than read inside the handler on every call.
// This also makes the handler trivially testable: pass any URL in the test, no process.env mocking.
export const createGraphqlHandler =
    (coreUrl: string) =>
    async ({query, variables, apiKey}: GraphqlToolInput) => {
        // URL constructor handles trailing slashes and encoding — safer than string concatenation
        const url = new URL('/graphql', coreUrl);
        url.searchParams.set('key', apiKey);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // variables is omitted from the body when undefined (JSON.stringify drops undefined values)
            body: JSON.stringify({query, variables}),
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed with status ${response.status}`);
        }

        const data = await response.json();

        // MCP tool handlers must return { content: ContentBlock[] }.
        // 'text' as const is required: without it TypeScript widens the type to string,
        // which is incompatible with the SDK's discriminated union.
        return {
            content: [{type: 'text' as const, text: JSON.stringify(data, null, 2)}],
        };
    };
