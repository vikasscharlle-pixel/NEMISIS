def _login(client, email: str, password: str = "Nemesis@123") -> str:
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def test_seed_counts_and_login(client):
    admin_token = _login(client, "admin@nemesis-x.io")
    headers = {"Authorization": f"Bearer {admin_token}"}

    users_resp = client.get("/users", headers=headers)
    assert users_resp.status_code == 200
    assert users_resp.json()["total"] == 10

    events_resp = client.get("/events?limit=100", headers=headers)
    assert events_resp.status_code == 200
    assert events_resp.json()["total"] == 50


def test_register_and_protected_routes(client):
    unauth = client.get("/dashboard/stats")
    assert unauth.status_code == 401

    reg = client.post(
        "/auth/register",
        json={
            "name": "New Viewer",
            "email": "newviewer@nemesis-x.io",
            "password": "Password123!",
        },
    )
    assert reg.status_code == 201
    data = reg.json()
    assert data["user"]["role"] == "Viewer"
    viewer_headers = {"Authorization": f"Bearer {data['access_token']}"}

    # Viewer can read dashboard & reports
    stats = client.get("/dashboard/stats", headers=viewer_headers)
    assert stats.status_code == 200
    assert stats.json()["total_alerts"] == 50

    reports = client.get("/reports", headers=viewer_headers)
    assert reports.status_code == 200
    assert reports.json()["total_events"] == 50

    # Viewer cannot access Admin user management
    denied = client.get("/users", headers=viewer_headers)
    assert denied.status_code == 403


def test_rbac_create_user_and_event_detail(client):
    operator_token = _login(client, "operator@nemesis-x.io")
    op_headers = {"Authorization": f"Bearer {operator_token}"}

    # Operator cannot create users
    forbidden = client.post(
        "/users",
        headers=op_headers,
        json={
            "name": "Blocked User",
            "email": "blocked@nemesis-x.io",
            "password": "Password123!",
            "role": "Viewer",
        },
    )
    assert forbidden.status_code == 403

    # Operator can read event detail & update status
    detail = client.get("/events/1", headers=op_headers)
    assert detail.status_code == 200
    assert len(detail.json()["evidence_items"]) == 1

    patch = client.patch("/events/1/status", headers=op_headers, json={"status": "CLEANING"})
    assert patch.status_code == 200
    assert patch.json()["status"] == "CLEANING"

    # Admin can create a new user
    admin_token = _login(client, "admin@nemesis-x.io")
    created = client.post(
        "/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Created Operator",
            "email": "created.op@nemesis-x.io",
            "password": "Password123!",
            "role": "Operator",
        },
    )
    assert created.status_code == 201
    assert created.json()["role"] == "Operator"
