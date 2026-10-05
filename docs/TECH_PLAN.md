# Technical Plan

**How** we build the vision in `docs/PRODUCT_VISION.md`. Part A documents the code as it exists today. Part B is the target design. Part C is the phased build plan with acceptance criteria.

---

# Part A: Current system (as built, Oct 2026)

## A.1 Request flow

```
Browser (React, Clerk session)
  │  Authorization: Bearer <Clerk JWT>
  ▼
FastAPI  /api/projects/*  ──► auth.get_current_user (Clerk JWKS, RS256)
  │                         ──► database.get_db (async SQLAlchemy)
  │                         ──► storage.upload_audio (Supabase Storage | local disk)
  │                         ──► services/* (ffmpeg, ElevenLabs) + OpenAI
  ▼
Postgres (Supabase) or SQLite

MCP client (Claude, ChatGPT, …)
  │  OAuth 2.1 (DCR + PKCE) via /oauth/*, consent page in web app (/mcp/authorize)
  ▼
POST /mcp  (JSON-RPC: initialize, tools/list, tools/call) → same logic as REST
```

All heavy work (transcription, rendering, ElevenLabs calls) currently runs **inside the HTTP request**. There is no job queue yet. That's fine for short audio; it won't be for video.

## A.2 REST endpoints (`backend/routers/projects.py`, prefix `/api/projects`)

| Method | Path | Does |
|---|---|---|
| GET | `/` | List the user's projects |
| POST | `/` | Create project |
| GET / DELETE | `/{id}` | Get / delete project |
| POST | `/{id}/upload` | Upload audio file → storage → `audio_url` |
| POST | `/{id}/transcribe` | Whisper (`whisper-1`, word + segment timestamps) → `transcript` JSON |
| GET | `/{id}/processing` | Processing status |
| POST | `/{id}/fillers` | Detect filler words → word refs |
| POST | `/{id}/edits/apply` | Apply ops (delete words, replace word via cloned-voice TTS) → new `AudioVersion` |
| GET | `/{id}/versions` | List versions |
| POST | `/{id}/versions/{vid}/activate` | Make a version active |
| POST | `/{id}/voice/clone` | ElevenLabs instant voice clone from project audio |
| POST | `/{id}/denoise` | ElevenLabs audio isolation → new version |
| POST | `/{id}/export` | Transcode chosen version to mp3/wav/m4a |
| GET/POST | `/{id}/threads` | List / create chat threads |
| PATCH/DELETE | `/{id}/threads/{tid}` | Rename / delete thread |
| GET | `/{id}/threads/{tid}/messages` | Thread history |
| POST | `/{id}/chat` | Streaming chat (OpenAI, default `gpt-4o-mini`) |

Other: `GET /api/health`, `GET /api/me`, `/oauth/*` + `/.well-known/oauth-*` (see `oauth_server.py`), `POST|GET /mcp`.

## A.3 Data model (`backend/models/db.py`)

- `projects`: id, user_id (Clerk `sub`), name, duration, status, audio_url, transcript (JSON), active_version_id, voice_id, voice_provider, timestamps
- `audio_versions`: id, project_id, parent_id, label, audio_url, transcript, duration. **Every edit = a new row.**
- `chat_threads`, `chat_messages` (role `user` | `ai`)
- `oauth_clients`, `oauth_auth_requests`, `oauth_tokens` (hashes only, 30-day access tokens, scopes `eigentalk:read` / `eigentalk:write`)

Transcript JSON shape (built in `_build_transcript`): `{ text, segments: [{ start, end, text, words: [{ word, start, end }] }] }`. Words are addressed as `(segment_idx, word_idx)`.

## A.4 Audio pipeline (`services/audio_editor.py`)

- `keep_ranges(deletes, duration)` inverts deleted word ranges into ranges to keep.
- `render_with_ops` splices kept ranges and inserted TTS clips with **40ms crossfades** to hide clicks.
- Word ranges get ±40ms padding (`_word_range`).
- ffmpeg comes from the system PATH or the `imageio-ffmpeg` wheel.

