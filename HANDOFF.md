# CineClub — status & handoff

_A snapshot for picking up in a fresh chat/session. The living backlog is in
[ROADMAP.md](./ROADMAP.md); the technical reference is in
[ARCHITECTURE.md](./ARCHITECTURE.md); end-user setup is in [README.md](./README.md)._

**Last updated:** 2026-06-27.

## Naming — three different names, all on purpose

This trips people up, so read it first:

| Thing | Name | Notes |
|-------|------|-------|
| **Brand** (what users see) | **CineClub** | Was "CineSpin" (clashed with an existing app + domain), before that "Spinema" / "cinewheel". Reads as Cine·Club. |
| **GitHub repo** | **`cinespin` → `cineclub`** | **Being renamed** to match the brand (was deliberately left as `cinespin`; repo name ≠ brand is fine — just tidying). **Low-risk:** every remaining `cinespin` mention is in **docs only**, no functional code references the repo path. See the rename checklist below. `thecineclub.co.uk` fronts it either way. |
| **Firebase project** | **`cinewheel-79636`** | **Do NOT rename** — internal id, never shown to users; renaming breaks the config. |
| **localStorage keys** | `cineclub_*` | Renamed from `cinespin_*` with the CineClub rebrand — no migration (test-only, as with prior renames); existing browsers just re-enter their name once. |

The app uses **relative paths** everywhere (no hardcoded domain/path), and the
live site is the **domain root** `thecineclub.co.uk` (not a `/repo/` subpath), so
the Pages path changing (`/cinespin/` → `/cineclub/`) does not affect the app.

### Repo-rename checklist — `cinespin` → `cineclub` (the next task)

The rename is on GitHub (repo Settings → rename). Low-risk: no functional code
references the old name (verified — all remaining `cinespin` mentions are docs).
After renaming:

- **⚠️ Verify Pages survived the rename FIRST.** Settings → Pages: confirm the
  custom domain still reads `thecineclub.co.uk` with **Enforce HTTPS** on and the
  DNS check green. The repo-root `CNAME` file re-asserts it on the next build, but
  a rename can bounce the Pages build — if the field cleared, re-enter
  `thecineclub.co.uk` and Save. This is the **only** thing that can actually break.
- **No Firebase / DNS / reCAPTCHA / API-key changes.** Those are all keyed on the
  **domain** (`thecineclub.co.uk`, `lewisf94.github.io`), not the repo path. The
  API-key referrer rule `https://lewisf94.github.io/*` already covers `/cineclub/`.
- **Update doc references** `…/cinespin/` → `…/cineclub/` (cosmetic — the github.io
  URL is just a redirect now): `README.md` (~3, 168, 180), `CLAUDE.md` (~11, 91),
  `CONTRIBUTING.md` (~32), `support/index.html` (~13), and this file's table.
- **Session/remote:** start the new chat against `lewisf94/cineclub`. GitHub
  redirects the old git remote, but the new session's GitHub tools should target
  the new name. Commit straight to **`main`** as always.

## Where things stand

- **Live:** <https://thecineclub.co.uk> — custom domain **fully set up and working** (Fasthosts DNS → GitHub Pages, custom domain + Enforce HTTPS, repo-root `CNAME`). The old `lewisf94.github.io/cinespin/` redirects to it.
- **Domain migration (2026-06-27) — DONE.** Three console lists were updated so the new domain works, all keyed on `thecineclub.co.uk` (+ `www`): Firebase Auth **Authorized domains**, the reCAPTCHA v3 key's **Domains** (App Check), and the Firebase **API-key HTTP-referrer** allowlist. That last one was the final blocker — anon sign-in is rejected from any referrer not on the list, which surfaced as the generic "Couldn't connect" banner.
- **Backend:** Firebase project `cinewheel-79636` (Firestore + Anonymous Auth + Email-link sign-in). Config in `js/firebase.js`.
- **Code:** all of the prioritized roadmap (P0–P4) plus the 2026-06 feature queue and security hardening are built and on `main`.

## On now (live / enabled)

- **TMDB** metadata — title autocomplete, posters, year/runtime/genres, "where to watch", richer stats. Key in `js/tmdb.js`.
- **Features:** approval **vote mode** + **vote-a-film-off**, **Letterboxd CSV import**, per-film **discussion comments** (revealed with reviews), **activity feed**, **taste compatibility**, **add-to-calendar (.ics)**, **trailers + recommendations**, **season recap** ("CineClub Wrapped"), **per-film rating histogram**, **spoiler tags**, **dark mode**, themed **stream-filter** pill.
- **PWA** (installable + offline shell), accessibility pass, single-writer finalize/reset, serverTimestamp ordering, render coalescing — all live.
- **Security (client/code side):** uid-recorded identity, **kicked-member live ejection** (a kicked member is cleanly returned to the landing screen). Member-locked rules + hardening are written (see "Needs YOU").

