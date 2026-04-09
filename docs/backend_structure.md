# Patreon Clone Backend - Architecture Documentation

## Overview

The backend is a **NestJS** application built with TypeScript, serving as the API layer for the Patreon Clone platform (a Patreon-style creator membership platform). It runs on port **8080** and connects to **MongoDB** (via Mongoose ODM) and **AWS S3** for file storage.

### Technology Stack

| Category | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| Database | MongoDB via Mongoose 8 |
| Auth | Passport.js (JWT, Local, Google OAuth) |
| Payments | Stripe (Connect, Webhooks) |
| File Storage | AWS S3 SDK v3 |
| Push Notifications | Firebase Admin SDK |
| Real-time | Socket.io (via NestJS WebSocket Gateway) |
| Validation | class-validator / class-transformer |
| Scheduling | @nestjs/schedule |
| Testing | Jest |
| Image Processing | Sharp |

---

## Directory Structure

```
app-backend/src/
  admin/               # Admin/moderation features
  admin/
    admin.guard.ts     # Admin role guard
    admin.module.ts
    controllers/
      moderation.controller.ts
      reports.controller.ts
    dto/
      moderation.dto.ts
      reports.dto.ts
    services/
      moderation.service.ts
      reports.service.ts

  analytics/           # Creator analytics & insights
  auth/                # Authentication (JWT, Local, Google OAuth)
  chat/                # Real-time chat via WebSockets
  collections/          # Post collections management
  common/              # Shared utilities, decorators, filters, interfaces
  config/              # Branding and business config constants
  creator-history/      # Creator profile visit tracking
  database/
    index.ts            # Schema barrel exports
    schemas/            # All Mongoose schemas organized by domain
  home/                # Public home feed, creators listing, categories
  members/              # Member-facing endpoints
  memberships/          # Membership tiers CRUD and management
  notifications/        # In-app notification system
  payments/             # Stripe payment orchestration
  posts/                # Post creation, management, and feed
  promotions/            # Discounts and gift codes
  push-notifications/    # Firebase FCM push notifications
  reports/              # User-facing post/user reporting
  s3/                  # AWS S3 file upload service
  search/               # Creator and post search
  users/                # User profile and creator onboarding
  webhooks/             # Stripe webhook handler

  main.ts               # Application bootstrap
  app.module.ts         # Root module
  app.controller.ts
  app.service.ts
```

---

## Module Architecture

The application is organized into **20 feature modules**, all imported into the root [app.module.ts](app-backend/src/app.module.ts). Each module is self-contained with its own controller(s), service(s), DTO(s), and schema registrations.

### Module Dependency Graph

```
AppModule
  ├── UsersModule
  │     ├── S3Module
  │     └── PaymentsModule
  │           └── UsersModule (circular via UsersService)
  ├── AuthModule
  │     └── PaymentsModule
  ├── S3Module
  ├── PostsModule
  │     ├── S3Module
  │     ├── MembershipsModule
  │     └── NotificationsModule
  ├── CollectionsModule
  │     ├── S3Module
  │     └── MembershipsModule
  ├── MembershipsModule
  │     ├── PaymentsModule
  │     ├── S3Module
  │     ├── NotificationsModule
  │     └── PromotionsModule
  ├── PaymentsModule
  ├── MembersModule
  ├── AnalyticsModule
  │     └── PaymentsModule
  ├── NotificationsModule
  │     ├── PushNotificationsModule
  │     └── UsersModule
  ├── PromotionsModule
  │     ├── MembershipsModule
  │     └── PaymentsModule
  ├── ChatModule
  │     ├── JwtModule
  │     ├── S3Module
  │     └── NotificationsModule
  ├── SearchModule
  │     └── UsersModule
  ├── HomeModule
  │     ├── UsersModule
  │     ├── PostsModule
  │     └── MembershipsModule
  ├── CreatorHistoryModule
  │     ├── PostsModule
  │     ├── MembershipsModule
  │     └── CollectionsModule
  ├── WebhooksModule
  │     ├── MembershipsModule
  │     ├── PaymentsModule
  │     ├── ChatModule
  │     └── UsersModule
  ├── PushNotificationsModule
  ├── ReportsModule
  └── AdminModule
```

### Key Architectural Notes

- **`forwardRef()`** is used to break circular dependencies between `MembershipsModule` and `NotificationsModule`, and between `MembershipsModule` and `PromotionsModule`.
- The **PaymentsModule** is foundational -- it is imported by Users, Memberships, Analytics, Promotions, and Webhooks modules.
- The **S3Module** is imported by Users, Posts, Chat, and Collections modules for file upload handling.
- The **NotificationsModule** generates and stores notifications that other modules dispatch to when key events occur.

