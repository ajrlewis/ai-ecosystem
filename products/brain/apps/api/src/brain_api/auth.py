from typing import Annotated, cast

from fastapi import Depends, Header, HTTPException, Request, status

from brain_auth import AuthContext, AuthenticationError, LocalBearerAuthenticator


def get_authenticator(request: Request) -> LocalBearerAuthenticator:
    return cast(LocalBearerAuthenticator, request.app.state.authenticator)


def get_auth_context(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
    x_mind_local_identity: Annotated[str | None, Header(include_in_schema=False)] = None,
) -> AuthContext:
    try:
        asserted = get_authenticator(request).authenticate_assertion(
            x_mind_local_identity, request.app.state.local_identity_secret
        )
        if asserted is not None:
            if "brain.api" not in asserted.scopes:
                raise HTTPException(status_code=403, detail="brain.api scope is required")
            return asserted
        return get_authenticator(request).authenticate(authorization)
    except AuthenticationError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
            headers={"WWW-Authenticate": "Bearer"},
        ) from error


def require_steward(context: Annotated[AuthContext, Depends(get_auth_context)]) -> AuthContext:
    if "knowledge.steward" not in context.roles:
        raise HTTPException(status_code=403, detail="knowledge.steward role is required")
    return context
