import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_register_and_login_flow():
    import uuid
    random_suffix = uuid.uuid4().hex[:6]
    test_email = f"student_{random_suffix}@ub.ac.id"
    test_password = "Password123!"

    # 1. Register student
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "full_name": "Mahasiswa Uji",
            "role": "student",
            "identifier": "22515020999"
        }
    )
    assert reg_resp.status_code == 200, reg_resp.text
    reg_data = reg_resp.json()
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["role"] == "student"
    assert "access_token" in reg_data

    # 2. Login with created credentials
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": test_password
        }
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 3. Fetch profile with token
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == test_email
    assert me_resp.json()["full_name"] == "Mahasiswa Uji"