## Off by default (code is ready; flip when you want)

- **App Check** (SH-1) — set `recaptchaV3SiteKey` in `js/firebase.js`, register the site, monitor → enforce.
- **Cloud Functions** server-authoritative mode — set `useFunctions = true` in `js/firebase.js`, deploy `functions/`, publish `functions/firestore.rules`. Needs Blaze. See `functions/README.md`.
  - ⚠️ **Known gap (SH-9):** the **vote**, **vote-to-remove**, and **service-override** writes have no callable and would be **denied** under the hardened rules — enabling this mode silently breaks those three features until vote functions are added. Fine in the default client-trusted mode.
- **Web push deadline reminders** — scaffolded (`js/push.js`, `firebase-messaging-sw.js`, scheduled `sendDeadlineReminders` function). OFF until a **VAPID key** is set in `js/firebase.js` (`messagingVapidKey`). Needs Blaze + deploy. README step 8.

## Needs YOU (console actions — I can't reach the Firebase project)

1. **CRITICAL — publish the rules.** Paste `firestore.rules` into Firebase → Firestore → Rules → Publish. The live DB still runs the **old permissive rules** until you do, so the member-lock + hardening (SH-2/4/6/8, incl. rating/comment author-pinning) aren't enforced yet. **Emulator-test first** (SH-8 adds `get()`-based checks). The uid-recording client is live, so have everyone **re-join once** after publishing.
2. **Email template still says "cinewheel-79636".** Fix: Firebase → Project Settings → General → **Public-facing name** → set to **CineClub** → Save. (The sign-in-link email isn't a directly-editable template; it uses this name. Sender address stays `@cinewheel-79636.firebaseapp.com` unless you set up custom SMTP.)
3. **App Check is on.** reCAPTCHA v3 key live in `js/firebase.js`, **enforced for Cloud Firestore**; Authentication is still in **Monitor** (fine to leave, or enforce later once the new domain shows sustained 100% verified). The **API-key HTTP-referrer** restriction is set and includes `thecineclub.co.uk` + `www`. Remaining optional: anonymous-account auto-cleanup (SH-5).
4. **Email-link sign-in** works and `thecineclub.co.uk` is now in **Authorized domains**. ✅
5. **Legal pages still have a placeholder.** `privacy.html` + `terms.html` say operated by **[YOUR NAME OR HANDLE]** — pick a real name/handle and fill it in. (Contact `hello@thecineclub.co.uk` and governing law *England & Wales* are already set.)
6. **Confirm `hello@thecineclub.co.uk` forwarding delivers.** The legal pages point users there — send a test email and check it lands in the Gmail inbox (Fasthosts free forward → `hellocineclub@gmail.com`).

## Still open / next candidates (details in ROADMAP.md)

- **SH-9** — make the vote feature server-authoritative (add `commitVoteWinner` etc. callables; relax hardened rules for the low-stakes poll/removeVotes/serviceOverride writes).
- **SH-3** sybil/metadata gap — needs a server-side join (a fresh anonymous uid can still join/rate; longer codes or App Check mitigate).
- **Deferred:** read-cost refactor (archive split — wants emulator testing); it's fine for small clubs as-is.
- **Optional polish:** new app icon/favicon if you want a "CC"/CineClub mark (current icon is a film-reel).

## Conventions to keep (don't regress)

- Commit straight to **`main`** (no feature branches, no PRs unless asked) — Pages serves `main`. The cloud harness suggests a `claude/…` branch; that's **overridden** — land on `main`.
- Commits authored **and** committed as **Lewis** (`85638536+lewisf94@users.noreply.github.com`).
- **No build step** for the front end (the optional `functions/` backend is a separate Node deploy).
- **No emojis** in the UI. Escape user input with the local `esc()` helper.
- Themes are per-user (localStorage), never in Firestore. Three only: `a24` (Default), `festival` (Cinema), `strokes` (Web 1.0), each with a light/dark `[data-mode]`.
- **One Firebase entry point** (`js/firebase.js` re-exports the SDK) — never import gstatic SDK URLs elsewhere.
