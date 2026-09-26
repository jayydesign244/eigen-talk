"""OAuth 2.1 authorization server for the MCP endpoint.

MCP clients can't be pre-registered, so they self-register (RFC 7591) and
authorize with PKCE. Clerk provides OAuth endpoints but no Dynamic Client
Registration, so we act as the authorization server ourselves and delegate
the human login to the existing web app:

  client  → GET  /oauth/authorize          (stores the request, redirects)
  browser → web app consent page           (user already signed in via Clerk)
  web app → POST /oauth/consent            (Clerk bearer token proves identity)
          ← redirect_to                    (back to the client with a code)
  client  → POST /oauth/token              (code + PKCE verifier → token)
  client  → POST /mcp                      (Bearer <our token>)

Only hashes of codes and tokens are persisted.
"""
import base64
import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.db import OAuthAuthRequest, OAuthClient, OAuthToken

router = APIRouter(tags=["oauth"])

AUTH_CODE_TTL = timedelta(minutes=5)
ACCESS_TOKEN_TTL = timedelta(days=30)
CONSENT_REQUEST_TTL = timedelta(minutes=15)
SCOPES = ["eigentalk:read", "eigentalk:write"]
DEFAULT_SCOPE = " ".join(SCOPES)


def public_base_url(request: Request) -> str:
    """Externally reachable origin. Behind a proxy the forwarded headers win."""
    configured = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
    if configured and "localhost" not in configured:
        return configured
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    return f"{proto}://{host}".rstrip("/")


def app_base_url() -> str:
    """Where the consent page lives — the first allowed frontend origin."""
    explicit = os.environ.get("APP_BASE_URL", "").rstrip("/")
    if explicit:
        return explicit
    origins = os.environ.get("ALLOWED_ORIGINS", "")
    first = next((o.strip() for o in origins.split(",") if o.strip()), "")
    return first.rstrip("/") or "http://localhost:3000"


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _now() -> datetime:
    return datetime.utcnow()


def _verify_pkce(verifier: str, challenge: str, method: str) -> bool:
    if method == "plain":
        return secrets.compare_digest(verifier, challenge)
    digest = hashlib.sha256(verifier.encode()).digest()
    expected = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return secrets.compare_digest(expected, challenge)


# --------------------------------------------------------------------------
# Discovery
# --------------------------------------------------------------------------

@router.get("/.well-known/oauth-protected-resource")
@router.get("/.well-known/oauth-protected-resource/mcp")
async def protected_resource_metadata(request: Request):
    base = public_base_url(request)
    return {
        "resource": f"{base}/mcp",
        "authorization_servers": [base],
        "scopes_supported": SCOPES,
        "bearer_methods_supported": ["header"],
        "resource_name": "EigenTalk",
    }


@router.get("/.well-known/oauth-authorization-server")
@router.get("/.well-known/oauth-authorization-server/mcp")
async def authorization_server_metadata(request: Request):
    base = public_base_url(request)
    return {
        "issuer": base,
        "authorization_endpoint": f"{base}/oauth/authorize",
        "token_endpoint": f"{base}/oauth/token",
        "registration_endpoint": f"{base}/oauth/register",
        "scopes_supported": SCOPES,
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "code_challenge_methods_supported": ["S256"],
        "token_endpoint_auth_methods_supported": ["none", "client_secret_post"],
    }


# --------------------------------------------------------------------------
# Dynamic client registration (RFC 7591)
# --------------------------------------------------------------------------

class RegistrationRequest(BaseModel):
    redirect_uris: list[str] = []
    client_name: Optional[str] = None
    token_endpoint_auth_method: Optional[str] = "none"
    grant_types: Optional[list[str]] = None
    response_types: Optional[list[str]] = None
    scope: Optional[str] = None