## A.5 MCP tools (`mcp_server.py`)

`list_projects, get_project, create_project, delete_project, processing_status, transcribe, get_transcript, detect_fillers, remove_all_fillers, delete_words, replace_word, remove_noise, clone_voice, list_versions, activate_version, export, list_threads, create_thread, rename_thread, delete_thread, thread_messages`

Add a tool with `@tool(name, description, schema, read_only=...)`, where the handler signature is `async def fn(user, db, **args)`.

## A.6 Known tech debt

1. No migrations framework (ad-hoc `_add_column_if_missing` in `main.py`). **Adopt Alembic** before adding ~10 new tables.
2. No job queue; long work blocks requests.
3. No tests, lint or CI.
4. `SETUP.md` describes Supabase Auth; the app uses Clerk.
5. Naming split: Sonicly (UI) vs EigenTalk (MCP/OAuth).
6. Supabase Storage public URLs: fine for audio, expensive for video egress. Move media to R2.
7. `routers/projects.py` (~1k lines) and `pages/Editor.jsx` (~1.5k lines) should be split as features grow.

---

# Part B: Target architecture

## B.1 Overview

```
React (Vercel)
  ├── Editor (audio+video), Calendar, Inbox, Analytics, Automations, Copilot, Settings/Connections
  ▼
FastAPI API (Railway)                         MCP server (same app; new tools for every module)
  ├── routers: projects, media, accounts, posts, automations, inbox, analytics, copilot, webhooks, billing
  ├── platform adapters (direct + unified-API fallback)
  ├── token vault (encrypted OAuth tokens)
  └── enqueue jobs ──► Redis queue ──► Worker processes:
                                        • render (ffmpeg: transcode, reframe, captions, clips) → R2
                                        • publish (per variant, idempotent, retry w/ backoff)
                                        • status poll (until platform says "published")
                                        • metrics sync (hourly ≤48h, then daily)
                                        • comments sync + automation rule evaluation
                                        • token refresh + expiry alerts
                                        • scheduler tick (due posts → publish jobs)
Webhooks in ──► /webhooks/{meta|youtube|tiktok|stripe|unified} ──► verify signature ──► enqueue
Postgres (Supabase) · R2 (media) · Clerk (auth) · Stripe (billing) · Resend (email) · Sentry/PostHog
```

Queue choice: **Arq** (asyncio-native, Redis, fits FastAPI) is the default recommendation. Alternatives: Dramatiq/Celery, or hosted Inngest/Trigger.dev. Run workers as a second Railway service from the same codebase (`arq worker.WorkerSettings`).

## B.2 New data model

```
media_assets        id, user_id, project_id, kind(audio|video|image), r2_key, url, duration, width, height,
                    fps, size_bytes, source(upload|render|record), created_at
social_accounts     id, user_id, platform, platform_user_id, handle, display_name, avatar_url,
                    access_token_enc, refresh_token_enc, scopes, expires_at, status(active|expiring|revoked|error),
                    provider(direct|unified), unified_profile_id, created_at, updated_at
posts               id, user_id, project_id, master_asset_id, title, status(draft|scheduled|publishing|done|partial|failed),
                    scheduled_at, created_at
post_variants       id, post_id, social_account_id, platform, asset_id(rendered variant), caption, title,
                    hashtags, thumbnail_asset_id, settings JSON (privacy, allow_comments, made_for_kids, etc.),
                    status(queued|rendering|uploading|processing|published|failed), platform_post_id,
                    platform_url, error, attempts, idempotency_key, published_at
post_metrics        id, variant_id, captured_at, views, likes, comments, shares, saves, watch_time_s,
                    avg_view_duration_s, followers_gained, raw JSON          ← time series, never overwrite
retention_curves    id, variant_id, captured_at, points JSON [{ratio, audience_watch_ratio, relative_perf}]
automations         id, user_id, name, enabled, trigger JSON, conditions JSON, actions JSON, created_at
automation_runs     id, automation_id, trigger_event JSON, status, actions_result JSON, created_at
comments            id, social_account_id, variant_id, platform_comment_id, parent_id, author_handle,
                    author_platform_id, text, created_at_platform, sentiment, status(new|replied|hidden|ignored),
                    replied_by(automation|user|ai), reply_text
dm_sends            id, comment_id, automation_id, platform, status, error, sent_at   ← dedupe: unique(comment_id)
contacts            id, user_id, platform, platform_user_id, handle, email, source_automation_id, created_at
competitors         id, user_id, platform, channel_id, handle, added_at
usage_events        id, user_id, kind(render_min|ai_tokens|x_post|transcribe_min), quantity, cost_usd, created_at
subscriptions       id, user_id, stripe_customer_id, plan, status, current_period_end
```

