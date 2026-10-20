<div align="center">
  <h1>Patreon Clone</h1>
  <p><strong>An open-source creator-membership platform — creators, subscriptions,
  monetized content, and payouts — with a web app, admin dashboard, and mobile app.</strong></p>
</div>

**Patreon Clone** is a full-stack, multi-tenant membership platform in the style of
Patreon: creators publish monetized content (text, image, video, audio, links) organized
into tiers, fans subscribe via Stripe, and creators get paid out through Stripe Connect.
It ships as **four apps** that work together:

| App | Tech | Role |
|---|---|---|
| [`app-backend`](app-backend/) | Node.js, NestJS 11, MongoDB | REST + WebSocket API: auth, memberships, payments, chat, push, admin |
| [`app-web`](app-web/) | Next.js 16, Chakra UI, framer-motion | Public site: discover creators, subscribe, consume gated content |
| [`app-dashboard`](app-dashboard/) | Next.js 16, shadcn/ui, TanStack Query | Platform operations: moderation, payouts, analytics, reporting |
| [`app-mobile`](app-mobile/) | Flutter (GetX), Firebase | Native mobile client for creators and members |

## 🌍 Live demo

Try the deployed demo instances (backed by a shared demo database — don't create real
subscriptions or payouts against it; use the credentials below to log in):

| App | URL | Login |
|---|---|---|
| Web app | <https://patreon-clone-web.up.railway.app/> | `test@bluetouch.dev` / `12345678` at [`/auth/login`](https://patreon-clone-web.up.railway.app/auth/login) |
| Admin dashboard | <https://patreon-clone-dashboard.up.railway.app/> | `info@bluetouch.dev` / `12345678` at [`/login`](https://patreon-clone-dashboard.up.railway.app/login) |

