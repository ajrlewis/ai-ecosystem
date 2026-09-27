# AI Ecosystem

AI Ecosystem is the product workspace for Knowledge and Agent.

- [Knowledge](products/knowledge/README.md) stores governed organisational knowledge and reusable
  agent Skills.
- [Agent](products/agent/README.md) is the agent runtime that reasons and acts using Knowledge and
  external tools.

Agent currently has a FastAPI service, Next.js conversation application, typed Knowledge HTTP client,
provider-neutral deterministic and OpenAI model adapters, and its own durable conversation store.
Agent execution and production identity remain intentionally deferred.

The products are developed together but remain independently deployable. Agent integrates with
Knowledge through Knowledge's public HTTP or MCP interfaces and never through Knowledge's database.

```text
products/
├── knowledge/
│   ├── apps/
│   ├── packages/
│   └── tests/
└── agent/
    ├── apps/
    ├── tests/
    └── README.md
```

Root workspace files coordinate shared development commands and local infrastructure. Product
implementations, tests, migrations, content, and product-specific documentation remain inside
their product directory.

The Compose service keys make product ownership explicit: `knowledge-postgres`, `knowledge-migrate`,
`knowledge-api`, `knowledge-web`, `agent-db-init`, `agent-migrate`, `agent-api`, and `agent-web`.

## Quick start with Docker

Docker Compose runs PostgreSQL, migrations, both APIs, and both web applications. From the
repository root:

```bash
docker compose up -d --build
docker compose exec -T knowledge-api knowledge-seed-northstar
docker compose exec -T knowledge-api knowledge-seed-defaults \
  --organization northstar \
  --policy "Northstar organization-wide" \
  --steward northstar-alex \
  --audit-principal northstar-cortex
docker compose ps
```

Both seed commands are safe to rerun. The Northstar seed supplies fictional knowledge,
principals, and access groups; the defaults seed supplies the repository-owned Skills.
The legacy `northstar-cortex` subject is intentionally retained as the seeded audit principal so
existing installations keep the same durable Principal identity after the product rename.

| Service | URL | Expected result |
| --- | --- | --- |
| Knowledge console | <http://127.0.0.1:3000/sign-in> | Local sign-in page |
| Knowledge API health | <http://127.0.0.1:8000/health> | Healthy API response |
| Knowledge API docs | <http://127.0.0.1:8000/docs> | Interactive OpenAPI documentation |
| Knowledge MCP | <http://127.0.0.1:8000/mcp/> | Streamable HTTP endpoint (not a browser UI) |
| Agent workspace | <http://127.0.0.1:3100/sign-in> | Local sign-in page |
| Agent API health | <http://127.0.0.1:8100/health> | Healthy API response |
| Agent API docs | <http://127.0.0.1:8100/docs> | Interactive OpenAPI documentation |

The disposable Compose credentials are:

Both sign-in forms list the same synthetic users. Their disposable development password is
`ai-ecosystem-local-dev`: `alex`, `morgan`, and `taylor`.

Sign in to Knowledge to browse the seeded Pages, provenance, Skills, and search results. Sign in to
Agent to create a durable local conversation or query the seeded Knowledge knowledge through Agent.
The default deterministic model is hermetic, so this flow does not need an external model key.

For quick command-line smoke tests:

```bash
curl --fail http://127.0.0.1:8000/health
curl --fail http://127.0.0.1:8100/health
curl --fail \
  -H 'Authorization: Bearer knowledge-local-dev' \
  http://127.0.0.1:8000/auth/context
```

### Seeded access profiles

The development adapter signs provider-neutral subject, display-name, tenant, scope, app-role,
principal, and group claims. `knowledge.api` and `agent.api` grant API access;
`knowledge.steward` permits Knowledge mutations and `conversation.user` permits Agent conversation
operations. Knowledge groups remain resource-policy claims, not roles. Northstar includes:

| Profile | Principal ID | Groups | Access exercised |
| --- | --- | --- | --- |
| Alex Rowan (`alex`) | `7f180c45-c2f9-5f9d-b715-bf68f4ced724` | Investment team (`8bde0934-4daa-5afa-a9c3-24e849557486`) | Steward; organization-wide and investment-team content |
| Morgan Lee | `52d13c34-a996-52f3-b4e9-33daf8b0fd72` | Portfolio operations (`ed74569a-d5ea-5cb2-a321-bbd23825d652`) | Organization-wide content; investment-team content is denied |
| Taylor Quinn | `b6fe5b54-0d90-5c69-8824-cdb9f04f1d03` | None (`[]`) | Organization-wide content; investment-team content is denied |

Choose a different user at either sign-in form; Compose does not need to be recreated. Signed,
HTTP-only sessions contain claims but no passwords or backend bearers. The opaque bearer remains
for local MCP and non-browser integration tests. This adapter is development-only and neither
implements OAuth nor issues production tokens; Microsoft Entra remains the intended production
identity provider.

Inspect logs with `docker compose logs -f`, and stop the stack while preserving its database with
`docker compose down`. Add `--volumes` only when you intentionally want to delete the local
database and start clean.
