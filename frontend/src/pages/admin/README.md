# Admin Dashboard (`pages/admin/`)

Admin-only SPA at `/admin`. Protected by `ProtectedRoute(requiredRole='ADMIN')`.

## Views

| Key | Component | Description |
|-----|-----------|-------------|
| `dashboard` | `pages/Dashboard` | Live metrics + activity feed |
| `queriesManagement` | `pages/QueriesManagement` | Community question list |
| `sparkLeaderboard` | `pages/SparkLeaderboard` | Spark points leaderboard (live) |
| `faqManagement` | `pages/FAQManagement` | FAQ content view |
| `adminProfile` | `pages/AdminProfile` | Profile settings — **no sidebar tab**; accessed via header user menu |

## File Structure

```
admin/
├── index.jsx                    # Shell — layout, nav, view routing
├── service.js                   # Admin-only API calls (dashboard, notifications)
├── README.md                   # This file
│
├── components/
│   ├── README.md               # Header + LeftPane component docs
│   ├── Header/
│   │   └── AdminHeader.jsx     # Top bar — search, notifications, user menu
│   └── LeftPane/
│       └── AdminLeftPane.jsx   # Sidebar nav — 4 items (no Profile tab)
│
└── pages/
    ├── Dashboard/
    │   └── index.jsx           # Metric cards, chart, activity feed, flags table
    ├── QueriesManagement/
    │   └── index.jsx
    ├── SparkLeaderboard/
    │   └── index.jsx           # Live leaderboard via /api/leaderboard
    ├── FAQManagement/
    │   └── index.jsx
    └── AdminProfile/
        └── index.jsx           # Profile settings — header menu only, no sidebar tab
```

## Key Design Notes

- All admin pages live in `pages/admin/pages/` — imported and rendered by the shell in `index.jsx`
- `viewProps` (`dashboardData`, `isLoading`, `searchQuery`, `onRefresh`) passed to every view
- Spark leaderboard fetches from `GET /api/leaderboard?type=spark&limit=20` (shared `user/service.js`)
- Profile settings use `fetchProfile`, `updateProfile`, `changePassword` from `user/service.js`
- Admin left pane uses `Zap` icon for Spark. **Profile has no sidebar tab** — accessed via the user menu in the header (same as user section).
- `AdminHeader` exposes `onProfileSettings` callback → shell sets `currentAdminView = 'adminProfile'`

## API Integration Status

| Feature | Endpoint | Status |
|---------|----------|--------|
| Dashboard metrics | `GET /api/admin/dashboard` | ✅ Live |
| Notifications | `GET /api/notifications?limit=8` | ✅ Live |
| Mark read | `PATCH /api/notifications/read-all` | ✅ Live |
| Spark leaderboard | `GET /api/leaderboard?type=spark` | ✅ Live |
| Profile fetch | `GET /api/profile/me` | ✅ Live |
| Profile update | `PATCH /api/profile/me` | ✅ Live |
| Password change | `PATCH /api/profile/password` | ✅ Live |
| Queries list | `GET /api/questions` | ✅ Live |
| FAQ management | — | ⚠️ Display only |

## Route Protection

```jsx
<ProtectedRoute requiredRole="ADMIN" path="/admin" element={<AdminHome />} />
```

- Checks: valid JWT + `ADMIN` role
- Unauthenticated → redirect to `/`
- Wrong role → redirect to `/dashboard`