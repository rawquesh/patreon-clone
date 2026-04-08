# Patreon Clone Dashboard — Architecture Reference

## Overview

Admin dashboard for the Patreon Clone creator platform. Built on Next.js 15 App Router with shadcn/ui, Tailwind CSS, and Recharts.

**API Base URL:** `http://localhost:8080` (configure via `NEXT_PUBLIC_API_URL` in `.env.local`)

## Authentication

The dashboard requires admin JWT authentication. Unauthenticated requests redirect to `/login`.

- **Login**: `POST /auth/login` with `{ email, password }` — returns `{ token, user }`
- **Token**: Stored in `auth_token` cookie (7-day expiry)
- **User info**: Stored in `sessionStorage` as `admin_user`
- **Logout**: Clears cookie and sessionStorage, redirects to `/login`

## API Client

All API calls go through `src/lib/api-client.ts` which:
- Attaches `Authorization: Bearer {token}` from cookie automatically
- Throws `ApiError` on failure (with `statusCode`, `message`, `isAuthError`, `isNotFound`, `isServerError`)
- Returns typed responses from the backend

## Key Conventions

### Rebranding
Change `src/config/branding.ts` to rebrand the entire app.

### Data Flow
All pages are `'use client'` components that:
1. Fetch data on mount via service functions
2. Update URL params (`useSearchParams` + `router.push`) for filters/search/pagination
3. Call service mutation functions for actions
4. Show toast notifications on success/error via `useToast`

### Page Structure
Each page (`src/app/(app)/[feature]/page.tsx`) follows this pattern:
- Loading skeletons while fetching
- Error state with retry button
- Search + filter controls (update URL params)
- Paginated data table
- Action buttons (approve/reject/etc.) with loading states
- Detail dialogs (lazy-load on open)

### Services
Service functions in `src/lib/services/` are the single data access layer. They call `apiClient.get/post/put/delete` and map backend responses to typed frontend models.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

## Common Tasks

```bash
# Type check
npm run typecheck

# Build
npm run build

# Dev server (port 9002)
npm run dev
```

## Status

- All 6 pages wired to real backend API
- All action buttons functional (approve/reject/suspend, deactivate, withhold, cancel, etc.)
- All pages support search, filters, and pagination via URL params
- All pages have detail dialogs
- Loading skeletons and error states on every page
- Toast notifications on all actions
