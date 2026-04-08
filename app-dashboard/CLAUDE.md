# Patreon Clone Dashboard — Architecture Reference

## Overview

Admin dashboard for the Patreon Clone creator platform. Built on Next.js 15 App Router with shadcn/ui, Tailwind CSS, and Genkit for AI features.

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout — fonts, metadata
│   ├── globals.css         # CSS variables (light/dark theming)
│   └── (app)/              # Route group: authenticated app shell
│       ├── layout.tsx      # Sidebar + header shell
│       ├── page.tsx        # Dashboard
│       ├── anomaly-detection/
│       ├── content/
│       ├── creators/
│       ├── members/
│       ├── payouts/
│       └── subscriptions/
│
├── config/                 # Centralized configuration
│   ├── branding.ts         # App name, tagline, support, social links
│   ├── navigation.ts       # Sidebar nav items (labels + icons)
│   └── seo.ts             # Metadata defaults
│
├── components/
│   ├── status-badge.tsx    # Unified status badge (all domains)
│   ├── page-header.tsx     # Page title + action buttons
│   ├── stat-card.tsx       # KPI card
│   ├── side-nav.tsx        # Navigation sidebar
│   └── ui/                 # shadcn/ui primitives
│
├── features/               # Feature-scoped code
│   ├── creators/
│   ├── members/
│   ├── content/
│   ├── subscriptions/
│   ├── payouts/
│   ├── anomaly-detection/
│   └── dashboard/
│       └── components/
│
├── lib/
│   ├── utils.ts            # cn() utility
│   ├── data.ts             # Mock data arrays (types re-exported here)
│   └── services/           # Data service layer (async, swappable)
│
├── hooks/                  # Shared custom hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── types/                  # Shared domain types
│   ├── creator.ts
│   ├── member.ts
│   ├── post.ts
│   ├── subscription.ts
│   └── payout.ts
│
└── ai/                     # Genkit AI layer
    ├── genkit.ts           # AI instance configuration
    ├── dev.ts              # Dev server entry
    └── flows/             # AI flow definitions
```

## Key Conventions

### Rebranding
Change `src/config/branding.ts` to rebrand the entire app. Every layout and page imports from this file.

### Adding a New Page
1. Create a route under `src/app/(app)/[feature]/page.tsx`
2. Create a feature folder under `src/features/[feature]/`
3. Add nav item to `src/config/navigation.ts`
4. Add service functions under `src/lib/services/[feature].service.ts`
5. Add types under `src/types/[feature].ts`

### Data Flow
Pages are **server components** by default. They call service functions from `src/lib/services/`. Services return mock data now but are designed to be swapped for real API calls — the interface is async.

When a page needs client-side interactivity (filters, charts, forms):
1. Keep the page as a server component
2. Create a client component in `src/features/[feature]/components/`
3. Pass data from the server component as props

### Status Badges
All status badges use `src/components/status-badge.tsx`. When adding a new domain, add a `StatusEntry[]` config and a typed export function. Never copy-paste variant maps into page files.

### Server Actions
Server actions live next to the page that uses them (e.g., `anomaly-detection/actions.ts`). Use `useFormState` from `react-dom` for form state.

### AI Flows
Genkit flows are defined in `src/ai/flows/`. The `dev.ts` entry registers them with the Genkit dev server. Run `npm run genkit:dev` to develop AI flows locally.

## What's Working

- All 7 dashboard pages render with mock data
- Select filters on Content and Subscriptions pages work (client-side)
- Anomaly Detection AI feature with Genkit + Gemini
- Dark mode toggle
- Mobile sidebar collapse/expand

## What's Stubbed

- No authentication or route protection
- All "action" buttons (Approve, Reject, Add Creator, etc.) are placeholders
- No real database — all data from `src/lib/data.ts`
- No Stripe integration — buttons exist but are non-functional

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | For anomaly detection | Google AI API key |

## Common Tasks

```bash
# Type check
npm run typecheck

# Build
npm run build

# Develop with AI flows
npm run genkit:dev
```
