# Open-Source Readiness Report

> **Project:** Kehilah — Patreon-style creator-membership platform
> **Repo:** `codecanyon-patreon-clone` (local; remote `origin` → a private GitHub repo)
> **Date:** 2026-07-09
> **Author:** Codebase analysis for the goal of publishing this project publicly on GitHub
> **Scope:** `app-backend`, `app-web`, `app-dashboard`, `app-mobile`

This report answers two questions:
1. **How does the system function?** — the architecture and data flow of each component.
2. **Is it ready to be open-sourced?** — a readiness verdict, the blockers, and a concrete
   remediation plan.

---

## 1. Executive summary

Kehilah is a **Patreon-style membership platform** with four deployable components:

| Component | Stack | Role |
|---|---|---|
| `app-backend` | Node.js / **NestJS** (TypeScript) | REST API + WebSockets; MongoDB, Stripe, S3, Firebase, Mailgun |
| `app-web` | **Next.js 15** + Chakra UI + framer-motion | Public consumer-facing site (creators, members, checkout) |
| `app-dashboard` | **Next.js 15** + shadcn/ui + TanStack Query | Admin/operations dashboard (moderation, payouts, analytics) |
| `app-mobile` | **Flutter** (GetX) + Firebase | Mobile client for both creator and member |

The backend is genuinely the richest piece: Stripe Connect payouts, JWT + Apple/Google/
Facebook OAuth, real-time chat over Socket.IO, FCM push, analytics aggregation, and a
large admin/moderation surface. It is production-shaped.

**Verdict: not ready to open-source in its current state.** The code quality is
sufficient, but the *repository* contains several hard blockers that must be cleared
before a public release:

- 🔴 **Real credentials committed to git** (Android signing keystore + password, Firebase
  project files, Firebase API keys hardcoded in Dart source, production URLs/emails).
- 🔴 **`.env` with live secrets** present on disk in every Node component (must confirm
  it is gitignored *and* that no secret ever landed in git history).
- 🔴 **Secret material embedded in `repomix-output.xml`** (a dump of the backend that
  contains AWS/S3 keys and Stripe secret-key placeholders) committed to git.
- 🟠 **No `LICENSE` file** — an open-source repo with no license is *all rights
  reserved* by default; contributors cannot legally reuse the code.
- 🟠 **`license: "UNLICENSED"`** in `app-backend/package.json`.
- 🟠 **No root `README.md`** explaining the monorepo; only boilerplate per-app READMEs.
- 🟠 **Large committed build/analysis artifacts** (`chakra.txt` 61 KB, 119 tracked
  `.cxx` CMake files, `tsconfig.tsbuildinfo`, `analysis_*.txt`).
- 🟡 **No tests** in web/dashboard/mobile (backend has 12 spec files; worth auditing).

The good news: **`.env` and `node_modules` are correctly gitignored today** (not tracked),
and the fixes below are mostly mechanical. The biggest risk is that some secrets were
*pushed at some point*, so even after deleting files now, the git **history** still
contains them and must be sanitized or the secrets rotated.

---

## 2. How the system functions

### 2.1 Data-flow overview

```
        Google / Apple / Facebook OAuth  ──►  /auth/*  (Passport)
                                              │
                                              ▼
   Web  /  Mobile  ──HTTP──►  NestJS Backend  ──►  MongoDB (Mongoose)
                          │
                          │── Stripe: subscription checkout + Connect payouts
                          │── S3:  post images / video, collections
                          │── FCM:  push notifications
                          │── Socket.IO: real-time chat (group + DM)
                          │
                          └──►  Admin Dashboard  (JWT + isAdmin)
```

### 2.2 `app-backend` (NestJS)

**Entry & bootstrap** — `src/main.ts`
- Enables global validation pipeline (`class-validator`), sets global prefix,
  initializes Firebase, and boots Socket.IO for real-time chat.

**Config** — `src/config/configuration.ts`
- A typed `ConfigService` factory that reads every value from `process.env`
  (Mongo, Stripe, S3, Mailgun, OAuth, Firebase, brand). No secrets in code; all
  injected. This is clean and safe for open source — *as long as* a `.env` with real
  values is not committed.

