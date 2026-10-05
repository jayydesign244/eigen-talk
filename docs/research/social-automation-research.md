# Sonicly → "Record to Publish" Platform: Research Report

*Research date: 3 Oct 2026. Prices and API rules change all the time; anything marked **(verify)** came from secondary sources and should be confirmed on the official page before you build on it.*

---

## 0. TL;DR (read this first)

1. **The market is crowded but split.** Editors (Descript, CapCut, OpusClip) edit. Schedulers (Buffer, Hootsuite, Ocoya, Metricool, Publer) post. DM tools (ManyChat, Inrō, LinkDM) do comment-to-DM. Analytics and AI research tools (vidIQ, Sprout) sit somewhere else again. **Nobody connects all of them in one loop**, and that loop is your pitch.
2. **The leap is not "we do everything".** Ocoya, Blotato and Vista Social already say that. The leap is a **closed loop**: *Edit → Publish everywhere → Listen (comments, DMs, analytics) → AI tells you what to change → back into the editor.* Example: "Your Short loses 40% of viewers at 0:03. Here's the hook from your top performer, want me to recut it?" No competitor feeds platform retention data back into the editing timeline. That's the moat.
3. **You already have two unfair advantages:** a transcript-based audio editor (ElevenLabs voice cloning, noise removal, filler removal) and an **MCP server with OAuth**, so any AI client can already drive Sonicly. Almost nobody in this space is agent-native. Lean into both.
4. **The hard part is permission, not code.** You need about **8 to 9 platform developer apps**, several with reviews or audits that take **weeks to months** (YouTube compliance audit, TikTok audit, Meta App Review plus Business Verification, LinkedIn Community Management API). Until they're approved, uploads to YouTube and TikTok are **private-only**. **Start these applications on day one.**
5. **Recommended build path:** launch the MVP on a **unified posting API** (Ayrshare, Zernio/Late or bundle.social), since they've already passed the audits. Run your own direct integrations for YouTube and Instagram in parallel, because those are where deep analytics and comment automation earn their keep. Switch over once your audits clear.
6. **Be honest about comment-to-DM.** It works properly on **Instagram and Facebook** (Meta's Private Replies API). On **YouTube** you can only auto-reply in the comments, because there are no DMs. On **TikTok** it's impossible: there's no public comment or DM API. Competitors fudge this; you can win trust by stating it clearly in the UI.

---

## 1. What we're building (restating the idea)

> **"Never open another app. Record, edit, publish everywhere, talk to your audience, and ask AI what to do next, all from one place."**

Core jobs-to-be-done:

| # | Job | Today the creator uses... |
|---|---|---|
| 1 | Record / import audio and video | Phone camera, OBS, Riverside, Zoom |
| 2 | Edit (cuts, captions, cleanup, clips) | CapCut, Descript, Premiere, OpusClip |
| 3 | Make platform versions (9:16, 16:9, length, captions, titles) | Manual re-export, OpusClip |
| 4 | Publish and schedule to YT / IG / TikTok / FB / LinkedIn / X / Threads / Pinterest / Bluesky | Native apps, Buffer, Later, Metricool |
| 5 | Cross-promote ("new video's up!" posts on X / Threads / LinkedIn with the real link) | Manual copy-paste, Zapier |
| 6 | Engage (reply to comments, comment-to-DM funnels) | Native apps, ManyChat, LinkDM |
| 7 | Measure (views, retention, engagement, growth) | YT Studio, IG Insights, Metricool, Sprout |
| 8 | Research (trends, competitors, ideas) | vidIQ, TubeBuddy, Google Trends, TikTok Creative Center, ChatGPT |

That's **5 to 8 tools and $100 to $400+/month** for a serious creator. Our pitch replaces all of them.

---

## 2. What Sonicly already has (don't underrate this)

Looking at the current repo:

- **Transcript-based audio editor** with filler removal (`backend/services/fillers.py`), AI word regeneration and voice cloning via ElevenLabs (`backend/services/voice.py`), and ElevenLabs noise removal.
- **Real audio export** with format choice, versions and history.
- **AI chat threads per project.**
- **An MCP server exposing every feature, with OAuth** (`backend/mcp_server.py`, `backend/oauth_server.py`). So Claude, ChatGPT or any MCP client can drive the app.
- Stack: React/Vite on Vercel, FastAPI on Railway, Supabase auth and DB.

**Opinion:** that MCP piece is quietly your most strategic asset. Blotato and Postiz have started shipping MCP endpoints, but no *editor-plus-publisher* is agent-native. "Hey Claude, take yesterday's podcast, cut three Shorts, post them Tue/Thu/Sat, and tweet when each goes live" is a sentence nobody can fully run today.

Also: you're **audio-first**. Podcasters are a huge, underserved segment. Schedulers treat audio as an afterthought and video editors treat podcasts as "long video". A podcast-to-everywhere pipeline is a strong wedge market.

---

## 3. Market snapshot

- Social media management software: estimates vary a lot by analyst, with **~19–26% CAGR** commonly quoted and projections up to ~$107B by 2030 (very top-down, so treat with salt).
- Creator economy: roughly **$250B–$480B in 2026** depending on what's counted (Goldman Sachs is the high end).
- Creator tools growing ~**34%/yr** (McKinsey, via secondary source).
- **Key trend:** AI is the main growth driver, and buyers are tired of per-seat and per-channel pricing (Hootsuite and Sprout complaints dominate G2 reviews). ManyChat cut its free tier in March 2026 (25 contacts), which pushed creators toward cheaper comment-to-DM tools.

---

## 4. Competitive analysis

### 4.1 Competitor map by category

| Category | Players | What they're great at | Where they stop |
|---|---|---|---|
| **AI content + scheduling (closest to Ocoya)** | **Ocoya**, Blotato, Predis.ai, SocialBee | AI captions/images, templates, multi-platform scheduling | No real video/audio editor; shallow analytics; no comment-to-DM |
| **Classic schedulers** | Buffer, Later, Metricool, Publer, Vista Social | Calendar, queue, decent analytics, cheap(ish) | No editing; AI is text-only (Buffer); reports gated on high tiers (Publer) |
| **Enterprise suites** | Hootsuite, Sprout Social, Agorapulse | Inbox, listening, team workflows, reporting | $199+/user/mo; overkill for creators; no editing |
| **AI video editors** | OpusClip, Descript, CapCut, Submagic, Captions | Clipping, captions, text-based editing | OpusClip has basic autopost/calendar; none have engagement inbox, DM automation or cross-promo |
| **Comment-to-DM** | ManyChat, Inrō, LinkDM, InstantDM, ReplyRush | IG/FB DM funnels | Single-purpose; per-contact pricing (ManyChat) |
| **Repurposing pipes** | Repurpose.io | Auto-forward content across platforms | Reliability complaints (broken workflows, reconnects) |
| **Research / analytics** | vidIQ, TubeBuddy, Sprout listening | Keywords, trends, competitor tracking | Separate app; mostly YouTube-only |
| **Open-source** | **Postiz** (30+ platforms, MCP, self-host) | Free scheduler, API, N8N/Zapier, MCP | Scheduler only; check its license before reusing any code |
| **Unified posting APIs (B2B infra, potential *suppliers*)** | Ayrshare, Zernio (ex-Late), bundle.social, Upload-Post, PostPeer | One API for ~13+ networks, already audited | Infra, not a consumer product |

### 4.2 Pricing benchmarks (2026, verify before quoting)

| Product | Entry | Mid | Notes |
|---|---|---|---|
| Ocoya | $15/mo (Bronze) | $39 / $79 / $159 | 7-day trial; fixed monthly tiers |
| Blotato | $29/mo | — | 20 accounts, 9 platforms, AI image/video, API + MCP |
| Buffer | Free; ~$5/channel/mo | — | Per-channel pricing |
| Later | from ~$18.75/mo | — | Visual/IG focused, link-in-bio |
| Metricool | $22/mo Starter (1 brand) | — | Good analytics for price |
| Vista Social | from $79/mo | — | Agency-oriented |
| Hootsuite | $99–$199/user/mo | — | Most-complained-about pricing |
| Sprout Social | $199/user/mo | — | ~$7k+/yr for 3 seats |
| OpusClip | Free / $15 Starter / $29 Pro | Business custom | Credits-based; has autopost and calendar |
| Descript | Free / $16–24 Hobbyist / $24–35 Creator | $50–65 Business | Per user |
| ManyChat | Free (25 contacts) | Pro scales per contact | Per-contact pricing annoys creators |
| ReplyRush | $9.99/mo | — | Cheap comment-to-DM |

**Takeaway:** a serious solo creator stacking Descript Creator ($35) + OpusClip Pro ($29) + Metricool/Ocoya (~$39) + ManyChat Pro (~$15+) + vidIQ (~$20+) spends **$130–$150+/mo**. That's your price anchor.

### 4.3 Ocoya specifically (the reference product)

Ocoya (Vilnius, founded 2021) is AI copy, Canva-style design, scheduling and basic analytics, with Shopify/e-commerce hooks. **Strength:** fast AI posts for small businesses. **Weakness for creators:** no real video or audio editing, analytics are surface level, no comment automation, and AI generates content but doesn't *analyze your performance*. They're a **marketer's** tool. You'd be a **creator's** tool. Different buyer; don't copy them, outflank them.

---

## 5. The leap: gaps nobody is filling

Ranked by how hard each would hit competitors.

### 🥇 1. Performance-aware editor (the closed loop)
- Pull **YouTube Analytics retention curves** (`audienceWatchRatio`, `relativeRetentionPerformance`, 100 points per video) and IG/FB reel insights, then **overlay them on the editor timeline/transcript**.
- AI: "Drop-off spike at 0:03 on 4 of your last 5 Shorts. Your best performer opens with a question. Rewrite the first line?" Then one click to regenerate the hook with the cloned voice (which you already have!).
- **Nobody does this.** vidIQ shows data; Descript edits; neither talks to the other.

### 🥈 2. "One master, native everywhere" (not just cross-posting)
- Same source becomes platform-native variants: auto-reframe 16:9 to 9:16, per-platform length limits (e.g. Bluesky 60s/50MB), captions burned in or not, platform-specific title, hashtags and hook, thumbnail per platform.
- Competitors mostly push **the same file plus the same caption** everywhere. Algorithms punish that.

### 🥉 3. Smart cascade ("announce" automations), which you specifically asked for
- Trigger: *"YouTube video finished processing and is public."* Actions: X post with the real URL and thumbnail, a Threads post, a LinkedIn post, a pinned comment on YT, an IG Story reminder, and a Bluesky post.
- Must use **the real published URL after processing**, not the scheduled time. Zapier-style tools often fire too early.
- Event-driven, with per-platform copy written by AI in the creator's voice.

### 4. Honest, cross-platform engagement inbox plus comment automation
- One inbox for comments across YT, IG, FB, Threads, X, LinkedIn and Bluesky, with AI-drafted replies in the creator's tone.
- **"Comment KEYWORD and I'll DM you the link":**
  - IG / FB: real Private Reply DM (once per comment, within 7 days).
  - YouTube: auto-reply **in the comment thread** (no DMs exist), or a pinned comment.
  - Threads: auto-reply to replies.
  - TikTok: **not possible via API.** Say so in the UI rather than faking it.
- Includes deduplication, rate limiting, follow-gate logic where the platform allows it, and lead capture into a mini CRM (email/list).

### 5. Agent-native (MCP-first)
- Every feature is callable from Claude/ChatGPT/agents. You already have this. Add publishing, analytics and inbox tools to the MCP server and market it hard: *"Sonicly is the hands for your AI."*

### 6. Research copilot grounded in *your* data plus market data
- "Why did this Short pop?" "What are channels like mine posting this week?" "Give me 5 trend-aligned ideas for my niche."
- Inputs: your own analytics, competitor public channel data (YouTube Data API is fine for public data), Google Trends (official API is in alpha with an application), and trend/outlier sources.
- Output: ideas that turn into scripts, then a recording, all inside the app.

### 7. Audio-first creator wedge
- Podcast becomes chapters, then clips, then audiograms/video, then Shorts/Reels/TikToks, then show notes, a newsletter and a LinkedIn post. Your editor DNA makes this natural; schedulers can't do it.

### 8. Pricing and trust as features
- Flat per-creator pricing (not per seat, channel or contact). Clear status for every post ("YouTube processing… public ✅"), auto-retry, **"your TikTok token expires in 3 days, reconnect"** alerts. Repurpose.io and Metricool reviews are full of "it silently broke".

---

## 6. Platform API reality check (the boring part that kills startups)

| Platform | Publish video | Analytics | Read/reply comments | DMs | Gate / review | Cost | Gotchas |
|---|---|---|---|---|---|---|---|
| **YouTube** (Data API v3 + Analytics API) | ✅ `videos.insert` (Shorts = vertical ≤3 min) | ✅ Deep (retention curves, traffic sources) | ✅ `commentThreads/comments.insert` (50 units) | ❌ no DMs | **Compliance audit required**, otherwise uploads are **forced private**. Google OAuth app verification for sensitive scopes. | Free, but quota of **10,000 units/day per project**. Upload commonly cited at **1,600 units** (some sources say it's been lowered; **verify**). At 1,600 that's **~6 uploads/day for the whole app**. **Request a quota increase early.** | |
| **Instagram** (Graph API, Business/Creator accounts) | ✅ Reels, posts, carousels, stories | ✅ Insights | ✅ comments + webhooks | ✅ **Private Replies** (comment-to-DM) + Messaging API | Meta **App Review** + **Business Verification** | Free | **100 API posts / 24h** per account; Reels 9:16, 5–90s for Reels tab; personal accounts not supported |
| **Facebook Pages** | ✅ Reels & video | ✅ | ✅ | ✅ Messenger | Same Meta app/review | Free | **30 API Reels / 24h** per Page |
| **Threads** | ✅ text/img/video/carousel | ✅ insights | ✅ Reply Management API + webhooks | ❌ | Meta app review | Free | ~250 posts & 1,000 replies / 24h |
| **TikTok** (Content Posting API + Login Kit + Display API) | ✅ Direct Post or Upload-to-drafts | ⚠️ basic (own videos via Display API) | ❌ **no public comment API** | ❌ | **Audit required.** Unaudited means SELF_ONLY (private), **max 5 users/24h**, accounts must be private | Free | Per-creator daily post caps; strict UX rules for the posting flow (preview, privacy picker, disclosure toggles) |
| **X (Twitter)** | ✅ (video via media upload) | ⚠️ basic metrics | ✅ replies | ⚠️ DMs costly/limited | Dev account | **Pay-per-use since Feb 2026**, no free tier for new devs. Reported **~$0.015 per post created** and higher for posts containing links (**verify exact link price**). Legacy Basic/Pro tiers being retired. | Cross-promo posts *contain links*, so model the link price carefully. |
| **LinkedIn** | ✅ personal (w_member_social, self-serve, video ≤15 min) | ⚠️ limited for members | ⚠️ org pages only | ❌ | **Company pages need Community Management API** (partner review, weeks to months) | Free | Personal posting is easy; pages are gated |
| **Pinterest** (API v5) | ✅ video pins (multi-step upload) | ✅ | ⚠️ | ❌ | App starts in **Trial mode** (own account only) until upgraded | Free | |
| **Bluesky** (AT Protocol) | ✅ (`app.bsky.video.uploadVideo`) | ⚠️ | ✅ | ⚠️ | **None**: open protocol (OAuth or app password) | Free | 60s / 50MB video limit |
| **Snapchat / Reddit / Google Business / Telegram** | Phase 3+ | | | | Varies (Snap public profile API restricted; Reddit has commercial API terms) | | Get these "for free" via a unified API |

**Translation:** Instagram + Facebook + Threads + YouTube are the **"full loop" platforms** (post, analyze, engage). TikTok and X are **"post-and-pray"**: you can publish, but engagement automation is minimal (TikTok) or pay-per-call (X). Build your product promises around this, not around a logo wall.

---

## 7. What we need: API keys, accounts and services

### 7.1 Platform developer apps (the gated ones)

| # | Developer app / account | APIs / products inside | Review needed | Rough lead time |
|---|---|---|---|---|
| 1 | **Google Cloud project** | YouTube Data API v3, YouTube Analytics API, (YouTube Reporting API), Google OAuth | OAuth consent verification + **YouTube API compliance audit** + **quota increase** | 2–8+ weeks |
| 2 | **Meta for Developers app** (+ Meta Business Manager, Business Verification) | Facebook Pages API, Instagram Graph API (publishing, insights, comments, messaging/private replies), Webhooks | **App Review per permission** + Business Verification | 2–6 weeks, often multiple rounds |
| 3 | **Threads app use-case** (inside Meta, configured separately) | Threads API (publish, replies, insights) | App Review | Overlaps with #2 |
| 4 | **TikTok for Developers app** | Login Kit, Content Posting API (Direct Post), Display API | **Content Posting audit** | 2–6+ weeks |
| 5 | **X Developer account** | X API v2 (posts, media) | Light; **billing required** (pay-per-use credits) | Days |
| 6 | **LinkedIn Developer app** | Sign In with LinkedIn, Share on LinkedIn (self-serve), **Community Management API** (pages) | CMA = partner review | Days (personal) / weeks–months (pages) |
| 7 | **Pinterest Developer app** | API v5 | Trial → Standard access upgrade | 1–3 weeks |
| 8 | **Bluesky** | AT Protocol | None (no key; OAuth/app password) | Instant |
| 9 | *(Later)* Snapchat, Reddit, Google Business Profile | | Varies | Later |

**About 8 platform apps / review processes** for launch-grade coverage, about 9–12 with the long tail.

### 7.2 Infrastructure and AI keys

| Purpose | Recommended | Status |
|---|---|---|
| Auth + Postgres | Supabase | ✅ have |
| Voice clone, TTS, noise removal | ElevenLabs | ✅ have |
| LLM (chat, research copilot, reply drafting, captions) | Anthropic Claude API | likely partial |
| Speech-to-text with word timestamps | Deepgram / AssemblyAI / ElevenLabs Scribe | needed for video captions at scale |
| Object storage for video (cheap egress) | Cloudflare R2 (or S3) | **needed**. Video will crush Supabase storage costs. |
| Video processing / rendering | Self-hosted FFmpeg workers (Railway/Fly/Modal GPU), or Shotstack / Creatomate / Remotion Lambda | **needed** |
| Video playback / streaming in editor | Mux or Cloudflare Stream (optional) | nice to have |
| Job queue + scheduler | Redis (Upstash) + Arq/Celery/Dramatiq, or Inngest / Trigger.dev | **needed**: publishing must be retryable background jobs |
| Webhook receiver | Your FastAPI + signature verification | **needed** (Meta, YouTube PubSubHubbub, TikTok) |
| Token vault | Encrypted refresh tokens (Supabase Vault / KMS) | **needed**. You'll hold users' social account keys. Treat it like a bank. |
| Payments | Stripe (or Lemon Squeezy / Paddle for tax handling) | needed |
| Transactional email | Resend / Postmark | needed (token-expiry alerts, digests) |
| Trend data | Google Trends API (alpha, apply), YouTube Data API search/videos, vidIQ, Apify/SerpApi (check ToS) | phase 2 |
| Unified posting API (MVP shortcut) | Ayrshare / Zernio / bundle.social / Upload-Post | **recommended for MVP** |
| Monitoring / product analytics | Sentry + PostHog | needed |

**Count: ~8 platform developer apps + ~10–12 infra/AI services, so ~20 credentials total.** Unified API for MVP means ~1 posting key + ~10 infra keys.

### 7.3 Build vs. buy for posting

| Option | Pros | Cons | Cost signal |
|---|---|---|---|
| **Unified API** (Ayrshare / Zernio / bundle.social) | Live in days, already audited, 13+ networks, some include analytics/comments | Margin hit, vendor lock-in, shallower data, their outage = your outage | Ayrshare $149/mo (1 profile) to $599/mo (30 profiles); Zernio from $19/mo (120 posts), free tier; bundle.social $400/mo for 100k posts, unlimited accounts **(verify)** |
| **Direct integrations** | Full data (retention curves!), best margins, own the moat | Months of reviews, maintenance burden of 8 APIs that change constantly | Free APIs (except X) + engineering time |
| **Hybrid (recommended)** | Ship fast, then own the platforms that matter | Two code paths for a while | — |

**Recommendation:** an MVP on a unified API with **per-post pricing** (bundle.social-style) so costs scale with usage, not per-profile. Build **direct YouTube + Instagram/Facebook/Threads** integrations in parallel, since that's where the closed-loop analytics and comment-to-DM live. Add TikTok direct after its audit passes.

> ⚠️ Check each unified API's ToS for reselling to end users and whether their analytics include **retention curves** (most don't). That one feature is why you'll need direct YouTube anyway.

---

## 8. Suggested architecture (fits the current stack)

```
React (Vercel)  ──►  FastAPI (Railway)  ──►  Supabase Postgres (projects, posts, schedules, metrics, inbox)
     │                    │
     │                    ├─► Job queue (Redis) ──► Workers:
     │                    │        • render/transcode (FFmpeg) → R2
     │                    │        • publish (per-platform adapters, retries, idempotency keys)
     │                    │        • analytics sync (hourly for 48h after post, then daily)
     │                    │        • comment poller / webhook processor → automation rules engine
     │                    │
     │                    ├─► Webhooks in: Meta (comments, messages), YouTube (PubSubHubbub), TikTok status
     │                    ├─► Token vault (encrypted OAuth refresh tokens + expiry monitor)
     │                    └─► AI layer: Claude with tools over *your own DB* (analytics, posts, comments)
     │
     └─► MCP server (already exists) exposes everything above to external agents
```

Key design principles:
- **Platform adapter pattern:** one interface (`publish`, `status`, `metrics`, `comments`, `reply`) with an implementation per platform, plus a `UnifiedApiAdapter` fallback. Lets you swap the MVP vendor for direct integrations one platform at a time.
- **Post = one master asset + N platform variants**, each with its own state machine: `draft → rendering → queued → uploading → processing → published | failed`.
- **Automations = triggers + conditions + actions** (e.g. `on youtube.published → post to X with {url}`; `on ig.comment contains "LINK" → private_reply(template)`).
- **Store metrics as time series**, not snapshots. The AI needs history to explain "why".

---

## 9. Phased roadmap

### Phase 0: Paperwork (start immediately, runs in background)
- [ ] Register a company entity if not already (Meta Business Verification needs a legal business)
- [ ] Publish privacy policy, ToS, data deletion page (all reviewers check these)
- [ ] Create: Google Cloud project, Meta app + Business Manager, TikTok dev app, X dev account, LinkedIn app, Pinterest app
- [ ] Record **demo screencasts** for each review (reviewers want to see the exact flow)
- [ ] Apply: YouTube audit + quota increase, TikTok Content Posting audit, Meta App Review, LinkedIn CMA, Google Trends API alpha

### Phase 1: MVP "Edit → Publish everywhere" (~6–8 weeks)
- Video support in the editor (you're audio-only today): import, trim by transcript, captions, 9:16 reframe
- Connect accounts via the unified API; schedule/publish to YT, IG, FB, TikTok, LinkedIn (personal), X, Threads, Bluesky
- Per-platform caption/title generation (Claude)
- Content calendar
- **Cascade automation v1:** "when published on YT, post on X/Threads/LinkedIn with link"
- Basic cross-platform stats dashboard

### Phase 2: "Listen & engage" (~6 weeks)
- Direct Meta integration: unified inbox for IG/FB/Threads comments
- **Comment-to-DM** for IG/FB (keyword triggers, templates, dedupe, 7-day window handling)
- YouTube comment auto-reply plus AI-drafted replies
- AI chat over your analytics ("what worked this month?")

### Phase 3: "Close the loop" (the moat)
- Direct YouTube Analytics: retention curves overlaid on the editor timeline
- AI hook doctor / recut suggestions plus one-click regenerate with the cloned voice
- Competitor tracking (public YouTube data), trend radar, idea → script → record flow
- Podcast → everything pipeline (chapters, clips, audiograms, show notes, newsletter)

### Phase 4: Scale
- Teams/agency workspaces, approvals, client reports
- Snapchat, Reddit, Google Business, Telegram via unified API
- Mobile app (creators record on phones; this matters more than you'd think)

---

## 10. Pricing idea (spicy take included)

| Plan | Price | For | Includes |
|---|---|---|---|
| Free | $0 | Try-out | 1 brand, 3 platforms, 10 posts/mo, watermark-free 720p, basic AI |
| Creator | ~$29/mo | Solo creators | All platforms, unlimited scheduling, 1080p, captions, cascade automations, comment-to-DM (IG/FB), AI copilot |
| Pro | ~$59/mo | Serious creators / podcasters | 4K, voice clone, retention overlay, competitor tracking, more AI/render minutes |
| Studio | ~$149/mo | Small teams/agencies | 5 brands, seats, approvals, white-label reports |

**Spicy take:** don't charge per channel or per contact. It's the #1 complaint about Buffer, Hootsuite and ManyChat. Charge for **compute** (render minutes, AI credits), because that's what actually costs you money. Ship usage meters people can see.

**Unit-cost watchouts:**
- **X links:** every cross-promo tweet has a link, so model X API cost per user per month and pass it through or cap it.
- **Video storage/egress:** use R2 (no egress fees) and auto-expire renders after N days.
- **Transcription + LLM:** cheap per minute, but heavy users of long podcasts add up. Meter it.
- **YouTube quota** is per *project*, not per user. It's a scaling ceiling until Google raises it.

---

## 11. Risks (real talk)

| Risk | Severity | Mitigation |
|---|---|---|
| **Platform reviews delay launch** | 🔴 High | Start day one; MVP on unified API; build demo flows reviewers can follow |
| **Platform policy changes** (X pricing flipped twice in 2026; TikTok's US situation) | 🔴 High | Adapter pattern; never make one platform core to the pitch |
| **Token security**: you hold keys to people's livelihoods | 🔴 High | Encryption at rest, least-privilege scopes, audit logs, SOC2-lite practices early |
| **Comment-to-DM abuse / spam flags** | 🟠 Med | Respect Meta rules (one private reply per comment, 7-day window, no cold DMs); rate limits; dedupe |
| **Scope creep**: "everything app" = mediocre at everything | 🟠 Med | Win **one** loop first: podcast/long-form creator → Shorts → publish → retention feedback |
| **Video infra cost** | 🟠 Med | R2, queue-based rendering, auto-expiry, pay-as-you-go GPU only when needed |
| **Big players copy you** (OpusClip already has autopost) | 🟡 Low–Med | The data loop + agent-native MCP + audio quality are hard to copy quickly |
| **Scraping for competitor/trend data** | 🟡 | Prefer official APIs; check ToS for any third-party scraping vendors |

---

## 12. Positioning

- **One-liner:** *"From record to everywhere. Sonicly edits, publishes, replies, and tells you what to make next."*
- **Against Ocoya / Buffer:** "They schedule posts. We make them, ship them, and learn from them."
- **Against Descript / CapCut:** "Your edit doesn't end at export."
- **Against ManyChat:** "Comment-to-DM included, not a second subscription."
- **Wedge audience:** podcasters and talking-head creators (audio DNA plus transcript editing = your home turf).

---

## 13. Your morning to-do list ☕

1. Decide the **wedge** (my vote: podcasters/long-form → Shorts).
2. Decide **MVP posting route**: unified API (my vote) vs. direct.
3. Create the **Google Cloud project + Meta app** today and start the **YouTube audit** and **Meta App Review** clocks.
4. Write privacy policy, ToS and data-deletion pages (blocker for every review).
5. Spike: add **video import + 9:16 export** to the existing editor. That's the biggest product gap vs. today's audio-only Sonicly.
6. Spike: one cascade automation end-to-end (YT publish → X post) on a unified API trial.

---

## Sources

- Ocoya pricing: [PricingSaaS – Ocoya](https://pricingsaas.com/companies/ocoya)
- Scheduler comparisons: [boast.io](https://boast.io/comparing-the-top-7-social-media-management-tools-for-businesses-in-2026/), [searchlab.nl](https://searchlab.nl/en/compare/hootsuite-vs-buffer-vs-sprout-social), [dupple](https://dupple.com/learn/best-social-media-management-tools), [Publer blog](https://publer.com/blog/sprout-social-alternatives/)
- Complaints / gaps: [Blotato – automation tools](https://www.blotato.com/blog/social-media-automation-tools), [framekit.ai](https://framekit.ai/blog/best-social-media-schedulers-for-creatives-2026), [Blogging Wizard](https://bloggingwizard.com/best-social-media-scheduling-tools/)
- Blotato / Metricool / Vista Social: [Blotato – Metricool alternatives](https://www.blotato.com/blog/metricool-alternatives), [Blotato alternatives](https://www.blotato.com/blotato-alternatives), [Metricool – Vista Social alternatives](https://metricool.com/vista-social-alternatives/)
- OpusClip / Descript: [OpusClip vs Descript](https://www.opus.pro/descript-alternative), [Creatify – OpusClip pricing](https://creatify.ai/blog/opusclip-pricing-plans-and-what-you-ll-actually-pay-in-2026), [Sonix – Descript pricing](https://sonix.ai/resources/descript-pricing/), [Castmagic](https://www.castmagic.io/blog/opus-clip-alternatives)
- Comment-to-DM: [Inrō – ManyChat alternatives](https://inro.social/blog/manychat-competitors-alternatives-2026), [WilloSend](https://willosend.beehiiv.com/p/manychat-alternative-instagram-dm-automation), [Zernio – ManyChat alternative](https://zernio.com/blog/manychat-alternative), [Blotato – IG Messaging API](https://www.blotato.com/blog/instagram-messaging-api), [SmartReply](https://smartreply.io/blog/can-you-automate-replies-instagram), [CreatorFlow – TikTok comment to DM](https://creatorflow.so/blog/tiktok-comment-to-dm/)
- TikTok API: [TikTok Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), [TikTok Direct Post reference](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post), [bundle.social – TikTok approval](https://bundle.social/blog/tiktok-api-approval), [Phyllo – TikTok rate limits](https://www.getphyllo.com/post/tiktok-api-rate-limits-in-2026-quotas-errors-workarounds), [Brandbastion – network API limits](https://help.brandbastion.com/en/articles/11164379-network-api-limitations), [xpoz – TikTok API](https://www.xpoz.ai/blog/comparisons/why-the-tiktok-api-falls-short-for-data-access-in-2026/)
- X API pricing: [Blotato](https://www.blotato.com/blog/twitter-api-pricing), [Outstand](https://www.outstand.so/blog/x-api-pricing), [Postproxy](https://postproxy.dev/blog/x-api-pricing-2026/), [Zernio](https://zernio.com/blog/twitter-api-pricing), [twitterapi.io](https://twitterapi.io/blog/x-api-cost-breakdown-2026)
- YouTube API: [Quota cost calculator](https://developers.google.com/youtube/v3/determine_quota_cost), [Ayrshare – YouTube 10k limit](https://www.ayrshare.com/solutions/how-to-bypass-the-youtube-10k-unit-limit-fixing-the-403-quota-exceeded-error/), [YouTube Analytics metrics](https://developers.google.com/youtube/analytics/metrics)
- Instagram / Facebook / Threads: [IG Content Publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing), [bundle.social – IG rate limits](https://bundle.social/blog/instagram-api-rate-limits), [FB Reels Publishing](https://developers.facebook.com/documentation/video-api/guides/reels-publishing), [Threads – manage replies](https://developers.facebook.com/docs/threads/retrieve-and-manage-replies), [bundle.social – Threads API](https://bundle.social/blog/threads-posting-api)
- LinkedIn: [Zernio – LinkedIn posting API](https://zernio.com/blog/linkedin-posting-api), [Postproxy – LinkedIn company pages](https://postproxy.dev/blog/linkedin-api-automate-company-page-publishing/)
- Pinterest / Bluesky: [Pinterest API docs](https://developers.pinterest.com/docs/content/update/), [bundle.social – Pinterest](https://bundle.social/blog/pinterest-pin-api), [Ayrshare – Bluesky guide](https://www.ayrshare.com/blog/complete-guide-to-bluesky-api-integration-authorization-posting-analytics-comments/)
- Unified APIs: [Ayrshare vs Zernio](https://www.ayrshare.com/compare/ayrshare-vs-zernio/), [Zernio – unified social API](https://my.zernio.com/blog/unified-social-media-api), [PostPeer – best posting APIs](https://www.postpeer.dev/blog/best-social-media-posting-apis)
- Postiz: [Railway – Postiz](https://railway.com/deploy/postiz), [buildfastwithai – Postiz review](https://buildfastwithai.com/ai-tools/postiz)
- Google Trends API: [PPC Land](https://ppc.land/google-opens-alpha-testing-for-new-trends-api-targeting-developers-and-journalists/), [konabayev.com](https://konabayev.com/blog/google-trends-api-landscape-2026/)
- Market size: [fungies.io – creator economy 2026](https://fungies.io/creator-economy-2026-complete-analysis-data-trends-forecasts/), [mewayz – creator tool stats](https://mewayz.com/pt-br/blog/40-link-in-bio-and-creator-tool-statistics-for-2026-market-size-usage-trends), [GII – social media management report](https://www.giikorea.co.kr/report/tbrc1968969-social-media-management-global-market-report.html)
