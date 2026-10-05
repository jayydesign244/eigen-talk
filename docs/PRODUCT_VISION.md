# Product Vision: Sonicly, "From record to everywhere"

This is the source of truth for **what** we're building and **why**. For **how**, see `docs/TECH_PLAN.md`. For market data and sources, see `docs/research/social-automation-research.md`.

---

## 1. The one-liner

> **If someone buys Sonicly, they never have to go back to separate platforms. From recording to upload to replying to comments, everything happens in one product.**

Short tagline: *"Sonicly edits, publishes, replies, and tells you what to make next."*

## 2. The problem

A serious creator today juggles 5 to 8 tools and spends **$130–150+/month**:

| Job | Typical tool |
|---|---|
| Record | Phone, OBS, Riverside, Zoom |
| Edit | Descript, CapCut, Premiere |
| Clip long video into Shorts/Reels | OpusClip |
| Schedule and publish | Buffer, Later, Metricool, Ocoya, or each native app by hand |
| Cross-promote ("new video's up!") | Manual copy-paste, Zapier |
| Comment-to-DM funnels | ManyChat, LinkDM |
| Analytics | YouTube Studio, IG Insights, Metricool |
| Research (trends, competitors, ideas) | vidIQ, TubeBuddy, Google Trends, ChatGPT |

Each tool stops at its own boundary. **Nobody connects editing to performance.** The editor never learns that viewers drop off at 0:03, and the analytics tool can't fix the video.

## 3. Our edge: the closed loop

```
   ┌──────────── Record / Import ────────────┐
   │                                          ▼
 Research ◄── AI copilot ◄── Listen ◄── Publish everywhere ◄── Edit
 (trends,     ("what should    (comments,   (native variants     (transcript-
 competitors)  I change?")      DMs, stats)  per platform)        based)
   │                                                               ▲
   └───────────────── ideas → scripts ─────────────────────────────┘
```

Concrete example of the loop: *"Your last 4 Shorts lose 40% of viewers at 0:03. Your best performer opens with a question. Want me to rewrite the hook and regenerate it in your voice?"* One click recuts and reposts.

What makes this hard to copy:
1. **Performance-aware editor**: platform retention curves overlaid on the transcript/timeline.
2. **Agent-native**: every feature is already exposed over MCP with OAuth, so Claude/ChatGPT can drive Sonicly end to end.
3. **Audio quality DNA**: transcript editing, voice cloning, noise removal, filler removal. Schedulers can't do this; editors don't publish.

## 4. Who it's for

| Persona | Why they care | Priority |
|---|---|---|
| **Podcasters / talking-head creators** (wedge market) | Long-form → many clips → every platform is their weekly grind; audio quality matters | 🥇 Launch target |
| Solo YouTubers / Shorts creators | Want one place to post and see what works | 🥈 |
| Coaches / course sellers / "comment LINK" funnel users | Comment-to-DM drives sales | 🥈 |
| Small agencies / social managers | Many brands, approvals, reports | 🥉 Later (Studio plan) |

Not our buyer at first: enterprise social teams (Sprout/Hootsuite territory).

## 5. Feature modules

Status legend: ✅ built · 🟡 partial · ⬜ planned

### 5.1 Create & Edit
- ✅ Upload audio, Whisper transcription with word timestamps
- ✅ Edit by transcript: delete words, remove fillers, replace a word with the cloned voice
- ✅ Noise removal (ElevenLabs isolation)
- ✅ Version history, non-destructive edits
- ✅ Export MP3/WAV/M4A
- ⬜ **Video import and editing by transcript** (same model, applied to video)
- ⬜ In-browser recording (audio + camera + screen)
- ⬜ Auto-captions (styled, burned in or as SRT)
- ⬜ Auto-reframe 16:9 → 9:16 with speaker tracking
- ⬜ AI clipping: find the best moments in long-form and turn them into Shorts
- ⬜ Audiograms for audio-only podcasts
- ⬜ Thumbnail generation per platform

### 5.2 Publish
- ⬜ Connect accounts: YouTube, Instagram, TikTok, Facebook, LinkedIn, X, Threads, Pinterest, Bluesky (later Snapchat, Reddit, Google Business, Telegram)
- ⬜ **One master asset → native variant per platform** (aspect ratio, length limits, caption, title, hashtags, thumbnail)
- ⬜ Publish now / schedule / content calendar
- ⬜ Per-post live status: rendering → uploading → processing → published, with retries
- ⬜ Account health: token-expiry warnings and one-click reconnect

### 5.3 Automate
- ⬜ **Cascade automations** (user explicitly wants these): *"When my YouTube video is public → post on X, Threads, LinkedIn and Bluesky with the real link; pin a comment on YouTube."* Must fire on the **actual publish event**, not the scheduled time.
- ⬜ Trigger → condition → action rules engine (also powers comment automation)
- ⬜ AI writes each platform's copy in the creator's voice

