"""RV1 acceptance · secrets never leak: AC14 (logs + error bodies + hashed storage), AC26 (error shape sweep)."""

import asyncpg
import httpx
import pytest

from tests.acceptance.conftest import (
    OTHER_PASSWORD,
    STRONG_PASSWORD,
    Server,
    assert_error,
    login,
    new_email,
    other_code,
    outbox,
    sha256_forms,
    signup,
)

SECRET_PASSWORD = "Leak@Check9"


async def test_ac14_secrets_never_appear_in_logs_or_error_bodies(
    server: Server, client: httpx.AsyncClient, db: asyncpg.Connection
) -> None:
    """AC14: run every flow, then no password, code, token, hash or full email appears in the server log or in any
    error body. (Access-log lines for the test-only outbox route are excluded: that route takes the email as a query
    parameter by design and never exists outside tests.)"""
    email = new_email("leak")
    secrets: set[str] = {SECRET_PASSWORD, OTHER_PASSWORD, email}
    error_bodies: list[str] = []

    async def call(method: str, url: str, **kwargs: object) -> httpx.Response:
        response = await client.request(method, url, **kwargs)  # type: ignore[arg-type]
        if response.status_code >= 400:
            error_bodies.append(response.text)
        return response

    code = await signup(client, email, SECRET_PASSWORD)
    secrets.add(code)
    await call("POST", "/auth/verify", json={"email": email, "code": other_code(code)})
    await call("POST", "/auth/login", json={"email": email, "password": SECRET_PASSWORD})  # 403 unverified
    pair = (await call("POST", "/auth/verify", json={"email": email, "code": code})).json()
    secrets |= {pair["access_token"], pair["refresh_token"]}

    await call("POST", "/auth/login", json={"email": email, "password": "Wrong@Pass1"})
    await call("POST", "/auth/signup", json={"email": email, "password": SECRET_PASSWORD})  # 409
    await call("POST", "/auth/signup", json={"email": "not-an-email", "password": SECRET_PASSWORD})  # 422
    await call("POST", "/auth/signup", json={"email": new_email("weak"), "password": "weakpassword"})  # 422
    rotated = (await call("POST", "/auth/refresh", json={"refresh_token": pair["refresh_token"]})).json()
    secrets |= {rotated["access_token"], rotated["refresh_token"]}
    await call("POST", "/auth/refresh", json={"refresh_token": pair["refresh_token"]})  # 401 reuse
    await call("GET", "/me", headers={"Authorization": f"Bearer {rotated['access_token']}x"})  # 401

    await call("POST", "/auth/password/forgot", json={"email": email})
    reset_code = (await outbox(client, email, "reset_password"))["code"]
    secrets.add(reset_code)
    await call("POST", "/auth/password/verify-code", json={"email": email, "code": other_code(reset_code)})
    token = (await call("POST", "/auth/password/verify-code", json={"email": email, "code": reset_code})).json()
    secrets.add(token["reset_token"])
    await call("POST", "/auth/password/reset", json={"reset_token": token["reset_token"], "new_password": "short"})
    await call(
        "POST", "/auth/password/reset", json={"reset_token": token["reset_token"], "new_password": OTHER_PASSWORD}
    )
    await call(
        "POST", "/auth/password/reset", json={"reset_token": token["reset_token"], "new_password": OTHER_PASSWORD}
    )
    await call("POST", "/auth/logout", json={"refresh_token": rotated["refresh_token"]})

    hashes = await db.fetch(
        "SELECT c.code_hash AS h FROM email_codes c JOIN users u ON u.id = c.user_id WHERE u.email = $1 "
        "UNION ALL SELECT password_hash FROM users WHERE email = $1",
        email,
    )
    secrets |= {r["h"] for r in hashes}
    for raw in (pair["refresh_token"], rotated["refresh_token"], token["reset_token"]):
        secrets |= sha256_forms(raw)

    log = "\n".join(line for line in server.log_text().splitlines() if "/test/outbox/" not in line)
    leaked_in_log = sorted(s for s in secrets if s and s in log)
    assert leaked_in_log == [], f"secrets found in the server log ({server.log_path}): {leaked_in_log}"

    assert error_bodies, "the flow should have produced error responses"
    leaked_in_bodies = sorted({s for s in secrets for body in error_bodies if s and s in body} - {email})
    assert leaked_in_bodies == [], f"secrets echoed in error bodies: {leaked_in_bodies}"


