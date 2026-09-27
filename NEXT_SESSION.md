# Next Session

## Status — 2026-09-27

The shared frontend brand foundation is implemented and merged in pull request #36. The root
`@ai-ecosystem/brand` package now owns the Zod-validated semantic colour contract, compiled default
AI Ecosystem palette, deterministic CSS custom-property mapping, and minimal global stylesheet.
Knowledge and Agent consume it directly; Knowledge retains its optional fictional Northstar
palette and runtime selection, while Agent uses the dependency-free compiled default.

The next logical slice is to align agent-facing brand guidance with that authoritative UI contract.
Knowledge already contains a fictional Northstar Brand Skill at
`products/knowledge/examples/northstar/skills/brand/SKILL.md`, but the repository-owned default
Skill bundle has no Brand Skill. Neither Brand Skill has a structured `theme.json` reference, so
agents receive prose-only guidance and there is no automated drift check between agent-facing
theme data and the compiled palettes.

The existing default bundle loader already supports declared files below a Skill's `references/`
directory, validates bundle boundaries, packages those references into the Knowledge database
distribution, and preserves deployed current Skill versions. Use those conventions rather than
adding another content lifecycle or making frontend rendering depend on Knowledge.

## Objective

Add a repository-owned default Brand Skill and structured theme references for both the default AI
Ecosystem brand and the fictional Northstar example. Validate the references against the shared
semantic theme contract and prevent them from drifting from the compiled palettes.

This is a content, validation, and packaging slice. It must not turn Skills into runtime frontend
configuration or introduce a database-backed theme service.

## Required outcome

### Default Brand Skill

- Add the conventional bundle directory:

  ```text
  products/knowledge/content/default/skills/brand/
  ├── SKILL.md
  └── references/
      └── theme.json
  ```

- Make `brand` a sixth canonical default Skill in
  `products/knowledge/content/default/manifest.yaml`, with a stable name and ordered position.
- Update the default `index` Skill's frontmatter route contract and Markdown routing table so the
  Brand Skill is reachable by stable slug.
- Keep the Skill focused on applying the default visual identity to generated content. Mention the
  structured reference as supporting bundle data without claiming it is currently retrievable
  through a public tool, and do not claim capabilities that Knowledge does not expose.
- Preserve the existing idempotent seed behavior: create the new Skill where absent, preserve every
  already-deployed current Skill version, and do not silently upgrade customized deployments.

### Structured theme references

- Add a UTF-8 JSON object containing exactly the current semantic tokens:

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

- The default `theme.json` values must exactly equal `defaultTheme` from
  `@ai-ecosystem/brand`.
- Add the corresponding fictional reference at:

  ```text
  products/knowledge/examples/northstar/skills/brand/references/theme.json
  ```

- The Northstar reference must exactly equal Knowledge's current `themes.northstar` palette and
  remain explicitly synthetic.
- Keep JSON data-only: no CSS declarations, custom-property names, selectors, URLs, scripts,
  comments, or arbitrary extension fields.
- Do not place Northstar values in `@ai-ecosystem/brand`; the example remains Knowledge-owned.

### Validation and drift protection

- Reuse `themeTokens` from `@ai-ecosystem/brand` as the authoritative validation contract. Do not
  copy the Zod schema into Knowledge, Python, or another package.
- Add focused TypeScript tests that parse both JSON references through `themeTokens`, reject extra
  or unsafe values, and assert exact equality with their compiled palettes.
- If JSON module imports make the public package boundary clearer, enable them only in the smallest
  relevant TypeScript configuration. Do not publish the example palette from the brand package.
- Extend the default bundle tests and loader invariants for the sixth canonical Skill, declared
  reference, index reachability, content hashes, and packaged-wheel behavior.
- Extend Northstar bundle validation so its Brand Skill reference must exist, remain inside the
  example bundle, and be valid UTF-8 JSON. Avoid copying the semantic keys or colour regex into
  Python; cross-language code should validate safe file structure and leave the authoritative
  palette semantics to the shared Zod contract.
- Keep failures explicit for missing, malformed, undeclared, traversal, unsafe, extra-key, and
  palette-drift cases.

### Content lifecycle and product boundaries

- `packages/brand` remains the authority for the compiled default theme and semantic token
  validation.
