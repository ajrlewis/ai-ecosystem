# Access Control

Brain separates authentication from authorization. A transport authenticator produces the
same provider-neutral value for HTTP and MCP:

```text
AuthContext
├── organization_id
├── principal_id
├── group_ids
├── subject and display_name
├── scopes
└── application roles
```

Application services accept this context explicitly and enforce access before returning
domain data. Transport handlers only extract credentials, validate input, invoke a
service, and serialize its result.

## Initial authentication

Local browser development uses configuration-backed synthetic users and integrity-protected,
HTTP-only claim sessions. Server-side calls forward a signed local identity assertion; Brain
requires `brain.api`, while mutations additionally require `knowledge.steward`. Cortex requires
`cortex.api` and `conversation.user`. App roles grant operations and never replace Brain group
claims, which continue to drive resource policies. The configured opaque bearer remains a
compatibility path for MCP and non-browser tests and has explicit steward authority. Neither
mechanism is a production identity system or OAuth issuer. HTTP `/health` and
the MCP `health` tool remain unauthenticated for process health checks.

The initial authenticated operation, HTTP `GET /auth/context` and MCP `auth_context`,
demonstrates that both transports resolve and pass the identical AuthContext to the same
IdentityService. Later domain operations reuse these adapters.

## Executable policy rule

All tenant-owned records are selected with
`record.organization_id == context.organization_id`. An absent policy never means public
access; objects whose contract requires a policy must have one.

For a same-organization record and its AccessPolicy `P`, access is:

```python
permitted_groups = groups_linked_to(P)
allowed = not permitted_groups or bool(context.group_ids & permitted_groups)
```

`brain_auth.require_access` implements this rule for application services; repository
queries must express the equivalent predicate when selecting candidates.

Thus no permitted Groups means Organization-wide access. One or more permitted Groups
requires membership in at least one; membership in every group is not required. Group
claims must be validated as belonging to the authenticated Organization. Soft-deleted or
inactive Principals, Groups, memberships, policies, and resources do not grant access.
There are no role hierarchies or implicit administrator bypasses. Scope checks, operation-role
checks, and resource-policy checks are distinct.

## Resource inheritance

- A Page's policy controls the Page, every PageVersion, every derived Chunk or embedding,
  and every title, snippet, match, count, or search result derived from it.
- A Source's policy independently controls direct Source retrieval.
- A Skill's policy controls the Skill and all SkillVersions.
- A Folder's policy controls direct Folder discovery; an item's own policy still controls
  the item. Folder placement never widens item access.
- Provenance is the intersection of permissions: a caller may receive a provenance link
  or Source details only when allowed to access both the Page and that Source. Hidden
  Sources must not be revealed by identifiers, counts, titles, URIs, or metadata.

Changing a parent policy changes access to all inherited representations immediately; no
policy is copied onto versions, chunks, or embeddings.

## Retrieval and search

Authorization is part of the database candidate query. The required order is:

```text
same organization + live record + policy predicate
    → candidate text/vector match
    → ranking
    → limit
    → authorized result shaping and provenance intersection
```

Filtering after ranking or limiting is incorrect because it leaks relevance and produces
incomplete results. Queries must not expose unauthorized data through titles, snippets,
facets, counts, timing-specific branches, error differences, logs, or provenance.

The implemented hybrid query materializes only same-tenant, live Pages whose joined
PageVersion is current and whose policy is organization-wide or intersects the caller's
validated groups. PostgreSQL full-text and pgvector candidate queries both read that
authorized relation, then combine lexical and semantic scores with deterministic tie-breaking.

## Mutations and deletion

Create and update services require `knowledge.steward` at the HTTP boundary and validate that all
referenced records share the caller's Organization. Soft deletion removes records from
normal authorization candidates. Immutable PageVersion and SkillVersion content is never
updated in place.

SCIM, SAML administration, provider-specific identity models, role inheritance, tenant
provisioning, and production identity-provider integration are explicitly deferred.
