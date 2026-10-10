# CRED latest → Sonicly design tokens (8 Oct 2026)

Branch: `design-cred-latest`. Nothing is committed yet.

## Summary

- **Source:** the official CRED Android app, **v6.1.4.157**, installed from Google Play in an emulator.
  - It is genuine: the package is `com.dreamplug.androidapp` and the signing certificate is DreamPlug, Bangalore.
  - The decoded files stayed outside the repo. Only **values** were taken, never CRED's fonts, icons, images, animations or code.
- **Overall impression:** CRED 6.1 is still NeoPOP, with sharper rules than the old public NeoPOP values:
  - Pop White surfaces (`#F8F8F8` / `#FBFBFB` / `#FFF`) and Pop Black `#0D0D0D`.
  - **Hairlines at 10% of the ink colour.**
  - Square corners almost everywhere.
  - 3px plunk depth with edges derived by a fixed lightness rule.
  - A very fast 50ms key press.
  - CRED's own grey "disabled key".
  - Medium-weight body text with wide-tracked caps labels.
  - A new display serif, **Denton**, replacing Cirka.
- **How the values were read:** resource names in the app are obfuscated. Values were ranked by how often they are used, and CRED's real style names were recovered from the app's resource tables (e.g. `Primary50_Plunk_Black`, `HeadingBold14`, `CapsSemiBold10`).

Confidence: **H** = read directly from the app. **M** = value read, role inferred. **L** = estimate.

---

## 1. Colour

