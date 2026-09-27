# Deferred Sessions

## Purpose

This file records optional architecture work that is explicitly outside the active handoff in
`NEXT_SESSION.md`. Items are ordered by dependency and evidence, not committed roadmap dates.
Before implementing an item, create a focused session brief from the current repository state and
confirm that at least two products need the proposed shared behavior.

Durable ownership rules live in `README.md` and `.agents/ARCHITECTURE.md`; this file contains
proposals rather than implemented facts.

The shared `@ai-ecosystem/brand` semantic theme contract, compiled default palette, and minimal
global stylesheet are implemented. The items below deliberately begin beyond that foundation;
they do not propose moving product layouts or workflows into the brand package.

## 1. Shared UI primitives

After the implemented shared brand foundation has remained stable in both products, consider a
root package:

```text
packages/ui
@ai-ecosystem/ui
```

It may contain genuinely reusable accessible primitives and semantic component styling. Extract
only components already used with the same behavior by Knowledge and Agent. Product shells,
navigation, conversations, evidence, knowledge pages, and workflows remain product-owned.

Do not start by moving every button, form, card, table, or layout into this package. Prefer small,
proven primitives with focused tests and a deliberate public API.

## 2. Shared frontend configuration

Once both web applications have demonstrated stable duplication, consider:

```text
packages/frontend-config
@ai-ecosystem/frontend-config
```

Candidates include TypeScript, ESLint, Tailwind, Vitest, Testing Library, or Playwright defaults.
Keep product-specific build inputs, routes, environment validation, and test behavior in each
application. Do not force superficially similar configurations together when their constraints
differ.

## 3. Runtime theme loading

Default and synthetic Northstar Brand Skills now carry structured, contract-validated theme
references as packaged Knowledge bundle assets. Loading those references from Knowledge, a Skill,
a database, tenant settings, or a remote provider as runtime frontend configuration remains
explicitly deferred. Frontends should continue to use compiled local themes unless a future brief
defines lifecycle, authorization, caching, failure, and deployment behavior.

## 4. Other shared implementation packages

Only extract these after Knowledge and Agent need the same stable behavior:

- structured logging, tracing, and correlation-ID utilities;
- provider-neutral identity claim types and validation primitives;
- configuration helpers;
- HTTP client foundations;
- testing utilities and synthetic fixtures.

Shared identity code may define neutral claims and validation primitives, but each product keeps
its own scopes, roles, permissions, and authorization decisions. Product-owned packages such as
Knowledge search/database code, Agent state, and the Agent-owned Knowledge client remain within
their products.

## 5. Deployment composition

Product-specific Dockerfiles, runtime configuration, schemas, and migrations remain with their
products. If multiple deployment targets become real requirements, consider moving composition to:

```text
deploy/
├── local/
├── kubernetes/
└── environments/
```

Environment composition must not create a shared migration chain or combine product databases.
Knowledge and Agent must remain independently buildable, deployable, testable, and reversible.

## 6. Repository automation

When CI complexity justifies it, split repository automation into focused workflows such as:

```text
.github/workflows/
├── knowledge.yml
├── agent.yml
├── frontend.yml
└── integration.yml
```

Repository workflows coordinate product-owned commands; they do not redefine product boundaries.

## 7. Future products

Potential products include analytics, support, integrations, and automation. Add one only when it
has meaningful independent boundaries, such as its own domain state, deployment lifecycle,
security boundary, public contract, or usefulness without the general Agent product. API or MCP
exposure alone does not justify a separate product.

Future products remain peers under `products/`. They may consume Knowledge through public HTTP or
MCP interfaces, but never through Knowledge's database or internal packages. Do not introduce a
parent-child layout that places Agent or another product inside Knowledge.

## Explicitly not implied

This file does not authorize implementation, deployment, production access, remote configuration,
new hosted resources, database mutations, or secret changes. It also does not commit the project
to every named package or product. Each item requires fresh discovery, a bounded objective,
verification criteria, and normal GitHub Flow delivery.