---

## Database Schemas

All schemas live under [src/database/schemas/](app-backend/src/database/schemas/) organized by domain. They use Mongoose decorators (`@Schema`, `@Prop`) and extend `Document`.

### Schema Inventory

| Schema | File | Purpose |
|---|---|---|
| **User** | `schemas/user/user.schema.ts` | Platform users (members + creators) |
| **Post** | `schemas/post/post.schema.ts` | Content posts (text, image, audio, video, link) |
| **Membership** | `schemas/membership/membership.schema.ts` | Creator subscription tiers |
| **Subscription** | `schemas/subscription/subscription.schema.ts` | Member's active/cancelled subscription to a membership |
| **Chat** | `schemas/chat/chat.schema.ts` | Chat rooms (creator-community) |
| **ChatParticipant** | `schemas/chat/chat.schema.ts` | Participant in a chat room |
| **Message** | `schemas/chat/chat.schema.ts` | Individual chat messages |
| **Notification** | `schemas/notification/notification.schema.ts` | In-app notifications |
| **Discount** | `schemas/promotion/discount.schema.ts` | Subscription discount codes |
| **Gift** | `schemas/promotion/gift.schema.ts` | Free-trial gift codes |
| **PromotionRedemption** | `schemas/promotion/redemption.schema.ts` | Tracks who used which promotion |
| **PostReport** | `schemas/report/post-report.schema.ts` | User reports on posts |
| **UserReport** | `schemas/report/user-report.schema.ts` | User reports on creators |
| **WithheldPost** | `schemas/report/withheld.schema.ts` | Posts hidden by moderators |
| **WithheldUser** | `schemas/report/withheld.schema.ts` | Users banned by moderators |
| **MembershipInsight** | `schemas/analytics/membership-insight.schema.ts` | Daily membership growth metrics |
| **EarningsInsight** | `schemas/analytics/earnings.schema.ts` | Daily earnings breakdown |
| **PostInsight** | `schemas/analytics/post-insight.schema.ts` | Per-post engagement metrics |
| **PayoutRequest** | `schemas/payout/payout.schema.ts` | Creator payout requests |
| **CreatorVisit** | `schemas/engagement/visit-history.schema.ts` | Visitor tracking per creator |
| **Device** | `schemas/device/device.schema.ts` | FCM push notification tokens |

### User Schema Fields (Key)

```
User
  ├── email, password, provider (LOCAL | GOOGLE | FACEBOOK | APPLE)
  ├── firstName, lastName, displayName, profilePicture, profileCover
  ├── gender, countryOfResidence
  ├── isCreator, creatorUsername, creatorStatus, creatorCategory, creatorHeadline
  ├── contentVisibleTo (BOTH | MALE | FEMALE)  -- gender-filtered content
  ├── genderPreference (BOTH | MALE | FEMALE)  -- member's viewing preference
  ├── stripeCustomerId, stripeConnectAccountId, hasCompletedStripeOnboarding
  ├── availableBalance, pendingBalance, lifetimeEarnings
  ├── creatorNotifyOnNewMember, creatorNotifyOnComments, creatorNotifyOnDirectMessages
  ├── memberNotifyOnNewPost, memberNotifyOnDirectMessages
  ├── introVideoUrl, bio, socialLinks
  └── isAdmin
```

### Creator Status Flow

A user transitions through these statuses when becoming a creator:

```
(non-creator) → DRAFT (onboarded with username) → ONBOARDING (Stripe setup started)
             → PUBLISHED (Stripe fully verified) → ARCHIVED
```

---

## Authentication & Authorization

### Strategies

Three Passport strategies are registered in [auth.module.ts](app-backend/src/auth/auth.module.ts):

| Strategy | File | Purpose |
|---|---|---|
| **LocalStrategy** | `strategies/auth.local.ts` | Email + password login |
| **JwtStrategy** | `strategies/auth.jwt.ts` | Bearer token validation |
| **GoogleStrategy** | `strategies/auth.google.ts` | OAuth 2.0 Google sign-in |

### Auth Flow

1. **Registration** (`POST /auth/register`) -- creates user, returns JWT
2. **Login** (`POST /auth/login`) -- validates credentials, returns JWT
3. **Google OAuth** (`GET /auth/google` → callback) -- OAuth flow, redirects to frontend with token
4. **Google Mobile** (`POST /auth/google/mobile`) -- verifies Google's access token server-side for mobile apps
5. **Token Check** (`GET /auth/check-email/:email`, `GET /auth/check-username/:username`) -- pre-registration validation

JWT tokens are signed with `JWT_SECRET` and expire in **1 day**. The payload contains `{ sub: userId, email }`.

### Guards