| Token (Sonicly) | Before | CRED 6.1 | Now | Conf |
|---|---|---|---|---|
| `--background` light | `#F4F4F1` (warm paper) | `#F8F8F8` (window bg), `#FBFBFB` surfaces | `#F8F8F8` | H |
| `--card` / `--popover` light | `#FFFFFF` | `#FFFFFF` | unchanged | H |
| `--muted` / `--accent` / `--surface-2` light | `#EBEBE6` | `#EFEFEF` (pop white 300) | `#EFEFEF` | H |
| `--muted-foreground` light | `#5C5C5C` | text at 70% `#B30D0D0D` / 50% `#800D0D0D` | `#545454` (70% level; the 50% level fails AA) | H |
| `--border` | `#E0E0DA` / `#262626` | **10% of ink**: `#1A0D0D0D` / `#1AFFFFFF` | `rgb(13 13 13 / .1)` / `rgb(255 255 255 / .1)` | H |
| `--input` light | `#C7C7C2` | 30% ink outlines, `#E0E0E0` search | `#B6B6B6` (30% ink: darker than before, but still under the 3:1 guideline, as in CRED) | H |
| `--card` dark | `#161616` | `#121212` (dark card) | `#121212` | H |
| `--popover` / `--muted` / `--surface-2` dark | `#1A1A1A` / `#1C1C1C` / `#1F1F1F` | `#161616` | `#161616` | H |
| `--accent` dark (hover) | `#232323` | `#252525` | `#252525` | H |
| `--muted-foreground` dark | `#8A8A8A` | 50% white ≈ `#868686`, palette `#8A8A8A` | unchanged | H |
| `--destructive` | `#EE4D37` | `#EE4D37` | **`#DF2B13`**: white text on `#EE4D37` is only 3.6:1 (fails AA), so this uses CRED's own derived red (4.7:1) | H / deviation |
| `--success` `--warning` `--info` | NeoPOP | identical (`#06C270`, `#F08D32`, `#144CC7`) | unchanged | H |
| `--success-track` (new) | — | `#B4EDD4` switch track (light), `#124D34` dark | added | H |
| `--caret` (new) | browser default | 2px **`#144CC7`** cursor | added (dark uses the accent) | H |
| `--disabled` + edges (new) | `opacity: .45` | face `#8A8A8A`, right `#B6B6B6`, bottom `#3D3D3D`, text `#FFF` | added (dark: `#3D3D3D` / `#585858` / `#252525`) | H |
| `--overlay` | 45% / 70% | Android default **60%** black; darker sheets 90% | 60% / 80% | H / M |
| `--sheet-edge`, `--sheet-handle` (new) | — | top edge `#E0E0E0`; handle `#8A8A8A` | added | H |
| `--brand` Sonic aqua | `#2CE6E0` | n/a (CRED's accent is yellow `#FFEB34`) | **kept**, as it is Sonicly's identity | — |

**Palette:** the app ships NeoPOP's full open-source palette unchanged: the Pop White and Pop Black ramps plus red, orange, blue, green, purple, peach, pink, yellow, lime and violet ramps. The Sonicly ramps and chart colours already come from it.

## 2. Plunk depth (the NeoPOP 3D edge)

| Item | Before | CRED 6.1 | Now | Conf |
|---|---|---|---|---|
| Depth | 3px | **3dp** (`neopop_depth`) | 3px | H |
| Edge colour rule | hand-picked | **HSL lightness:**<br>• right edge −0.10, bottom edge −0.20 (faces with L ≥ 0.3)<br>• right edge +0.20, bottom edge +0.10 (darker faces) | all `--edge-*` recomputed with this rule | H |
| Primary edges, light (`#0D0D0D` face) | `#8A8A8A` / `#3D3D3D` | `#404040` / `#272727` | updated | H |
| White face edges | `#E0E0E0` / `#8A8A8A` | `#E6E6E6` / `#CCCCCC` | updated | H |
| Brand edges | `#1FA19D` / `#167370` | rule → `#18C7C2` / `#129A95` | updated | H |
| Dark card edges | `#333333` / `#262626` | in-app override `#303030` / `#242424` | updated | H |
| Press | 140ms, (.4,0,.2,1) | **50ms AccelerateDecelerate**, face moves the full depth | 50ms, (.37,0,.63,1) | H |
| Disabled | 45% opacity | grey key: face `#8A8A8A`, edges `#B6B6B6` / `#3D3D3D` | new `plunk-disable` utility on solid buttons | H |
| Shimmer | — | 45° band, 20dp wide, 1.5s linear, rests 5s, white 25–30% | new opt-in `pop-shimmer` utility | H |
| Hover lift to 4px | yes | none (touch app) | **kept**, as a desktop affordance | — |
| Radius | 0 | 0 on all NeoPOP surfaces. About 80% of shapes are square; the rounded exceptions are filter pills (18dp), a "curved" sheet (10dp) and legacy toasts | 0 (no change) | H |

## 3. Typography

| Role | Before | CRED 6.1 | Now | Conf |
|---|---|---|---|---|
| Display serif | Gloock (stand-in for Cirka) | **Denton Variable**, weights 100–700 (Cirka is now rare) | **Fraunces** (variable, Google Fonts), with wonky and soft shapes turned off | H |
| UI sans | Plus Jakarta Sans | Gilroy | kept (closest open licence) | H |
| Mono | JetBrains Mono | **Overpass Mono** | **Overpass Mono**, the same font | H |
| Body | Regular, 0.005em | **Gilroy Medium**, 0.4sp (~0.03em), line-height **1.5×** | weight 500, 0.02em, 1.5 | H |
| Headings (sans) | Bold, tight | Gilroy Bold, 0.2sp (~0.01em), line-height **1.25×** | docs scale updated (H3 20/25, H4 16/20) | H |
| Display (serif) | line-height 1.1 | Denton about 1.3–1.39× (24/33, 36/50, 58/75) | 1.2 (a compromise at 60px) | H / M |
| Caps label | ExtraBold 11, 0.16em | **CapsSemiBold10 / CapsBold10, 2sp = 0.2em**, line-height 1.25 (most-used style in the app, 982 uses) | Bold 11, **0.2em**; every hard-coded caps label now uses 0.2em and Bold | H |
| CTA label | Bold 14 | HeadingBold14 (0.01) / 13 (0.02) / 11 (0.04) | button sizes use these | H |
| Most-used text | — | Medium 12/18 (888), Medium 11, SemiBold 13, Bold 18, SemiBold 14, Bold 20 | docs "Small" is now Medium 12/18 | H |

CRED's type scale is responsive: screens narrower than 360dp get smaller variants, e.g. the hero goes 58 → 36–50. Sonicly already scales headings with breakpoints, so no change was needed.

## 4. Motion

| Token | Before | CRED 6.1 | Now | Conf |
|---|---|---|---|---|
| `duration.fast` / `base` / `slow` | 140 / 220 / 420ms | most common: **200 / 300 / 500ms** | 200 / 300 / 500ms | H |
| Default curve | expo out (.16,1,.3,1) | **FastOutSlowIn (.4,0,.2,1)**; one custom curve (.43,0,.58,1) | `--ease-standard`, `ease.out`, `ease.inOut` | H |
| Rise / page enter | 420ms expo | page push 300ms | 300ms standard | H |
| Dialog | 200ms, scale .97 | **scale 0.9 → 1, 220ms** | 220ms, zoom 90 | H |
| Sheet | 300 / 200ms expo | **350ms decelerate in, 350ms accelerate out** | 350ms, decelerate / accelerate | H |
| Springs | 520/34, 260/28 | Compose: ratio 1 / 1500, ratio 0.75 / 200; NeoPOP press 6000, no bounce | `snappy` 1500/77, `soft` 200/21, new `press` 6000/155 | H |
| Shimmer loop | 1.6s | 1.5s linear | 1.5s | H |
| Press scale | — | **none**: CRED moves the face along its depth instead | unchanged (Sonicly already does this) | H |

## 5. Components: variants, sizes and states

| Component | CRED 6.1 | What changed in Sonicly |
|---|---|---|
| **Button** | **Heights:** 50 / 40 / 30dp (Plunk adds the 3dp depth).<br>**Padding:** 20dp (Secondary 15, or 12 at the smallest size).<br>**Label:** Bold 14 / 13 / 11 with 0.01 / 0.02 / 0.04 tracking.<br>**Variants:** Light/Dark × Elevated / Flat / Flat-Border, Link, Tilted.<br>**Disabled:** grey key.<br>**Loading:** spinner replaces the label. | **Sizes:** `lg` 50px, `default` 40px, `sm` 30px, with CRED tracking. `icon-sm` / `icon-lg` are 30 / 50px.<br>**Disabled:** solid variants turn into the grey key (`plunk-disable`).<br>**Outline:** now a 1px ink stroke (CRED Secondary Flat-Border).<br>**API:** props and variant names are unchanged. |
| **Switch** | 40×20 square track, 1px ink border, 2px padding.<br>16px square thumb with an 8px "window" in the track colour.<br>Off: ink thumb. On: green `#06C270` thumb on a mint `#B4EDD4` track. | **Rebuilt to these values.** Also covers the `sm` size (32×16, 12px thumb).<br>The "on" colour changed from brand aqua to CRED green. |
| **Checkbox** | 20px square, 1px ink border.<br>Checked: solid ink with a white tick.<br>Warning: orange border. | 20px, 1px ink border, a hover tint, and a solid ink fill when checked. |
| **Radio** | 20px circle, 1px ink ring.<br>Checked: solid ink disc with a 7.3px white dot.<br>Pressed: solid disc. | Rebuilt to match, including the pressed state. |
| **Input / textarea / select / combobox / composer** | 1px border: `#E0E0E0`, or 30% ink.<br>Focus: 1px ink, with no thick underline.<br>Cursor: 2px blue.<br>Placeholder: 30%.<br>Error: red text. | **Focus:** the 2px inner underline is gone (CRED focus is just the border turning ink).<br>**Cursor:** blue `--caret` everywhere.<br>**Error:** the red border is kept for accessibility. |
| **Card** | Square.<br>Hairline at 10% ink, 0.4–0.5dp.<br>Dark card `#121212`.<br>Elevated cards use 3dp depth. | Comes through the tokens (`--border`, `--card`, `--edge-card-*`). |
| **Bottom sheet / drawer** | Square top with a **3dp raised top edge**.<br>Handle **60×2** `#8A8A8A`, sitting **15dp above** the sheet. | Bottom drawer and sheet use a 3px `--sheet-edge` top.<br>The handle is now a 60×2 bar floating above the sheet. |
| **Dialog / alert dialog** | Pops from 0.9 scale in 220ms. | Updated. |
| **Scrim** | 60% black, 90% on dark variants. | 60% / 80%. |
| **Tabs** | No indicator at all; selection is shown by text style. | **Line tabs:** the indicator is thinned from 3px to 2px and kept for clarity on desktop.<br>**Segmented tabs:** unchanged. |
| **Badge / tag** | Padding 8×4, Bold caps, 0.12em tracking. | `py-1`, Bold (was ExtraBold). |
| **Toast** | Top-anchored, square, padding 30×15, SemiBold 13 with 0.03em tracking. | **Title:** SemiBold 13, 0.03em.<br>**Unchanged:** the toast was already top-centre and square, and the status bar stays. |
| **Menus / popovers** | Not NeoPOP-specific in the app. | Caps labels: 0.2em, Bold. |
| **Tooltip / snackbar** | Stock Android only. | Unchanged. |
| **Tilt button** (CRED's yellow floating CTA) | 18.8° / 32° skew, 10dp depth, floats about 5dp every 2s. | **Not added.** Sonicly has no equivalent and adding one would be a new component. Say if you want it. |

## 6. Fonts

| CRED (identified by name only) | Sonicly now | Why |
|---|---|---|
| Denton Variable (display serif) | **Fraunces** | Variable, wide weight range and high contrast. The closest open-licence match. |
| Gilroy (UI) | Plus Jakarta Sans | Geometric and wide, close in feel. Already in use. |
| Overpass Mono | **Overpass Mono** | The same family. Open licence on Google Fonts. |
| PP Cirka, Swear Display, GrandSlang, Nunito Sans, pixel fonts | not used | Rare, or only used on promo screens. |

## 7. What could not be read from the app

- **Mosaic (CRED's newest, server-driven component system):** the button-type styling (e.g. `light_elevated`) is drawn by Flutter inside the compiled native library, so its exact numbers are not readable. The Compose and XML equivalents above were used instead.
- **Logged-in screens:** home cards, rewards and offers come from CRED's server, so they aren't in the app files.
- **The Compose edge rule:** it blends 30% / 40% toward black, a little different from the XML rule. Sonicly uses the XML rule, which is the one the 439 CRED buttons use.

If you want these covered, the iPhone screenshots that would help are:
1. The home screen, top section.
2. A card detail screen.
3. Any bottom sheet, open.
4. A form with a text field focused.
5. A screen recording of a primary button being pressed.
6. A list screen.

## 8. Files changed

- `frontend/index.html`: Google Fonts link (Fraunces, Overpass Mono).
- `frontend/src/index.css`:
  - Light and dark tokens, plus new tokens (`--caret`, `--disabled*`, `--success-track`, `--sheet-*`).
  - Plunk timing, with new `plunk-disable` and `pop-shimmer` utilities.
  - Type helpers, body text, and motion tokens and keyframes.
- `frontend/src/lib/motion.js`: durations, curves and springs.
- `frontend/src/components/ui/`:
  - `button`, `switch`, `checkbox`, `radio-group`.
  - `input`, `textarea`, `select`, `native-select`, `combobox`, `input-group`, `composer`, `composer-panel`.
  - `drawer`, `sheet`, `dialog`, `alert-dialog`, `tabs`, `badge`, `sonner`.
  - Caps tracking in `styles`, `command`, `message`, `table`, `sidebar`, `questionnaire`.
- `frontend/src/components/theme-provider.jsx`: light `theme-color` is now `#F8F8F8`.
- `frontend/src/pages/Editor.jsx`: light waveform colour.
- `frontend/src/pages/design-system/foundations.jsx`, `demos-forms.jsx`, `demos-data.jsx`: docs show the new values.
- `.claude/launch.json`: frontend dev server on port 3001 (port 3000 was in use).

Screenshots are in `docs/design/screens/cred-latest/`: button, colour, type, depth, forms and login, in light and dark, desktop and mobile.

### Audit pass

A second pass covered all 75 components and the docs pages:
- **Motion:** the remaining expo and overshoot curves now use CRED's standard curve.
  - Components: switch, slider, accordion, tabs, progress, navigation menu, task list, web search, agent progress, agent limits card.
  - Also the sign-up strength bar.
- **Questionnaire:** choices match the new 20px checkbox and radio.
- **Agent Progress:** pending boxes use 1px borders.
- **Loading buttons:** a busy key (`aria-busy`) keeps its colour while a spinner replaces the label, as CRED's progress button does, instead of turning grey.
- **Docs pages:**
  - Every description and state demo now matches the new behaviour (Button, Badge, Input, Textarea, Checkbox, Radio, Switch, Tabs, Dialog, Sheet, Drawer).
  - The radio page has a Pressed state.
  - The button page has a Glint demo.

## 9. Checks run

- **All 82 design-system pages:** dark at 1440px and light at 375px, with no console errors, no page errors, no horizontal scroll and no empty pages.

- `npx vite build` passes.
- 9 pages × light/dark × 1440px/375px (36 checks) passed:
  - no console errors;
  - no horizontal scroll.
- Measured in the browser:
  - button heights 50 / 40 / 30 / 28px;
  - edge colours match the rule;
  - disabled keys turn grey;
  - the switch is 40×20 with symmetric 3px gaps on and off.
- Reduced motion is still respected: the global rule is unchanged.

---

# Update (8 Oct 2026): rebuilt in the CRED 2026 look

The first pass followed CRED's native NeoPOP code (square, hard 3px edges). The current app screens are drawn by CRED's Flutter "2026 design system" from server-driven templates that ship inside the app (`central_experience`: home, search, more, profile templates). Those templates hold the real values, so the system was rebuilt on them.

| Area | CRED 2026 (template value) | Sonicly now |
|---|---|---|
| Page | white | `--background #FFFFFF` (dark stays `#0D0D0D`) |
| Radius | cards 16, buttons/trail CTAs 8, icon tiles 10, sheets/grouped 22, badges 4, raised key 2, chips full | `rounded-2xl` / `md` / `lg` / `3xl` / `sm` / `xs` / `full` |
| Hairlines | 0.8px `#1A0D0D0D`, cool `#E5ECF0`, tile rim `#D0D9DE` 0.48 | `border-[0.8px] border-border`, `--border-cool`, `--pill-border` |
| Circle icon tile | 44px, `#FFFFFF → #FBF9F9`, 0.72px `#33C8C8C8` | `surface-tile` |
| Ice tile / chip | `#FFFFFF (41%) → #E2ECF0`, 0.48px `#D0D9DE` | `surface-pill` |
| Grey trail CTA | 36h, r8, `#80ECEEF1`, 0.8px `#E5ECF0`, 11px w700 | `Button variant="secondary" size="sm"` |
| Dark pill CTA | r36, `#474747 → #161616`, 1px `#B3FFFFFF`, shadows `0 4 10 #33000000` + `0 14 10 #1A000000`, bottom sheen | `Button variant="pill"`, `surface-pop`, `shadow-pop` |
| Raised key | face 80×32 `#FFEB88 → #F6B800`, rim `#FFFFFF → #FEE67D`, hard `0 3 0 #0D0D0D`, text `#552A12` 11 bold | `Button variant="gold"` (and `brand` in Sonic aqua) |
| Status chips | r4, gradients `#F08B7B→#EE5050`, `#6CCFBE→#17A284`, 8px w700 | `Badge` destructive/success (gradients deepened to pass AA) |
| Section header | 10px w700, ls 1.2px, 70% ink | `text-caps text-label` |
| Rows | title 13 w700 ls 0.2 lh 1.385; subtitle 12 w500 ls 0.4 `#8A8A8A` | `Item`, list rows |
| Floating layers | — | `pop-float` = 12px corners, hairline, soft shadow; menu rows `rounded-md` with soft highlight |

New button variants (existing ones kept): `pill`, `gold`, `chip`. Every component in `components/ui/` and the design-system site shell were restyled (classes only; props, variants and `data-slot`s unchanged).

**Still approximate (not in the templates, compiled into CRED's Shorebird Flutter build, which can't be decompiled; and CRED closes itself on an emulator, so it can't be measured live):** the new checkbox, radio, toggle, the black "EARN" pill tags and the raised edge under the ice chips. These follow the same tokens.

**Accessibility deviations from CRED:** muted text `#767676` instead of `#8A8A8A`, and darker status-chip gradients, so text meets WCAG AA.
