# CLAUDE.md

Start here. This file gives an AI assistant (or a new teammate) the context to work on this repo without the chat history it was built in.

## What this is

**Sonicly** (internal/MCP name: **EigenTalk**, repo: `eigen-talk`) is an AI audio editor that is growing into an **all-in-one creator platform**: record → edit → publish to every social platform → engage with the audience → ask AI what to make next. The user should never have to open YouTube Studio, Instagram, TikTok, etc. separately.

- Today: a working **transcript-based audio editor** (web app + API + MCP server).
- Next: video editing, multi-platform publishing, cross-promo automations, engagement inbox, comment-to-DM, analytics, AI research copilot.

Read these before planning any feature work:

| Doc | What's in it |
|---|---|
| `docs/PRODUCT_VISION.md` | What we're building, for whom, feature modules, decisions made, open questions |
| `docs/TECH_PLAN.md` | Current architecture in detail, target architecture, new data model, platform adapter design, phased task list |
| `docs/research/social-automation-research.md` | Market and competitor research, platform API limits, required API keys, pricing ideas, sources |
| `docs/research/video-editing-research.html` | Adobe Podcast / Descript / CapCut / invideo teardown, video editing phases 1–3, prompt → settings-panel ("effect cards") spec, voice-clone plan |

## Current state (as of Oct 2026)

