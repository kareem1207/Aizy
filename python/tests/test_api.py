import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(scope="module")
def client():
    # Context manager runs the startup event, which trains the models.
    with TestClient(main.app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "healthy"


def test_fashion_query(client):
    r = client.post("/ai/fashion/query", json={"prompt": "outfit for a girl at a wedding"})
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert "recommend" in body["data"]["recommendation"].lower()


def test_sales_forecast(client):
    r = client.post("/ai/sales/forecast")
    assert r.status_code == 200
    forecast = r.json()["data"]["forecast"]
    assert forecast["sales_forecasts"] and forecast["best_overall_product"]


def test_training_is_disabled_without_admin_token(client, monkeypatch):
    monkeypatch.delenv("AI_ADMIN_TOKEN", raising=False)
    assert client.post("/ai/fashion/train", json={}).status_code == 403
    assert client.post("/ai/sales/train", json={}).status_code == 403
    assert client.post("/ai/admin/train", json={}).status_code == 403


def test_training_needs_the_right_token(client, monkeypatch):
    monkeypatch.setenv("AI_ADMIN_TOKEN", "s3cret")
    assert client.post("/ai/fashion/train", json={}).status_code == 401
    assert client.post("/ai/fashion/train", json={}, headers={"X-Admin-Token": "nope"}).status_code == 401


def test_training_cannot_read_arbitrary_files(client, monkeypatch):
    monkeypatch.setenv("AI_ADMIN_TOKEN", "s3cret")
    headers = {"X-Admin-Token": "s3cret"}
    # Traversal attempts are reduced to a bare file name inside ./data, never a system path.
    r = client.post("/ai/sales/train", json={"filepath": "../../etc/passwd"}, headers=headers)
    assert r.status_code in (400, 500)
    assert "passwd" not in r.text or "data" in r.text