**Infrastructure modules**
- `database/` — Mongoose schemas under `database/schemas/` (user, creator, membership,
  subscription, post, chat, notification, payout, promotion, report, analytics, etc.).
  Seed script `seed.ts` and `run-migrations.ts` live at the repo root.
- `stripe/` — Checkout for subscriptions and **Stripe Connect** flows: onboarding
  links, account verification, and payout creation for creators.
- `s3/` — Uploads via S3-compatible endpoints (main, collections, test buckets).
- `firebase/` — FCM push (mobile) + admin SDK for device tokens.
- `mailgun/` — Transactional email (verification, notifications).
- `websockets/` + `chat/` — Socket.IO gateway powering group chat and DMs, with
  persistence in MongoDB and delivery of unread counts.
- `push/` — FCM notification dispatch and device-token management.
- `admin/` — Read/moderation API consumed by the dashboard (stats, creator/member
  approval, content withholding, subscription & payout lifecycle).

**Auth** — `auth/`
- `strategies/`: `auth.google.ts`, `auth.apple.ts`, `auth.facebook.ts` (Passport) plus
  local + JWT.
- `guards/`: `JWTGuard`, `RbacGuard` (role-based), `OAuthGuard`, `IsAdminGuard`.
- Social OAuth exchanges a code for a JWT; subsequent requests are JWT-only.
- Admin authority is a boolean `user.isAdmin` flag verified by `IsAdminGuard` — the
  dashboard does not hold its own credentials.

**Stripe Webhooks** — `webhooks/stripe-webhooks.controller.ts`
- Verifies `stripe-signature` using **two** secrets: `STRIPE_WEBHOOK_SECRET` for the
  platform account and `STRIPE_WEBHOOK_CONNECT_SECRET` for connected (creator)
  accounts.

**Scheduling** — a nightly cron aggregates per-creator earnings analytics.

**Required external services to bootstrap a contributor:**
MongoDB, Stripe (+ Connect), an S3-compatible bucket set, Firebase (FCM + SDK),
Mailgun, and Google/Apple/Facebook OAuth apps. `.env.example` documents all variables.

### 2.3 `app-web` (public site, Next.js)

- **Auth context** (`src/lib/auth-context.tsx` + `src/app/auth/**`): Google/Apple/Facebook
  login via the backend; returns a JWT that the client stores and forwards on API calls.
- **Creator onboarding** (`src/app/onboarding/`): multi-step — choose URL, connect
  Stripe (via backend `/onboarding/*` + `refresh`), create creator, then set up a first
  membership.
- **Checkout** (`src/app/checkout/`): a client-side **Stripe `redirectToCheckout`** using
  a *publishable* key — a safe, public identifier (not a blocker).
- **API layer**: a `fetch` client pointed at `process.env.NEXT_PUBLIC_API_URL`.
  Only *two* `process.env` vars are used app-wide; both are `NEXT_PUBLIC_*` (safe by
  design). `app-web/.env` holds them but is **gitignored** — not tracked.
- **Messaging**: chat reuses the Socket.IO client + REST `/chat/*`.
- UI is built on **Chakra UI** and **framer-motion**; the 61 KB `chakra.txt` file is a
  copied Chakra *documentation dump*, not source.

### 2.4 `app-dashboard` (admin, Next.js)

- TanStack Query + shadcn/ui + Chakra. Talks to the backend through
  `src/lib/services/` (a token-aware client using `NEXT_PUBLIC_API_URL`).
- **Login** (`/login`): no password — it redirects to the *main* app's Google OAuth,
  accepts a `token` query param, stores the JWT in `localStorage`, then calls
  `/auth/verify` (401 → redirect back). So the dashboard is **fully protected by the
  backend's JWT + `isAdmin`**; it holds no secrets of its own.
- Routes: `admin-users`, `analytics`, `audit-log`, `content`, `creators`, `export`,
  `members`, `payouts`, `reports`, `settings`, `subscriptions`.
- `server-status` route reflects backend env checks (reads the same env the backend uses).
- `app-dashboard/.env` (holds `NEXT_PUBLIC_API_URL`) is **gitignored** — not tracked.
- No tests.

### 2.5 `app-mobile` (Flutter)

- **GetX** (state + DI + navigation), `flutter_bloc` present too; HTTP via a Dart HTTP
  client + Socket.IO-React-Dart for chat; Firebase for push (FCM).
