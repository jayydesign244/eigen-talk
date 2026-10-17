# Update Sonicly's design system to the latest CRED look & feel

**For Claude Code working in this repo.** Read this whole file first, then `CLAUDE.md`, then `docs/design/REDESIGN.md`.

## The goal (in the owner's words, summarised)

Sonicly's design system already follows CRED's **NeoPOP** structure, but it's based on the *old* public NeoPOP values. The owner wants the **same look and feel as the latest CRED app**. We do **not** copy CRED's components, code or assets. We **extract design values** (colors, spacing, corner radius, strokes, depth/elevation, type scale, motion) from the official CRED Android app and from screenshots, then **update Sonicly's own tokens and components** to match.

## Inputs

| Input | Where | Notes |
|---|---|---|
| Official CRED APK files | `~/Downloads/cred-apk.zip` (base.apk + split_*.apk) | Produced by `docs/setup/android-emulator-cred-apk.md`. Must verify (Step 1). |
| NeoPOP (CRED's open-source design system, Apache-2.0) | https://github.com/CRED-CLUB/neopop-web, https://github.com/CRED-CLUB/neopop-android | Baseline + vocabulary for the latest values |
| iPhone screenshots / screen recordings | Owner sends on request | For anything the APK can't tell us (Step 4) |

## Hard rules

1. **Values only.** Never copy CRED's fonts, icons, images, illustrations, Lottie/animation files, layouts or code into the repo. Re-implement everything as Sonicly's own code.
2. **Fonts:** match CRED's style with **open-licence** fonts (Google Fonts). Current stand-ins: Gloock (for CRED's display serif), Plus Jakarta Sans (for Gilroy), JetBrains Mono.
3. **Keep component APIs stable** (props, variants, sizes, `data-slot`s) so no page breaks. Change looks, not interfaces.
4. **Both themes** (light + dark) and **WCAG AA contrast** for text. Keep `prefers-reduced-motion` support.
5. **No approval, no changes:** produce the report (Steps 2–4) and **wait for the owner's go-ahead** before editing components (Step 5).
6. **Commit only when the owner asks.** Suggest working on a branch, e.g. `design-cred-latest`.
7. Extracted APKs and decompiled output live **outside the repo** (e.g. a temp/scratch folder). Only the *report* and *our own code* go into the repo.

---

## Current Sonicly design system (what you're changing)

- **Stack:** React 18 + Vite, **Tailwind v4 (CSS-first)** — no `tailwind.config.js`; tokens are in CSS. shadcn-style components on `radix-ui`, animations with `motion`.
- **`frontend/src/index.css`** (≈700 lines) — the source of truth:
  - `:root, .light { … }` and `.dark { … }` — semantic colour tokens (`--background`, `--foreground`, `--card`, `--primary`, `--brand` (Sonic aqua `#2CE6E0`), `--muted`, `--border`, status colours with `-soft`/`-ink` variants, `--edge-*-r/-b` plunk edge colours, `--float-*`, `--ease-*`).
  - `@theme inline { … }` — fonts (`--font-sans/serif/mono`), **radius scale (all 0px — square corners)**, `--color-*` mappings, sonic/accent ramps.
  - `@property --plunk` + `@utility plunk / plunk-press / plunk-bordered / edge-*` — NeoPOP's 3D "plunk" depth: two solid 45° edges (right lighter, bottom darker), 3px default, 4px on hover, 0 when pressed.
  - `pop-float`, `pop-float-lg` (overlay extrusion), `text-caps`, `font-display`, `tabular`, `hatch`, `shimmer`, keyframes (`rise`, `pop`, `eq`, `live`, …).
- **`frontend/src/components/ui/`** — 74 components (button, card, input, select, dialog, sheet, tabs, slider, switch, toast/sonner, tooltip, dropdown, context-menu, table, chat bubbles, agent cards, …).
- **`frontend/src/components/ui/styles.js`** — shared menu/overlay class strings.
- **`frontend/src/lib/motion.js`** — motion presets (durations, springs, stagger).
- **`frontend/index.html`** — Google Fonts `<link>`.
- **Docs site:** `frontend/src/pages/design-system/` (`foundations.jsx` = Colour, Type, Shape & depth, Space & grid, Motion, Icons; `demos-*.jsx` = component pages). Route: `/design-system`.

---

## Step 1 — Unpack and verify the APK

