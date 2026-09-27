# Next Session

## Status — 2026-09-27

The development-only multi-user authentication slice from the previous handoff has been completed
and merged. The repository is still named `mind`, and its two independently deployable products
are still named Brain and Cortex throughout directories, packages, imports, services,
configuration, databases, tests, generated artifacts, documentation, and development credentials.

The naming discussion has converged on a neutral, cloneable ecosystem identity:

```text
ai-ecosystem/
└── products/
    ├── knowledge/
    └── agent/
```

The broader target architecture for shared packages, future products, deployment composition, and
branding remains documented separately in `NAMING.md`. This session should perform only the large
repository and product rename needed to establish that foundation.

## Objective

Rename the workspace from Mind to AI Ecosystem, Brain to Knowledge, and Cortex to Agent without
changing product behavior, weakening product boundaries, or combining their independently owned
state and deployment lifecycles.

The intended mapping is:

```text
mind             -> ai-ecosystem
products/brain   -> products/knowledge
products/cortex  -> products/agent
Brain            -> Knowledge
Cortex           -> Agent
```

Suggested repository description:

> AI Ecosystem is a self-hosted foundation for building enterprise AI products around shared,
> governed organisational knowledge and reusable agent capabilities.

`ai-ecosystem` is intentionally neutral so another organisation can clone and brand it:

```text
ai-ecosystem        # upstream
acme-ai-ecosystem   # branded deployment or fork
```

## Product boundaries to preserve

- **Knowledge** owns durable organisational knowledge, reusable Skills, provenance, access
  control, versions, and retrieval.
- **Agent** owns conversations, reasoning, model interaction, tool use, workflows, and execution.
- Knowledge and Agent remain independently deployable peer products.
- Agent consumes Knowledge only through public HTTP or MCP interfaces, never through Knowledge's
  database or internal packages.
- Agent is one Knowledge consumer. Future products may own specialised agents while consuming the
  same governed Knowledge and Skills.
- The rename must not introduce a parent-child structure such as `knowledge/{knowledge,agent}`.

## Rename inventory

### Repository and directories

- Rename `products/brain` to `products/knowledge` with history-preserving Git moves.
- Rename `products/cortex` to `products/agent` with history-preserving Git moves.
- Update root workspace manifests, scripts, ignore rules, Docker build contexts, and documentation
  paths.
- Treat the local checkout directory and GitHub repository rename as separate operations. Renaming
  the remote repository or changing remote settings requires explicit maintainer authorization.

### Python and Node packages

Rename Python distributions, import namespaces, commands, and workspace entries consistently. The
exact final mapping should be inventoried before edits, but the intended pattern is:

```text
brain-*        -> knowledge-*
brain_*        -> knowledge_*
cortex-*       -> agent-*
cortex_*       -> agent_*
@brain/web     -> @ai-ecosystem/knowledge-web
@cortex/web    -> @ai-ecosystem/agent-web
```

The current Agent-owned Brain HTTP client should become an Agent-owned Knowledge client, for
example:

```text
products/agent/packages/knowledge-client
agent-knowledge
```

Do not create a shared cross-product domain package while renaming it. The client remains owned by
Agent and depends only on Knowledge's public contract.

### Applications, services, and state

Use explicit product ownership in service and application names:

```text
knowledge-api
knowledge-web
knowledge-mcp
knowledge-migrate
knowledge-postgres

agent-api
agent-web
agent-migrate
agent-state
```

Update Compose service keys, health identities, image targets, executable names, database names,
migration configuration, test URLs, local seed commands, and dependency diagnostics. Preserve
separate Knowledge and Agent migration chains and databases.

### Configuration and authentication names

Inventory and rename product-specific environment variables, scopes, roles, cookies, local
bearers, headers, synthetic subjects, and test credentials. Avoid changing their semantics during
the rename.

Pay particular attention to names such as:

```text
BRAIN_*
CORTEX_*
brain.api
cortex.api
brain-session
cortex-session
brain-local-dev
cortex-local-dev
```

Provider-neutral names such as `LOCAL_USERS`, `LOCAL_IDENTITY_SECRET`, and the signed local claim
model should remain neutral when they already describe shared concepts accurately.

### Contracts, generated files, and content

- Update OpenAPI titles, generated Zod validators, checked-in contract paths, and drift scripts.
- Regenerate `uv.lock`, `package-lock.json`, OpenAPI documents, and generated clients from their
  authoritative sources; do not hand-edit generated contracts.
- Update default bundle identities, deterministic UUID namespaces only when identity continuity is
  explicitly understood, seed commands, fixture paths, and synthetic provenance subjects.
- Preserve existing database and content identity where a cosmetic rename does not require a new
  identifier. Avoid silently making idempotent seeds create duplicate entities or versions.
- Keep Northstar fictional and retain its role as an optional example rather than a product or
  tenant name.

### Documentation and agent context

Update the root README, both product specifications, access-control and data-model documents,
architecture guidance, canonical commands, diagrams, examples, and agent-managed context. Search
for both case-sensitive and case-insensitive remnants of Mind, Brain, and Cortex, then review each
remaining occurrence deliberately rather than applying an unchecked global replacement.

Historical references may retain old names when changing them would falsify history. Current
architecture, commands, and product descriptions must use the new names consistently.

## Suggested execution order

1. Inventory every current name across tracked files, package metadata, generated artifacts,
   runtime configuration, persisted identifiers, and remote repository settings.
2. Define and document the complete old-to-new mapping before changing files.
3. Create a dedicated rename branch from an up-to-date `main`.
4. Move the two product directories with `git mv`.
5. Rename Python distributions, modules, commands, npm workspaces, service names, configuration,
   database and migration references, authentication names, tests, and documentation.
6. Regenerate lockfiles and public API contracts using canonical commands.
7. Run focused checks after each product becomes internally consistent, then run the complete
   cross-product verification suite.
8. Search for stale names and classify any intentional historical or compatibility occurrences.
9. Review the final diff for accidental behavior changes, secrets, identity discontinuity, broken
   paths, and generated-file drift.
10. Deliver the rename through a focused pull request. Rename the GitHub repository or local
    checkout only when separately authorized and at the safest point in the delivery sequence.

## Definition of done

- The tracked workspace consistently presents itself as AI Ecosystem with Knowledge and Agent
  products.
- Product directories, Python and npm packages, commands, Compose services, configuration,
  databases, migrations, contracts, tests, and current documentation use the agreed names.
- Knowledge and Agent remain independently deployable with separate state and migrations.
- Agent still accesses Knowledge only through its public HTTP or MCP interfaces.
- Existing seeds remain idempotent and do not create duplicate durable identities solely because
  of the rename.
- Generated contracts and lockfiles have no drift.
- Relevant Ruff, Pyright, pytest, npm lint, typecheck, unit, build, contract, Docker, Compose,
  PostgreSQL integration, and Playwright checks pass.
- A final repository-wide search documents or removes every remaining old-name occurrence.
- `NAMING.md` remains a separate follow-on architecture document; shared package extraction,
  branding consolidation, and unrelated refactors are not folded into the rename.

## Explicitly deferred

- Extracting root `packages/ui`, `packages/brand`, observability, identity, configuration, or test
  packages;
- consolidating the two current frontend themes or creating a shared design system;
- adding the default Brand Skill or structured theme references;
- adding future products, connectors, actions, automation, or an agent runtime;
- changing authorization behavior, identity semantics, database models, or public product
  capabilities;
- production deployment or hosted database changes;
- renaming the GitHub repository, changing remote settings, or moving the local checkout without
  explicit maintainer authorization.