- **Config is centralized in `lib/config/app_config.dart`** — which is where the
  open-source problem lives (see below).
- Talks to the backend through the URL in `app_config.dart`; Firebase via a
  generated `firebase_options.dart`.
- Tests: only `test/widget_test.dart` (boilerplate). No `integration_test/`.

---

## 3. Open-source blockers (must-fix)

### 🔴 B1 — Real credentials committed to git

| File | What it contains | Severity |
|---|---|---|
| `app-mobile/android/app/key.jks` | Android **signing keystore** (binary) | Critical — anyone could sign/forgery risk for your app identity |
| `app-mobile/android/key.properties` | `storePassword`, `keyPassword`, `keyAlias` (plaintext) | Critical — keystore is useless-locked; combined with the `.jks` it's a full signing key |
| `app-mobile/android/app/google-services.json` | Firebase project number, API key, OAuth client, app IDs | High — grants access to your Firebase project |
| `app-mobile/ios/Runner/GoogleService-Info.plist` | iOS Firebase config + API key | High |
| `app-mobile/lib/firebase_options.dart` | Firebase API keys for Android/iOS in Dart source | High |
| `app-mobile/lib/config/app_config.dart` | Hardcoded **production** URLs & emails (`kehilahserver.com`, `kehilah.co`, `chaim@kehilah.co`) | Medium — PII + brand leak |
| `app-mobile/lib/constants/*.dart`, `shared_preference_constants.dart` | Likely more hardcoded endpoints | Medium |

**Why this matters:** even if you delete these files now, they live in the git **history**.
A public clone will contain them. You must (a) remove from the working tree, (b) add to
`.gitignore` / stop tracking, and (c) **rotate the keys** — treat everything that was ever
pushed as compromised.

**What to do (mobile):**
1. Delete from git:
   ```
   git rm --cached app-mobile/android/app/key.jks
   git rm --cached app-mobile/android/key.properties
   git rm --cached app-mobile/android/app/google-services.json
   git rm --cached app-mobile/ios/Runner/GoogleService-Info.plist
   git rm --cached app-mobile/lib/firebase_options.dart   # replace with a template
   ```
2. Provide **templates** instead:
   - `google-services.json` → document "copy into `android/app/` (gitignored)".
   - `firebase_options.dart` → ship a `firebase_options.example.dart` with placeholders.
3. Externalize `app_config.dart` values (URLs, emails) to a **const file the contributor
   edits**, or build-args; remove real domains/emails.
4. **Rotate**: regenerate the Android keystore, create a fresh Firebase project, and
   remove the old API key.

### 🔴 B2 — `.env` with live secrets on disk

- `app-web/.env`, `app-dashboard/.env`, `app-backend/.env` exist on disk with real
  values. They are **gitignored today** (not in `git ls-files`), so the *current* tree is
  clean.
- **The risk is history.** Verify none was ever committed:
  ```
  git log --all --full-history -- app-web/.env app-dashboard/.env app-backend/.env
  git log --all --oneline -- '*.env'
  ```
  If any `.env` with real secrets appears in history, rotate the secrets (Stripe, Mongo
  URI, AWS, JWT, webhook) and sanitize history.