### 5.4 Engage
- ⬜ Unified inbox: comments (and DMs where allowed) from all platforms
- ⬜ AI-drafted replies in the creator's tone; bulk approve
- ⬜ **Comment-to-DM** ("comment LINK and I'll send it to you"), with honest per-platform support:

| Platform | What we can do |
|---|---|
| Instagram, Facebook | Real private-reply DM (once per comment, within 7 days of the comment) |
| YouTube | Auto-reply **in the comment thread** or a pinned comment (YouTube has no DMs) |
| Threads | Auto-reply to replies |
| X | Replies (paid per API call) |
| TikTok | **Not possible**: TikTok has no public comment or DM API. Say so in the UI. |

- ⬜ Lead capture: emails from DM funnels go into a simple contact list

### 5.5 Analyze
- ⬜ Cross-platform dashboard: views, watch time, engagement, follower growth
- ⬜ Per-post performance over time (hourly for the first 48h, then daily)
- ⬜ **Retention overlay in the editor** (YouTube Analytics `audienceWatchRatio`; IG/FB reel insights where available)
- ⬜ Best time to post, per platform, from the creator's own data

### 5.6 AI Copilot (research and strategy)
- 🟡 Chat exists (per-project threads) but only knows about the audio project
- ⬜ Grounded in the creator's own analytics, posts and comments (tool calling over our DB)
- ⬜ Competitor tracking (public YouTube data first)
- ⬜ Trend research (Google Trends API alpha, YouTube trending, outlier detection)
- ⬜ "Why did this post pop?", "What should I post this week?", idea → script → record flow
- ⬜ Comment sentiment and FAQ mining ("12 people asked for your mic setup")

### 5.7 Agent access (MCP)
- ✅ MCP server + OAuth for all editor features
- ⬜ Add publishing, scheduling, analytics and inbox tools so an agent can run the whole loop: *"Cut 3 Shorts from yesterday's episode, post Tue/Thu/Sat, tweet when each goes live."*

## 6. Decisions made so far

| Decision | Choice | Why |
|---|---|---|
| Wedge market | Podcasters and talking-head creators | Matches our audio-editing strength; underserved by schedulers |
| MVP publishing route | **Unified posting API** (Ayrshare / Zernio / bundle.social) first, with direct integrations built in parallel | Their apps already passed platform audits; ours will take weeks to months |
| Direct integrations priority | YouTube, then Meta (IG/FB/Threads), then TikTok | Those carry the closed-loop data (retention) and comment automation |
| Auth | Clerk | Already integrated |
| Agent-native | Every feature = REST route + MCP tool | Core differentiator |
| Honesty over logo walls | Show per-platform capability limits in the UI | Competitors over-promise, especially on TikTok and comment-to-DM |
| Pricing model | Flat per creator plus metered compute (render minutes, AI credits). **No per-seat, per-channel or per-contact pricing.** | Top complaint about Buffer, Hootsuite and ManyChat |

## 7. Pricing draft

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | 1 brand, 3 platforms, 10 posts/mo, basic AI |
| Creator | ~$29/mo | All platforms, unlimited scheduling, captions, cascade automations, IG/FB comment-to-DM, AI copilot |
| Pro | ~$59/mo | 4K, voice clone, retention overlay, competitor tracking, more AI and render minutes |
| Studio | ~$149/mo | 5 brands, team seats, approvals, client reports |

Cost watchouts: X API charges per post (more for posts with links, which every cross-promo has), video storage and egress, transcription and LLM minutes, and YouTube's per-project daily quota.

## 8. Open questions (need an owner decision)

1. **Final product name**: "Sonicly" (UI, README) vs "EigenTalk" (MCP server, OAuth scopes `eigentalk:*`, repo name). Pick one before launch; OAuth scopes are hard to rename later.
2. Which unified API vendor for the MVP? Compare ToS (reselling allowed?), analytics depth, per-post vs per-profile pricing.
3. Video rendering: self-hosted FFmpeg workers vs a render API (Shotstack/Creatomate/Remotion Lambda)?
4. Mobile app: when? Creators record on phones.
5. Company entity for Meta Business Verification: is one registered?
6. Should we keep OpenAI for chat/transcription or move the copilot to Claude? (Both are possible; decide on cost/quality.)

## 9. Non-goals (for now)

- Enterprise social listening, approval chains with 10 roles, paid ads management
- Cold DMs or any automation that breaks platform rules
- Scraping platforms where an official API exists
- Being a full Premiere replacement. We edit by transcript and AI; precision timeline editing comes later, if ever.

## 10. Glossary

| Term | Meaning |
|---|---|
| Master asset | The source edit (audio/video) a creator works on |
| Variant | A platform-specific render of a master (e.g. 9:16 60s for Shorts) |
| Post | A variant plus copy plus target account plus schedule; has its own status |
| Cascade | An automation fired by a publish event on one platform that posts elsewhere |
| Comment-to-DM | Auto-sending a private message when someone comments a keyword |
| Unified API | A third-party service that posts to many networks through one API |
| Closed loop | Analytics flow back into editing decisions |