```bash
which apktool jadx || brew install apktool jadx      # Java needed (jadx brings openjdk)
W="$(mktemp -d)/cred"; mkdir -p "$W" && cd "$W"
unzip -q ~/Downloads/cred-apk.zip
ls cred-apk/                                           # base.apk + split_*.apk
apktool d -f -s -o res-base cred-apk/base.apk          # resources + manifest (no smali)
grep -o 'package="[^"]*"' res-base/AndroidManifest.xml  # must be com.dreamplug.androidapp
grep -E "versionName|versionCode" res-base/apktool.yml
for s in cred-apk/split_*.apk; do apktool d -f -s -o "res-$(basename "$s" .apk)" "$s"; done
jadx --no-res -d code cred-apk/base.apk                # Java/Kotlin sources (for Compose values)
```

**Stop** if the package isn't `com.dreamplug.androidapp` — tell the owner the file isn't genuine CRED.

## Step 2 — Extract the values

Work through each category. For every value record: **name/key, value, source file, where it's used (best guess), confidence (high/medium/low).** Note light vs night (`values-night`, `drawable-night`).

### Colours
- `res-*/res/values/colors.xml`, `values-night/colors.xml`, `res/color/*.xml` (state lists).
- Theme attributes: `values/themes.xml`, `styles.xml` → `colorPrimary`, `colorSurface`, `colorOnSurface`, `android:windowBackground`, `colorControl*`.
- NeoPOP attrs: `grep -rn "neopop\|pop_" res-base/res/values/attrs.xml res-base/res/values/*.xml | head -100`.
- Compose colours in code: `grep -rhoE "Color\((0x[0-9A-Fa-f]{8})" code | sort | uniq -c | sort -rn | head -80` and `grep -rhoE "ColorKt\.Color\(([0-9]{6,})L?\)" code | sort | uniq -c | sort -rn | head -80` (convert the long → hex ARGB).
- Group into: backgrounds/surfaces, text levels, accents, status, edges/borders, overlays.

### Spacing & sizes
- `res/values/dimens.xml` (dp/sp). Build the spacing scale (e.g. 4/8/12/16/20/24/32…) and component sizes (button heights, input heights, icon sizes, card padding, screen margins).
- Compose: `grep -rhoE "Dp\.m[0-9]+constructorimpl\(([0-9.]+)f\)" code | sort | uniq -c | sort -rn | head -60` (pattern varies — also try `(float) [0-9]+` near `Dp`).

### Corner radius & strokes
- `res/drawable*/*.xml`: `<corners android:radius=…>`, `<stroke android:width=… android:color=…>`, `<gradient>`.
- Compose: `grep -rn "RoundedCornerShape\|CutCornerShape" code | head -40`.
- Note: current Sonicly radius is **0 everywhere**; check whether newer CRED uses rounded cards/sheets/chips.

### Depth / elevation / shadows (the NeoPOP "plunk")
- Look for edge/depth values: `grep -rn "depth\|edge\|plunk\|shadow\|elevation" res-base/res/values/*.xml | head -80`.
- Compare with NeoPOP's depth model (right/bottom edge colours, angle, thickness, shimmer).

### Typography
- `res/values/styles.xml` → `TextAppearance.*`: `textSize` (sp), `fontFamily`, `textStyle`, `letterSpacing` (em), `lineHeight`, `textAllCaps`.
- `res/font/` → **font names only** (identify families; do not copy files). Pick the closest open-licence Google Fonts.
- Compose: `grep -rhoE "TextUnitKt\.getSp\(([0-9.]+)\)|getSp\(([0-9]+)\)" code | sort | uniq -c | sort -rn | head -40`, `FontWeight`, `letterSpacing`.
- Build the type scale: display, h1–h4, body, caption, label/caps, numbers/mono.

### Motion
- `res/anim/*.xml`, `res/animator/*.xml`, `res/interpolator/*.xml` → durations, interpolators (curves).
- `res/values/integers.xml` → `*_duration`.
- Lottie JSON in `assets/` / `res/raw/`: read only `fr` (frame rate) and durations for timing — don't copy the files.
- Compose: `grep -rn "tween(\|spring(\|keyframes" code | head -40`.

### Server-driven UI
CRED renders many screens from server JSON after login, so some latest designs won't be in the APK. Note any JSON configs/templates in `assets/` that hint at tokens.

## Step 3 — Compare & propose

