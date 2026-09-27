import os

import httpx
import pytest


@pytest.mark.e2e
def test_authenticated_durable_conversation_flow() -> None:
    agent_url = os.getenv("AGENT_TEST_URL")
    token = os.getenv("AGENT_TEST_BEARER_TOKEN", "agent-local-dev")
    if agent_url is None:
        pytest.skip("AGENT_TEST_URL is required for the external Agent boundary test")
    headers = {"Authorization": f"Bearer {token}"}

    created = httpx.post(f"{agent_url}/conversations", headers=headers, timeout=10)
    assert created.status_code == 201
    conversation_id = created.json()["id"]
    turn = httpx.post(
        f"{agent_url}/conversations/{conversation_id}/turns",
        headers=headers,
        json={"content": "Northstar hello"},
        timeout=10,
    )
    assert turn.status_code == 200
    assert turn.json()["model"] == "agent-deterministic-v1"
    reopened = httpx.get(
        f"{agent_url}/conversations/{conversation_id}", headers=headers, timeout=10
    )
    assert reopened.status_code == 200
    assert [
        (item["sequence"], item["role"], item["content"]) for item in reopened.json()["messages"]
    ] == [
        (1, "user", "Northstar hello"),
        (2, "assistant", "Synthetic response to: Northstar hello"),
    ]
