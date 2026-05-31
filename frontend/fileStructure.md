# Rogāre Frontend — File Structure

```
frontend/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.jsx                   # Root — mounts router
    ├── main.jsx                  # Entry point
    ├── index.css                 # Global styles + Tailwind
    │
    ├── api/
    │   ├── README.md
    │   └── axios.jsx             # Axios instances (public + auth interceptor)
    │
    ├── components/               # Shared/reusable UI components
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   └── README.md
    │   ├── Footer/
    │   │   ├── Footer.tsx
    │   │   └── README.md
    │   ├── Input/
    │   │   ├── Input.tsx
    │   │   └── README.md
    │   ├── Modal/
    │   │   └── Modal.tsx         # Generic modal (center + top-right positioning)
    │   └── Select/
    │       └── Select.jsx         # Custom dropdown/select component
    │
    ├── lib/
    │   └── notify.js             # Toast notification helpers (notifyError, notifySuccess)
    │
    ├── pages/
    │   ├── landing/              # Public landing page (unauthenticated)
    │   │   ├── index.jsx         # Landing page with hero, FAQ accordion, CTAs
    │   │   ├── service.jsx       # Landing page API calls (fetchFaqs)
    │   │   ├── LoginModal/
    │   │   │   ├── index.jsx     # Login modal (top-right position)
    │   │   │   └── service.jsx
    │   │   └── components/
    │   │       └── FaqCard.jsx   # FAQ accordion card
    │   │
    │   ├── admin/                 # Admin dashboard (role-gated SPA)
    │   │   ├── index.jsx            # Shell: sidebar + header + view routing
    │   │   ├── service.js           # Admin API calls (dashboard, notifications)
    │   │   ├── README.md            # Admin section docs
    │   │   ├── components/
    │   │   │   ├── Header/
    │   │   │   └── AdminHeader.jsx
    │   │   └── LeftPane/
    │   │       └── AdminLeftPane.jsx
    │   │   └── pages/
    │   │       ├── Dashboard/
    │   │       │   └── index.jsx
    │   │       ├── QueriesManagement/
    │   │       │   └── index.jsx
    │   │       ├── SparkLeaderboard/
    │   │       │   └── index.jsx    # Live spark leaderboard
    │   │       ├── FAQManagement/
    │   │       │   └── index.jsx
    │   │       └── AdminProfile/
    │   │           └── index.jsx    # Header menu only — no sidebar tab
    │   │
    │   └── user/                 # Authenticated student section
    │       ├── index.jsx         # Route entry (redirects based on role)
    │       ├── layout.jsx        # Shell: Header + LeftPane + <Outlet> + Footer
    │       ├── constants.js      # Shared static data (STATUS_CONFIG, SEARCH_CATEGORIES, etc.)
    │       ├── service.js        # Shared API calls (fetchQuestions, voteQuestion, etc.)
    │       │
    │       ├── components/       # Components used within user section
    │       │   ├── FAQCategories/
    │       │   │   ├── FAQCategories.jsx
    │       │   │   └── README.md
    │       │   ├── Header/
    │       │   │   ├── DashboardHeader.jsx
    │       │   │   └── README.md
    │       │   ├── LeftPane/
    │       │   │   ├── LeftPane.jsx   # Collapsible sidebar
    │       │   │   └── README.md
    │       │   ├── QuestionCard/
    │       │   │   ├── QuestionCard.jsx
    │       │   │   └── README.md
    │       │   ├── ReportModal/
    │       │   │   └── ReportModal.jsx  # Uses Modal + Select + Button
    │       │   └── SearchModal/
    │       │       └── SearchModal.jsx
    │       │
    │       └── pages/            # Page-level views (folder-per-page)
    │           ├── Dashboard/
    │           │   └── index.jsx  # SPA: tabs, question cards, right pane, inline detail
    │           ├── RaiseQuery/
    │           │   └── index.jsx
    │           ├── QueryDetail/
    │           │   └── index.jsx
    │           └── ProfileSettings/
    │               └── index.jsx
    │
    ├── routes/
    │   ├── index.jsx            # Route definitions
    │   ├── ProtectedRoute.jsx   # Auth + role guard
    │   └── README.md
    │
    └── store/
        └── useAuthStore.js       # Zustand auth store (user, setUser, clearUser)
```

## URL Routes

| URL | Page | Auth |
|-----|------|------|
| `/` | Landing | Public |
| `/dashboard` | Student Dashboard | Required |
| `/raise-query` | Raise New Query | Required |
| `/profile` | Profile Settings | Required |
| `/admin` | Admin Dashboard | Required + ADMIN role |

## Conventions

- **Folder-per-component** — each component in its own folder; direct file import, no `index.tsx` barrel exports
- **Shared layout** — `user/layout.jsx` wraps all student pages with Header + LeftPane + Footer
- **SPA navigation** — no URL changes when switching tabs or opening question details
- **Global components** — `Button`, `Input`, `Modal`, `Select` live in `src/components/`
- **Service layer** — shared API calls in `user/service.js`; page-specific calls co-located
- **State** — Zustand (`useAuthStore`) for auth; component `useState` for local UI
- **Styling** — Tailwind CSS v4 utility classes; brand color `#8c6a40`
- **No UI kit** — plain Tailwind with custom components; Headless UI is the planned migration target
- **Routing** — React Router v7 with nested routes; `ProtectedRoute` for auth guards

## Component Hierarchy

```
App
├── LandingPage
│   ├── FaqCard
│   └── LoginModal (top-right, uses Modal)
└── UserLayout (wraps all /dashboard, /raise-query, /profile)
    ├── DashboardHeader
    │   ├── NotificationBell + dropdown
    │   └── UserMenu + dropdown
    ├── LeftPane (collapsible)
    ├── Footer
    └── Outlet
        ├── DashboardPage
        │   ├── QuestionCard (with Report button)
        │   ├── FAQCategories
        │   └── SearchModal
        ├── RaiseQueryPage
        ├── QueryDetailPage
        └── ProfileSettingsPage
```