Use Alembic for all of it.

## B.3 Platform adapter interface

One interface, one implementation per platform, plus a fallback adapter that calls the unified API. That lets us move platforms from "unified" to "direct" one at a time without touching callers.

```python
class PlatformAdapter(Protocol):
    platform: str
    capabilities: set[str]   # {"publish_video","publish_image","schedule_native","metrics",
                             #  "retention","comments_read","comments_reply","private_reply_dm","webhooks"}

    def oauth_url(self, state: str) -> str: ...
    async def exchange_code(self, code: str) -> TokenSet: ...
    async def refresh(self, account) -> TokenSet: ...

    async def validate(self, variant) -> list[str]: ...          # pre-flight: aspect, length, size, caption limits
    async def publish(self, account, variant) -> PublishResult: ... # returns platform id or a pending handle
    async def status(self, account, handle) -> PublishStatus: ...   # poll until published/failed

    async def metrics(self, account, platform_post_id) -> Metrics: ...
    async def retention(self, account, platform_post_id) -> list[Point] | None: ...
    async def list_comments(self, account, platform_post_id, since) -> list[Comment]: ...
    async def reply_comment(self, account, comment_id, text) -> str: ...
    async def private_reply(self, account, comment_id, text) -> str: ...   # IG/FB only
```

The UI reads `capabilities` to show or hide features per platform. That's the "honesty" principle in code.

## B.4 Platform rules to encode (verify against official docs before shipping)

| Platform | Key limits / rules |
|---|---|
| YouTube | Uploads are **private until the API compliance audit passes**. Default quota 10,000 units/day **per Google Cloud project**; `videos.insert` commonly cited at 1,600 units (verify), `comments.insert` 50. Request a quota increase. Shorts = vertical, ≤3 min. |
| Instagram | Business/Creator accounts only. 100 API posts / 24h. Reels 9:16, 5–90s for Reels tab. Container create → poll status → publish. Private replies: one per comment, within 7 days. Needs Meta App Review + Business Verification. |
| Facebook Pages | 30 API Reels / 24h per Page. Upload session → upload → publish. |
| Threads | ~250 posts and 1,000 replies / 24h. Reply Management API + webhooks. |
| TikTok | Unaudited: SELF_ONLY visibility, max 5 users/24h, accounts must be private. Audit required for public posting. **No comment or DM API.** Strict UX requirements in the posting flow (preview, privacy selector, content-disclosure toggles). |
| X | Pay-per-use since Feb 2026, no free tier. Charged per post, and more for posts with links (verify current price). Track every call in `usage_events`. |
| LinkedIn | Personal posts: self-serve `w_member_social`, video ≤15 min. Company pages: Community Management API (partner review). |
| Pinterest | v5; video = register media → upload → create pin. Trial mode posts only to the app owner's account until upgraded. |
| Bluesky | AT Protocol, no review. Video ≤60s, ≤50MB via `video.bsky.app`. |

## B.5 Publishing state machine