Working features:
- Upload audio → transcribe with **OpenAI Whisper** (`whisper-1`, word timestamps)
- Edit audio **by editing the transcript**: delete words, auto-remove filler words, replace a word (re-synthesized in the speaker's **ElevenLabs cloned voice**)
- **ElevenLabs noise removal** (audio isolation)
- **Version history**: every edit creates an `AudioVersion` row; any version can be activated
- **Video projects** (Adobe Podcast style): upload a video, edit its audio via the transcript; a muted 540p preview follows every cut through a per-version `timeline` (edited-audio time → source-video time). No visual editing yet.
- **Export** to MP3 (320k), WAV (24-bit/48k) or M4A (256k) via ffmpeg; video projects also export MP4 re-cut from the original, reframed to original/16:9/9:16/1:1 at 720p/1080p
- **Sound engine** (`services/sound/`): 45 effects (clean/repair, pitch & formant, EQ, dynamics, creative, space, fades, loudness), 65 named looks, 6 character sliders, music/intro/outro layers with auto-ducking, user presets, and audio analysis with one-click fixes. Non-destructive: a per-project draft is previewed, then "Apply" saves a version that remembers its effects and dry source, so it stays editable.
- **AI assistant** turns any request into sound settings or transcript edits through two tools (`update_sound`, `edit_audio`); short common requests ("warmer", "a bit more", "undo") are handled instantly without the model. It only helps with the recording/Sonicly, refuses off-topic requests, and its reply always lists what actually changed.
- **Transcript edits**: delete, replace (voice), bleep (tone/mute), insert pause, tighten long pauses
- **AI chat** threads saved per project
- **MCP server** at `POST /mcp` exposing every feature as a tool, plus a self-hosted **OAuth 2.1 server** (Dynamic Client Registration + PKCE) so the MCP URL can be pasted into Claude/ChatGPT/any MCP client

Not built yet: visual video editing (captions, transitions, timeline — see `docs/research/video-editing-research.html` for the phased plan), social publishing, analytics, inbox, automations, billing.

## Stack

| Layer | Tech | Hosted on |
|---|---|---|
| Frontend | React 18, React Router 6, Vite 5, Tailwind 3, wavesurfer.js, `@clerk/clerk-react` | Vercel |
| Backend | FastAPI, Pydantic v2, async SQLAlchemy 2, httpx, ffmpeg (system or `imageio-ffmpeg`) | Railway (Nixpacks, Python 3.11) |
| Auth | **Clerk** (JWT verified against Clerk JWKS in `backend/auth.py`) | Clerk |
| DB | Supabase Postgres (asyncpg); **falls back to local SQLite** `sonicly_dev.db` if `DATABASE_URL` is unset | Supabase |
| Storage | Supabase Storage bucket `audio`; **falls back to local `backend/uploads/`** if Supabase isn't configured | Supabase |
| AI | OpenAI (chat `gpt-4o-mini` default, Whisper), ElevenLabs (voice clone, TTS, isolation) | — |

> ⚠️ `SETUP.md` is **out of date**: it describes Supabase Auth, but auth was switched to **Clerk** in May 2026. Trust `backend/.env.example`, `frontend/.env.example` and this file.

## Run locally

```bash
# Backend (http://localhost:8000, docs at /docs)
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # everything is optional for a first boot
python main.py

# Frontend (http://localhost:3000)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Dev-mode behaviour worth knowing:
- No `CLERK_ISSUER` → backend skips auth and treats every request as `dev-user`.
- No `DATABASE_URL` → SQLite file. No Supabase keys → local disk uploads served at `/api/uploads`.
- No `ELEVENLABS_API_KEY` → voice clone / word replace / denoise return 503; everything else works.
- No `OPENAI_API_KEY` → transcription and chat fail.
- `.claude/launch.json` defines `sonicly-frontend` and `sonicly-backend` run configs.

There are **no automated tests, linters or CI** yet. Check changes by running the app.

## Repo map

```
backend/
  main.py              App factory, CORS, lifespan (create_all + ad-hoc ADD COLUMN migrations), /api/health, /api/me
  auth.py              Clerk JWT verification (get_current_user dependency)
  database.py          Async engine; Postgres or SQLite fallback
  storage.py           upload_audio(): Supabase Storage or local disk
  models/db.py         ORM: Project, AudioVersion, ChatThread, ChatMessage, OAuthClient, OAuthAuthRequest, OAuthToken
  models/schemas.py    Pydantic request/response models
  routers/projects.py  All /api/projects/* endpoints (CRUD, upload, transcribe, chat, fillers, edits, versions, voice, denoise, export)
  services/audio_editor.py  ffmpeg: keep_ranges, render_with_ops (40ms crossfades), transcode, probe_duration
  services/fillers.py       Filler-word detection on the transcript
  services/voice.py         ElevenLabs: clone_voice, synthesize, isolate_audio, delete_voice
  services/video.py         Video import (extract audio, preview proxy), timeline maths (compose/remap), MP4 export
  services/sound/registry.py  Every effect + params (range, neutral, simple/pro), character sliders, doc normalisation
  services/sound/looks.py     Named looks + the instant matcher (greetings, undo/reset, more/less, look keywords)
  services/sound/render.py    Doc → audio: character → effects, intensity, staged chain (ffmpeg batches + pedalboard), scopes, layers, loudness + limiter
  services/sound/analyze.py   Loudness/noise/tone (vs LTASS)/pitch/hum/echo/pace → findings with fixes
  services/sound/ai.py        Assistant system prompt, tool schemas, applying tool ops, phrase lookup
  routers/sound.py     /api/sound/* and /api/projects/{id}/sound/* (draft, look, preview, apply, analyze, layers, presets)
  mcp_server.py        JSON-RPC MCP endpoint; @tool registry wraps the same logic as the REST routes
  oauth_server.py      OAuth 2.1 AS for MCP (DCR, /authorize, /consent, /token); only hashes stored
frontend/src/
  App.jsx              Routes: / /signup /login /sso-callback /dashboard /processing /editor /mcp/authorize
  lib/api.js           Every backend call (fetch + Clerk bearer token); streamChat for SSE chat
  pages/Editor.jsx     The main editor: transcript, waveform, chat, versions, export, compare, sound panel wiring
  components/editor/SoundPanel.jsx  Sound check, looks, character sliders, effect cards (Simple/Pro), layers, presets, A/B + apply
  pages/Dashboard.jsx  Project list / upload
  context/AuthContext.jsx, components/ProtectedRoute.jsx, hooks/useAudioPlayer.js, hooks/usePendingEdits.js
```

## Conventions

- **New sound effects go in `services/sound/registry.py` only** — the slider UI, the AI's tool schema and the MCP tools are generated from it. Add rendering in `render.py` (`ff_graph` for ffmpeg filters, `run_effect` otherwise) and, if useful, a look in `looks.py`.
- **Every new feature gets both a REST route and an MCP tool.** Being agent-native is a core product bet (see vision doc). Register tools with the `@tool(...)` decorator in `mcp_server.py`; mark read-only tools `read_only=True`.
- **Never fake results.** Commit `6ccc642` removed UI that invented edit results. If a provider is missing or fails, return a clear error (503 with a reason) and show it in the UI.
- **Graceful degradation**: the app must boot with zero credentials. New integrations should follow the same "missing key → feature disabled, rest works" pattern.
- **Edits are non-destructive**: produce a new `AudioVersion`; never overwrite the original file.
- **Schema changes**: no Alembic yet. New tables come from `Base.metadata.create_all`; new columns on existing tables go through `_add_column_if_missing` in `main.py`. Adopting Alembic is on the roadmap before the social features land.
- Secrets live in `.env` (gitignored). Never commit keys. Social OAuth tokens must be **encrypted at rest** when we add them.
- Commit style: short imperative subject describing the user-visible change (see `git log`).

## Immediate next steps

See `docs/TECH_PLAN.md` § "Phased build plan" for the full list. The top of the queue:
1. Start the platform developer app reviews (YouTube audit, Meta App Review, TikTok audit). They take weeks, so they gate everything else.
2. Fix `SETUP.md` to match Clerk + current env vars.
3. Add Alembic, a background job queue, and object storage suitable for video (Cloudflare R2).
4. Video import + 9:16 export in the editor.
5. A publishing MVP on a unified posting API, then a "YouTube published → post on X/Threads/LinkedIn" automation.
