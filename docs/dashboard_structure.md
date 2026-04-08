# Dashboard Architecture Documentation

## Overview

The `app-dashboard` is an admin dashboard application for the **Patreon Clone** creator-platform (Patreon clone). It is built with **Next.js 15** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Recharts**.

- **Dev server**: `npm run dev` (runs on port 9002)
- **Build**: `npm run build`
- **Type check**: `npm run typecheck`

---

## Folder Structure

```
app-dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout (fonts, metadata, HTML shell)
│   │   ├── globals.css          # Tailwind base + CSS custom properties (light/dark themes)
│   │   ├── favicon.ico
│   │   └── (app)/               # Route group: authenticated app shell
│   │       ├── layout.tsx       # App shell: sidebar + header + main content area
│   │       ├── page.tsx         # Dashboard homepage
│   │       ├── creators/        # Creators management page
│   │       ├── members/         # Members management page
│   │       ├── content/         # Content feed page
│   │       ├── subscriptions/   # Subscriptions page
│   │       └── payouts/         # Payout manager page
│   │
│   ├── components/              # Shared UI components
│   │   ├── ui/                  # shadcn/ui primitives (30+ components)
│   │   ├── page-header.tsx      # Reusable page title + action buttons
│   │   ├── stat-card.tsx        # KPI metric card
│   │   ├── status-badge.tsx     # Unified status badge (all domains)
│   │   └── side-nav.tsx         # Sidebar navigation (client component)
│   │
│   ├── config/                  # Centralized configuration
│   │   ├── index.ts            # Barrel re-export
│   │   ├── branding.ts         # App name, tagline, support/social links
│   │   ├── navigation.ts       # Sidebar nav items (labels + Lucide icons)
│   │   └── seo.ts              # Metadata defaults (title template, OG, Twitter)
│   │
│   ├── features/               # Feature-scoped code (domain isolation)
│   │   ├── dashboard/
│   │   │   └── components/
│   │   │       ├── dashboard-charts.tsx   # Line + bar charts (client)
│   │   │       └── recent-transactions.tsx  # Transactions table (client)
│   │   ├── content/
│   │   │   └── components/
│   │   │       └── content-feed.tsx       # Filterable content cards (client)
│   │   ├── subscriptions/
│   │   │   └── components/
│   │   │       └── subscriptions-table.tsx  # Filterable sub table (client)
│   │   └── payouts/
│   │       └── components/
│   │           ├── payouts-table.tsx        # Pending payout actions (client)
│   │           └── processed-payouts-table.tsx  # Approved/rejected (client)
│   │
│   ├── lib/                    # Utilities and data layer
│   │   ├── utils.ts           # cn() — clsx + tailwind-merge helper
│   │   ├── data.ts            # Mock data arrays (creators, members, posts, etc.)
│   │   └── services/          # Async data service layer (API-ready interface)
│   │       ├── index.ts       # Barrel re-exports
│   │       ├── creator.service.ts
│   │       ├── member.service.ts
│   │       ├── post.service.ts
│   │       ├── subscription.service.ts
│   │       └── payout.service.ts
│   │
│   ├── hooks/                 # Shared custom React hooks
│   │   ├── use-mobile.tsx    # Responsive breakpoint detection
│   │   └── use-toast.ts      # Toast notification system (reducer-based)
│   │
│   ├── types/                 # Shared domain TypeScript types
│   │   ├── index.ts          # Barrel re-exports
│   │   ├── creator.ts
│   │   ├── member.ts
│   │   ├── post.ts
│   │   ├── subscription.ts
│   │   └── payout.ts
│   │
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind with CSS variable theming
├── next.config.ts            # Next.js config (port 9002, image domains)
├── components.json           # shadcn/ui CLI config
└── package.json
```

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 | App Router, SSR, routing |
| UI | shadcn/ui + Radix UI | Accessible component primitives |
| Styling | Tailwind CSS 3 | Utility-first CSS with CSS variables |
| Charts | Recharts | Line and bar charts on dashboard |
| Forms | React Hook Form + Zod | Form state and validation |
| Icons | Lucide React | Consistent icon set |
| Date utils | date-fns | Date formatting |

---

## Domain Model (Types)

The system models a creator-platform with 5 core entities:

### Creator
- `id`, `name`, `email`, `avatar`
- `status`: `approved` | `pending` | `suspended`
- `stripeOnboarded`: boolean
- `joinedDate`: string

### Member
- `id`, `name`, `email`, `avatar`
- `status`: `active` | `inactive`
- `subscription`: { `plan`, `status` (active/canceled/past_due) }

### Post
- `id`, `creator` (name + avatar), `type` (text/image/video)
- `status`: `published` | `draft` | `archived`
- `content`, `image?`, `createdAt`

### Subscription
- `id`, `member` (name/email/avatar), `creator` (name)
- `plan`, `status`, `amount`, `startDate`, `nextBilling`

### Payout
- `id`, `creator` (name/avatar)
- `amount`, `requestDate`, `status` (pending/approved/rejected)
- `processedDate?`

---

## Pages and Their Responsibilities

### `/` — Dashboard Homepage
The main overview page. Combines stat cards, charts, and recent transactions. Mixes server-rendered layout with `'use client'` chart components. Uses Recharts `LineChart` (membership growth) and `BarChart` (earnings).

### `/creators` — Creators Management
Server-rendered table listing all creators with inline status badges, Stripe onboarding status, and a dropdown action menu (Approve/Reject/Suspend). Search input is present but non-functional.