This repo is fully self-contained — no SaaS lock-in. Every external service (Stripe,
Firebase, S3, OAuth) is configured through environment variables, and the entire product
can be rebranded by editing a handful of config files (see [Rebranding](#rebranding)).

---

## 🏗️ How the pieces fit together

```
                       ┌─────────────────────────────┐
                       │   Stripe                    │
   web  /  mobile  ───►│  • Checkout (subscriptions) │
        /  dashboard   │  • Connect (creator payouts)│
                        └──────────────┬──────────────┘
                                       │ webhooks (signature-verified)
                                       ▼
        ┌──────────┐   JWT + OAuth   ┌──────────────────────────────┐
        │ MongoDB  │◄───────────────►│        app-backend           │
        │ (Mongoose)                │  NestJS REST + Socket.IO API │
        └──────────┘                 │  • auth (JWT/Google/Apple/…)│
        ┌──────────┐                 │  • memberships / payments   │
        │ S3 or    │◄───────────────►│  • posts / collections / chat│
        │ R2/MinIO │                 │  • admin / analytics / push │
        └──────────┘                 └──────────────────────────────┘
        ┌──────────┐
        │ Firebase │◄── FCM push (service account via env)
        └──────────┘
```

**Request flow (subscriber)**

1. `app-web` / `app-mobile` → `POST /auth/*` or OAuth (Google) against the backend.
2. Backend verifies identity, mints a **JWT** (bcrypt local login or social profile
   lookup), and returns it.
3. Client stores the token and sends it in the `Authorization` header on every API call.
4. To subscribe: the web app calls `POST /memberships/checkout/:id`, the backend creates a
   Stripe Checkout Session and returns a `checkoutUrl`; the browser redirects to Stripe
   and back (see [Stripe setup](#3-stripe)).
5. Stripe webhook → backend updates the subscription, grants tier access, credits the
   creator's Connect balance. Payouts are initiated by the dashboard or scheduled jobs
   and verified through Stripe Connect.

**Creator payout flow** — creators complete Stripe **Connect onboarding**
(`/onboarding/stripe` + `/onboarding/refresh` in the web app). Their earnings accrue to a
connected Stripe account; the backend tracks available balance and creates
Stripe **transfers** when a payout is approved (dashboard → `admin/payouts/:id/approve`).

**Real-time** — group chats and DMs run over **Socket.IO** (`app-backend/src/chat`),
persisted to MongoDB; unread counts and notification state are mirrored to the
`notifications` module, and the mobile app receives push via **Firebase Cloud Messaging**
with a per-user device-token registry (`database/schemas/device`).

---

## 🚀 Getting started

### 0. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ (LTS) | backend + both Next.js apps |
| MongoDB | 5+/Atlas | `MONGODB_URI` |
| Flutter | 3.32.2 (see `app-mobile/.fvmrc`) | mobile app |
| Stripe account | test or live | platform account + Connect enabled |
| S3-compatible storage | AWS S3 / Cloudflare R2 / MinIO | for media uploads |
| Google Cloud project | (optional) | for Google OAuth sign-in |
| Firebase project | (optional) | mobile push notifications |

> Clone the repo once; each app has its own install/build commands below.

### 1. Backend — `app-backend`

```bash
cd app-backend
yarn install                    # or: npm install
cp .env.example .env           # then fill in real values (see table below)
yarn start:dev                 # NestJS dev server on :8080
```

Seed demo users/content (optional — writes sample creators, posts, and picture files):

```bash
yarn seed
yarn run-migrate               # run any pending schema migrations
```

**Required env vars** (all documented in [`.env.example`](app-backend/.env.example)):

| Var | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_…`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for platform webhooks (`whsec_…`) |
| `STRIPE_WEBHOOK_CONNECT_SECRET` | Signing secret for Stripe Connect webhooks |
| `AWS_*` / `S3_*` | S3-compatible credentials, endpoint, and bucket names |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials |
| `BACKEND_URL`, `FRONTEND_URL` | Public URLs (OAuth callbacks, Stripe redirects, CORS) |
| `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` | Firebase service-account JSON (compact one-liner) for FCM push |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

> ⚠️ **Webhooks:** Stripe can't reach `localhost` — forward webhook events locally with
> the [Stripe CLI](https://stripe.com/docs/development/terminal-local-testing)
> (`stripe listen --forward-to localhost:8080/webhooks/stripe`). Setup details:
> [docs/stripe_setup.md](docs/stripe_setup.md) and
> [docs/google_oauth_cred.md](docs/google_oauth_cred.md).

### 2. Web app — `app-web` (and dashboard — `app-dashboard`)

```bash
cd app-web
npm install
cp .env.example .env         # point NEXT_PUBLIC_API_URL at your backend
npm run dev                  # http://localhost:3000
```

```bash
cd app-dashboard
npm install
cp .env.example .env
npm run dev                  # http://localhost:3000 (use a different port in dev)
```

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:8080` |
| `NEXT_PUBLIC_API_IMAGE_BUCKET` | Public media bucket base URL |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | (optional) contact-form service key |

The dashboard's login button delegates to the **web app's** Google OAuth flow and verifies
the returned JWT — a regular user simply gets no access to admin routes; only accounts
with `isAdmin: true` (a flag on the user document, typically set on the first seeded
admin or via `docs/admin-user` bootstrap) can use it.

### 3. Stripe

1. Create a **Stripe platform account** and enable
   **[Connect](https://docs.stripe.com/connect)** (the app uses the Express/destination
   charges model for creator payouts).
2. Put your secret key in `STRIPE_SECRET_KEY` (use `sk_test_…` keys while developing).
3. In **Dashboard → Developers → Webhooks**, add **two** endpoints both pointing at
   `https://<your-backend>/webhooks/stripe`:
   - a standard endpoint for `customer.subscription.*`, `invoice.*` events → its
     signing secret is `STRIPE_WEBHOOK_SECRET`;
   - a **"listen to events on connected accounts"** endpoint for `account.updated` → its
     secret is `STRIPE_WEBHOOK_CONNECT_SECRET`.
4. In the **Dashboard → Settings → Developer tools** "Known callback URL domains", add
   your `FRONTEND_URL` so Stripe's hosted Checkout redirects back to the site.

Step-by-step (including Stripe CLI local forwarding): [docs/stripe_setup.md](docs/stripe_setup.md).

### 4. Firebase (mobile push, optional)

Push notifications only need this when you build the **mobile** app:

1. Create a Firebase project; register your app for **Android**
   (`com.example.patreonclone` after rebranding, see below) and **iOS**.
2. Download `google-services.json` into `app-mobile/android/app/` and
   `GoogleService-Info.plist` into `app-mobile/ios/Runner/`
   (the repo ships **placeholder versions** of both — replace with yours).
3. `flutterfire configure` (or edit `app-mobile/lib/firebase_options.dart` /
   `app-mobile/lib/config/app_config.dart` → `FirebaseConfig`) with your project's
   API keys.
4. **Backend:** download a **service-account key JSON** from
   Firebase → Project settings → Service accounts, minify it to one line, and set it as
   `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` in `app-backend/.env`. The backend stores the
   mobile app's device tokens and sends FCM messages through it.

### 5. Mobile app — `app-mobile`

```bash
cd app-mobile
flutter pub get
# 1. edit lib/config/app_config.dart → apiServerUrl (your backend) + Firebase values
# 2. for Android signing: cp android/key.properties.example android/key.properties
#    and generate your own .jks keystore (instructions in that file's header)
flutter run        # pick a target; .fvmrc pins Flutter 3.32.2
```

> Android builds use a **release signing config** read from `android/key.properties`
> (gitignored — you must create it; the `.example` template is committed). If you don't
> have a keystore, debug builds still work but the config falls back safely to
> an unsigned build.

### 6. Google OAuth (web sign-in, optional)

Create a **Web application** OAuth client in the Google Cloud Console, then set
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in the backend `.env` and add the
authorized redirect `https://<your-backend>/auth/google/callback` plus your
frontend URL as authorized JavaScript origins. Walkthrough:
[docs/google_oauth_cred.md](docs/google_oauth_cred.md).

---

## 🔑 Environment variables, quick map

Everything sensitive lives in `.env` files (all gitignored; each app ships a
`.env.example`). The full matrix is in [`docs/open-source-readiness-report.md`](docs/open-source-readiness-report.md)
§"Required external services" if you want the exhaustive version.

| Service | Backend var(s) | Frontend var(s) |
|---|---|---|
| MongoDB | `MONGODB_URI` | — |
| JWT | `JWT_SECRET` | — |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_CONNECT_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET` (optional) | — |
| S3 / R2 / MinIO | `AWS_*`, `S3_BUCKET_NAME`, `S3_COLLECTIONS_BUCKET`, `S3_TEST_BUCKET`, `S3_ASSETS_BASE_URL` | `NEXT_PUBLIC_API_IMAGE_BUCKET` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BACKEND_URL` | — |
| Firebase (FCM) | `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` | — |
| CORS | `ALLOWED_ORIGINS` | — |
| URLs | `BACKEND_URL`, `FRONTEND_URL` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL` |

---

## 🗂️ Architecture notes

- **Backend modules** (`app-backend/src/<domain>/`): `auth` (JWT + Passport strategies for
  Google/Apple/Facebook), `users`, `members` / `memberships` (tiers, entitlements),
  `payments` + `webhooks` (Stripe Checkout & Connect, signature-verified), `posts` /
  `collections` (media via presigned S3 URLs, video thumbnails via `sharp`), `chat`
  (Socket.IO + persistence), `notifications` + `push-notifications` (FCM),
  `promotions` (gifts/discounts), `reports` (moderation queue), `admin` (operations API
  for the dashboard), `analytics` + `creator-history` (earnings aggregation via cron),
  `s3`, `search`, `home`, `platform-settings`, `server-status` (env health checks the
  dashboard surfaces).
- **Web app** (`app-web/src/app`): public marketing/home/explore, creator profiles,
  gated posts by type, `/checkout` (Stripe redirect), creator `/onboarding`
  (URL → Stripe Connect → profile → first membership), community, notifications,
  settings, ToS/Privacy.
- **Dashboard** (`app-dashboard/src/app/(app)`): admin-users, creators (approve/reject/
  suspend), members, content (withhold/restore/delete), subscriptions + stats,
  payouts (approve → Stripe transfer / reject → refund to balance), analytics,
  audit-log, reports, export.
- **Mobile** (`app-mobile/lib`): mirrors the web features in two personas — a **member**
  app (home feed, creator profiles, checkout, chat) and a **creator** app (post creation
  incl. audio/image/video upload, collections, earnings dashboard). All state is managed
  with GetX; HTTP + Socket.IO clients live under `lib/backend/`, central branding/URL
  config in `lib/config/app_config.dart`.

---

## 🎨 Rebranding

The project ships with generic placeholder brand values (`patreon-clone`,
`patreon-clone.example.com`) that are safe to run as-is. To rebrand:

- **Backend:** `app-backend/src/config/branding.config.ts` (name, emails, social links,
  logo URLs — overridable via `BRAND_*` env vars).
- **Web:** `app-dashboard/src/config/branding.ts` and any copy in `app-web/src`.
- **Mobile:** everything in one place — `app-mobile/lib/config/app_config.dart`
  (app name, tagline, company, API URL, frontend domain, contact emails, colors,
  Firebase config). Also `android/app/google-services.json`,
  `ios/Runner/GoogleService-Info.plist`, `ios/Runner/Info.plist` (display name),
  `android/app/build.gradle` (`namespace`/`applicationId` — currently
  `com.example.patreonclone`, a valid placeholder ID you should change to your own),
  and the launcher icons (`assets/images/`).

---

## 📁 Repository layout

```
├── app-backend/     # NestJS API (MongoDB, Stripe, S3, Firebase FCM, Socket.IO)
├── app-web/         # Next.js public site
├── app-dashboard/   # Next.js admin dashboard
├── app-mobile/      # Flutter mobile app (Android + iOS)
├── docs/            # setup guides (Stripe, Google OAuth) + this project's notes
└── README.md
```

## 🧪 Testing

- Backend: `cd app-backend && yarn test` (Jest; spec files live next to their modules,
  e2e suite in `test/`).
- Web/Dashboard: not yet covered by automated tests — a `next build` smoke test is the
  practical gate for now.
- Mobile: `cd app-mobile && flutter test` (boilerplate widget test; extend per feature).

## 📝 Notes on committing to this repo

- **Never commit** `.env`, `key.properties`, `*.jks`, `google-services.json`,
  `GoogleService-Info.plist`, or `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` contents.
  The root `.gitignore` covers these; the committed placeholder files exist so the
  repo builds out of the box, with clearly marked `your-…` values.
- The old project's signing/Firebase credentials were **removed from the full git
  history** of this repository (rewritten, not just the latest commit). Treat any
  keys that may have leaked from *previous* private copies as compromised and rotate
  them (Stripe keys, AWS keys, Firebase project, Android keystore, JWT secret).

## License

MIT — see [LICENSE](LICENSE).
