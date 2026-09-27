import base64
import hashlib
import hmac
import json

import pytest

from cortex_auth import AuthenticationError, LocalBearerAuthenticator


def test_local_bearer_authenticates_configured_owner() -> None:
    authenticator = LocalBearerAuthenticator(token="synthetic-token", owner_id="owner-a")

    assert authenticator.authenticate("Bearer synthetic-token").owner_id == "owner-a"


def test_signed_local_identity_uses_subject_as_owner_and_rejects_tampering() -> None:
    claims = {
        "subject": "northstar-morgan",
        "scopes": ["cortex.api"],
        "roles": ["conversation.user"],
    }
    payload = base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip("=")
    signature = (
        base64.urlsafe_b64encode(
            hmac.new(b"identity-secret", payload.encode(), hashlib.sha256).digest()
        )
        .decode()
        .rstrip("=")
    )
    authenticator = LocalBearerAuthenticator(token="synthetic-token", owner_id="owner-a")

    identity = authenticator.authenticate_assertion(f"{payload}.{signature}", "identity-secret")
    assert identity is not None
    assert identity.owner_id == "northstar-morgan"
    with pytest.raises(AuthenticationError):
        authenticator.authenticate_assertion(f"{payload}.{signature}x", "identity-secret")


@pytest.mark.parametrize("authorization", [None, "", "Basic synthetic-token", "Bearer wrong"])
def test_local_bearer_rejects_absent_or_invalid_credentials(authorization: str | None) -> None:
    authenticator = LocalBearerAuthenticator(token="synthetic-token", owner_id="owner-a")

    with pytest.raises(AuthenticationError):
        authenticator.authenticate(authorization)
