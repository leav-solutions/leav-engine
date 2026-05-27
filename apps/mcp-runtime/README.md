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

**Auth:** the user provides their personal LEAV `apiKey` as a tool input. It is forwarded as `?apiKey=xxx` to the LEAV core. This scopes every action to the user's own permissions and produces a traceable audit trail — no shared service account.

## Running locally

The service runs inside the shared Docker Compose stack alongside all other LEAV services — no need to start it separately.

```bash
# From the repo root
docker compose -f docker/docker-compose.yml up -d
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
claude mcp add leav-runtime --transport http http://mcp.leav.localhost/mcp
```

Add `--scope user` to make it available across all your projects.

Then restart your Claude Code session — MCP servers are loaded at startup.

**Claude Desktop** — add to your MCP config file:

```json
{
    "mcpServers": {
        "leav-runtime": {
            "url": "http://mcp.leav.localhost/mcp"
        }
    }
}
```

Claude will discover the available tools automatically via the MCP handshake.

## MCP tools

### `graphql`

Execute a GraphQL query or mutation against the LEAV instance.

| Input       | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| `query`     | string | yes      | GraphQL query or mutation                     |
| `variables` | object | no       | Query variables                               |
| `apiKey`    | string | yes      | LEAV API key (scopes permissions to the user) |

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
