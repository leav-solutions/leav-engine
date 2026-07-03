# mcp-runtime

MCP server that exposes LEAV APIs as tools for AI agents (Claude).

It wraps the existing LEAV APIs (GraphQL, REST, tRPC) without modifying them.
An agent connects to this server and can call LEAV directly — queries, mutations, record management — using natural language prompts.

## Architecture

```
Claude (AI agent)
      │  MCP protocol (HTTP Streamable / SSE)
      ▼
mcp-runtime  (:3000/mcp)
      │  HTTP + apiKey
      ▼
LEAV core  (GraphQL, REST, tRPC)
```

**Stateless design:** each MCP request creates a fresh server instance. No session state is stored in memory, so any K8s pod can handle any request.

**Auth:** every request to `/mcp` must carry the user's personal LEAV `apiKey` as an
`Authorization: ApiKey <apiKey>` header. A custom `ApiKey` scheme is used rather than `Bearer`: a
LEAV apiKey is not an OAuth 2.0 access token, and the MCP spec reserves `Authorization: Bearer` for a
future OAuth flow. A middleware validates the key against the LEAV core (a minimal `me` query —
reusing core's own auth) and rejects the request with `401` if the key is missing, invalid or
expired. The validated key is then forwarded as `?key=xxx` to core on every tool call, so every
action is scoped to the user's own permissions and produces a traceable audit trail — no shared
service account. The key is **not** a tool input: the agent never sees or handles it.

## Running locally

The service runs inside the shared Docker Compose stack, but it is gated behind the `mcp` profile — it is not started by the default `up`. Pass `--profile mcp` to launch it alongside the other LEAV services.

```bash
# From the repo root
docker compose -f docker/docker-compose.yml --profile mcp up -d
```

`mcp-runtime` is then available at `http://mcp.leav.localhost` (routed by Traefik).

> If you set up the project before this service was added, make sure `mcp.leav.localhost` is in your `/etc/hosts`:
>
> ```
> 127.0.0.1    mcp.leav.localhost
> ```

## Testing the connection

**Liveness check:**

```bash
curl http://localhost:44444/health
```

> The monitoring server runs on port 44444 (inside the container), not behind Traefik.
> Use `docker exec` or a direct port mapping to reach it locally.

**MCP handshake** — sends an `initialize` message the same way an agent would:

```bash
curl -X POST http://mcp.leav.localhost/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: ApiKey <your-leav-apiKey>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "curl-test", "version": "1.0" }
    }
  }'
```

The server responds with its capabilities and the list of available tools.

## Connecting Claude to the server

**Claude Code CLI:**

```bash
claude mcp add leav-runtime --transport http http://mcp.leav.localhost/mcp \
  --header "Authorization: ApiKey <your-leav-apiKey>"
```

Add `--scope user` to make it available across all your projects.

Then restart your Claude Code session — MCP servers are loaded at startup.

**Claude Desktop** — add to your MCP config file:

```json
{
    "mcpServers": {
        "leav-runtime": {
            "url": "http://mcp.leav.localhost/mcp",
            "headers": {
                "Authorization": "ApiKey <your-leav-apiKey>"
            }
        }
    }
}
```

Claude will discover the available tools automatically via the MCP handshake.

## MCP tools

### `graphql_schema_guide`

Returns a static, hand-written cookbook of the LEAV core GraphQL API (read libraries/records/views,
create records/attributes/libraries, save values) with ready-to-use examples and the key enums.
Takes no input.

The agent is told (via the `graphql_query` / `graphql_mutation` descriptions) to call this **first**
and to **never run schema introspection** (`__schema` / `__type`): the generic API is static and
identical on every LEAV instance, so introspecting it only wastes the agent's context. Only a
library's own attributes are dynamic, and those are discovered through the `libraries` / `attributes`
queries the guide documents.

The cookbook lives in `src/tools/schemaGuide.ts` as a string constant (bundled by `tsc`, no extra
build step). **When the core GraphQL schema changes** (`apps/core/src/app/core/**/*App.ts`), update
that file to keep the examples accurate.

### `graphql_query` / `graphql_mutation`

Execute a read-only query (`graphql_query`) or a mutation (`graphql_mutation`) against the LEAV
instance.

| Input       | Type   | Required | Description               |
| ----------- | ------ | -------- | ------------------------- |
| `query`     | string | yes      | GraphQL query or mutation |
| `variables` | object | no       | Query variables           |

> The `apiKey` is **not** a tool input — it is authenticated once per request via the
> `Authorization: ApiKey <apiKey>` header (see [Auth](#architecture)) and forwarded to core internally.

> `rest` and `trpc` tools are planned (LEAVC-888) and will be registered in `src/index.ts`.

## Environment variables

| Variable                 | Required | Default | Description                                                   |
| ------------------------ | -------- | ------- | ------------------------------------------------------------- |
| `CORE_URL`               | yes      | —       | Base URL of the LEAV core (e.g. `http://core.leav.localhost`) |
| `PORT`                   | no       | `3000`  | HTTP port the MCP server listens on                           |
| `MONITORING_SERVER_PORT` | no       | `44444` | HTTP port for the monitoring server (`/health`, `/metrics`)   |

> `TRPC_PLUGINS_URL` will be added when the `trpc` tool is implemented.

## Endpoints

**MCP server** (port `PORT`, default 3000 — behind Traefik):

| Method       | Path   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `POST / GET` | `/mcp` | MCP protocol endpoint (tool calls + SSE) |

**Monitoring server** (port `MONITORING_SERVER_PORT`, default 44444 — internal only):

| Method | Path       | Description                    |
| ------ | ---------- | ------------------------------ |
| `GET`  | `/health`  | K8s liveness / readiness probe |
| `GET`  | `/metrics` | Prometheus metrics             |

## Tests

```bash
yarn test             # vitest run (unit)
yarn test:watch       # vitest watch
```

## Build

```bash
yarn build            # compiles to dist/
yarn start            # runs dist/index.js
```