async def test_ac14_validation_errors_do_not_echo_the_password(client: httpx.AsyncClient) -> None:
    """AC14: 422 bodies never echo the submitted password (FastAPI's default validation body would)."""
    for payload in (
        {"email": "not-an-email", "password": SECRET_PASSWORD},
        {"email": new_email("x"), "password": "Ab1!" + "€" * 30},
        {"email": new_email("x"), "password": 12345678},
        {"password": SECRET_PASSWORD},
    ):
        response = await client.post("/auth/signup", json=payload)
        assert response.status_code == 422, response.text
        assert SECRET_PASSWORD not in response.text, response.text
        assert "€€€" not in response.text and "\\u20ac\\u20ac" not in response.text, response.text


async def test_ac14_refresh_tokens_are_stored_hashed(client: httpx.AsyncClient, db: asyncpg.Connection) -> None:
    """AC14: refresh_tokens.token_hash is the SHA-256 of the token; the raw token is stored nowhere in the row."""
    email = new_email("rt")
    code = await signup(client, email)
    pair = (await client.post("/auth/verify", json={"email": email, "code": code})).json()
    row = await db.fetchrow(
        "SELECT r.* FROM refresh_tokens r JOIN users u ON u.id = r.user_id WHERE u.email = $1", email
    )
    assert row is not None
    assert row["token_hash"] in sha256_forms(pair["refresh_token"])
    assert pair["refresh_token"] not in {str(v) for v in dict(row).values()}


# ── AC26 sweep ───────────────────────────────────────────────────────────────

MALFORMED_BODIES = [
    pytest.param("/auth/signup", {}, id="signup-empty"),
    pytest.param("/auth/verify", {"email": "a@example.com"}, id="verify-missing-code"),
    pytest.param("/auth/resend", {}, id="resend-empty"),
    pytest.param("/auth/login", {"email": "a@example.com"}, id="login-missing-password"),
    pytest.param("/auth/refresh", {}, id="refresh-empty"),
    pytest.param("/auth/password/forgot", {}, id="forgot-empty"),
    pytest.param("/auth/password/verify-code", {"email": "a@example.com"}, id="verify-code-missing-code"),
    pytest.param("/auth/password/reset", {"reset_token": "x"}, id="reset-missing-password"),
]


@pytest.mark.parametrize(("path", "payload"), MALFORMED_BODIES)
async def test_ac26_malformed_requests_use_the_error_shape(client: httpx.AsyncClient, path: str, payload: dict) -> None:
    """AC26: even request-validation failures come back as {"error", "detail"} (+ optional fields), never FastAPI's
    default {"detail": [...]} list."""
    response = await client.post(path, json=payload)
    assert response.status_code in (400, 422), response.text
    body = response.json()
    assert isinstance(body.get("error"), str) and body["error"], body
    assert isinstance(body.get("detail"), str), f"detail must be human text, not {type(body.get('detail'))}: {body}"


async def test_ac26_login_errors_use_the_error_shape(client: httpx.AsyncClient) -> None:
    """AC26: spot check that 401/403/409 bodies carry only the allowed keys."""
    email = new_email("shape")
    await signup(client, email, STRONG_PASSWORD)
    assert_error(await login(client, email), 403, "email_not_verified", email=email)
    assert_error(await login(client, email, "Wrong@Pass1"), 401, "invalid_credentials")
