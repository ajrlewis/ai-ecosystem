# Workflow

`README.md` defines the AI Ecosystem product workspace. `products/knowledge/README.md` is Knowledge's
target-state product specification, and `products/agent/README.md` is the Agent specification.
`.agents/ARCHITECTURE.md` records implemented slices; do not describe specifications as
implemented or proposed commands as verified.

## Change Loop

1. Read the relevant product specification, current implementation, tests, agent guidance, and
   `.agents/sessions/ACTIVE.md` when the request invokes the active handoff. Confirm that the brief
   still describes unfinished work; current code and durable architecture win if it has drifted.
2. Preserve Knowledge's agent-agnostic storage boundary and make the smallest change that satisfies the task.
3. Add or update focused tests for changed behavior, including failure and authorization paths where relevant.
4. Run the relevant verified commands from `.agents/COMMANDS.md`.
5. Review the diff for scope, secrets, generated files, migrations, and documentation accuracy.
6. Update agent context when durable project facts change. If the active session is completed,
   archive its brief with the completion date, pull request, merged commit when known, and
   verification outcome. Replace `ACTIVE.md` with the next explicitly selected slice or state that
   no active objective is selected; never promote deferred work implicitly.
7. Reconcile `.agents/sessions/DEFERRED.md`, record persistent out-of-scope setup work in
   `.agents/todos/TODO.md`, and archive completed TODO entries in `DONE.md`.

## Session Lifecycle

- The monorepo has exactly one active implementation handoff at
  `.agents/sessions/ACTIVE.md`, even when its scope is a single product.
- Durable product rules belong in product specifications or nested `AGENTS.md` files, not in a
  second active-session document.
- `.agents/sessions/DEFERRED.md` is planning input, not implementation authorization.
- `.agents/sessions/archive/` preserves completed briefs as historical evidence. Archived content
  cannot override current source, specifications, architecture, or the active brief.
- Prefer advancing the handoff in the implementation pull request so merged `main` remains
  truthful. When the next priority is not selected, explicitly record that state rather than
  inventing a roadmap item.

## Python And TypeScript Changes

- Python applications and packages use uv, Ruff, Pyright, and pytest. Knowledge tests live in
  `products/knowledge/tests/`, with dependency-backed PostgreSQL behavior behind the `integration` marker.
- The TypeScript applications are npm workspaces at `products/knowledge/apps/web` and
  `products/agent/apps/web`. Use ESLint, TypeScript's
  no-emit check, Vitest with Testing Library for components and server transport behavior,
  and Playwright for browser integration with the real Compose API and Northstar seed.
- FastAPI schemas are authoritative. Regenerate `products/knowledge/apps/web/openapi.json` and the generated Zod
  validators after public API changes; never hand-edit generated contracts. The drift check
  must pass in CI.
- Keep backend tokens and local credential validation in server-only modules. Client
  Components are limited to browser interaction and must not import server configuration.
- Run checks for every language affected by a change. Cross-stack contracts, Docker, Compose,
  or browser behavior require both Python and TypeScript checks plus the relevant integration
  flow.

## Git

The repository uses GitHub Flow with `main` as the remote default branch.

- Work on a focused feature or fix branch; never push directly to `main`.
- Use a concise typed branch name such as `feature/add-export`, `fix/empty-response`, or `chore/update-dependencies`; include a tracker identifier when one exists.
- Before pushing or updating a pull request, fetch `origin` and merge `origin/main` into the feature branch. Resolve conflicts on the feature branch and rerun relevant checks.
- Open a pull request into `main`, inspect CI and review feedback, and merge through the pull request.
- Do not force-push shared branches.

The phrases "branch add commit push and PR" and "PR merged," or clear equivalents, invoke the complete delivery and safe local-cleanup procedures in `.agents/presets/git/github-flow.md`. Do not pause between authorized delivery steps merely to request confirmation already supplied by the shortcut.

The remote is a solo repository with no current protection on `main`. Follow the corresponding open item in `.agents/todos/TODO.md`; remote repository-setting changes require explicit maintainer authorization.

## Project-Specific Expectations

- Keep HTTP and MCP as thin interfaces over the same domain/application services.
- Define schema changes with Alembic migrations and validate them against PostgreSQL with pgvector where behavior depends on those systems.
- Keep configuration typed and environment-based; never commit secrets.
- Update public contracts and focused architecture documents alongside behavior changes.
- Keep fixtures synthetic. The Northstar example must not contain real confidential information.
- Require explicit maintainer authorization before deployments, production access, database mutations outside normal local/test workflows, secret changes, or remote repository-setting changes.
