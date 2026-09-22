import base64
import hashlib
import hmac
import json
from dataclasses import dataclass
from hmac import compare_digest


class AuthenticationError(Exception):
    """Raised when local bearer credentials are absent or invalid."""


@dataclass(frozen=True, slots=True)
class CallerIdentity:
    owner_id: str
    assertion: str | None = None
    scopes: frozenset[str] = frozenset({"cortex.api"})
    roles: frozenset[str] = frozenset({"conversation.user"})


class LocalBearerAuthenticator:
    """Authenticate one configured local-development caller."""

    def __init__(self, *, token: str, owner_id: str) -> None:
        self._token = token
        self._identity = CallerIdentity(owner_id=owner_id)

    def authenticate(self, authorization: str | None) -> CallerIdentity:
        scheme, _, credentials = (authorization or "").partition(" ")
        if (
            scheme.lower() != "bearer"
            or not credentials
            or not compare_digest(credentials.encode(), self._token.encode())
        ):
            raise AuthenticationError
        return self._identity

    def authenticate_assertion(
        self, assertion: str | None, secret: str | None
    ) -> CallerIdentity | None:
        if assertion is None:
            return None
        if not secret:
            raise AuthenticationError
        payload, separator, signature = assertion.rpartition(".")
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
        try:
            actual = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
            data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            raise AuthenticationError from error
        if separator != "." or not hmac.compare_digest(actual, expected):
            raise AuthenticationError
        try:
            scopes = frozenset(data["scopes"])
            roles = frozenset(data["roles"])
            if not isinstance(data["subject"], str) or not data["subject"].strip():
                raise ValueError
            if not scopes <= {"brain.api", "cortex.api"} or not roles <= {
                "knowledge.steward",
                "conversation.user",
            }:
                raise ValueError
            return CallerIdentity(
                owner_id=data["subject"],
                assertion=assertion,
                scopes=scopes,
                roles=roles,
            )
        except (KeyError, TypeError, ValueError) as error:
            raise AuthenticationError from error
