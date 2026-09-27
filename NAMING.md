# AI Ecosystem Target Architecture

The dedicated repository and product rename from Mind/Brain/Cortex to AI
Ecosystem/Knowledge/Agent is scoped in `NEXT_SESSION.md`. This document intentionally remains
separate: it records the broader architecture that can follow after the rename rather than
expanding that migration with shared-package extraction or product redesign.

## Future product model

The ecosystem can grow without changing the core naming:

```text
ai-ecosystem/
└── products/
    ├── knowledge/
    ├── agent/
    ├── analytics/
    ├── support/
    ├── integrations/
    └── automation/
```

Future products can expose public APIs or MCP interfaces. Agent may interact with them, but they
remain independent products.

Something should become a separate product when it has meaningful independent boundaries, such
as:

- its own domain state;
- an independent deployment lifecycle;
- its own security boundary;
- a public contract;
- usefulness without the general Agent product.

API or MCP exposure alone does not necessarily justify making something a product.

## Shared frontend direction

The current frontends do **not** share a theme or design-system package.

Current state:

- Brain/Knowledge has typed runtime themes and semantic CSS variables in
  `products/brain/apps/web/lib/theme.ts`.
- It includes `brain` and fictional `northstar` palettes.
- Cortex/Agent has a separate hard-coded dark palette in
  `products/cortex/apps/web/app/styles.css`.
- The applications share a few visual choices, such as Inter and Georgia, but those are
  duplicated.
- Neither frontend currently depends on a shared workspace UI package.

Potential future layout:

```text
ai-ecosystem/
├── packages/
│   ├── ui/
│   ├── brand/
│   └── frontend-config/
└── products/
    ├── knowledge/
    │   └── apps/web/
    └── agent/
        └── apps/web/
```

Responsibilities:

- `packages/ui` provides reusable UI primitives and semantic CSS rules.
- `packages/brand` provides the theme contract, default theme, and theme application.
- `packages/frontend-config` provides genuinely shared TypeScript, ESLint, Tailwind, or test
  configuration.
- Product applications retain domain-specific components and layouts.

Start by sharing theme tokens and validation. Do not immediately extract every button, form,
shell, or navigation component; the current products have substantially different interfaces.

A useful rule:

> Root packages provide shared presentation foundations; products provide domain-specific
> experiences.

Possible package names:

```text
@ai-ecosystem/ui
@ai-ecosystem/brand
@ai-ecosystem/frontend-config
```

## Shared backend and delivery structure

The root `packages/` directory can contain reusable backend and infrastructure code as well as
frontend code. It should not become a catch-all for product-owned behavior, database state, or
deployment processes.

A possible second-generation repository structure is:

```text
ai-ecosystem/
├── products/
│   ├── knowledge/
│   │   ├── apps/
│   │   ├── packages/
│   │   ├── migrations/
│   │   └── Dockerfile
│   └── agent/
│       ├── apps/
│       ├── packages/
│       ├── migrations/
│       └── Dockerfile
├── packages/
│   ├── ui/
│   ├── brand/
│   ├── observability/
│   ├── identity/
│   ├── configuration/
│   └── testing/
├── deploy/
│   ├── local/
│   ├── kubernetes/
│   └── environments/
└── .github/
    └── workflows/
```

The ownership rule is:

> Shared packages contain reusable implementation. Products own domain behavior and state.
> Deployment configuration composes products into environments.

Good candidates for root packages include:

- UI primitives and semantic themes;
- structured logging, tracing, and correlation-ID utilities;
- provider-neutral identity claim types and validation primitives;
- configuration helpers;
- HTTP client foundations;
- test utilities and synthetic fixtures;
- shared linting, TypeScript, and build configuration.

Root packages should remain conservative. Code should usually move there only after at least two
products need the same stable behavior. Product-specific code should remain product-owned, for
example:

```text
products/knowledge/packages/search
products/knowledge/packages/db
products/agent/packages/state
products/agent/packages/knowledge-client
```

Shared identity packages must not collapse product authorization policies into one implementation.
They may define provider-neutral claims and validation primitives, while each product continues to
own its roles, permissions, and authorization decisions.

### Migration ownership

Each product should own its database schema and migration history:

```text
products/knowledge/migrations/
products/agent/migrations/
```

The migration chains remain separate even when the products use the same PostgreSQL server. This
preserves independent deployment, rollback, testing, and state ownership. A root-level shared
migration chain would blur those boundaries.

If a supposedly shared package starts owning durable operational state or migrations, it should be
reconsidered as an independently deployed service or product rather than treated as an ordinary
library.

### Deployment ownership

Product-specific build and runtime assets stay with the product:

```text
products/knowledge/Dockerfile
products/knowledge/alembic.ini
products/agent/Dockerfile
products/agent/alembic.ini
```

Root deployment configuration assembles products into runnable environments:

```text
deploy/
├── local/
│   └── compose.yaml
├── kubernetes/
│   ├── knowledge/
│   ├── agent/
│   └── ecosystem/
└── environments/
    ├── development/
    ├── staging/
    └── production/
```

This split allows a product to remain independently buildable while the repository can still
provide a complete local or hosted ecosystem deployment.

### Repository automation

Repository-level CI can coordinate shared and cross-product checks while invoking product-owned
commands:

```text
.github/workflows/
├── knowledge.yml
├── agent.yml
├── frontend.yml
└── integration.yml
```

In summary:

```text
packages/   reusable implementation
products/   domain ownership, state, migrations, and deployable applications
deploy/     composition of products into environments
.github/    repository-level automation
```

## Branding and Skills

The repository is not intended to be multi-tenant. It currently has:

- a built-in default content bundle;
- Northstar as a fictional example company.

The intended branding model is therefore:

```text
Default ecosystem brand
├── default UI theme
└── default Brand Skill

Northstar example brand
├── example UI theme
└── Northstar Brand Skill
```

The shared UI should have a compiled, built-in default theme so every product works without
Knowledge being seeded or available.

Knowledge can also store a `brand` Skill for agents that produce branded content. However:

- `SKILL.md` contains agent instructions.
- Frontends should not parse prose from `SKILL.md` to configure application styling.
- Exact semantic theme values can live in a structured Skill reference such as
  `references/theme.json`.
- The UI theme and Skill reference should be validated against the same semantic theme contract.
- A check should prevent the compiled default theme and default Skill reference from drifting.

Potential content layout:

```text
products/knowledge/
├── content/default/
│   └── skills/brand/
│       ├── SKILL.md
│       └── references/theme.json
└── examples/northstar/
    └── skills/brand/
        ├── SKILL.md
        └── references/theme.json
```

Northstar already has a `skills/brand/SKILL.md`. The current default Skill bundle does not have a
corresponding Brand Skill.

## Follow-on implementation direction

After the dedicated rename is complete, possible incremental work is:

1. Extract the semantic theme contract and default palette into a neutral shared package.
2. Make both web applications consume the shared theme foundation.
3. Add a default Brand Skill with a structured theme reference.
4. Update Northstar to demonstrate an optional example-brand override.
5. Extract other root packages only after at least two products need the same stable behavior.
6. Run all canonical checks for each independently bounded change.