- Add a **`.env.example`** to every Node app (backend has one; web/dashboard don't) so a
  fresh clone is runnable without real keys.

### 🔴 B3 — Secret material inside `repomix-output.*`

- `app-backend/repomix-output.xml` (1.3 MB) and `.txt` (86 KB) are **dumped source that
  embeds `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `STRIPE_SECRET_KEY`, `JWT_SECRET`,
  `MONGODB_URI`, `GOOGLE_CLIENT_SECRET`, etc.** They were generated by the *Repomix* tool
  and committed.
- Even if the values are placeholders, a committed backend dump in a public repo is a
  liability and a source of confusion.
- **Fix:** `git rm app-backend/repomix-output.txt app-backend/repomix-output.xml` and add
  both to `.gitignore`. Do the same for any tool dumps.

### 🟠 B4 — No license (legal)

- There is **no `LICENSE`** at the repo root, and `app-backend/package.json` declares
  `"license": "UNLICENSED"`. Under default copyright, **no one may use your code**.
- **Fix:** pick a license (MIT / Apache-2.0 / GPL). For a commercial-adjacent platform,
  **Apache-2.0** or **MIT** are common. Set `"license"` in every `package.json` to match
  and drop a root `LICENSE`.
- **Decision point:** are you open-*sourcing for* reuse, or just wanting the code
  visible? That determines MIT vs. a more protective license. Worth a moment.

### 🟠 B5 — No root README / docs

- No top-level `README.md`. Each app has a **boilerplate** README (Nest/Next/Flutter
  starter text) that doesn't describe Kehilah.
- **Fix:** write a root `README.md` (what it is, architecture diagram, how to run each
  app, env setup, prerequisites, license). Replace the per-app boilerplate READMEs with
  real setup notes or move them under `docs/`.

### 🟠 B6 — Committed build/analysis artifacts (repo bloat)

| File | Size | Note |
|---|---|---|
| `app-web/chakra.txt` | 61 KB | Chakra docs dump — delete |
| `app-mobile/android/app/.cxx/…` | **119 tracked files** | CMake build cache — should never be in git |
| `app-web/tsconfig.tsbuildinfo`, `app-dashboard/tsconfig.tsbuildinfo` | — | incremental-build cache — gitignore |
| `app-mobile/analysis_errors.txt`, `analysis_output.txt` | — | analyzer output — delete |
| `app-web/repomix.config.json`, `app-web/editor-code.md` | — | tool/scratch files |

- `node_modules` is correctly gitignored everywhere (good).
- **Fix:** add a root/`.gitignore` covering `*.tsbuildinfo`, `.cxx/`, `*.txt` analyzer
  dumps, `chakra.txt`, `repomix*`, `editor-code.md`, and remove the already-tracked ones
  from git. Consider a **root `.gitignore`** since there is none at the repo root.

### 🟡 B7 — No meaningful tests

- Backend: **12 `.spec.ts`** files — worth auditing, but at least a floor exists.
- Web / Dashboard / Mobile: **zero** test files (mobile only has the generated
  `widget_test.dart`).
- **Not a hard blocker** for publishing, but an open-source project with no tests is
  harder to contribute to. Even a handful of e2e tests + CI would strengthen it.

### 🟡 B8 — Branding & PII throughout

- `kehilah`, `chaim@kehilah.co`, `kehilahserver.com`, `kehilah.co` appear in **218 mobile
  files** and several web/dashboard files. For a generic open-source template you'd want
  these replaced or at least moved to a config the user fills in.
- `docs/google_oauth_cred.md` and `docs/stripe_setup.md` may contain your real client
  IDs/secret references — review before publishing.

---

## 4. What's already good

- `.env` and `node_modules` are **gitignored** in all Node apps (current tree is clean
  of tracked `.env`).
- All secrets are **env-injected** in the backend; nothing is hardcoded in `src/`.
- Stripe **publishable** keys used in web are safe; secret keys stay server-side.
- Stripe webhook **signature verification** is implemented (both platform + Connect).
- The dashboard has **no independent credentials** — it's gated by the backend's
  `isAdmin` flag (good; no dashboard-specific secret to leak).
- `next.config.ts` in both Next apps has **sane defaults**.
- Backend has a seed script, migration runner, and a real test floor.

---

## 5. Remediation checklist (ordered)

**Phase 0 — Decide**
- [ ] Choose a license (recommend Apache-2.0 or MIT). This gates everything legal.
- [ ] Confirm goal: fully open-source (contributors can run & modify) vs. public-but-
      proprietary.

**Phase 1 — Purge credentials (do first; these are your highest-risk items)**
- [ ] `git rm --cached` + delete the 7 mobile credential files in B1; add to `.gitignore`.
- [ ] Create `firebase_options.example.dart` / `google-services.json` instruction instead
      of shipping real files.
- [ ] Externalize `app_config.dart` URLs/emails; remove real domains + personal emails.
- [ ] Delete `app-backend/repomix-output.{txt,xml}`; gitignore `repomix*`.
- [ ] Confirm no `.env` ever committed (`git log --all -- '*.env'`); if found, rotate
      Stripe/AWS/JWT/Mongo/webhook secrets and sanitize history.

**Phase 2 — Sanitize repo metadata**
- [ ] Add a **root `.gitignore`** (`.tsbuildinfo`, `.cxx/`, analyzer dumps, `chakra.txt`,
      `repomix*`, `*.txt` scratch, `key.properties`, `*.jks`, `google-services.json`,
      `GoogleService-Info.plist`).
- [ ] Remove all tracked build/analysis artifacts (B6).
- [ ] `git rm --cached app-web/chakra.txt app-web/tsconfig.tsbuildinfo
      app-dashboard/tsconfig.tsbuildinfo app-mobile/analysis_*.txt app-web/editor-code.md
      app-web/repomix.config.json`.

**Phase 3 — Legal + docs**
- [ ] Add root `LICENSE` (matching chosen license).
- [ ] Set `"license"` field in all three `package.json` files (remove `UNLICENSED`).
- [ ] Write root `README.md`: overview, architecture, per-app setup, env, prerequisites,
      license, security note.
- [ ] Add `.env.example` to `app-web` and `app-dashboard`.
- [ ] Audit `docs/*.md` for real client IDs/secrets.

**Phase 4 — History cleanup (because secrets were pushed)**
- [ ] Rotate **all** exposed secrets (keystore, Firebase, Stripe, AWS, Mongo, JWT,
      webhook, Mailgun) regardless of whether they look "real" — treat as compromised.
- [ ] Rewrite history to drop the committed secrets (`git filter-repo` /
      `BFG`), **or** start a fresh branch/commit tree and re-publish. For a *first-time
      public* release, the cleanest path is often:
      - finish Phases 1–3 on `main`,
      - create a new public repo, and push a **squashed, secret-free initial commit**
        (don't inherit the private history), then rotate keys.
- [ ] If you must keep history, use `git filter-repo --replace-text` on credential
      patterns and force-push; coordinate with the private remote.

**Phase 5 — Polish (optional but recommended)**
- [ ] Add a few real tests (backend e2e; a couple of web/mobile unit tests).
- [ ] Add a **CI workflow** (`.github/workflows`) to build each app on push.
- [ ] Consider a **CONTRIBUTING.md** and **CODE_OF_CONDUCT.md**.
- [ ] Replace per-app boilerplate READMEs with real setup notes.

---

## 6. Bottom line

**The code itself is open-source-able.** It's a coherent, production-shaped NestJS +
Next.js + Flutter membership platform with clean env-based config and no hardcoded
secrets in the backend. **The repo, as it stands, is not safe to publish** because of
committed mobile signing/Firebase credentials, a secret-bearing backend dump
(`repomix-output`), on-disk `.env` files, a missing license, and build-artifact bloat.

The blockers are all **mechanical and bounded** (mostly `git rm --cached`, `.gitignore`,
a license file, and a README). The one step that isn't reversible is **history**:
anything pushed in the past still lives in git. Recommend finishing a clean,
secret-free tree on `main`, then publishing a fresh public repo from a squashed initial
commit and rotating every key that ever appeared in the private history.

---

## Appendix A — File inventory of cleanup targets

**Credentials / PII (remove or template):**
- `app-mobile/android/app/key.jks`
- `app-mobile/android/key.properties`
- `app-mobile/android/app/google-services.json`
- `app-mobile/ios/Runner/GoogleService-Info.plist`
- `app-mobile/lib/firebase_options.dart` → template
- `app-mobile/lib/config/app_config.dart` → externalize URLs/emails
- `app-backend/repomix-output.txt`, `repomix-output.xml`
- `app-web/.env`, `app-dashboard/.env`, `app-backend/.env` (keep local only; add `.env.example`)

**Build / analysis artifacts (gitignore):**
- `app-web/chakra.txt`
- `app-web/tsconfig.tsbuildinfo`, `app-dashboard/tsconfig.tsbuildinfo`
- `app-mobile/analysis_errors.txt`, `app-mobile/analysis_output.txt`
- `app-mobile/android/app/.cxx/**` (119 files)
- `app-web/editor-code.md`, `app-web/repomix.config.json`

**Legal / docs (add):**
- Root `LICENSE`
- Root `README.md`
- Root `.gitignore`
- `.env.example` (web, dashboard)
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/workflows/*` (recommended)