@router.post("/oauth/register", status_code=201)
async def register_client(
    payload: RegistrationRequest, db: AsyncSession = Depends(get_db)
):
    if not payload.redirect_uris:
        raise HTTPException(status_code=400, detail="redirect_uris is required")

    client_id = secrets.token_urlsafe(24)
    confidential = payload.token_endpoint_auth_method not in (None, "", "none")
    secret = secrets.token_urlsafe(32) if confidential else None

    db.add(OAuthClient(
        client_id=client_id,
        client_name=(payload.client_name or "MCP client")[:255],
        redirect_uris=payload.redirect_uris,
        client_secret_hash=_hash(secret) if secret else None,
    ))
    await db.commit()

    body = {
        "client_id": client_id,
        "client_name": payload.client_name or "MCP client",
        "redirect_uris": payload.redirect_uris,
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "client_secret_post" if secret else "none",
        "client_id_issued_at": int(_now().timestamp()),
    }
    if secret:
        body["client_secret"] = secret
    return body


# --------------------------------------------------------------------------
# Authorization
# --------------------------------------------------------------------------

@router.get("/oauth/authorize")
async def authorize(
    request: Request,
    client_id: str,
    redirect_uri: str,
    response_type: str = "code",
    code_challenge: str = "",
    code_challenge_method: str = "S256",
    state: Optional[str] = None,
    scope: Optional[str] = None,
    resource: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Validate the request, park it, and send the user to the consent page."""
    if response_type != "code":
        raise HTTPException(status_code=400, detail="Only response_type=code is supported")
    if not code_challenge:
        raise HTTPException(status_code=400, detail="PKCE code_challenge is required")
    if code_challenge_method not in ("S256", "plain"):
        raise HTTPException(status_code=400, detail="Unsupported code_challenge_method")

    client = (await db.execute(
        select(OAuthClient).where(OAuthClient.client_id == client_id)
    )).scalar_one_or_none()
    if client is None:
        raise HTTPException(status_code=400, detail="Unknown client_id")
    if redirect_uri not in (client.redirect_uris or []):
        # Never redirect to an unregistered URI — that's the open-redirect hole.
        raise HTTPException(status_code=400, detail="redirect_uri not registered")

    request_id = secrets.token_urlsafe(24)
    db.add(OAuthAuthRequest(
        id=request_id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        state=state,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
        scope=scope or DEFAULT_SCOPE,
        resource=resource,
        expires_at=_now() + CONSENT_REQUEST_TTL,
    ))
    await db.commit()

    consent = f"{app_base_url()}/mcp/authorize?" + urlencode({"request_id": request_id})
    return RedirectResponse(consent, status_code=302)


class ConsentDecision(BaseModel):
    request_id: str
    approve: bool = True


@router.get("/oauth/consent/{request_id}")
async def consent_details(
    request_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """What the consent page shows: who is asking, and for what."""
    req = (await db.execute(
        select(OAuthAuthRequest).where(OAuthAuthRequest.id == request_id)
    )).scalar_one_or_none()
    if req is None or req.expires_at < _now() or req.code_hash:
        raise HTTPException(status_code=404, detail="Authorization request not found or expired")
    client = (await db.execute(
        select(OAuthClient).where(OAuthClient.client_id == req.client_id)
    )).scalar_one_or_none()
    return {
        "client_name": (client.client_name if client else None) or "An MCP client",
        "scopes": (req.scope or DEFAULT_SCOPE).split(),
        "account_email": user.get("email") or user.get("sub"),
    }


@router.post("/oauth/consent")
async def consent(
    decision: ConsentDecision,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The signed-in user approves. Mint a code and hand back the redirect."""
    req = (await db.execute(
        select(OAuthAuthRequest).where(OAuthAuthRequest.id == decision.request_id)
    )).scalar_one_or_none()
    if req is None or req.expires_at < _now() or req.code_hash:
        raise HTTPException(status_code=404, detail="Authorization request not found or expired")

    params = {}
    if req.state:
        params["state"] = req.state

    if not decision.approve:
        params["error"] = "access_denied"
        req.used = True
        await db.commit()
        return {"redirect_to": f"{req.redirect_uri}?{urlencode(params)}"}

    code = secrets.token_urlsafe(32)
    req.user_id = user.get("sub")
    req.code_hash = _hash(code)
    req.expires_at = _now() + AUTH_CODE_TTL
    await db.commit()

    params["code"] = code
    return {"redirect_to": f"{req.redirect_uri}?{urlencode(params)}"}


# --------------------------------------------------------------------------
# Token
# --------------------------------------------------------------------------

def _issue_tokens(db: AsyncSession, client_id: str, user_id: str, scope: str) -> dict:
    access = secrets.token_urlsafe(40)
    refresh = secrets.token_urlsafe(40)
    db.add(OAuthToken(
        access_token_hash=_hash(access),
        refresh_token_hash=_hash(refresh),
        client_id=client_id,
        user_id=user_id,
        scope=scope,
        expires_at=_now() + ACCESS_TOKEN_TTL,
    ))
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": int(ACCESS_TOKEN_TTL.total_seconds()),
        "scope": scope,
    }


