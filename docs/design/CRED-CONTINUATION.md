# CRED design-system continuation

Prepared 10 October 2026 for the existing Claude cloud session. This is a setup handoff, not a completed Mobbin audit.

## Source and branch

Repository: https://github.com/jayydesign244/eigen-talk

The local CRED design-system work is on `design-cred-latest`. Start from this branch, not the older `main` snapshot. Keep the cloud session's assigned `claude/dazzling-galileo-lcvdfx` branch as the output branch so the source checkpoint remains available.

If the assigned branch already has changes, inspect them before integrating the source branch. Do not reset or overwrite them.

```sh
git fetch origin
git switch claude/dazzling-galileo-lcvdfx
git merge origin/design-cred-latest
```

## Scope carried forward from the local session

- Visit every available CRED screen on Mobbin individually. Save progress after each page or batch, including source links and screen IDs; deduplicate repeated screens without losing their flow membership.
- Inventory components, variants, and states, then compare them with the current implementation.
- Update real React components in `frontend/src`, and update `/design-system` demos to show the resulting coverage.
- Use Mobbin captures to establish component/state coverage; preserve the newer values documented in `docs/design/cred-latest-tokens.md` for styling.
- This is Sonicly's actual design system, following the existing implementation and its preserved Sonicly aqua branding. It is not a separate literal CRED clone.
- No video recordings are needed.

The APK-derived `cred-screen-checklist.md` is a separate inventory of internal screen names. Its totals are not a count of Mobbin screens, and its unchecked entries do not prove any visual review.

## Mobbin and audit status

> **Update (10 Oct 2026, cloud session):** done. All 69 CRED flows and 282 unique screens on Mobbin were collected and reviewed one by one, and the design system was updated: 37 new components and 7 extended. See `mobbin-cred/README.md`. The notes below describe the state before that work.

The prior collection attempts failed. No completed collection or screen-by-screen audit is claimed here. The files in `docs/design/screens/cred-latest/` are existing design-system QA screenshots, not a full Mobbin export.

Claude's account connector catalog exposes a verified Mobbin connector. Connecting it and checking whether the existing Code cloud session exposes its tools are separate checks; an account connection alone does not prove tool availability in that session.

Before implementation, verify a CRED search works in the cloud session. If it does not expose Mobbin, stop and report that exact limitation. The fallback is to collect full-resolution images and a resumable manifest locally and transfer those files to cloud; do not substitute a few search results for complete coverage.

## Checkpoint validation

The existing frontend changes pass `npm run build` and `git diff --check`. Vite reports a large design-system bundle warning. These checks establish that the checkpoint builds, not that the full component audit is complete.

Setup work stops here. The user will resume the Claude session themselves.
