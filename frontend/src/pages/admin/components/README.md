# Admin Components (`pages/admin/components/`)

## File Structure

```
components/
├── Header/
│   └── AdminHeader.jsx      # Top bar with search, notifications, user menu
└── LeftPane/
    └── AdminLeftPane.jsx    # Sidebar navigation (4 items)
```

## AdminHeader

Top bar rendered at the top of the admin shell. Fixed height: 72px.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `user` | `object` | User object — `name`, `email`, `role` |
| `initials` | `string` | Two-letter avatar initials |
| `searchQuery` | `string` | Current search input value |
| `notifications` | `array` | Notification items for the dropdown |
| `unreadCount` | `number` | Count of unread notifications |
| `onSearchChange` | `function` | Called when search input changes |
| `onSearchSubmit` | `function` | Called on search form submit |
| `onNotificationsOpen` | `function` | Called when notification bell is clicked |
| `onLanding` | `function` | Called when "FAQ View" button is clicked |
| `onLogout` | `function` | Called when "Logout" menu item is clicked |
| `onProfileSettings` | `function` | Called when "Profile Settings" menu item is clicked |

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Search input...............]  [FAQ View]  [🔔]  [Avatar ⌄] │
└──────────────────────────────────────────────────────────────┘
```

### User Menu Items

- **Profile Settings** → calls `onProfileSettings` → sets `currentAdminView = 'adminProfile'`
- **Logout** → calls `onLogout`

### Design Details

- Search form: `max-w-[420px]`, `bg-[#f3f4f6]` background, `focus-within:ring-[#8c6a40]`
- "FAQ View" button: `border-[#8c6a40] bg-[#8c6a40]` (brown brand color), white text
- Notification bell: red dot badge when `unreadCount > 0`
- User menu: `Menu` from `@headlessui/react` — `Profile Settings` + `Logout` items

---

## AdminLeftPane

Left sidebar with navigation items. Fixed width on desktop, slides in on mobile.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `currentAdminView` | `string` | Active view key |
| `onNavigate` | `function` | Called with the new view key when a nav item is clicked |

### Nav Items

| ID | Label | Icon |
|----|-------|------|
| `dashboard` | Dashboard | `LayoutGrid` |
| `queriesManagement` | Queries | `MessageSquare` |
| `sparkLeaderboard` | Spark | `Zap` |
| `faqManagement` | FAQ | `Settings` |

### Design Details

- Active item: `bg-[#8c6a40]` background, white text/icon
- Inactive items: `#f8f9f9` background, `#6b7280` text/icon
- Hover: `bg-[#f3f4f6]`
- Bottom section: white label ("Admin"), version number
- `PanelLeftClose` (hamburger) toggles sidebar on mobile

### Usage in Shell

```jsx
<AdminLeftPane
  currentAdminView={currentAdminView}
  onNavigate={setCurrentAdminView}
/>
```