```
post_variant:  queued ─► rendering ─► uploading ─► processing ─► published
                  │          │            │             │
                  └──────────┴────────────┴─────────────┴──► failed (retryable? → back to queued with backoff, max N)
post.status = aggregate of its variants: done | partial | failed
```

- **Idempotency key** per variant attempt, so a retry never double-posts.
- `published` is set only after the platform confirms. That event emits `post.published{platform, url}`, which is what **cascade automations** listen to.

## B.6 Automation engine

```json
{
  "trigger":    {"type": "post.published", "platform": "youtube"},
  "conditions": [{"field": "variant.kind", "op": "eq", "value": "short"}],
  "actions": [
    {"type": "post", "platform": "x",        "template": "ai:announce", "include_link": true},
    {"type": "post", "platform": "threads",  "template": "ai:announce"},
    {"type": "comment", "platform": "youtube", "target": "self", "pin": true, "text": "Full episode → {{link}}"}
  ]
}
```

```json
{
  "trigger":    {"type": "comment.created", "platform": "instagram", "post": "any"},
  "conditions": [{"field": "comment.text", "op": "contains_word", "value": "LINK", "case": "insensitive"}],
  "actions": [
    {"type": "private_reply", "text": "Here you go 👉 {{url}}"},
    {"type": "reply_comment", "text": "Sent! Check your DMs 📩"}
  ]
}
```

Rules: dedupe on `(comment_id)`, per-account rate limits, respect the 7-day private-reply window, never DM anyone who didn't interact, log every run in `automation_runs`.

## B.7 Security

- OAuth tokens encrypted with an app key (Fernet/AES-GCM; key in env/KMS), never logged, never returned to the frontend.
- Request minimal scopes per platform; store granted scopes.
- Verify all webhook signatures (Meta `X-Hub-Signature-256`, Stripe, etc.).
- Per-user authorization checks on every resource (the current `_get_owned_project` pattern).
- Audit log for publish/delete/automation actions.
- Required public pages for platform reviews: privacy policy, terms, data-deletion instructions/callback.

## B.8 Environment variables to add

```
# Storage / queue
R2_ACCOUNT_ID=  R2_ACCESS_KEY_ID=  R2_SECRET_ACCESS_KEY=  R2_BUCKET=  R2_PUBLIC_BASE_URL=
REDIS_URL=
TOKEN_ENCRYPTION_KEY=

# Unified posting API (MVP)
UNIFIED_API_PROVIDER=ayrshare|zernio|bundle   UNIFIED_API_KEY=

# Direct platforms
GOOGLE_CLIENT_ID=  GOOGLE_CLIENT_SECRET=                     # YouTube Data + Analytics
META_APP_ID=  META_APP_SECRET=  META_WEBHOOK_VERIFY_TOKEN=   # FB, IG
THREADS_APP_ID=  THREADS_APP_SECRET=
TIKTOK_CLIENT_KEY=  TIKTOK_CLIENT_SECRET=
X_CLIENT_ID=  X_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=  LINKEDIN_CLIENT_SECRET=
PINTEREST_APP_ID=  PINTEREST_APP_SECRET=

# AI / data
ANTHROPIC_API_KEY=            # if the copilot moves to Claude
DEEPGRAM_API_KEY=             # or keep Whisper; needed for video captions at scale
GOOGLE_TRENDS_API_KEY=        # alpha access by application

# Business
STRIPE_SECRET_KEY=  STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=  POSTHOG_KEY=
```

Each must follow the existing pattern: **missing key → that feature reports "not configured", the app still boots.**

---

# Part C: Phased build plan

