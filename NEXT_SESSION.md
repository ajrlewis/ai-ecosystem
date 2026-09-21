# Next Session

## Status — 2026-09-21

The root README now documents a verified Docker quick start, local URLs, disposable credentials,
health checks, seed commands, and the current single-identity login boundary. The Northstar seed
contains three fictional human authorization profiles: Alex belongs to the investment team,
Morgan belongs to portfolio operations, and Taylor has no group membership. They are Brain
principals and group claims, not password-bearing users or application roles.

The current local adapters still accept one configured web username/password and one configured
API bearer per product. Brain maps its bearer to one configured organization, principal, and set
of groups; Cortex maps its bearer to one opaque owner and calls Brain as one configured service
identity. Testing another Brain profile therefore requires changing environment variables and
recreating services. Production Entra authentication is not implemented.

## Objective

Implement a development-only, multi-user authentication adapter that makes the local Docker login
flow resemble the intended Microsoft Entra claim model without turning Mind into an identity or
authorization server. Locally configured synthetic users should be able to sign in and exercise
different application scopes and app roles against the seeded database.

## Intended Identity Boundary

- Microsoft Entra remains the future production identity provider and token issuer.
- OAuth scopes express whether a client may access a Brain or Cortex API.
- Entra app roles express what an authenticated user is permitted to do in the application.
- Mind validates issuer-provided claims and applies its own resource authorization rules; it does
  not own production passwords, issue production access tokens, or provide user administration.
- The local adapter only emulates the validated claim result. It must not implement OAuth, mimic
  Entra endpoints, or establish a second production identity model.

## Next Bounded Slice

### 1. Shared local claim contract

- Define the minimum provider-neutral identity result needed by the applications: stable subject,
  display name, organization/tenant, granted API scopes, and application roles.
- Choose explicit Brain and Cortex scope names and a small role vocabulary based on real permitted
  operations. Do not call Brain groups “roles”; document the mapping from app roles to existing
  Brain principals/group claims or evolve the authorization context deliberately if direct role
  checks are required.
- Keep the contract suitable for a later Entra token validator, but add no Microsoft SDK or remote
  identity-provider dependency in this slice.

### 2. Configuration-backed local users

- Replace each web application's single development credential with a typed, server-only local
  user fixture containing username, development password, subject, display name, scopes, and roles.
- Include representative synthetic users such as administrator/steward, investment, operations,
  and reader/organization-only. Resolve their stable identities against the Northstar seed.
- Store only disposable development fixtures in repository configuration. Never return passwords,
  API bearers, session secrets, or the complete fixture through browser code, HTML, logs, API
  responses, generated artifacts, or client bundles.
- Fail startup or sign-in safely for malformed fixtures, duplicate usernames/subjects, unknown
  roles, missing required scopes, or identities that do not resolve.

### 3. Signed local sessions and API propagation

- Put only the minimum authenticated local claims in integrity-protected, HTTP-only, same-site
  sessions. Preserve safe redirect handling, sign-out, constant-time credential comparison where
  applicable, and server-only backend calls.
- Enforce the required application scope at the API boundary and enforce app roles on operations
  that differ by permission. Keep resource-level organization and policy filtering in Brain.
- Ensure Cortex does not silently collapse every signed-in local user onto one owner or one Brain
  authorization identity. Propagate a validated provider-neutral identity through public service
  boundaries without exposing the server credential to the browser and without accessing Brain's
  database directly.
- Keep the existing opaque local bearer available for non-browser integration tests and MCP if
  needed, with an explicit compatibility boundary and no ambiguous precedence.

### 4. Docker experience and verification

- Make the seeded users directly selectable through the documented Brain and Cortex sign-in forms;
  changing `.env` and recreating containers should no longer be necessary to switch personas.
- Update `.env.example`, Compose, the root README, product documentation, access-control contract,
  architecture notes, and generated API contracts when public schemas change.
- Add unit and browser tests for each representative role, required and missing scopes, invalid
  credentials, session tampering, cross-user conversation isolation, restricted Brain content,
  sign-out, and the absence of secrets/claims from client bundles.
- Add PostgreSQL-backed coverage proving that the seeded personas resolve and that investment-only
  content is visible to Alex but absent for Morgan and Taylor before ranking or limiting.

## Definition Of Done

- A developer can start Compose once and sign in as multiple documented synthetic users without
  editing environment variables or running an identity provider.
- Local sessions emulate the intended validated Entra scopes and app roles while remaining clearly
  development-only.
- Each Cortex user has isolated durable state and receives Brain results for their own propagated
  authorization identity.
- Scope checks, role checks, and Brain resource authorization are distinct, named, and covered by
  success and denial tests.
- No production auth server, password database, OAuth endpoint, or provider-specific domain
  coupling is introduced.
- Relevant Python, TypeScript, PostgreSQL, contract, Docker, Compose, and Playwright checks pass,
  and the final diff and built client artifacts contain no secrets.

## Explicitly Deferred

- Microsoft Entra tenant registration, consent, redirect URIs, client secrets/certificates, live
  token acquisition, JWKS validation, group overage handling, and production deployment;
- user provisioning, password management, invitations, role administration UI, SCIM, SAML, and
  Mind-issued production tokens;
- generalized RBAC/ABAC engines, custom-role builders, organization switching, and shared-SaaS
  tenant discovery;
- agent runtime, tool approvals, connectors, background work, and unrelated knowledge features.
