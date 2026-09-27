# Agent TODO

Persistent agent-managed setup work only; this is not the product backlog. Move completed entries to `DONE.md` with the completion date and outcome.

## Open Items

- Restore the non-integration Python suite above the configured 90% branch-aware coverage gate;
  all 188 selected tests pass, but the current measured total is 89.55%.

- Diagnose the Next.js 16.3.3 webpack worker crash seen on this x86_64 host and in Linux Docker
  (`SIGSEGV`/trace trap during optimized production builds); lint, typecheck, Vitest, and contract
  drift checks pass for both web applications.

- Review the four npm audit findings reported by the initial web dependency install (one
  moderate, two high, one critical), identify whether they affect production or only the
  OpenAPI/test toolchain, and upgrade without bypassing the pinned Next.js security release.

- Decide whether external approving review is practical for this solo repository, then obtain explicit authorization to configure GitHub protection. Require pull requests and the existing `quality` and `docker` CI checks, and block direct/force pushes and branch deletion; verify the effective rules afterward.