### `/members` — Members Management
Server-rendered table of platform members showing account status and subscription details. Dropdown actions (Deactivate) are placeholders.

### `/content` — Content Feed
Card-based grid of all posts. Uses shadcn `Select` components for client-side filtering by creator, type, and status. Post cards render images via Next.js `Image` with `fill` + `aspect-video`.

### `/subscriptions` — Subscriptions Monitor
Combines 4 KPI stat cards (MRR, active count, ARPU, churn rate) with a filterable subscriptions table. Filters (creator, member, status) and search are client-side state.

### `/payouts` — Payout Manager
4 KPI stat cards + tabbed interface (Pending / Approved / Rejected) using shadcn `Tabs`. Pending payouts show Approve/Reject buttons (non-functional). Approved/Rejected tabs use `ProcessedPayoutsTable`.

---

## Data Flow Architecture

```
User Request
     │
     ▼
Next.js App Router (Server Component)
     │
     ├── (Direct import) ──► src/lib/data.ts (mock arrays)
     │    or
     └── (Async call) ──► src/lib/services/*.service.ts
                               │
                               ▼
                          Real API (future)
```

Pages are **server components** by default. They call service functions from `src/lib/services/`. Services are `async` and return typed data, making them drop-in replaceable with real API calls.

When a page needs client-side interactivity (filters, charts, forms):
1. Keep the page as a server component
2. Extract interactive parts into `'use client'` components under `src/features/[feature]/components/`
3. Pass data from the server component as props

---

## Design Patterns and Conventions

### 1. Server vs. Client Component Split
Most pages are server components that render static structure. Only components needing interactivity (`'use client'`) are:
- `src/app/(app)/page.tsx` (uses Recharts)
- `src/app/(app)/content/page.tsx` (uses `Select` for filters)
- `src/app/(app)/subscriptions/page.tsx` (uses `Select` + state)
- `src/app/(app)/payouts/page.tsx` (uses `Tabs`)
- All components in `src/features/*/components/` (client by convention)

### 2. Feature-Scoped Code
Domain-specific logic lives under `src/features/[feature]/`. This keeps related components, types, and services co-located and makes the codebase navigable by domain rather than technical role.

### 3. Centralized Configuration
`src/config/branding.ts` is the single source of truth for rebranding. It exports the `branding` object with app name, tagline, support contact, and social links. All layouts and pages import from this file.

### 4. Status Badge Registry
`src/components/status-badge.tsx` provides a typed, centralized system for all status badges. Each domain (Creator, Member, Subscription, Payout, Post) has a `StatusEntry[]` config and a corresponding export. Pages use typed badge components (e.g., `CreatorStatusBadge`, `SubscriptionStatusBadge`) rather than duplicating variant maps.

### 5. Server Actions
Server actions use the `'use server'` directive. Form state is managed with `useFormState` from `react-dom`.

### 6. Service Layer Pattern
Each service (`creator.service.ts`, `member.service.ts`, etc.) follows the same pattern:
- `get[Entity]s()` — returns array
- `get[Entity]ById(id)` — returns single item or undefined
- All functions are `async` to match a real API interface
- Currently backed by mock data from `src/lib/data.ts`

### 6. Toast Notifications
`src/hooks/use-toast.ts` implements a reducer-based toast system inspired by `react-hot-toast`. It uses a module-level listener array for cross-component state sharing without a context provider.

### 7. CSS Variable Theming
`src/app/globals.css` defines CSS custom properties on `:root` (light mode) and `.dark` class. Tailwind config maps these variables to semantic token names (e.g., `--primary` maps to `hsl(var(--primary))`). Dark mode toggle is wired through the shadcn sidebar component's built-in dark mode support.

---

## Theming System

The app uses a CSS custom property system that supports light and dark modes:

```css
/* Light (default) */
:root {
  --background: 40 50% 98%;
  --primary: 211 71% 43%;    /* Blue */
  --accent: 335 27% 64%;     /* Purple */
  --destructive: 0 84% 60%;  /* Red */
}

/* Dark */
.dark {
  --background: 222.2 84% 4.9%;
  --primary: 211 71% 55%;
  --accent: 335 27% 64%;
  --destructive: 0 62.8% 30.6%;
}
```

The sidebar, cards, buttons, inputs, and all shadcn components inherit from these variables. No hardcoded colors anywhere.

---

## What's Working vs. What's Stubbed

### Working
- All 6 dashboard pages render with mock data
- Client-side filters on Content Feed and Subscriptions pages
- Recharts charts (line + bar) on dashboard homepage
- Tab-based filtering on Payouts page
- Dark mode toggle (via shadcn sidebar)
- Mobile sidebar collapse/expand

### Stubbed / Non-Functional
- No authentication or route protection
- All "action" buttons (Approve, Reject, Add Creator, Deactivate) are placeholders
- Search inputs on Creators and Members pages are non-functional
- No real database — all data from `src/lib/data.ts`
- No Stripe integration — payout approve/reject buttons are UI only
- No real API calls — services return mock data synchronously despite being async

---

## How to Add a New Page

1. Create a route under `src/app/(app)/[feature]/page.tsx`
2. Create a feature folder under `src/features/[feature]/`
3. Add nav item to `src/config/navigation.ts`
4. Add service functions under `src/lib/services/[feature].service.ts`
5. Add types under `src/types/[feature].ts`
6. If interactive, create client components in `src/features/[feature]/components/`

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | — | App base URL for metadata |
