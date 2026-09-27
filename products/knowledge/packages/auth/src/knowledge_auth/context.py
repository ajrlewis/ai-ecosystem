from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class AuthContext:
    """Provider-neutral identity and group claims used by application services."""

    organization_id: UUID
    principal_id: UUID
    group_ids: frozenset[UUID]
    subject: str = "local-integration"
    display_name: str = "Local integration"
    scopes: frozenset[str] = frozenset({"knowledge.api"})
    roles: frozenset[str] = frozenset({"knowledge.steward"})