| Guard | File | Usage |
|---|---|---|
| `AuthGuard('jwt')` | Passport built-in | Protects routes requiring authentication |
| **OptionalJwtAuthGuard** | `optional-auth-guard.ts` | Returns `undefined` if no token, used for public endpoints that adapt based on auth state |
| **AdminGuard** | `admin/admin.guard.ts` | Checks `user.isAdmin === true` |
| **WsJwtGuard** | `chat/ws-jwt.guard.ts` | Validates JWT in WebSocket handshake |

### Decorators

- `@CurrentUser()` -- extracts authenticated user from request (`@common/decorators/current-user.decorator.ts`)
- `@Public()` -- skips auth guard for public routes (`@common/decorators/public.decorator.ts`)

---

## Core Workflows

### 1. User Registration & Creator Onboarding

```
1. POST /auth/register        → Creates user with LOCAL provider
2. PUT /users/profile         → Updates profile (name, gender, etc.)
3. POST /users/onboard-creator → Sets creatorUsername, isCreator=true, status=DRAFT
4. POST /users/publish-creator → Creates Stripe Connect Express account, status→ONBOARDING
5. User completes Stripe onboarding in frontend
6. Stripe account.updated webhook → status→PUBLISHED, hasCompletedStripeOnboarding=true
```

### 2. Subscription (Member Joins a Creator)

```
1. POST /memberships/checkout        → Creates Stripe Checkout session
2. User pays on Stripe Checkout page
3. Stripe checkout.session.completed  → (optional) creates subscription record
4. Stripe customer.subscription.created → creates Subscription document in DB
5. ChatModule.handleNewSubscription    → adds member to creator's chat room
6. Notification sent to creator (new member)
```

### 3. Post Creation & Access Control

```
1. POST /posts (with tierAccess array of membership IDs)
2. Post saved with tierAccess restrictions
3. GET /posts/by-creator/:id
   → For each post: checks if requesting user has active subscription to any tier in tierAccess
   → If no access: returns filtered preview (truncated text, no media)
   → If access: returns full post
4. Notifications sent to subscribers when new post is published
```

### 4. Real-time Chat (WebSocket)

- **Namespace**: `/chat`
- Implemented via `ChatGateway` (`@WebSocketGateway`)
- Events:
  - `join_room` / `leave_room` -- subscribe to a creator's chat
  - `send_message` -- send a message (broadcasts to room)
  - `mark_read` -- mark messages as read
- Room naming: `chat:{chatId}`
- Access is gated by subscription status (checked via `ChatService`)

### 5. Stripe Connect (Creator Payouts)

```
1. Creator completes Stripe onboarding (Express account)
2. Platform collects subscription payments (minus 15% fee)
3. Creator requests payout → PayoutRequest created
4. Stripe transfer initiated to creator's connected account
5. Earnings tracked in EarningsInsight, availableBalance updated
```

---

## API Groups

### Auth (`/auth`)
- `POST /auth/register`, `/auth/login`, `/auth/signup`
- `GET /auth/google`, `GET /auth/google/callback`
- `POST /auth/google/mobile`
- `GET /auth/user`, `GET /auth/check-username/:u`, `GET /auth/check-email/:e`

### Users (`/users`)
- Profile management: `PUT /users/profile`, `PUT /users/profile/photo`, `PUT /users/profile/cover`
- Creator onboarding: `POST /users/onboard-creator`, `POST /users/publish-creator`
- Creator profile: `PUT /users/creator/headline`, `PUT /users/creator/category`, `PUT /users/creator/content-visibility`
- `PUT /users/about`, `PUT /users/social-links`, `POST /users/reset-password`
- Subscriptions: `GET /users/subscriptions`, `GET /users/:id/subscriptions`
- `DELETE /users/account`, `GET /users/migrate`

### Posts (`/posts`)
- CRUD for text, image, audio, video, link posts
- `GET /posts/by-creator/:creatorId` -- paginated feed with access control
- Like, comment, share operations
- Tier-based access filtering

### Memberships (`/memberships`)
- `POST /memberships` -- create tier
- `GET /memberships/creator/:id` -- list creator's tiers
- `POST /memberships/checkout` -- initiate Stripe checkout
- `POST /memberships/cancel` -- cancel subscription
- `GET /memberships/stats/:id` -- creator earnings stats

### Payments (`/payments`)
- `GET /payments/connect/status` -- Stripe Connect account status
- `POST /payments/connect/onboarding-link` -- refresh onboarding URL
- `GET /payments/balance` -- creator balance
- `POST /payments/payout` -- request payout

### Chat (`/chat`)
- REST: `GET /chat/rooms`, `GET /chat/:roomId/messages`
- WebSocket: real-time messaging via Socket.io