def _token_error(error: str, description: str, status: int = 400) -> JSONResponse:
    return JSONResponse({"error": error, "error_description": description}, status_code=status)


@router.post("/oauth/token")
async def token(
    grant_type: str = Form(...),
    code: Optional[str] = Form(None),
    redirect_uri: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    client_secret: Optional[str] = Form(None),
    code_verifier: Optional[str] = Form(None),
    refresh_token: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    if grant_type == "refresh_token":
        if not refresh_token:
            return _token_error("invalid_request", "refresh_token is required")
        existing = (await db.execute(
            select(OAuthToken).where(
                OAuthToken.refresh_token_hash == _hash(refresh_token),
                OAuthToken.revoked == False,  # noqa: E712
            )
        )).scalar_one_or_none()
        if existing is None:
            return _token_error("invalid_grant", "Unknown or revoked refresh token")
        existing.revoked = True  # rotate
        issued = _issue_tokens(db, existing.client_id, existing.user_id, existing.scope or DEFAULT_SCOPE)
        await db.commit()
        return issued

    if grant_type != "authorization_code":
        return _token_error("unsupported_grant_type", f"Unsupported grant_type: {grant_type}")
    if not code or not code_verifier:
        return _token_error("invalid_request", "code and code_verifier are required")

    req = (await db.execute(
        select(OAuthAuthRequest).where(OAuthAuthRequest.code_hash == _hash(code))
    )).scalar_one_or_none()
    if req is None or req.used or req.user_id is None:
        return _token_error("invalid_grant", "Unknown or already-used authorization code")
    if req.expires_at < _now():
        return _token_error("invalid_grant", "Authorization code expired")
    if client_id and client_id != req.client_id:
        return _token_error("invalid_grant", "client_id does not match the code")
    if redirect_uri and redirect_uri != req.redirect_uri:
        return _token_error("invalid_grant", "redirect_uri does not match the code")
    if not _verify_pkce(code_verifier, req.code_challenge, req.code_challenge_method):
        return _token_error("invalid_grant", "PKCE verification failed")

    client = (await db.execute(
        select(OAuthClient).where(OAuthClient.client_id == req.client_id)
    )).scalar_one_or_none()
    if client is not None and client.client_secret_hash:
        if not client_secret or _hash(client_secret) != client.client_secret_hash:
            return _token_error("invalid_client", "Bad client credentials", status=401)

    req.used = True  # single use
    issued = _issue_tokens(db, req.client_id, req.user_id, req.scope or DEFAULT_SCOPE)
    await db.commit()
    return issued


# --------------------------------------------------------------------------
# Resolving our tokens on the MCP endpoint
# --------------------------------------------------------------------------

async def resolve_oauth_token(raw_token: str, db: AsyncSession) -> Optional[dict]:
    """Return a user dict for one of our access tokens, or None."""
    row = (await db.execute(
        select(OAuthToken).where(
            OAuthToken.access_token_hash == _hash(raw_token),
            OAuthToken.revoked == False,  # noqa: E712
        )
    )).scalar_one_or_none()
    if row is None or row.expires_at < _now():
        return None
    return {"sub": row.user_id, "scope": row.scope, "client_id": row.client_id}
