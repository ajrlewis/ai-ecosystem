# Next Session

## Status — 2026-09-27

The repository and product rename is complete and merged. The GitHub repository is now
`ajrlewis/ai-ecosystem`, the local `origin` points to the renamed repository, and the workspace
consistently uses AI Ecosystem, Knowledge, and Agent across product directories, packages,
services, configuration, contracts, tests, and current documentation. The local checkout directory
is still named `mind`; changing it is a separate host-local operation and is not required for this
session.

Knowledge and Agent remain independently deployable peer products with separate application code,
state, migrations, and deployment lifecycles. Agent continues to consume Knowledge only through
its public HTTP interfaces.

The next incremental architecture step is the shared frontend brand foundation. The current
applications still implement that foundation separately:

- Knowledge defines a validated semantic theme contract plus `knowledge` and `northstar` palettes
  in `products/knowledge/apps/web/lib/theme.ts`, then applies the tokens through CSS custom
  properties.
- Agent hard-codes a separate dark palette, typography, focus treatment, surfaces, borders, and
  controls in `products/agent/apps/web/app/styles.css`.
- Both applications duplicate Inter/Georgia typography and related global presentation rules.
- No root frontend package is currently included in the npm workspace.

## Objective

Create a neutral shared brand package and make both product web applications consume the same
validated semantic theme foundation so they look and behave like parts of one AI Ecosystem while
retaining their distinct product workflows and layouts.

The intended initial package is:

```text
packages/
└── brand/
    ├── package.json
    └── src/
        ├── index.ts
        └── foundation.css
```

Suggested package name:

```text
@ai-ecosystem/brand
```

Use the existing Knowledge theme contract as the starting point rather than inventing a second
contract. Move only stable, genuinely shared presentation foundations into the root package.

## Required outcome

### Shared semantic theme contract

- Move the Zod-validated semantic token contract, `ThemeTokens` type, safe-colour validation, CSS
  custom-property conversion, and compiled default AI Ecosystem palette into
  `@ai-ecosystem/brand`.
- Keep token names semantic rather than product- or component-specific. The current baseline is:

  ```text
  primary
  accent
  surface
  surfaceRaised
  text
  textMuted
  border
  focus
  success
  warning
  danger
  ```

- Add tokens only when both products demonstrably need them. Avoid speculative theme systems,
  arbitrary user-provided CSS, or component-specific colour names.
- Preserve strict validation before values become inline CSS custom properties. Do not weaken the
  current protection against unsafe CSS values.
- Export a built-in default theme so every product renders correctly without Knowledge, a seeded
  database, an API request, or runtime theme configuration.

### Shared visual foundation

- Add a small shared stylesheet for the genuinely common global layer: box sizing, typography,
  body defaults, semantic background/text colours, links, focus-visible treatment, skip-link
  behavior, and reusable low-level control/surface conventions where both products already need
  them.
- Both applications should consume the same default palette, font stacks, focus treatment,
  surfaces, borders, and status colours.
- Preserve accessible contrast, keyboard focus visibility, reduced layout shift, responsive
  behavior, and inert rendering of untrusted content.
- Do not force both applications into the same information architecture. Knowledge remains a
  read-only knowledge console; Agent remains a conversation workspace.

### Product integration

- Add `packages/*` to the root npm workspaces and update the lockfile from authoritative package
  manifests.
- Add `@ai-ecosystem/brand` as a workspace dependency of both
  `@ai-ecosystem/knowledge-web` and `@ai-ecosystem/agent-web`.
- Replace Knowledge's product-local theme contract with imports from the shared package. Keep only
  product integration or selection behavior in the Knowledge application.
- Replace Agent's hard-coded colour values with the shared semantic CSS variables and apply the
  compiled default theme at its root layout boundary.
- Keep product-specific component selectors and layout rules in their owning applications. Do not
  move conversation, evidence, page, navigation, shell, or sign-in components into the shared
  package merely because their colours become consistent.
- Keep server-only credentials and session handling unchanged. Theme selection must not introduce
  a backend dependency or expose configuration to the browser unnecessarily.

### Theme selection and examples

- Retain Knowledge's current theme-selection behavior unless a small neutral shared helper can be
  reused without coupling products.
- Treat Northstar as an optional fictional example theme, not the ecosystem default, product name,
  or tenant abstraction.
- It is acceptable for the Northstar palette to remain Knowledge-owned in this slice if sharing it
  would make example content a required dependency of Agent.
