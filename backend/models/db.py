"""SQLAlchemy ORM models."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    name: Mapped[str] = mapped_column(String(255))
    duration: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="New")
    audio_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    transcript: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    active_version_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    voice_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    voice_provider: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class AudioVersion(Base):
    """An audio + transcript snapshot. Every edit produces a new row."""
    __tablename__ = "audio_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("audio_versions.id", ondelete="SET NULL"), nullable=True
    )
    label: Mapped[str] = mapped_column(String(128), default="Edit")
    audio_url: Mapped[str] = mapped_column(String(1024))
    transcript: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class ChatThread(Base):
    """One conversation inside a project. A project can hold many."""
    __tablename__ = "chat_threads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="New chat")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class OAuthClient(Base):
    """An MCP client that registered itself via Dynamic Client Registration.

    Claude, Codex and friends can't be pre-registered, so they self-register
    on first connect (RFC 7591).
    """
    __tablename__ = "oauth_clients"

    client_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    client_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    redirect_uris: Mapped[list] = mapped_column(JSON, default=list)
    # Public clients (PKCE-only) have no secret; confidential ones store a hash.
    client_secret_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class OAuthAuthRequest(Base):
    """One authorization attempt: pending consent, then an issued code.

    Holds the PKCE challenge and the client's redirect target between
    /authorize and the user approving it in the web app.
    """
    __tablename__ = "oauth_auth_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(64), index=True)
    redirect_uri: Mapped[str] = mapped_column(String(1024))
    state: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    code_challenge: Mapped[str] = mapped_column(String(256))
    code_challenge_method: Mapped[str] = mapped_column(String(16), default="S256")
    scope: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    resource: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    # Set once the user approves.
    user_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    code_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class OAuthToken(Base):
    """An issued access token. Only hashes are stored, never the token."""
    __tablename__ = "oauth_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    access_token_hash: Mapped[str] = mapped_column(String(128), index=True, unique=True)
    refresh_token_hash: Mapped[Optional[str]] = mapped_column(
        String(128), nullable=True, index=True
    )
    client_id: Mapped[str] = mapped_column(String(64), index=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    scope: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class ChatMessage(Base):
    """A single turn in a chat thread."""
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    thread_id: Mapped[int] = mapped_column(
        ForeignKey("chat_threads.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(16))  # "user" | "ai"
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
