from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from agent_knowledge.errors import (
    KnowledgeMalformedResponse,
    KnowledgeRejectedCredentials,
    KnowledgeUnavailable,
    KnowledgeUnexpectedResponse,
)
from agent_knowledge.models import (
    KnowledgeHealth,
    KnowledgeIdentityContext,
    KnowledgePage,
    KnowledgeSearchResponse,
)

ResponseModel = TypeVar("ResponseModel", bound=BaseModel)


class KnowledgeClient:
    """Typed client for the small public Knowledge surface Agent currently consumes."""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        connect_timeout_seconds: float,
        read_timeout_seconds: float,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self._owns_http_client = http_client is None
        self._http_client = http_client or httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=httpx.Timeout(
                connect=connect_timeout_seconds,
                read=read_timeout_seconds,
                write=read_timeout_seconds,
                pool=connect_timeout_seconds,
            ),
        )
        self._authorization = f"Bearer {api_key}"

    async def health(self) -> KnowledgeHealth:
        return await self._get("/health", KnowledgeHealth, authenticated=False)

    async def identity_context(
        self, *, identity_assertion: str | None = None
    ) -> KnowledgeIdentityContext:
        return await self._get(
            "/auth/context",
            KnowledgeIdentityContext,
            authenticated=True,
            identity_assertion=identity_assertion,
        )

    async def search(
        self, query: str, *, limit: int = 1, identity_assertion: str | None = None
    ) -> KnowledgeSearchResponse:
        return await self._request(
            "POST",
            "/search",
            KnowledgeSearchResponse,
            json={"query": query, "limit": limit},
            identity_assertion=identity_assertion,
        )

    async def get_page(
        self, page_id: str, *, identity_assertion: str | None = None
    ) -> KnowledgePage:
        return await self._get(
            f"/pages/{page_id}",
            KnowledgePage,
            authenticated=True,
            identity_assertion=identity_assertion,
        )

    async def aclose(self) -> None:
        if self._owns_http_client:
            await self._http_client.aclose()

    async def _get(
        self,
        path: str,
        model: type[ResponseModel],
        *,
        authenticated: bool,
        identity_assertion: str | None = None,
    ) -> ResponseModel:
        headers = {"Authorization": self._authorization} if authenticated else None
        return await self._request(
            "GET", path, model, headers=headers, identity_assertion=identity_assertion
        )

    async def _request(
        self,
        method: str,
        path: str,
        model: type[ResponseModel],
        *,
        headers: dict[str, str] | None = None,
        json: dict[str, object] | None = None,
        identity_assertion: str | None = None,
    ) -> ResponseModel:
        if method == "POST":
            headers = {"Authorization": self._authorization}
        if identity_assertion is not None:
            headers = {**(headers or {}), "X-AI-Ecosystem-Local-Identity": identity_assertion}
        try:
            response = await self._http_client.request(method, path, headers=headers, json=json)
        except httpx.TransportError as exc:
            raise KnowledgeUnavailable("Knowledge is unavailable") from exc

        if response.status_code in {401, 403}:
            raise KnowledgeRejectedCredentials("Knowledge rejected Agent credentials")
        if response.status_code != 200:
            raise KnowledgeUnexpectedResponse("Knowledge returned an unexpected status")
        try:
            return model.model_validate(response.json())
        except (ValueError, ValidationError) as exc:
            raise KnowledgeMalformedResponse("Knowledge returned a malformed response") from exc
