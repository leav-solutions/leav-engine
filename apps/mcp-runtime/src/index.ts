import packageJson from '../package.json';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, {type Request, type Response} from 'express';
import {logger} from '@leav/logger';
import {monitoringServer} from '@leav/monitoring-server';
import {
    createGraphqlHandler,
    graphqlInputSchema,
    graphqlMutationToolDescription,
    graphqlMutationToolName,
    graphqlQueryToolDescription,
    graphqlQueryToolName,
} from './tools/graphql';
import {
    graphqlSchemaGuideInputSchema,
    graphqlSchemaGuideToolDescription,
    graphqlSchemaGuideToolName,
    schemaGuideHandler,
} from './tools/schemaGuide';
import {createApiKeyValidator, createAuthMiddleware} from './auth/apiKeyAuth';

const PORT = Number(process.env.PORT ?? 3000);
const CORE_URL = process.env.CORE_URL;

// Fail fast at startup: without CORE_URL the server has nothing to proxy to
if (!CORE_URL) {
    logger.error('Missing required environment variable: CORE_URL');
    process.exit(1);
}

const app = express();
// express.json() parses the request body — required for MCP POST messages
app.use(express.json());

// Every /mcp request must carry a valid LEAV apiKey as `Authorization: ApiKey <apiKey>`.
// The key is validated against core (reusing core's own auth) before any MCP handling, and the
// validated key is stashed on res.locals for the per-request tool handlers to forward to core.
const authenticate = createAuthMiddleware(createApiKeyValidator(CORE_URL));

// MCP endpoint — handles both POST (tool calls) and GET (SSE event stream for notifications)
// One new McpServer + transport pair is created per request: this is intentional.
// Stateless design means any K8s pod can handle any request without shared session state.
// The cost is negligible: McpServer is just a JavaScript object with a tool registry.
app.all('/mcp', authenticate, async (req: Request, res: Response) => {
    // Guaranteed present by the authenticate middleware above.
    const apiKey = res.locals.apiKey as string;

    logger.debug('MCP request received', {
        method: req.method,
        // JSON-RPC method (e.g. tools/call, tools/list) — only present on POST bodies
        rpcMethod: req.body?.method,
        toolName: req.body?.params?.name,
        rpcId: req.body?.id,
        userAgent: req.get('user-agent'),
    });

    // sessionIdGenerator: undefined opts into stateless mode — the SDK will not set a
    // Mcp-Session-Id header and will not expect one on subsequent requests
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    const server = new McpServer({
        name: 'mcp-runtime',
        version: packageJson.version ?? '0.0.0',
    });

    // Register every tool on this server instance before connecting.
    // rest and trpc tools will be added here once implemented (LEAVC-888).

    // Static schema cookbook: lets the agent learn the generic API without introspecting it.
    server.registerTool(
        graphqlSchemaGuideToolName,
        {description: graphqlSchemaGuideToolDescription, inputSchema: graphqlSchemaGuideInputSchema},
        schemaGuideHandler,
    );

    server.registerTool(
        graphqlQueryToolName,
        {description: graphqlQueryToolDescription, inputSchema: graphqlInputSchema},
        createGraphqlHandler(CORE_URL, apiKey),
    );

    server.registerTool(
        graphqlMutationToolName,
        {description: graphqlMutationToolDescription, inputSchema: graphqlInputSchema},
        createGraphqlHandler(CORE_URL, apiKey),
    );

    try {
        await server.connect(transport);
        // handleRequest reads req.body (already parsed by express.json()), writes to res
        await transport.handleRequest(req, res, req.body);
    } finally {
        // Always close the server to release the transport — prevents memory leaks
        // when the process handles many requests over its lifetime
        await server.close();
    }
});

app.listen(PORT, () => {
    logger.info(`mcp-runtime listening on :${PORT}`, {coreUrl: CORE_URL});
});

monitoringServer()
    .init()
    .catch(err => logger.error(`Monitoring server failed to start: ${err.message}`));
