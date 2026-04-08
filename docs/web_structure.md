# app-web Codebase Structure & Architecture

> **Project:** Patreon Clone (Patreon Clone) — Next.js 15.1.3 + React 19 + TypeScript + Chakra UI v3

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Folder Structure](#2-folder-structure)
3. [Architecture Patterns](#3-architecture-patterns)
4. [State Management](#4-state-management)
5. [Key Directories & Their Responsibilities](#5-key-directories--their-responsibilities)
6. [Core Workflows](#6-core-workflows)
7. [API Layer](#7-api-layer)
8. [Routing & Pages](#8-routing--pages)
9. [Design Patterns & Conventions](#9-design-patterns--conventions)
10. [Domain Models](#10-domain-models)

---

## 1. Tech Stack Overview

| Category | Technology |
|---|---|
| Framework | Next.js 15.1.3 (App Router) |
| Language | TypeScript |
| UI Library | Chakra UI v3 |
| Server State | TanStack Query v5 |
| Real-time | Socket.io Client |
| HTTP Client | Axios |
| Forms | react-hook-form + zod |
| Rich Text Editor | Quill v2 |
| Video Player | wavesurfer.js, plyr |
| Audio Player | react-h5-audio-player |
| Charts | chart.js + react-chartjs-2 |
| Icons | @iconify/react, lucide-react, react-icons |
| Carousels | swiper, embla-carousel-react, react-multi-carousel |
| Notifications | sonner |
| Auth | JWT (jwt-decode), cookies-next |
| Fonts | Epilogue (Google), Tiempos Headline (OTF) |
| Theme | next-themes |
| Image Upload | react-dropzone |
| Date Handling | dayjs |

---

## 2. Folder Structure

```
app-web/
├── public/                    # Static assets
│   ├── audio/                 # Sample audio files
│   ├── creators/               # Creator cover images (1.png – 10.jpg)
│   ├── fonts/                 # Custom OTF fonts (Tiempos Headline family)
│   ├── icons/                 # App icons (logo, cover images)
│   └── images/                # Marketing images, pricing cards, onboarding
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── assets/                # Additional static assets
│   ├── components/            # Shared React components
│   ├── config/                # Branding, routes, SEO config
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── icons/                 # Custom SVG icon components
│   ├── lib/                   # Core library: API client, theme, services
│   ├── page-components/       # Page-level client components
│   ├── types/                 # TypeScript type re-exports
│   ├── typings/               # Domain interface definitions
│   └── utils/                 # Utility functions
│
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── eslint.config.mjs         # ESLint configuration
└── README.md                  # Project README
```

---

## 3. Architecture Patterns

### Server vs Client Components

The codebase uses Next.js App Router's hybrid rendering:

- **Server Components** (`src/app/`) — Marketing pages, post detail pages (SSR with auth via `cookies()`). No `"use client"` directive.
- **Client Components** (`page-components/`, `components/`) — All interactive pages use `"use client"`. Wrapped in `Suspense` boundaries.

### Provider Hierarchy

All providers are stacked in `src/app/layout.tsx` (bottom to top):

```
QueryClientProvider
  └── ChakraProvider
        └── ThemeProvider
              └── AuthProvider
                    ├── UserModeProvider
                    ├── ChatProvider
                    ├── SubscriptionProvider
                    ├── NotificationsProvider
                    ├── MembersProvider
                    ├── UserNotificationsProvider
                    └── PostsFilterProvider
```

### Page → Page-Component Pattern

Pages in `src/app/` are thin wrappers that delegate to `page-components/`:

```
src/app/profile/insights/page.tsx    # Server wrapper with Suspense
  └── src/page-components/profile/insights-page/index.tsx   # "use client" — all logic
```

This keeps pages server-renderable while isolating interactivity in client components.

### Service Layer Pattern

API calls follow a two-tier pattern:

1. **Service functions** (`lib/backend-services/*.ts`) — Plain async functions wrapping axios calls.
2. **React Query hooks** — Wrap service functions, return `useQuery`/`useMutation` objects.

---

## 4. State Management

State is layered across three levels:

### Level 1: TanStack Query (Server State)

All data from the backend (posts, creators, memberships, notifications, user data) lives in TanStack Query. Configured in `src/lib/react-query.tsx` with a client-side singleton `QueryClient` pattern.

### Level 2: React Context (Global UI State)

Seven context providers manage cross-cutting concerns:

| Provider | File | Responsibility |
|---|---|---|
| `AuthProvider` | `context/auth.provider.tsx` | User session, login, logout, mutations |
| `UserModeProvider` | `context/user-mode.provider.tsx` | Creator vs user mode toggle (persisted) |
| `ChatProvider` | `context/chat.provider.tsx` | Socket.io real-time chat state |
| `SubscriptionProvider` | `context/subscription.provider.tsx` | Active user subscriptions |
| `NotificationsProvider` | `context/notifications.provider.tsx` | Creator-mode notifications (60s polling) |
| `UserNotificationsProvider` | `context/user-notifications.provider.tsx` | Member-mode notifications |
| `MembersProvider` | `context/members-provider.tsx` | Creator audience data |
| `PostsFilterProvider` | `context/posts.provider.tsx` | Post list filtering and pagination |

### Level 3: Local State (`useState`)

Component-specific UI state (form inputs, toggles, modals) is handled with standard React `useState`.

---

## 5. Key Directories & Their Responsibilities

### `src/config/`

Single source of truth for application-wide configuration:

- **`branding.ts`** — All branding constants: app name, colors, URLs, contact info, social links. **Edit this file to rebrand the application.**
- **`routes.ts`** — `PUBLIC_ROUTES` and `PUBLIC_ROUTE_PREFIXES` arrays used by middleware to protect routes.
- **`seo.ts`** — Default SEO metadata, OG tags, and a base URL builder.

### `src/typings/`

Domain interface definitions. All interfaces use the `I`-prefix convention:

| File | Interfaces |
|---|---|
| `IUser.ts` | User, CreatorProfile, social links, gender enum |
| `IPost.ts` | Post, PostType enum, PostFilter, PostTag, MediaAsset |
| `ISubscription.ts` | Subscription, SubscriptionStatus, PlanType |
| `ICollection.ts` | Collection, CollectionAccess |
| `IChat.ts` | Chat, ChatType, ChatMember |
| `IMessage.ts` | Message, MessageAttachment |
| `IComment.ts` | Comment |
| `INotification.ts` | Notification, NotificationType |
| `IMember.ts` | Member, MemberStatus |
| `IMembership.ts` | Membership, MembershipTier, Benefit |
| `ITierAccess.ts` | TierAccess, AccessLevel enum |
| `IDiscount.ts` | Discount, DiscountType, GiftCode |
| `insights.ts` | InsightsData, EarningsData, MembershipStats |

### `src/lib/`

Core infrastructure and services:

| File/Directory | Purpose |
|---|---|
| `api.ts` | Axios instance with auth interceptor (injects `Authorization: Bearer {token}` from localStorage). Response interceptor handles 401 by clearing token and redirecting. |
| `react-query.tsx` | TanStack Query provider + client singleton `QueryClient`. |
| `theme.ts` | Chakra UI v3 system definition. Custom color tokens: `blue`, `orange`, `desert`, `dune`, `green`, `star`. Custom keyframes. |
| `font.ts` | Custom font configuration for Epilogue + Tiempos Headline. |
| `auth.ts` | Server-side auth helper (decodes cookies, extracts user ID). |
| `constants.ts` | `HARDCODED_CATEGORIES` array and `CreatorCategory` type. |
| `toasts.ts` | Toast handler factory using `sonner`. |
| `s3-video-upload.ts` | S3 presigned URL upload logic. |
| `backend-services/` | All API service modules (see Section 7). |

### `src/context/`

See Section 4 above for the full provider list.

### `src/components/`

Shared reusable components, organized by domain:

| Directory | Purpose |
|---|---|
| `ui/` | Base UI components: `Button`, `Avatar`, `Toaster`, `Provider`, `ColorMode`, `Carousel`. Also `CreatorCard` for displaying creator profiles. |
| `SideNav/` | Left sidebar navigation (desktop + mobile). `data.ts` holds nav item configuration. Supports both creator and user modes. |
| `SubscriptionManagement/` | Subscription-related components. |
| `RestrictedContent/` | Gated content wrapper (shows preview for locked posts). |
| `comment/` | Comment thread components. |
| `forms/` | Shared form components, e.g., `CreateMembershipForm`. |
| `search/` | Search-related components. |

### `src/page-components/`

Page-level client components. Mirrors the `src/app/` structure:

| Directory | Pages It Powers |
|---|---|
| `auth/callback.tsx` | `/auth/callback` |
| `creator/` | Creator profile page: profile cover, action bar, socials, pricing card, post types (text/image/video/audio/link), community page |
| `home/` | Authenticated user feed (`/home`) |
| `explore/` | Creator discovery: search bar, top creators, popular this week, recently visited, category filters |
| `post/` | Individual post pages (text/image/video/audio/link) |
| `profile/` | Creator dashboard: profile, settings, audience, community, create (post creation), insights, library, notifications, payout, promotions pages |
| `onboarding/` | Creator onboarding steps: choose URL, connect, creator profile, Stripe |
| `notifications-page/` | User notifications page |
| `search-page/` | Global search results page |
| `settings-page/` | User settings (basics) |

### `src/hooks/`

Custom React hooks:

- `useScrollBeyond.tsx` — Detects when user scrolls past a threshold.
- `useSubscriptionStatus.ts` — Checks if the current user is subscribed to a specific creator.

### `src/utils/`

Utility functions:

- `formatTime.ts` — Time formatting helpers.
- `getTimeAgo.ts` — Relative time string (e.g., "2 hours ago").
- `sortByRelativeDate.ts` — Sort array by relative date.
- `creators-data.ts` — Sample/mock creator data for marketing pages.

### `src/icons/`

Custom SVG icon components for consistency across the app.

---

## 6. Core Workflows

### Authentication Flow

```
1. User enters email
   → POST /auth/check-email/:email

2. If account exists + password set
   → Show password field

3. Login submit
   → POST /auth/login → { user, token }
   → Token stored in localStorage + cookie (30-day expiry)
   → queryClient.setQueryData(["user"], userData)
   → Redirect to /profile (creators) or /explore (members)

4. On app mount
   → JWT decoded for expiration check
   → useQuery(["user"]) fetches /auth/user

5. 401 response from any API
   → Token cleared from localStorage
   → Redirect to /
```

Google OAuth: redirects to `https://{apiServer}/auth/google`, then back to `/auth/callback?token=...` which stores the token and redirects.

### Subscription Flow

```
1. User visits /membership/[creatorId]
   → Sees free + paid tier cards

2. User selects tier + clicks "Subscribe"
   → POST /memberships/checkout/:membershipId

3. Backend returns { subscription, checkoutUrl }
   → If checkoutUrl: redirect to Stripe hosted checkout
   → If free tier: direct subscription API call

4. Stripe redirects to /creator/stripe/complete
   → POST /users/stripe-onboarding/complete

5. On success
   → SubscriptionProvider fetches updated subscriptions
   → User redirected to /home or /creator/[id]
```

### Post Creation Flow

```
1. Creator navigates to /profile/create/[type]
   → Fills form (title, content via Quill, tier access, collection, media)

2. Submit
   → POST /posts (multipart/form-data for media)
   → If "Save Draft": saves as draft
   → If "Publish": POST /posts/:id/publish

3. React Query invalidates
   → ["creatorPosts"] — post list
   → ["user"] — user data (post count)

4. Creator redirected to post detail or post list
```

### Chat Flow (Real-time)

```
1. ChatProvider mounts (user authenticated)
   → connectToChat() → Socket.io connects to /chat namespace

2. Server emits "connected" event
   → Sets connected = true

3. Load chats list
   → GET /chat → direct + group chats

4. Open a chat
   → GET /chat/:id
   → GET /chat/:id/messages

5. Send message
   → POST /chat/:id/messages (FormData for attachments)
   → Server emits "new_message" → ChatProvider appends to state

6. Mark as read
   → POST /chat/:id/read
```

### Post Viewing Flow

```
1. User visits /post/[id]
   → Server Component extracts auth token from cookies()
   → JWT decoded server-side for userID
   → Fetches post data (with auth header)
   → Renders post with dynamic OG metadata

2. Client hydrates
   → useSubscriptionStatus checks access
   → RestrictedContent shows preview if locked
   → Comments/likes loaded via React Query hooks
```

---

## 7. API Layer

### Axios Configuration (`src/lib/api.ts`)

```typescript
// Request interceptor: injects Bearer token
// Response interceptor: catches 401 → clears auth, redirects to /
```

### Backend Services (`src/lib/backend-services/`)

| Service File | API Endpoints Covered |
|---|---|
| `home-service.ts` | Feed (`/home/subscribed-feed`), top creators, categories, recently visited |
| `creator-service.tsx` | Creator profile (`/creators/:id`), creator posts, memberships |
| `subscription-service.tsx` | Subscribe, cancel, membership tiers, checkout, Stripe |
| `posts-service.tsx` | CRUD posts, drafts, collections, publish/unpublish |
| `post-service.tsx` | Comments, likes, individual post fetch |
| `chat-service.ts` | Socket.io singleton + REST fallback for chat/messages |
| `notifications-service.tsx` | Fetch, mark read, mark all read, delete notifications |
| `members-service.tsx` | Audience list, CSV export, member management |
| `insights-service.tsx` | Analytics: earnings, memberships, post stats |
| `promotions-service.tsx` | Discount/gift CRUD, validation, redemption |
| `search-service.ts` | Global creator/post search |
| `user-service.tsx` | User profile, settings, onboarding |

---

## 8. Routing & Pages

### Route Groups

| Pattern | Example | Description |
|---|---|---|
| `/` | `app/page.tsx` | Marketing landing page |
| `/auth/*` | `app/auth/login/` | Login, OAuth callback |
| `/checkout/*` | `app/checkout/membership/[id]/` | Stripe checkout |
| `/creator/[id]` | `app/creator/[id]/page.tsx` | Public creator profile |
| `/creator/stripe/*` | `app/creator/stripe/complete/` | Post-payment completion |
| `/home` | `app/home/page.tsx` | Authenticated user feed |
| `/membership/[id]` | `app/membership/[id]/page.tsx` | Tier selection |
| `/onboarding/*` | `app/onboarding/creator/` | Creator setup wizard |
| `/post/[id]` | `app/post/[id]/page.tsx` | Individual post (SSR) |
| `/pricing` | `app/pricing/page.tsx` | Pricing info |
| `/profile/*` | `app/profile/insights/` | Creator dashboard |
| `/search` | `app/search/page.tsx` | Search results |
| `/settings/*` | `app/settings/basics/` | User settings |
| `/stripe/*` | `app/stripe/onboarding/complete/` | Creator Stripe setup |
| `/support` | `app/support/page.tsx` | Support page |
| `/explore` | `app/explore/page.tsx` | Creator discovery |
| `/notifications` | `app/notifications/page.tsx` | User notifications |
| `/community*` | `app/community/` | Community pages |
| `/top-creators/*` | `app/top-creators/[category]/` | Category creator lists |

### Key Dynamic Routes

| Route | File | Notes |
|---|---|---|
| `/creator/[id]` | `app/creator/[id]/page.tsx` | SSR creator profile |
| `/creator/[id]/collection/[collectionId]` | `app/creator/[id]/collection/[collectionId]/` | Collection view |
| `/post/[id]` | `app/post/[id]/page.tsx` | SSR post detail |
| `/membership/[creatorId]` | `app/membership/[creatorId]/page.tsx` | Tier selection |
| `/profile/posts/[type]/[postId]` | `app/profile/posts/[type]/[postId]/` | Edit post |
| `/profile/collections/[id]` | `app/profile/collections/[id]/` | Manage collection |
| `/profile/community/chat/[chatId]` | `app/profile/community/chat/[chatId]/` | Group chat |
| `/profile/community/direct-messages/[chatId]` | `app/profile/community/direct-messages/[chatId]/` | DM |
| `/top-creators/[category]` | `app/top-creators/[category]/` | Category filter |

---

## 9. Design Patterns & Conventions

### File Naming

| Type | Convention | Example |
|---|---|---|
| Page files | `page.tsx` | `src/app/profile/insights/page.tsx` |
| Page components | `index.tsx` or named `.tsx` | `src/page-components/profile/insights-page/index.tsx` |
| Reusable components | PascalCase `.tsx` | `CreatorCard.tsx`, `RestrictedContent.tsx` |
| Index re-exports | `index.ts` | `src/components/SideNav/index.tsx` |
| Service functions | camelCase `.ts` | `src/lib/backend-services/chat-service.ts` |
| Utilities | camelCase `.ts` | `src/utils/formatTime.ts` |
| Custom hooks | `use*.ts/tsx` | `src/hooks/useSubscriptionStatus.ts` |
| Types/interfaces | `I*.ts` (typings) | `src/typings/IUser.ts` |

### Component Structure

```tsx
// Page (thin wrapper, server or client)
import { Suspense } from "react";
import { PageComponent } from "@/page-components/...";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageComponent />
    </Suspense>
  );
}

// Page component (full logic)
"use client";
import { useState } from "react";

export function PageComponent() {
  const [state, setState] = useState(null);
  // All hooks, mutations, queries here
}
```

### Form Handling

All forms use `react-hook-form` + `zod` + `@hookform/resolvers/zod`:

```typescript
const schema = z.object({ title: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
```

### Toast Notifications

Centralized via `src/lib/toasts.ts`:

```typescript
import { createToaster } from "@/components/ui/toaster";
const toaster = createToaster();
toaster.create({ title: "Success!", type: "success" });
```

### CSS/Styling

- **Chakra UI v3** throughout with design tokens defined in `src/lib/theme.ts`.
- Tokens referenced as `blue.500`, `star.600`, `desert.100`, etc.
- Custom keyframes for animations in theme.
- Custom fonts loaded via `next/font/google` + OTF files in `public/fonts/`.

### Path Aliases

```json
"@/*"         → "./src/*"
"@/config"    → "./src/config"
"@/types"     → "./src/types"
```

---

## 10. Domain Models

### User & Creator

- **User** — core account (email, username, name, avatar, bio, gender preference, content visibility)
- **CreatorProfile** — creator-specific data (cover image, social links, categories, Stripe Connect status)
- **UserMode** — toggle between "creator" and "user" mode (persisted in localStorage)

### Content

- **Post** — five types: `text`, `image`, `video`, `audio`, `link`
- **Collection** — groups of posts with access levels: `all`, `free_members`, `paid_only`
- **PostTag** — labels for categorization
- **MediaAsset** — uploaded files (images, audio, video)

### Subscriptions & Payments

- **Membership** — creator-defined tiers with: name, description, monthly/yearly price, benefits, seat limits, featured flag
- **Subscription** — user's active subscription to a creator's membership
- **Discount / GiftCode** — promotion codes (percentage or fixed amount, expiration)
- **Stripe Connect** — creator payment onboarding

### Community

- **Chat** — group chats or direct messages (`ChatType` enum)
- **Message** — text + file attachments, timestamps, read receipts
- **Comment** — threaded comments on posts
- **Notification** — polling-based, types: post, subscription, chat, system

### Analytics

- **InsightsData** — earnings charts, membership growth, post engagement stats
- **EarningsData** — revenue over time by tier
- **MembershipStats** — subscriber counts and churn
