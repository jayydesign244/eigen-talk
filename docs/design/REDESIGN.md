# Sonicly redesign — overnight report (5 Oct 2026)

Branch: `new-design` (from `main`). Everything is committed locally. **Nothing has been pushed.**

## What's done

### 1. Design system: every shadcn/ui component in CRED's NeoPOP structure

- **All 65 components on ui.shadcn.com** are in `frontend/src/components/ui/`, from Accordion to Typography, including the new chat set (Attachment, Bubble, Marker, Message, Message Scroller, Questionnaire).
- **Docs site at `/design-system`:**
  - 6 foundation pages: Colour, Type, Shape & depth, Space & grid, Motion, Icons.
  - 64 component pages showing variants, sizes and states (default, hover, focus, pressed, disabled, invalid, loading).
- **Previews in both themes:** "Both" renders every preview in dark and light side by side; "Page" follows the theme switch.
- **Search:** press `/` to search the docs. The layout works on phones (navigation moves into a drawer).

**The system in one paragraph:** a monochrome base (Pop Black `#0D0D0D` / paper `#F4F4F1`) with one accent, Sonic aqua `#2CE6E0`. Corners are square everywhere except true circles (avatars, radio buttons). Depth comes from NeoPOP's **plunk**: two solid edges, 3px at 45°, right edge lighter and bottom edge darker. The values were read from CRED's open-source `neopop-web`. Keys lift a pixel on hover and sink into their edge when pressed. Menus, popovers and dialogs use the same 45° extrusion. Headings use **Gloock** (free stand-in for Cirka), the interface uses **Plus Jakarta Sans** (stand-in for Gilroy), and timecodes use **JetBrains Mono**.

**Where it lives:**
- Tokens and the plunk mechanics: `frontend/src/index.css`.
- Shared menu and overlay styles: `frontend/src/components/ui/styles.js`.
- Motion presets: `frontend/src/lib/motion.js`.

### 2. Screens, redesigned one at a time (Mobbin references, verified in Playwright)

| Screen | Mobbin references | What changed beyond looks |
|---|---|---|
| Login / Sign-up | Base44, Lovable, Lindy, Uxcel, Wise | Split layout with a self-running product demo: a prompt types itself, filler words drop out of the waveform, the score climbs. Real `<form>`s (Enter works, password managers detect them). Inline errors. Live password checklist and strength meter. |
| Dashboard | Descript, Riverside, ElevenLabs | Quick actions, real stats, filter/sort/grid-list, drag-and-drop anywhere to upload, ⌘K palette, U/R shortcuts, guided empty state, delete confirmation. Recording shows a live mic level meter. Removed the dead Rename/Duplicate actions and fake sidebar links. |
| Processing | Flodesk, Remote | **Now real.** It used to wait 2.8 s on timers. Now it runs transcription and filler detection and reports actual word and filler counts. Already-transcribed projects skip it and open the editor directly. |
| Editor | Descript, Riverside, ElevenLabs, Hume | Transcript as a document, waveform/transport docked at the bottom, collapsible AI panel. Word states (filler / playing / cut / rewritten). Right-click word menu. Slide-up "pending edits" bar with undo / discard / apply. Version menu. **Real A/B compare** (replaces the hardcoded 42→87 score and fake change list). New export dialog. Keyboard shortcuts. Reload-safe `?p=<id>` URLs. |
| MCP authorize | GitHub (Laravel Cloud), HubSpot | Clear "who is connecting", permission rows with icons, one Allow key, and proper expired / incomplete-link states. |

The landing page was skipped as agreed. It still renders in its original style.

**Animation** is part of every screen:
- **Keys:** plunk press.
- **Entrances:** page rises and staggered lists, cards landing with a spring, list reorder animation.
- **Controls:** switch snap, sliding tab rules, accordion plus → cross.
- **Loading:** equaliser spinner, shimmer skeletons.
- **Screen-specific:** the login demo, the processing scan line and headline crossfade, the pending-edits spring, the theme-toggle rotation.
- **Reduced motion:** everything respects the OS setting.

### 3. Fixes found along the way

