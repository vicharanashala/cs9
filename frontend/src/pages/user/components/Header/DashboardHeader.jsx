import {
  Popover, PopoverButton, PopoverPanel,
  Menu, MenuButton, MenuItems, MenuItem,
} from '@headlessui/react'
import { Settings, Search, SlidersHorizontal, PlusCircle, Bell, LogOut, Moon, Sun, Menu as MenuIcon, Megaphone } from 'lucide-react'
import Button from '../../../../components/Button/Button'

function DashboardHeader({
  user,
  initials,
  currentView,
  showRaiseQuery = true,
  notifications,
  unreadCount,
  isDark,
  onSearchOpen,
  onRaiseQuery,
  onNotifOpen,
  onDarkToggle,
  onProfileSettings,
  onLogout,
  onMenuToggle,
}) {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-border bg-card px-4 sm:px-8 py-4 text-foreground transition-all duration-300">
      <div className="flex flex-1 items-center gap-2 max-w-[420px]">
        {/* Menu button on mobile */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none md:hidden cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <MenuIcon className="h-5 w-5" strokeWidth={1.8} />
        </button>

        {/* Search trigger — opens modal in DashboardPage */}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/50 px-4 py-2.5 text-left text-sm text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          onClick={() => onSearchOpen?.()}
        >
          <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
          <span className="flex-1 truncate">Search FAQs, categories, or status…</span>
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.8} />
        </button>
      </div>

      {/* Right-side action group */}
      <div className="flex items-center gap-4 sm:gap-6 ml-2">
        {showRaiseQuery && (
          <Button
            variant="primary"
            className="gap-2 rounded-lg px-3 py-2.5 sm:px-4.5 text-xs font-bold uppercase tracking-wider text-white"
            onClick={onRaiseQuery}
          >
            <PlusCircle className="h-4.5 w-4.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Raise Query</span>
          </Button>
        )}

        {/* Bell */}
        <Popover className="relative">
          <PopoverButton
            onClick={() => onNotifOpen?.()}
            className="relative p-2 text-muted-foreground transition hover:text-foreground rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <Bell className="h-5 w-5" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </PopoverButton>

          <PopoverPanel className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl focus:outline-none animate-scale-up">
            <p className="border-b border-border px-4 py-3.5 text-sm font-bold text-foreground bg-secondary/40">
              Notifications
            </p>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.notification_id || n.id}
                    className={`border-b border-border/50 px-4 py-3.5 transition-colors ${n.is_read ? 'bg-transparent' : 'bg-primary/5'}`}
                  >
                    {n.type === 'admin_announcement' ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                          <Megaphone className="h-2.5 w-2.5" strokeWidth={2.5} /> Announcement
                        </span>
                        <p className="text-xs font-bold text-foreground mb-0.5 capitalize leading-snug">{n.title}</p>
                        <p className="text-[12px] text-muted-foreground leading-normal mb-1.5">{n.body}</p>
                      </>
                    ) : (
                      <p className="mb-1 text-sm leading-relaxed text-foreground font-medium">{n.body || n.title}</p>
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="cursor-pointer bg-secondary/30 py-3 text-center text-xs font-bold text-foreground transition hover:bg-secondary/70 border-t border-border/50 uppercase tracking-wider">
              View All
            </div>
          </PopoverPanel>
        </Popover>

        {/* Dark mode */}
        <button
          type="button"
          className="p-2 text-muted-foreground transition hover:text-foreground rounded-full hover:bg-secondary focus:outline-none cursor-pointer"
          onClick={() => onDarkToggle()}
          aria-label="Toggle dark mode"
        >
          {isDark
            ? <Sun  className="h-5 w-5" strokeWidth={1.8} />
            : <Moon className="h-5 w-5" strokeWidth={1.8} />}
        </button>

        {/* Divider */}
        <span className="h-6 w-px bg-border" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-3 focus:outline-none rounded-lg p-1.5 hover:bg-secondary/40 transition-colors cursor-pointer">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-bold capitalize text-foreground">{user?.name || 'Student'}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{user?.role || 'USER'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {initials}
            </div>
          </MenuButton>

          <MenuItems className="absolute right-0 top-12 z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl focus:outline-none animate-scale-up">
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-4 py-3.5 text-sm font-semibold text-foreground transition hover:bg-secondary cursor-pointer"
                onClick={onProfileSettings}
              >
                <Settings className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.8} /> <span>Profile Settings</span>
              </button>
            </MenuItem>
            <div className="h-px bg-border" />
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-4 py-3.5 text-sm font-bold text-red-600 dark:text-red-400 transition hover:bg-secondary cursor-pointer"
                onClick={onLogout}
              >
                <LogOut className="h-4.5 w-4.5" strokeWidth={1.8} /> <span>Logout</span>
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}

export default DashboardHeader
