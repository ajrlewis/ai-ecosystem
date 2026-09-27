"""Authorized retrieval boundary; implementation is intentionally deferred."""

from knowledge_search.chunking import ChunkDraft, chunk_markdown
from knowledge_search.repository import SearchCandidate, SearchRepository

__all__ = ["ChunkDraft", "SearchCandidate", "SearchRepository", "chunk_markdown"]
