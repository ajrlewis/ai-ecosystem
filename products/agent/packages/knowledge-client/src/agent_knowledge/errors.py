class KnowledgeClientError(Exception):
    """Base class for safe, deterministic Knowledge client failures."""


class KnowledgeUnavailable(KnowledgeClientError):
    pass


class KnowledgeRejectedCredentials(KnowledgeClientError):
    pass


class KnowledgeMalformedResponse(KnowledgeClientError):
    pass


class KnowledgeUnexpectedResponse(KnowledgeClientError):
    pass
