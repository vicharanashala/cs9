import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { Bell, LogOut, Moon, Search, Settings, Sun } from 'lucide-react'
import Button from '../../../../components/Button/Button'

function AdminHeader({
  user,
  initials,
  searchQuery,
  notifications,
  unreadCount,
  isDark,
  onSearchChange,
  onSearchSubmit,
  onNotificationsOpen,
  onDarkToggle,
  onLanding,
  onLogout,
  onProfileSettings,
}) {
  return (
    <header className="relative z-20 flex min-h-[72px] items-center justify-between border-b border-border bg-card px-5 py-4 lg:px-8 text-foreground transition-all duration-300">
      <form
        className="flex h-10 w-full max-w-[420px] items-center gap-2 rounded-lg bg-secondary/80 border border-border/50 px-3 text-muted-foreground transition focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
        onSubmit={onSearchSubmit}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search queries, FAQs, or status..."
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </form>

      <div className="ml-4 flex items-center gap-4 lg:gap-6">
        <Button
          variant="primary"
          className="hidden min-h-9 px-4 text-xs font-bold uppercase tracking-wider sm:inline-flex"
          onClick={onLanding}
        >
          FAQ View
        </Button>

        {/* Notifications bell */}
        <div className="relative">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => onNotificationsOpen?.()}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Dark mode */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none"
          onClick={() => onDarkToggle?.()}
        >
          {isDark
            ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
            : <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        </button>

        <span className="hidden h-8 w-px bg-border sm:block" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-3 focus:outline-none rounded-lg p-1 hover:bg-secondary/40 transition-colors">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold capitalize text-foreground">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {initials}
            </div>
          </MenuButton>

          <MenuItems className="absolute right-0 top-12 z-50 min-w-[170px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl focus:outline-none animate-in fade-in slide-in-from-top-3 duration-200">
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                onClick={onProfileSettings}
              >
                <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} /> <span>Profile Settings</span>
              </button>
            </MenuItem>
            <div className="h-px bg-border" />
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-secondary"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} /> <span>Logout</span>
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}

export default AdminHeader