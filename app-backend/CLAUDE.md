# Patreon Clone Backend — Admin Module Reference

## Admin Endpoints

All admin endpoints require JWT authentication (`AuthGuard('jwt')`) and admin role (`AdminGuard` — checks `user.isAdmin === true`).

### Dashboard Stats (`/admin/dashboard`)
- `GET /admin/dashboard/stats` — Platform KPIs: total creators, members, MRR, churn rate, revenue, payout stats, membership growth, earnings data, recent transactions

### Creators (`/admin/creators`)
- `GET /admin/creators` — Paginated list (page, limit, search, status, sortBy, sortOrder)
- `GET /admin/creators/:id` — Full creator details + recent subscriptions
- `POST /admin/creators/:id/approve` — Approve draft creator
- `POST /admin/creators/:id/reject` — Reject creator
- `POST /admin/creators/:id/suspend` — Suspend/archive creator
- `POST /admin/creators/:id/activate` — Reactivate suspended creator

### Members (`/admin/members`)
- `GET /admin/members` — Paginated list (page, limit, search, status, sortBy, sortOrder)
- `GET /admin/members/:id` — Full member details + subscriptions
- `POST /admin/members/:id/deactivate` — Deactivate member account
- `POST /admin/members/:id/activate` — Reactivate member

### Content (`/admin/content`)
- `GET /admin/content` — Paginated post list (page, limit, search, creatorId, type, status, sortBy, sortOrder)
- `GET /admin/content/:id` — Full post details + engagement stats
- `POST /admin/content/:id/withhold` — Hide/withhold a post
- `POST /admin/content/:id/restore` — Restore withheld post
- `DELETE /admin/content/:id` — Soft-delete a post

### Subscriptions (`/admin/subscriptions`)
- `GET /admin/subscriptions` — Paginated list (page, limit, search, creatorId, memberId, status, sortBy, sortOrder)
- `GET /admin/subscriptions/stats` — MRR, active count, ARPU, churn rate
- `GET /admin/subscriptions/:id` — Full subscription details
- `POST /admin/subscriptions/:id/cancel` — Cancel subscription

### Payouts (`/admin/payouts`)
- `GET /admin/payouts` — Paginated list (page, limit, status, sortBy, sortOrder)
- `GET /admin/payouts/stats` — Pending total, paid this month, total paid, rejected count
- `GET /admin/payouts/:id` — Full payout details + creator info
- `POST /admin/payouts/:id/approve` — Approve payout (creates Stripe transfer)
- `POST /admin/payouts/:id/reject` — Reject payout (returns funds to available balance)
