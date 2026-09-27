from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AgentKnowledgeModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class KnowledgeHealth(AgentKnowledgeModel):
    status: Literal["ok"]
    service: str
    environment: str


class KnowledgeIdentityContext(AgentKnowledgeModel):
    organization_id: UUID
    principal_id: UUID
    group_ids: tuple[UUID, ...]


class KnowledgeSearchResult(BaseModel):
    page_id: UUID
    page_version_id: UUID
    title: str
    path: str
    snippet: str


class KnowledgeSearchResponse(BaseModel):
    results: list[KnowledgeSearchResult]


class KnowledgeSource(BaseModel):
    title: str


class KnowledgeProvenance(BaseModel):
    source: KnowledgeSource


class KnowledgePageVersion(BaseModel):
    id: UUID
    content_markdown: str
    provenance: list[KnowledgeProvenance]


class KnowledgePage(BaseModel):
    id: UUID
    title: str
    current_version: KnowledgePageVersion