Write **`docs/design/cred-latest-tokens.md`** in the repo with:

1. **Summary** — APK version, what was found, overall impression ("darker surfaces, rounded 12px cards, 2px edges…").
2. **Token comparison table** per category:

   | Token (Sonicly) | Sonicly now | CRED latest (APK) | NeoPOP (open source) | Proposed | Confidence |
   |---|---|---|---|---|---|

   Map to Sonicly's real token names in `index.css` (e.g. `--background`, `--card`, `--edge-card-r`, `--radius-lg`, `--font-sans`).
3. **Component-level notes** — buttons (primary/secondary/tertiary, sizes, depth), cards, inputs, selects, sheets/dialogs, tabs, chips/badges, sliders, switches, toasts, lists, nav bars.
4. **Fonts** — CRED family names (identified) → proposed open-licence alternatives, with a one-line reason each.
5. **What we could not determine** (Step 4 list).

## Step 4 — Ask for screenshots (only for gaps)

Give the owner a **specific** list, e.g.:
> Please send iPhone screenshots (Side + Volume Up) of: 1) Home screen top section, 2) a card detail screen, 3) any bottom sheet open, 4) a form with a text field focused, 5) a primary button being pressed (screen recording), 6) a list screen, 7) dark/light if the app has both.

When screenshots arrive, measure what you can (spacing, sizes, radius) relative to known references (status bar height, standard text size) and update the report with the new values (confidence: medium).

**Then stop and ask the owner to approve the proposed tokens.**

## Step 5 — Implement (after approval)

Order matters — tokens first so most components update automatically:

1. **`frontend/src/index.css`**
   - Update colour tokens in `:root/.light` and `.dark`.
   - Update `@theme inline`: radius scale, fonts.
   - Update plunk/depth (`--plunk` default, edge colours, `plunk-press` hover/pressed values) and `pop-float*`.
   - Update `--ease-*` curves and keyframe timings.
2. **`frontend/index.html`** — swap the Google Fonts `<link>` if fonts change (and `--font-*` in step 1).
3. **`frontend/src/lib/motion.js`** — durations/springs to match.
4. **`frontend/src/components/ui/*.jsx`** — adjust per component where tokens aren't enough (padding, heights, radius on specific parts, depth per variant). Keep props/variants identical.
5. **`frontend/src/components/ui/styles.js`** — shared menu/overlay classes.
6. **Docs site** — update `pages/design-system/foundations.jsx` so Colour / Type / Shape & depth / Space / Motion pages show the new values; check every `demos-*.jsx` page still renders.
7. Spot-check app-specific components that hard-code styles: `components/editor/*` (SoundPanel, AssistantPanel, ExportDialog, VideoPreview, TranscriptView), `pages/VoiceStudio.jsx`, `pages/Dashboard.jsx`, `components/projects/*`.

## Step 6 — Verify

1. `cd frontend && npx vite build` — must pass.
2. Run locally: backend `cd backend && venv/bin/python -m uvicorn main:app --port 8000`, frontend `npm run dev` (port 3000).
   - To view app screens **without logging in**, run a second frontend with Clerk disabled (dev auto-auth):
     `VITE_CLERK_PUBLISHABLE_KEY= VITE_API_URL=http://localhost:8001/api npx vite --port 3001` against a test backend on 8001 started with `CLERK_ISSUER= DATABASE_URL=` (SQLite, no auth). Never point the no-auth setup at the real database.
3. Check in a real browser at **1440×900 and 375×812**, **light and dark**:
   - `/design-system` — every foundation and component page.
   - `/login`, `/signup`, `/dashboard`, `/editor?p=<id>` (transcript, Assistant tab, **Sound** tab, export dialog), `/voice`.
4. No console errors, no horizontal scroll on mobile, text contrast AA, focus rings visible, reduced-motion respected.
5. Take before/after screenshots of the key screens for the owner.

## Step 7 — Report to the owner

Short, plain-language summary:
- What changed (colours, radius, depth, type, motion) with 1–2 before/after screenshots.
- Anything still approximate and why (e.g. "home card spacing measured from screenshot").
- Files changed.
- **Ask whether to commit/push** (don't do it unprompted).

---

### Quick reference — owner preferences
- Plain, simple language in reports; tables over walls of text.
- Local HTML/MD files in the repo, not published artifacts.
- Commit only when asked.
- Don't permanently delete anything; move to Trash.
