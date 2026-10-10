# CRED → Sonicly: Mobbin audit and design-system update (10 Oct 2026)

## What was done

1. **Collected every CRED screen on Mobbin.** I paged through the Mobbin connector's flow search by app name ("CRED", iOS) until it reported no further pages. That gave **69 flows and 282 unique screens** (349 flow-screen slots before de-duplication). The full list is in `manifest.json`, with each screen's ID, Mobbin link and flows.
2. **Reviewed every screen individually.** All 282 were downloaded at full resolution (1170×2652; kept out of the repo) and reviewed in order. Each screen has notes and component tags in `manifest.json` (`reviewed: true` on all 282).
3. **Built the inventory.** The 555 distinct tags were grouped into component families, with 0 unmapped. The table is in `inventory.md`.
4. **Updated the design system.** Added 37 components and extended 7 existing ones in `frontend/src/components/ui/`. Each one has a page at `/design-system`, marked **New**. Every page links back to the CRED screens it came from (`pages/design-system/cred-refs.js`, generated from the manifest).

The Mobbin captures date from March 2024, so they decided **which components and states exist**. Visual values still come from `../cred-latest-tokens.md`, with Sonicly's aqua brand kept.

## New components

| Group | Components |
|---|---|
| Structure | SectionHeader, DividerLabel, PageTitle |
| Navigation | AppBar, BottomNav, IconTile / IconTileGrid |
| Actions | TextLink, SlideToConfirm, ProgressButton, ActionBar / SplitActions, Chip |
| Feedback | Ribbon, Countdown, Ticker, Banner, Receipt, TrustFooter, StatusScreen, StepTrack, PageDots |
| Forms | SearchField, FloatingField, BareField, AmountInput, QuickAmounts, Keypad (+ `applyKey`), OptionCard, NumberStepper, SwatchPicker, WheelPicker |
| Data | Price, TransactionRow / TransactionGroup, KeyValueGrid / SummaryTable, NumberedList, SwipeRow, Gauge, FlipCounter |
| Cards | PromoCard, MediaCard, ProductCard, OfferCard, TicketCard |
| Overlays & chat | ActionSheet, ConfirmSheet (on Drawer), TourPanel, QuickReplies |

## Extended components

- **Button:** adds `elevated` (NeoPOP 3D key: black on light pages, white on dark; lifts on hover, sinks when pressed, grey key when disabled) and `pay` (lime 3D key).
- **Badge:** adds `success-soft`, `destructive-soft`, `muted`, `tab`, `notch` and `mono`.
- **Tabs:** adds `pill` (caps, grey active pill) and `boxed` (square outlined filters).
- **Progress:** adds `size="line"` (2px loader rule) and `size="lg"`.
- **Spinner:** adds `variant="dots"` (CRED's busy button).
- **Item:** adds `ItemMedia variant="tile"` and `ItemArrow`.

## Deliberately not built

These are artwork rather than UI components (tagged `art` in the inventory): the isometric illustrations, 3D reward chests and slot reels, fuel-price 3D tags, spotlight and chevron backgrounds, the number-plate input, and the card-scan frame. The camera scanner was also skipped.

## How it was checked

- `npm run build` passes, and `git diff --check` is clean.
- All 37 new and 6 updated doc pages were rendered in Chromium (Playwright) in both themes, with no console or page errors.
- Screenshots of each page were reviewed. Fixed along the way: elevated keys overflowing their grid, prices showing `.00`, the gauge centre rendering black in light theme (the `--color-*` theme variables aren't emitted at runtime, so components use the base tokens), promo-card buttons blending into their card, the choice-row arrow wrapping, and a stray strip under media cards.
- Interaction checks: the sheet opens and closes, the confirm sheet shows both actions, the slider confirms from the keyboard, the keypad builds `12.5`, the stepper stops at its max, and option cards select.

## Known limits

- The Mobbin connector can only search; it can't list an app's screens tab directly. Coverage is "every screen inside a CRED flow on Mobbin". A screen that belongs to no flow wouldn't appear. Compare 282 with the total on CRED's Mobbin app page to confirm.
- There are no automated tests in this repo (see CLAUDE.md), so the checks above were manual.
- The new components are in the design system but not yet used in the app's screens.