### Phase 0: Foundations and paperwork (start now; reviews run in the background)
- [ ] Decide the final product name (OAuth scopes depend on it)
- [ ] Publish privacy policy, terms, and data-deletion pages on the frontend
- [ ] Create developer apps: Google Cloud, Meta (+ Business Manager, Business Verification), TikTok, X, LinkedIn, Pinterest
- [ ] Submit: YouTube API compliance audit + quota increase, Meta App Review, TikTok Content Posting audit, LinkedIn CMA, Google Trends API alpha
- [ ] Rewrite `SETUP.md` for Clerk + current env vars
- [ ] Add Alembic (baseline migration from current models)
- [ ] Add Redis + Arq worker service; move transcription/denoise/export into jobs with status polling
- [ ] Add R2 storage behind `storage.py` (keep Supabase/local fallbacks)
- [ ] Minimal pytest suite for transcript ops (`fillers`, `keep_ranges`, `_apply_edits_to_transcript`) + GitHub Actions CI

**Done when:** the app runs with a worker, media goes to R2, migrations work, CI is green, and all reviews are submitted.

### Phase 1: Video + Publish MVP
- [ ] `media_assets`; video upload (chunked/resumable) → R2
- [ ] Transcribe video (extract audio → existing pipeline); transcript edits apply to video (ffmpeg cut/concat with the same keep-ranges)
- [ ] Captions: generate SRT from word timestamps; burn-in option with 2–3 styles
- [ ] Reframe 16:9 → 9:16 (center crop v1; face tracking later)
- [ ] `social_accounts` via the unified API (connect flow, list accounts, health)
- [ ] `posts` / `post_variants`, platform pre-flight validation, publish now + schedule, calendar view
- [ ] AI caption/title per platform (existing chat model)
- [ ] Cascade automation v1: `post.published` → post to X/Threads/LinkedIn/Bluesky with link
- [ ] MCP tools: `list_accounts, create_post, schedule_post, post_status, list_posts`

**Done when:** a user uploads a video, cuts it by transcript, renders a 9:16 captioned Short, posts it to YouTube + IG + TikTok, and an X post with the YouTube link fires automatically after YouTube confirms publish.

### Phase 2: Listen and Engage
- [ ] Direct Meta adapter (IG, FB, Threads) once App Review passes; webhooks for comments
- [ ] `comments` sync for YT/IG/FB/Threads; unified inbox UI; AI-drafted replies
- [ ] Comment-to-DM automations (IG/FB private replies) + YouTube comment auto-reply; `dm_sends` dedupe; `contacts`
- [ ] `post_metrics` sync jobs; cross-platform analytics dashboard
- [ ] Copilot v2: tool calling over posts/metrics/comments ("what worked this month?")
- [ ] MCP tools: `list_comments, reply_comment, create_automation, get_metrics`

**Done when:** "comment LINK" on an IG Reel sends a DM within a minute, exactly once per commenter, and the dashboard shows 7-day performance across platforms.

### Phase 3: Close the loop (moat)
- [ ] Direct YouTube adapter (after audit): upload, YouTube Analytics retention curves → `retention_curves`
- [ ] Retention overlay on the editor transcript/timeline
- [ ] "Hook doctor": detect early drop-off, suggest a rewrite, regenerate the line with the cloned voice, re-render
- [ ] AI clipping from long-form (score segments by transcript + historical retention)
- [ ] Competitor tracking (public YouTube data), trend radar, idea → script → record
- [ ] Podcast → everything: chapters, audiograms, show notes, newsletter draft

### Phase 4: Scale and business
- [ ] Stripe billing, plans, `usage_events` metering, usage UI
- [ ] Direct TikTok adapter (after audit); Pinterest, Bluesky direct
- [ ] Teams/workspaces, roles, approvals, client reports (Studio plan)
- [ ] Long-tail platforms via the unified API (Snapchat, Reddit, Google Business, Telegram)
- [ ] Mobile capture app

## Testing strategy (to adopt from Phase 0)

- Unit: transcript ops, keep-range math, platform validators, automation rule matching
- Adapter contract tests with recorded HTTP fixtures (no live platform calls in CI)
- One end-to-end smoke test per phase "done when" scenario, run manually against sandbox/test accounts