- **Session expiry:** the API client retries once with a fresh Clerk token on a 401. Idle tabs were getting "Signature has expired".
- **Readable errors:** errors are explained in plain language, with technical details tucked behind a toggle (`lib/errors.js`).
- **No duplicate transcription:** transcription is deduplicated per project, so React's dev double-render can't run it twice.
- **Focus rings:** Tailwind v4's `outline-hidden` silently disabled focus rings, so focus now uses `outline-solid`. All controls show a visible ring.
- **Smaller download:** routes are lazy-loaded, so the main bundle no longer carries the design-system site.

### 4. Agent components (from BoardUI's list)

Eleven more components, inspired by boardui.com's list. They're built from scratch in the NeoPOP system; no BoardUI Pro code was copied. They live in `frontend/src/components/ui/`, with pages at `/design-system` (the site now has 75 components):

**Agent Limits Card · Agent Progress · Agent Thinking · Composer · Composer Attachments · Composer Loader · Composer Panel · Notification Center · Stat Cards · Task List · Web Search**

Where the app uses them:
- **Dashboard:**
  - Stat Cards form the stats row.
  - Notification Center is the new **Activity** bell in the top bar. It's built from real project events (created, ready to edit, exported, needs audio), with unread state remembered per browser.
- **Processing:** Agent Progress shows the real transcription steps and reports the total time when done.
- **Editor assistant:**
  - Composer Panel, with a version/word-count status tab, replaces the message box. Its mic dictates through the browser's own speech recognition.
  - Composer Loader lights the rim while the AI replies.
  - Agent Thinking replaces the "thinking…" line.
  - Task List logs every applied edit or noise cleanup, with its steps, the new version and how long it took.
  - Composer Attachments: right-click a word → **Ask AI about this line**, or **+ → Attach line at playhead**. Attached lines show as tiles in the composer and on the sent message, and their text goes to the AI with the question.
  - Web Search, as a **transcript search**: put a phrase in quotes ("cut every “you know”") and Sonicly finds it in the transcript first. It logs each search with its match count and clickable timestamps, and gives the AI those timestamps.
  - Agent Limits Card: the gauge on the composer's status tab opens it. It shows an estimate of the AI's context (instructions, transcript, conversation) and how much of the transcript is sent. The backend sends only the first 6,000 characters, and the card warns when a transcript is longer.

All three use real data. Attachments and searches are saved inside the message text and rebuilt when a conversation is reopened. The backend's thread-title helper ignores that block.

## ⚠️ Needs you

1. **Your OpenAI account is out of credits.** The API returns `insufficient_quota`, so **transcription and AI chat fail** until you add credits. $0 was spent. The app now explains this clearly instead of showing raw JSON.
2. **Test project in your database:** "[Test] Sonicly demo clip" (id 24) is a 12-second clip I generated with macOS `say`. Because Whisper was unavailable, I wrote a matching transcript into **that project only** to test the editor. I also applied one real edit to it ("Removed 7 words", free via ffmpeg). Delete it from the dashboard menu whenever you like.
3. **Not exercised, to protect your credits and quiet house:**
   - **ElevenLabs features:** Clean up noise, voice clone and word rewrite are paid, so I didn't run them.
   - **Export download:** it would save a file to your machine.
   - **Audio playback:** apart from 1.6 s once, since the browser runs on your Mac.

   The UI for all of these is built and its states are designed.

## Notes for later (backend, not changed)

- **Stale durations:** a project's `duration` isn't updated after edits, so dashboard cards show the original length (0:12) after cutting to 0:09.
- **Slow quota errors:** the OpenAI SDK retries quota errors for about 11 s before failing. Setting `max_retries=0` for 429 `insufficient_quota` would surface the error faster.
- **Outdated setup doc:** `SETUP.md` still describes Supabase Auth; the app uses Clerk.

## Run it

```bash
cd frontend && npm install && npm run dev
```

- App: http://localhost:3000 (dashboard: `/dashboard`)
- Design system: http://localhost:3000/design-system

The upgrade to **Tailwind v4 + React 19** is part of this branch. If you see stale styles, restart Vite with `npx vite --force`.

## Screenshots

`docs/design/screens/` contains 15 screens: design system, login, sign-up, dashboard (dark, light, mobile), processing, and editor (default, pending cuts, compare, export, light, mobile).