- Agent should use the compiled default ecosystem theme in this session. Cross-application
  persistence or synchronization of a user's selected example theme is not required.

## Product boundaries to preserve

- `packages/brand` owns only reusable presentation contracts, the compiled default palette, and
  shared global styling foundations.
- Knowledge and Agent own their product-specific pages, layouts, components, routes, sessions,
  accessibility labels, and interaction behavior.
- The shared package must not import from either product.
- Neither product may import the other product's frontend internals.
- Do not introduce shared backend state, migrations, APIs, authorization policy, or deployment
  coupling.
- Both product applications must remain independently buildable and deployable.

Dependency direction:

```text
products/knowledge/apps/web ─┐
                             ├──> packages/brand
products/agent/apps/web ─────┘
```

## Testing and documentation

- Move or recreate focused theme-contract tests at the shared package boundary, including valid
  palettes, rejected unsafe values, deterministic CSS-variable mapping, and the compiled default
  theme.
- Update Knowledge tests to cover its remaining theme-selection integration and Northstar
  override.
- Update Agent component tests where colours or root theme application have observable semantic
  behavior; avoid brittle pixel or implementation-detail assertions.
- Add a drift-style assertion that both product manifests depend on the shared brand package and
  neither redefines the semantic token contract.
- Update the root README, relevant product specifications, `.agents/ARCHITECTURE.md`,
  `.agents/COMMANDS.md`, and `DEFERRED_SESSION.md` to distinguish the implemented shared brand
  foundation from still-proposed shared UI and frontend-config packages.
- Review both applications at desktop and narrow viewports. Confirm sign-in, navigation, empty,
  loading, error, conversation, evidence, page, provenance, search, and Skill views remain usable.

## Suggested execution order

1. Inventory duplicated global styles, semantic colours, typography, focus rules, and current theme
   tests across both applications.
2. Define the minimal public API and CSS boundary for `@ai-ecosystem/brand`.
3. Add the root package and npm workspace entry, then regenerate `package-lock.json`.
4. Move the validated theme contract and default palette from Knowledge into the shared package.
5. Make Knowledge consume the shared contract without changing its product behavior or Northstar
   selection semantics.
6. Make Agent apply the shared default theme and convert its hard-coded palette to semantic
   variables while preserving its conversation-specific layout.
7. Add focused shared and product integration tests.
8. Run each frontend's lint, typecheck, unit tests, contract drift check, and production build;
   then run the relevant Docker and Playwright flows when the local environment supports them.
9. Review the final diff for accidental component extraction, frontend cross-imports, unsafe CSS,
   inaccessible contrast/focus, generated artifacts, and unrelated redesign.

## Definition of done

- A root `@ai-ecosystem/brand` workspace package owns the validated semantic theme contract,
  deterministic CSS-variable mapping, compiled default palette, and minimal shared global styling.
- Knowledge and Agent both consume the package directly and no longer maintain competing default
  colour, typography, focus, surface, or border foundations.
- Agent has no hard-coded parallel theme palette; product-specific styles use shared semantic
  variables.
- Knowledge's optional Northstar theme still works without becoming an Agent or ecosystem
  dependency.
- Both products retain their own layouts, components, interaction patterns, state, APIs, and
  deployment boundaries.
- Shared-package and product tests cover theme validation, unsafe values, CSS-variable mapping,
  default application, and Knowledge theme selection.
- The package lockfile is regenerated and workspace dependency resolution is reproducible.
- Relevant lint, typecheck, Vitest, contract drift, production build, Docker, and Playwright checks
  pass, or any confirmed host-toolchain blocker is reported with exact evidence rather than
  described as a product failure.
- Documentation and agent context accurately describe the implemented shared brand foundation.

## Explicitly deferred

- A general `@ai-ecosystem/ui` component library or extraction of buttons, forms, cards, shells,
  navigation, tables, messages, composers, or evidence components;
- `@ai-ecosystem/frontend-config` and shared ESLint, TypeScript, Tailwind, Vitest, or Playwright
  configuration;
- adding the default Brand Skill or structured `references/theme.json` files;
- loading UI themes from Knowledge, Skills, a database, tenant settings, or a remote provider;
- synchronizing a selected theme across independently deployed products;
- broader visual redesign, new logos, marketing pages, or product navigation changes;
- shared backend packages, identity extraction, observability extraction, deployment restructuring,
  or new products;
- changing authentication, authorization, persistence, migrations, public APIs, or product
  capabilities.