### Analytics (`/analytics`)
- Creator dashboard metrics: earnings, new members, churn
- Post performance: impressions, engagement
- Time-series data (daily/weekly/monthly breakdowns)

### Promotions (`/promotions`)
- Discount codes: `POST /discounts`, `GET /discounts`, `POST /discounts/validate`
- Gift codes: `POST /gifts`, `GET /gifts`, `POST /gifts/redeem`
- Scheduler (`PromotionsSchedulerService`) auto-expires and cleans up promotions

### Notifications (`/notifications`)
- `GET /notifications` -- user's notification list
- `PUT /notifications/:id/read`
- Push notification dispatch via Firebase Admin SDK

### Search (`/search`)
- `GET /search?q=query` -- full-text search across creators and posts

### Home (`/home`)
- `GET /home/feed` -- public home feed
- `GET /creators` -- browse all creators (with filtering)
- `GET /categories` -- category listing

### Reports (`/reports`)
- `POST /reports/posts` -- report a post
- `POST /reports/users` -- report a creator

### Admin (`/admin`)
- `GET /admin/reports/posts`, `GET /admin/reports/users`
- `POST /admin/moderation/posts/:id/withhold`, `POST /admin/moderation/posts/:id/restore`
- `POST /admin/moderation/users/:id/ban`, `POST /admin/moderation/users/:id/unban`

### Webhooks (`/webhooks/stripe`)
- `POST /webhooks/stripe` -- handles all Stripe events
  - `account.updated` -- Stripe Connect onboarding status
  - `customer.subscription.created/updated/deleted`
  - `invoice.paid`, `invoice.payment_failed`

### S3 (`/s3`)
- `POST /s3/upload` -- file upload endpoint
- `DELETE /s3/delete` -- file deletion
- Backed by `S3Service` using AWS SDK v3

### Creator History (`/creator-history`)
- `POST /creator-history/visit` -- record a profile visit
- `GET /creator-history/subscribers` -- subscriber history

---

## Design Patterns & Conventions

### Module Pattern
Each feature follows NestJS module convention: one module class importing schemas, other modules, and registering controllers + providers. Services are the single source of business logic.

### DTO Validation
All request DTOs use `class-validator` decorators. Controllers pipe requests through `ValidationPipe` (implicitly via NestJS defaults, or explicitly where needed).

### Error Handling
A global `HttpExceptionFilter` (`common/filters/http-exception.filter.ts`) catches all exceptions and returns consistent JSON error responses with `statusCode`, `timestamp`, `path`, `method`, and `message`.

### WebSocket Gateway
`ChatGateway` implements NestJS's `@WebSocketGateway` decorator with the `chat` namespace. It uses `WsJwtGuard` to validate JWT tokens from WebSocket handshake query params.

### Stripe Webhooks
The webhook endpoint uses a **raw body parser** (configured in `main.ts`) to verify Stripe webhook signatures. Two webhook secrets are supported: one for standard events and one for Connect events (distinguished by the presence of an `account` field on the event).

### Image Processing
`Sharp` is used for image processing. `cheerio` is used to parse HTML content in posts for generating text previews.

### Scheduling
`@nestjs/schedule` is registered via `Cron` decorators in `PromotionsSchedulerService` for automatic promotion expiration.

### MongoDB Indexing
Every schema defines indexes at the bottom of the schema file for:
- Foreign key lookups (`creator`, `subscriber`, `membership`)
- Status filtering (`status: 1`)
- Unique constraints (e.g., `creatorUsername`, promo codes)
- Compound indexes for common query patterns

### File Upload
File uploads use `MulterModule` (1GB limit). The `S3Service` handles upload to AWS S3 with presigned URLs for download.

---

## Environment Variables

The application uses `@nestjs/config` and reads from `.env`. Key variables:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Standard Stripe webhook secret |
| `STRIPE_WEBHOOK_CONNECT_SECRET` | Connect account webhook secret |
| `AWS_DEFAULT_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY` | AWS S3 credentials |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FRONTEND_URL` | For Stripe redirect URLs |
| `BACKEND_URL` | For OAuth callback URLs |

---

## CORS Configuration

CORS is enabled for the following origins in `main.ts`:
- `http://localhost:3000`, `http://localhost:3001` (local dev)
- `https://patreon-clone.vercel.app`, `https://www.patreon-clone.example.com`, `https://patreon-clone.example.com` (production)

---

## Global Request Pipeline

```
Request → Raw body parser (for Stripe webhook) / JSON parser (all others)
        → CORS headers
        → Passport JWT validation
        → Controller
        → Service (business logic)
        → Response
```

Errors caught by `HttpExceptionFilter` return a standardized JSON error body.
