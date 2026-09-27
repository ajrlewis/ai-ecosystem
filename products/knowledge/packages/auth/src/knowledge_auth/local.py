import base64
import hashlib
import hmac
import json
from hmac import compare_digest
from uuid import UUID

from knowledge_auth.context import AuthContext


class AuthenticationError(Exception):
    """Raised when local bearer credentials are absent or invalid."""


class LocalBearerAuthenticator:
    """Authenticate one configured local-development bearer token."""

    def __init__(self, *, token: str | None, context: AuthContext) -> None:
        self._token = token
        self._context = context

    def authenticate_assertion(
        self, assertion: str | None, secret: str | None
    ) -> AuthContext | None:
        if assertion is None:
            return None
        if not secret:
            raise AuthenticationError("Local identity assertions are not configured")
        payload, separator, signature = assertion.rpartition(".")
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
        try:
            actual = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
            raw = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
            data = json.loads(raw)
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            raise AuthenticationError("Valid local identity is required") from error
        if separator != "." or not hmac.compare_digest(actual, expected):
            raise AuthenticationError("Valid local identity is required")
        try:
            scopes = frozenset(data["scopes"])
            roles = frozenset(data["roles"])
            if not isinstance(data["subject"], str) or not data["subject"].strip():
                raise ValueError
            if not isinstance(data["displayName"], str) or not data["displayName"].strip():
                raise ValueError
            if not scopes <= {"knowledge.api", "agent.api"} or not roles <= {
                "knowledge.steward",
                "conversation.user",
            }:
                raise ValueError
            return AuthContext(
                organization_id=UUID(data["organizationId"]),
                principal_id=UUID(data["principalId"]),
                group_ids=frozenset(UUID(value) for value in data["groupIds"]),
                subject=data["subject"],
                display_name=data["displayName"],
                scopes=scopes,
                roles=roles,
            )
        except (KeyError, TypeError, ValueError) as error:
            raise AuthenticationError("Valid local identity is required") from error

    def authenticate(self, authorization: str | None) -> AuthContext:
        scheme, _, credentials = (authorization or "").partition(" ")
        if (
            self._token is None
            or scheme.lower() != "bearer"
            or not credentials
            or not compare_digest(credentials.encode(), self._token.encode())
        ):
            raise AuthenticationError("Valid bearer credentials are required")
        return self._context