- Knowledge owns default and example Skill documents, reference packaging, seed behavior, and the
  optional Northstar palette.
- Agent may retrieve Brand Skills through Knowledge's existing public interfaces in future work;
  this session must not add Agent coupling or automatic Skill execution.
- Frontends must continue rendering from compiled local themes with no Knowledge request, database
  lookup, seed prerequisite, or remote-provider dependency.
- Do not add migrations, public APIs, authentication changes, runtime theme selection, or browser
  access to Skill references.

Dependency direction remains:

```text
products/knowledge default/example content ──validated against──> packages/brand contract

products/knowledge web ─┐
                        ├──> packages/brand compiled themes
products/agent web ─────┘
```

No dependency may point from `packages/brand` into a product runtime.

## Testing and documentation

- Update focused tests in `packages/brand/tests/` and
  `products/knowledge/tests/unit/test_skill_documents.py`.
- Update PostgreSQL default-seed expectations from five to six Skills and verify a rerun preserves
  existing current versions while creating only the missing Brand Skill.
- Build the Knowledge database wheel and inspect it, or exercise the existing packaged-bundle
  test, to prove both default Brand files are included.
- Run the shared brand checks, Python static/unit checks, dependency-backed default-seed coverage,
  Knowledge web checks affected by the Northstar drift assertion, and Docker build.
- Update the root README, Knowledge specification, `.agents/ARCHITECTURE.md`,
  `.agents/COMMANDS.md`, and `DEFERRED_SESSION.md` to describe implemented Brand Skills and leave
  runtime theme loading explicitly deferred.
- Do not describe structured Skill references as persisted database entities if they remain
  packaged bundle assets; document their actual lifecycle precisely.

## Suggested execution order

1. Inventory the default bundle loader, manifest invariants, index routes, packaged-wheel tests,
   Northstar loader, and all assertions fixed at five Skills.
2. Define the minimal default Brand Skill contract and exact data-only `theme.json` shape.
3. Add the default Skill/reference and update the manifest, index route, hashes, and seed tests.
4. Add the Northstar reference and make its existing Brand Skill point readers to structured theme
   data without treating the example as an ecosystem default.
5. Add authoritative Zod validation and exact palette drift tests at the frontend/shared-package
   boundary.
6. Add the smallest Python bundle checks needed for safe paths, JSON structure, packaging, and
   deterministic seed behavior.
7. Run the relevant canonical checks and inspect the built package/Docker image contents.
8. Review the diff for duplicated theme contracts, accidental frontend-to-Knowledge coupling,
   identity churn, automatic upgrades, or claims that references are runtime database state.

## Definition of done

- The default bundle contains a reachable sixth `brand` Skill with a declared `theme.json`
  reference and remains valid, deterministic, idempotent, and package-complete.
- Northstar's existing fictional Brand Skill has its own structured example reference without
  becoming a dependency of Agent or the ecosystem default.
- Both reference files validate through the authoritative shared `themeTokens` contract and match
  their compiled palettes exactly.
- Unsafe values, missing/extra keys, malformed JSON, path traversal, undeclared files, and palette
  drift fail focused tests.
- Existing deployed default Skill versions remain untouched; a rerun creates only genuinely
  missing defaults.
- Frontend rendering remains dependency-free and does not read Skills, references, Knowledge, or a
  database for theme values.
- Relevant brand, Knowledge Python/web, PostgreSQL seed, packaging, Docker, and drift checks pass,
  or a confirmed host blocker is reported with exact evidence.
- Documentation accurately distinguishes compiled UI themes, packaged agent-facing references,
  and persisted Skill documents.

## Explicitly deferred

- Loading application themes from Knowledge, Skills, reference files, a database, tenant settings,
  or a remote provider;
- exposing Skill reference files through new public HTTP, MCP, or browser contracts;
- synchronizing theme selection across independently deployed products;
- a general `@ai-ecosystem/ui` component library;
- shared frontend configuration for ESLint, TypeScript, Tailwind, Vitest, or Playwright;
- broader brand assets, logos, binary media, marketing pages, or visual redesign;
- automatic execution of Brand Skills or changes to the Agent runtime;
- migrations, authorization changes, production identity, deployment restructuring, or new
  products.
